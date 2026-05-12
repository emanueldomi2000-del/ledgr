(function () {
  'use strict';

  const API = 'https://ledgr-backend-production-c132.up.railway.app';

  let _reg = null; // ServiceWorkerRegistration

  // ── Helpers ──────────────────────────────────────────────────
  function u8(b64) {
    var pad  = '='.repeat((4 - b64.length % 4) % 4);
    var b64s = (b64 + pad).replace(/-/g, '+').replace(/_/g, '/');
    var raw  = atob(b64s);
    var out  = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }

  function getUser() {
    try { return JSON.parse(localStorage.getItem('ledgr_user') || localStorage.getItem('user')); }
    catch (_) { return null; }
  }

  function supported() {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  // ── Register service worker ───────────────────────────────────
  async function register() {
    if (!supported()) return null;
    try {
      _reg = await navigator.serviceWorker.register('/notifications-sw.js', { scope: '/' });
      return _reg;
    } catch (e) {
      console.warn('[LEDGR Push] SW registration failed:', e.message);
      return null;
    }
  }

  // ── Subscribe ─────────────────────────────────────────────────
  async function subscribe() {
    const user = getUser();
    if (!user || !user.id) return { error: 'Not logged in' };
    if (!supported())      return { error: 'Push not supported' };

    // 1. Request permission
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return { error: 'Permission denied' };

    // 2. Ensure SW is registered
    const reg = _reg || await register();
    if (!reg) return { error: 'Service worker unavailable' };

    // 3. Fetch VAPID public key
    let vapidKey;
    try {
      const r = await fetch(API + '/vapid-public-key');
      const d = await r.json();
      vapidKey = d.publicKey;
    } catch (e) {
      return { error: 'Could not fetch VAPID key' };
    }

    // 4. Create push subscription
    let sub;
    try {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: u8(vapidKey)
      });
    } catch (e) {
      return { error: 'Could not create subscription: ' + e.message };
    }

    // 5. Save to backend
    try {
      await fetch(API + '/push/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ userId: user.id, subscription: sub.toJSON() })
      });
    } catch (e) {
      return { error: 'Could not save subscription' };
    }

    localStorage.setItem('ledgr_push_subscribed', '1');
    return { success: true };
  }

  // ── Unsubscribe ───────────────────────────────────────────────
  async function unsubscribe() {
    const reg = _reg || (supported() && await navigator.serviceWorker.ready);
    if (!reg) return;
    try {
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch(API + '/push/unsubscribe', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ endpoint: sub.endpoint })
        });
        await sub.unsubscribe();
      }
    } catch (e) {}
    localStorage.removeItem('ledgr_push_subscribed');
  }

  // ── Status ────────────────────────────────────────────────────
  function status() {
    if (!supported()) return 'unsupported';
    return Notification.permission; // 'default' | 'granted' | 'denied'
  }

  function isSubscribed() {
    return status() === 'granted' && !!localStorage.getItem('ledgr_push_subscribed');
  }

  // ── "Enable Notifications" banner (home page only) ────────────
  function injectBanner() {
    if (!supported()) return;
    if (status() !== 'default') return;            // already asked
    if (localStorage.getItem('ledgr_push_banner_dismissed')) return;
    if (!document.getElementById('app')) return;   // not logged-in page

    if (!document.getElementById('push-banner-styles')) {
      var s = document.createElement('style');
      s.id  = 'push-banner-styles';
      s.textContent =
        '#push-banner{display:flex;align-items:center;justify-content:space-between;gap:12px;' +
        'background:rgba(184,159,255,0.07);border:1px solid rgba(184,159,255,0.18);' +
        'border-radius:12px;padding:12px 18px;margin:16px 24px 0;animation:pb-in .3s ease both}' +
        '@keyframes pb-in{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}' +
        '#push-banner p{font-family:\'DM Mono\',monospace;font-size:11px;color:#9590b8;margin:0;flex:1}' +
        '#push-banner p b{color:#f0edff}' +
        '#push-banner-enable{background:#b89fff;color:#07060d;border:none;border-radius:7px;' +
        'padding:8px 16px;font-size:12px;font-weight:700;cursor:pointer;font-family:\'Syne\',sans-serif;' +
        'white-space:nowrap;transition:background .15s}' +
        '#push-banner-enable:hover{background:#cdb8ff}' +
        '#push-banner-dismiss{background:none;border:none;color:#6a6690;font-size:16px;' +
        'cursor:pointer;padding:0 4px;line-height:1;flex-shrink:0}' +
        '#push-banner-dismiss:hover{color:#f0edff}';
      document.head.appendChild(s);
    }

    var banner = document.createElement('div');
    banner.id  = 'push-banner';
    banner.innerHTML =
      '<p>🔔 <b>Enable push notifications</b> — get alerted when tipsters you follow post picks</p>' +
      '<button id="push-banner-enable">Enable</button>' +
      '<button id="push-banner-dismiss" title="Dismiss">✕</button>';

    // Insert before first .main or after <nav>
    var anchor = document.querySelector('.main') || document.querySelector('nav + *');
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(banner, anchor);

    document.getElementById('push-banner-enable').onclick = async function () {
      this.textContent = 'Enabling…';
      this.disabled = true;
      var result = await subscribe();
      if (result.success) {
        banner.innerHTML =
          '<p>✅ <b>Notifications enabled!</b> You\'ll be notified when followed tipsters post picks.</p>' +
          '<button id="push-banner-dismiss" style="background:none;border:none;color:#6a6690;font-size:16px;cursor:pointer;padding:0 4px">✕</button>';
        document.getElementById('push-banner-dismiss').onclick = function () { banner.remove(); };
        setTimeout(function () { banner.style.opacity = '0'; setTimeout(function () { banner.remove(); }, 400); }, 3000);
      } else {
        banner.innerHTML =
          '<p style="color:#f87171">Could not enable notifications — please check your browser settings.</p>' +
          '<button id="push-banner-dismiss" style="background:none;border:none;color:#6a6690;font-size:16px;cursor:pointer;padding:0 4px">✕</button>';
        document.getElementById('push-banner-dismiss').onclick = function () {
          localStorage.setItem('ledgr_push_banner_dismissed', '1');
          banner.remove();
        };
      }
    };

    document.getElementById('push-banner-dismiss').onclick = function () {
      localStorage.setItem('ledgr_push_banner_dismissed', '1');
      banner.remove();
    };
  }

  // ── Init (call on every page that loads the SW) ───────────────
  async function init() {
    await register();
    // Show banner only on home page
    if (window.location.pathname === '/home' || window.location.pathname === '/home/') {
      // Small delay so page renders first
      setTimeout(injectBanner, 1500);
    }
  }

  // ── Public API ────────────────────────────────────────────────
  window.Push = {
    init:         init,
    subscribe:    subscribe,
    unsubscribe:  unsubscribe,
    status:       status,
    isSubscribed: isSubscribed,
    supported:    supported
  };

})();
