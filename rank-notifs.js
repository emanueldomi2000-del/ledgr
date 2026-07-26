(function () {
  'use strict';

  var STATE_KEY  = 'ledgr_rank_state';
  var NOTIFS_KEY = 'ledgr_notifications';

  function _getState()    { try { return JSON.parse(localStorage.getItem(STATE_KEY)  || 'null'); } catch (e) { return null; } }
  function _saveState(s)  { localStorage.setItem(STATE_KEY, JSON.stringify(s)); }
  function _getNotifs()   { try { return JSON.parse(localStorage.getItem(NOTIFS_KEY) || '[]');  } catch (e) { return []; } }
  function _saveNotifs(n) { localStorage.setItem(NOTIFS_KEY, JSON.stringify(n)); }

  function _push(notif) {
    var list = _getNotifs();
    list.unshift({
      id:   Date.now() + '_rn_' + Math.random().toString(36).slice(2, 6),
      type: notif.type,
      icon: notif.icon,
      text: notif.text,
      ref:  notif.ref || '',
      ts:   Date.now(),
      read: false
    });
    _saveNotifs(list.slice(0, 100));
  }

  // ── Reputation level (mirrors getReputation in every other page) ────────────
  function _repLevel(settled, ss, roi, wrPct) {
    if (settled >= 200 && ss >= 75 && roi > 10 && wrPct >= 55) return 5;
    if (settled >= 100 && ss >= 60 && roi > 5  && wrPct >= 52) return 4;
    if (settled >= 50  && ss >= 40 && roi > 0)                  return 3;
    if (settled >= 20)                                           return 2;
    return 1;
  }
  function _repKey(level) {
    return ['unrated', 'rookie', 'proven', 'trusted', 'elite'][level - 1] || 'unrated';
  }

  // ── Sharp Score milestones ──────────────────────────────────────────────────
  var SHARP_MILESTONES = [40, 60, 70, 80, 90];
  function _topMilestone(score) {
    var hit = SHARP_MILESTONES.filter(function (m) { return score >= m; });
    return hit.length ? hit[hit.length - 1] : 0;
  }

  // ── Division ordering ───────────────────────────────────────────────────────
  var DIV_ORDER = { BRONZE: 1, SILVER: 2, GOLD: 3, PLATINUM: 4, DIAMOND: 5, ELITE: 6, LEGENDARY: 7 };

  // ── HoF eligibility (mirrors _isTrusted in hall-of-fame) ───────────────────
  function _trusted(t) {
    var s  = (t.wins || 0) + (t.losses || 0);
    var wr = t.winRate != null ? t.winRate * 100 : 0;
    return s >= 100 && (t.sharpScore || 0) >= 60 && (t.roi || 0) > 5 && wr >= 52;
  }

  function _currentHofBadges(username, all) {
    if (!all || !all.length || !username) return [];
    var badges  = [];
    var trusted = all.filter(_trusted);
    var roiLead = trusted.filter(function (t) { return t.totalPicks >= 50 && (t.avgOdds || 0) >= 1.5; })
                         .sort(function (a, b) { return b.roi - a.roi; })[0];
    var strKing = trusted.filter(function (t) { return (t.bestStreak || 0) >= 7; })
                         .sort(function (a, b) { return b.bestStreak - a.bestStreak; })[0];
    var shpElite = trusted.filter(function (t) { return t.totalPicks >= 50; })
                          .sort(function (a, b) { return b.sharpScore - a.sharpScore; })[0];
    if (roiLead  && roiLead.username  === username) badges.push('ROI LEADER');
    if (strKing  && strKing.username  === username) badges.push('STREAK KING');
    if (shpElite && shpElite.username === username) badges.push('SHARP ELITE');
    return badges;
  }

  // ── Public API ──────────────────────────────────────────────────────────────
  window.RankNotifs = {
    check: function (rm, allTipsters) {
      if (!rm) return;

      var settled  = (rm.wins || 0) + (rm.losses || 0);
      var ss       = rm.sharpScore || 0;
      var roi      = rm.roi != null ? parseFloat(rm.roi) : 0;
      var wrPct    = rm.winRate != null ? rm.winRate * 100 : 0;
      var division = (rm.division || 'BRONZE').toUpperCase();
      var username = rm.username || '';

      var repLvl    = _repLevel(settled, ss, roi, wrPct);
      var milestone = _topMilestone(ss);
      var hofNow    = _currentHofBadges(username, allTipsters);

      var prev = _getState();

      // First visit for this user — seed state silently, no notifications
      if (!prev) {
        _saveState({ repLevel: repLvl, milestone: milestone, division: division, hofBadges: hofNow, sharpScore: ss, roi: roi, wrPct: wrPct });
        return;
      }

      var next = { repLevel: repLvl, milestone: milestone, division: division, hofBadges: hofNow.length ? hofNow : (prev.hofBadges || []), sharpScore: ss, roi: roi, wrPct: wrPct };

      // Provisional — update state silently, no notifications until 20 settled picks.
      // Division and Sharp Score can look impressive on tiny samples; we must not celebrate them.
      if (settled < 20) {
        _saveState(next);
        return;
      }

      // ── 1. Reputation upgrade (highest priority) ────────────────────────────
      var REP_ICONS = { 3: '🛡️', 4: '🔥', 5: '👑' };
      if (repLvl > (prev.repLevel || 1) && repLvl >= 3) {
        _push({
          type: 'reputation_up',
          icon: REP_ICONS[repLvl] || '⬆️',
          text: 'Reputation upgraded: <b>' + _repKey(repLvl).toUpperCase() + '</b>',
          ref:  username
        });
      }

      // ── 2. Division promotion ───────────────────────────────────────────────
      var prevDivN = DIV_ORDER[(prev.division || 'BRONZE').toUpperCase()] || 0;
      var newDivN  = DIV_ORDER[division] || 0;
      if (newDivN > prevDivN && prevDivN > 0) {
        _push({
          type: 'division_up',
          icon: '⬆️',
          text: 'Promoted to <b>' + division + '</b>',
          ref:  username
        });
      }

      // ── 3. Division demotion ────────────────────────────────────────────────
      if (newDivN < prevDivN && newDivN > 0) {
        _push({
          type: 'division_down',
          icon: '⬇️',
          text: 'Dropped to <b>' + division + '</b>',
          ref:  username
        });
      }

      // ── 4. Sharp Score milestone ────────────────────────────────────────────
      if (milestone > (prev.milestone || 0)) {
        _push({
          type: 'sharp_milestone',
          icon: '📈',
          text: 'Sharp Score reached <b>' + milestone + '</b>',
          ref:  username
        });
      }

      // ── 5. Hall of Fame unlocks ─────────────────────────────────────────────
      if (hofNow.length) {
        var prevSet = new Set(prev.hofBadges || []);
        hofNow.forEach(function (badge) {
          if (!prevSet.has(badge)) {
            _push({
              type: 'hof_unlock',
              icon: '🏆',
              text: 'Hall of Fame Record: <b>' + badge + '</b>',
              ref:  'hall-of-fame'
            });
          }
        });
      }

      _saveState(next);
    }
  };

}());
