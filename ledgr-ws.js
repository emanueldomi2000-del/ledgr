/* ═══ LEDGR — Shared WebSocket Client ══════════════════════════════════════
 * Provides window.LedgrWS — a single multiplexed WS connection per page.
 *
 * API:
 *   LedgrWS.on(type, fn)        subscribe to an event type (or '*' for all)
 *   LedgrWS.off(type, fn)       unsubscribe
 *   LedgrWS.rarity(event)       → 1-5 rarity tier for UI decisions
 *   LedgrWS.isVisible()         → false when tab is hidden (suppress animations)
 *   LedgrWS.connected           → boolean
 *
 * Rarity tiers:
 *   1  ambient   — ticker update only, no card, no animation
 *   2  subtle    — small feed card, slide-in, no glow
 *   3  medium    — accented card, glow border, sidebar card
 *   4  prestige  — gold treatment, extended card, brief celebration
 *   5  moment    — full-impact — rank #1, legendary, 10-win streak
 *
 * Low-power mode (tab hidden):
 *   Does NOT disconnect. Reduces heartbeat to 60s instead of 25s.
 *   Suppresses all UI updates via LedgrWS.isVisible() guard.
 *   On return to visible: restores 25s heartbeat, requests catch-up.
 * ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var WSS              = 'wss://ledgr-backend-7hmh.onrender.com';
  var HB_NORMAL        = 25000;   // heartbeat interval: normal mode
  var HB_LOWPOWER      = 60000;   // heartbeat interval: low-power (hidden tab)
  var BACKOFF          = [1000, 2000, 4000, 8000, 16000, 30000];
  var MAX_BACKOFF_IDX  = BACKOFF.length - 1;

  // ── Rarity table ────────────────────────────────────────────────────────────
  var STATIC_RARITY = {
    pick_win:       1,
    pick_result:    1,
    followed_posted:1,
    pick_tailed:    1,
    rank_change:    1,
    online_count:   0,   // meta, not an event card
    ws_connected:   0,
    ws_disconnected:0,
  };

  function computeRarity(type, payload) {
    if (STATIC_RARITY[type] !== undefined) return STATIC_RARITY[type];
    payload = payload || {};

    if (type === 'big_win') {
      if (payload.pnl >= 20) return 4;
      if (payload.pnl >= 10) return 3;
      return 2;
    }
    if (type === 'underdog_hit') {
      return payload.odds >= 5.0 ? 4 : 3;
    }
    if (type === 'streak_milestone') {
      if (payload.streak >= 10) return 5;
      if (payload.streak >= 7)  return 4;
      if (payload.streak >= 5)  return 3;
      return 2;
    }
    if (type === 'division_up') {
      var map = { SILVER:1, GOLD:2, PLATINUM:3, DIAMOND:4, ELITE:4, LEGENDARY:5 };
      return map[payload.toDivision] || 2;
    }
    if (type === 'rank_up') {
      if (payload.newRank === 1)  return 5;
      if (payload.newRank <= 3)   return 4;
      if (payload.newRank <= 10)  return 3;
      return 2;
    }
    if (type === 'badge_unlock')   return payload.badgeRarity || 2;
    if (type === 'milestone_pick') {
      if (payload.count >= 200) return 4;
      if (payload.count >= 100) return 3;
      return 2;
    }
    return 1;
  }

  // ── State ────────────────────────────────────────────────────────────────────
  var _ws             = null;
  var _connected      = false;
  var _lowPower       = document.visibilityState === 'hidden';
  var _reconnIdx      = 0;
  var _reconnTimer    = null;
  var _hbTimer        = null;
  var _lastEventId    = 0;
  var _handlers       = {};   // { type: [fn, ...] }
  var _userId         = null;
  var _token          = null;

  // ── Auth ─────────────────────────────────────────────────────────────────────
  function _getAuth() {
    try {
      var raw = localStorage.getItem('ledgr_user') || localStorage.getItem('user');
      var u   = raw ? JSON.parse(raw) : null;
      var t   = localStorage.getItem('ledgr_token') || localStorage.getItem('token') || null;
      return { userId: u && u.id ? u.id : null, token: t };
    } catch (_) {
      return { userId: null, token: null };
    }
  }

  // ── Dispatch ──────────────────────────────────────────────────────────────────
  function _dispatch(ev) {
    var rarity = ev.rarity !== undefined
      ? ev.rarity
      : computeRarity(ev.type, ev.payload);
    ev._rarity = rarity;

    var all  = _handlers['*']      || [];
    var mine = _handlers[ev.type]  || [];
    var combined = all.concat(mine);
    for (var i = 0; i < combined.length; i++) {
      try { combined[i](ev); } catch (_) {}
    }
  }

  // ── Heartbeat ─────────────────────────────────────────────────────────────────
  function _startHeartbeat() {
    clearInterval(_hbTimer);
    var interval = _lowPower ? HB_LOWPOWER : HB_NORMAL;
    _hbTimer = setInterval(function () {
      if (_ws && _ws.readyState === 1 /* OPEN */) {
        try { _ws.send('{"type":"ping"}'); } catch (_) {}
      }
    }, interval);
  }

  // ── Connect ───────────────────────────────────────────────────────────────────
  function _connect() {
    clearTimeout(_reconnTimer);

    if (_ws) {
      try { _ws.close(); } catch (_) {}
      _ws = null;
    }

    var auth = _getAuth();
    _userId  = auth.userId;
    _token   = auth.token;

    try {
      _ws = new WebSocket(WSS);
    } catch (_) {
      _scheduleReconnect();
      return;
    }

    _ws.onopen = function () {
      _connected = true;
      _reconnIdx = 0;

      // Announce our identity and request catch-up for any missed events
      try {
        _ws.send(JSON.stringify({
          type:        'subscribe',
          userId:      _userId,
          token:       _token,
          lastEventId: _lastEventId,
          lowPower:    _lowPower,
        }));
      } catch (_) {}

      _startHeartbeat();
      _dispatch({ type: 'ws_connected', payload: {}, _rarity: 0 });
    };

    _ws.onmessage = function (e) {
      var msg;
      try { msg = JSON.parse(e.data); } catch (_) { return; }

      // Heartbeat response — update last-seen but don't dispatch
      if (msg.type === 'pong') return;

      // Track highest seen eventId for catch-up on reconnect
      if (msg.eventId && msg.eventId > _lastEventId) _lastEventId = msg.eventId;

      _dispatch(msg);
    };

    _ws.onclose = function () {
      _connected = false;
      clearInterval(_hbTimer);
      _dispatch({ type: 'ws_disconnected', payload: {}, _rarity: 0 });
      _scheduleReconnect();
    };

    _ws.onerror = function () {
      _connected = false;
      // onclose will fire next and trigger reconnect
    };
  }

  function _scheduleReconnect() {
    clearTimeout(_reconnTimer);
    var delay = BACKOFF[Math.min(_reconnIdx, MAX_BACKOFF_IDX)];
    _reconnIdx = Math.min(_reconnIdx + 1, MAX_BACKOFF_IDX);
    _reconnTimer = setTimeout(_connect, delay);
  }

  // ── Visibility: LOW-POWER MODE (not disconnect) ───────────────────────────────
  // When tab is hidden: keep socket alive, reduce heartbeat, suppress animations.
  // When tab returns:   restore heartbeat, request catch-up for missed events.
  document.addEventListener('visibilitychange', function () {
    _lowPower = document.visibilityState === 'hidden';

    if (_lowPower) {
      // Switch to slow heartbeat — keep connection alive during tab switch
      _startHeartbeat();
      if (_ws && _ws.readyState === 1) {
        try { _ws.send('{"type":"low_power","active":true}'); } catch (_) {}
      }
    } else {
      // Returning to visible
      _startHeartbeat();   // back to 25s heartbeat
      if (_ws && _ws.readyState === 1) {
        try {
          _ws.send(JSON.stringify({ type: 'catch_up', since: _lastEventId }));
          _ws.send('{"type":"low_power","active":false}');
        } catch (_) {}
      } else if (!_connected) {
        // Was lost while hidden — reconnect immediately
        _reconnIdx = 0;
        _connect();
      }
    }
  });

  // ── Public API ────────────────────────────────────────────────────────────────
  window.LedgrWS = {
    on: function (type, fn) {
      if (!_handlers[type]) _handlers[type] = [];
      if (_handlers[type].indexOf(fn) === -1) _handlers[type].push(fn);
    },

    off: function (type, fn) {
      if (!_handlers[type]) return;
      var idx = _handlers[type].indexOf(fn);
      if (idx !== -1) _handlers[type].splice(idx, 1);
    },

    // Compute or retrieve the rarity tier for an event (1–5, 0 = meta/internal)
    rarity: function (ev) {
      return ev._rarity !== undefined
        ? ev._rarity
        : computeRarity(ev.type, ev.payload);
    },

    // True when tab is visible — use to guard animations
    isVisible: function () { return !_lowPower; },

    get connected() { return _connected; },
  };

  // Boot after page scripts have settled
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(_connect, 120); });
  } else {
    setTimeout(_connect, 120);
  }

})();
