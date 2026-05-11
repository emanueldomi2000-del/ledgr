(function () {
  'use strict';

  // ── CSS ─────────────────────────────────────────────────────────
  if (!document.getElementById('mob-styles')) {
    const s = document.createElement('style');
    s.id = 'mob-styles';
    s.textContent = `
/* ═══ LEDGR MOBILE POLISH ════════════════════════════════════ */

/* Page fade-in on load */
@keyframes mob-in{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
@media(max-width:600px){
  body{animation:mob-in .22s ease both}

  /* Body padding so content clears bottom nav */
  body{padding-bottom:calc(64px + env(safe-area-inset-bottom,0px)) !important}

  /* Hide desktop floating post FAB — bottom nav replaces it */
  #floatingPost{display:none !important}

  /* Tighten main padding on very small screens */
  .main{padding-left:14px !important;padding-right:14px !important}

  /* Ensure hero text is readable at 375px */
  .hero-tagline{font-size:clamp(38px,10vw,64px) !important}
  .profile-username{font-size:clamp(28px,9vw,40px) !important}

  /* Minimum readable font sizes */
  .feed-event,.pick-event-text,.feed-market,.pick-market-text{font-size:13px !important}

  /* Touch-friendly buttons: min 44px height */
  .follow-btn,.sub-btn,.share-btn,.pf-btn,.filter-btn,.sport-tab,.nav-btn,
  .tf-btn,.date-tab,.conf-tab,.stake-type-tab{min-height:44px !important}

  /* Action buttons full-width on mobile */
  .profile-actions{flex-direction:column;width:100%}
  .profile-actions .follow-btn,.profile-actions .share-btn,.profile-actions .sub-btn{width:100%;justify-content:center;text-align:center}

  /* Stats grid 2-col on mobile */
  .stats-row{grid-template-columns:repeat(2,1fr) !important}

  /* Leaderboard — hide archetype badge on very small screens to save space */
  .at-badge-sm{display:none}

  /* Dashboard grid single col */
  .grid{grid-template-columns:1fr !important}
  .stats{grid-template-columns:repeat(2,1fr) !important}

  /* Notification panel full-width */
  .notif-panel{right:8px !important;width:calc(100vw - 16px) !important;left:8px}

  /* Recap card full-width */
  .recap-card{width:calc(100vw - 16px) !important;border-radius:16px !important}

  /* Slide-nav overlay works with bottom nav */
  .slide-nav{z-index:210}
  .slide-nav-overlay{z-index:209}

  /* Leaderboard rows — single compressed layout */
  .lb-row{padding:12px 10px !important}
  .rank-num{font-size:15px !important;width:28px !important}
  .av{width:32px !important;height:32px !important;border-radius:8px !important;font-size:11px !important}

  /* Panel padding tighter */
  .panel{padding:16px 14px !important}
  .profile-hero{padding:0 14px 20px !important}
}

/* ── Bottom Navigation ── */
#mob-nav{
  display:none;
  position:fixed;
  bottom:0;left:0;right:0;
  z-index:200;
  background:rgba(6,5,8,0.97);
  border-top:1px solid rgba(184,159,255,0.1);
  backdrop-filter:blur(28px);
  -webkit-backdrop-filter:blur(28px);
  height:calc(60px + env(safe-area-inset-bottom,0px));
  padding-bottom:env(safe-area-inset-bottom,0px);
  align-items:stretch
}
@media(max-width:600px){#mob-nav{display:flex}}

.mob-tab{
  flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:3px;text-decoration:none;color:#544f6e;background:none;border:none;
  cursor:pointer;min-height:44px;padding:6px 2px;transition:color .15s
}
.mob-tab.mob-active{color:#b89fff}
.mob-tab:active{opacity:.65}
.mob-icon{font-size:19px;line-height:1;display:block}
.mob-lbl{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:.5px;text-transform:uppercase;color:inherit}

/* Post tab FAB */
.mob-tab-post{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;text-decoration:none;background:none;border:none;cursor:pointer;min-height:44px;padding:4px 2px;color:#b89fff}
.mob-post-circle{width:44px;height:44px;background:#b89fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;color:#06050a;box-shadow:0 4px 20px rgba(184,159,255,.38);transition:transform .15s,box-shadow .15s}
.mob-tab-post:active .mob-post-circle{transform:scale(.9);box-shadow:0 2px 10px rgba(184,159,255,.2)}
.mob-post-lbl{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:.5px;text-transform:uppercase}
`;
    document.head.appendChild(s);
  }

  // ── Page transition ──────────────────────────────────────────────
  function navigate(url) {
    if (window.innerWidth > 600) { window.location.href = url; return; }
    document.body.style.transition = 'opacity .15s ease';
    document.body.style.opacity = '0';
    setTimeout(function () { window.location.href = url; }, 150);
  }

  // ── Username helper ──────────────────────────────────────────────
  function getUsername() {
    try {
      var ud = localStorage.getItem('ledgr_user') || localStorage.getItem('user');
      if (!ud) return null;
      var u = JSON.parse(ud);
      return u.username || null;
    } catch (e) { return null; }
  }

  // ── Build bottom nav ─────────────────────────────────────────────
  function buildNav() {
    if (document.getElementById('mob-nav')) return;

    var path = window.location.pathname;

    var tabs = [
      { href: '/home',        icon: '🏠', lbl: 'Home',   match: /\/home/ },
      { href: '/leaderboard', icon: '🏆', lbl: 'Board',  match: /\/leaderboard/ },
      { post: true },
      { href: '/feed',        icon: '🔴', lbl: 'Live',   match: /\/feed/ },
      { profile: true,        icon: '👤', lbl: 'Me',     match: /\/tipster/ },
    ];

    var nav = document.createElement('nav');
    nav.id = 'mob-nav';
    nav.setAttribute('aria-label', 'Main navigation');

    tabs.forEach(function (tab) {
      if (tab.post) {
        var btn = document.createElement('a');
        btn.className = 'mob-tab-post';
        btn.href = '/dashboard';
        btn.innerHTML = '<div class="mob-post-circle">＋</div><span class="mob-post-lbl">Post</span>';
        btn.addEventListener('click', function (e) {
          if (window.innerWidth <= 600) { e.preventDefault(); navigate('/dashboard'); }
        });
        nav.appendChild(btn);
        return;
      }

      var a = document.createElement('a');
      a.className = 'mob-tab' + (tab.match && tab.match.test(path) ? ' mob-active' : '');

      if (tab.profile) {
        var un = getUsername();
        a.href = un ? '/tipster?u=' + un : '/login';
        a.innerHTML = '<span class="mob-icon">' + tab.icon + '</span><span class="mob-lbl">' + tab.lbl + '</span>';
        // Update username asynchronously in case localStorage hasn't loaded yet
        if (!un) {
          setTimeout(function () {
            var u2 = getUsername();
            if (u2) a.href = '/tipster?u=' + u2;
          }, 500);
        }
      } else {
        a.href = tab.href;
        a.innerHTML = '<span class="mob-icon">' + tab.icon + '</span><span class="mob-lbl">' + tab.lbl + '</span>';
      }

      a.addEventListener('click', function (e) {
        if (window.innerWidth <= 600 && a.href !== window.location.href) {
          e.preventDefault();
          navigate(a.getAttribute('href'));
        }
      });

      nav.appendChild(a);
    });

    document.body.appendChild(nav);
  }

  // ── Boot ─────────────────────────────────────────────────────────
  function boot() {
    buildNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
