/**
 * LEDGR /app-nav.js
 * Unified app navigation system — desktop nav + mobile slide nav.
 * Self-contained IIFE. No external dependencies.
 * Requires /app-tokens.css CSS vars for best results (has hardcoded fallbacks).
 *
 * Usage:
 *   <script src="/app-nav.js"></script>
 *   <script>AppNav.init({ active: 'feed' });</script>
 *
 * API:
 *   AppNav.init({ active, showCta })  — render and inject nav into page
 *   AppNav.open()                     — open slide nav
 *   AppNav.close()                    — close slide nav
 *   AppNav.logout()                   — clear all auth keys and redirect to /
 *   AppNav.goToProfile()              — navigate to /tipster?u=username
 *   AppNav.setNotifBadge(count)       — update notification badge count
 *
 * Phase 2 — Foundation
 */
(function () {
  'use strict';

  // ── CSS ───────────────────────────────────────────────────────────────────
  var CSS = [
    /* Top nav */
    '#appNav{',
      'position:sticky;top:0;',
      'z-index:var(--nav-z,50);',
      'height:var(--nav-h,60px);',
      'display:flex;align-items:center;justify-content:space-between;',
      'padding:0 32px;',
      'background:rgba(7,6,13,0.92);',
      'backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);',
      'border-bottom:1px solid var(--bd,rgba(184,159,255,0.10));',
      'flex-shrink:0;',
    '}',

    '.an-logo{',
      'font-family:var(--font-display,"Bebas Neue",sans-serif);',
      'font-size:26px;letter-spacing:6px;',
      'color:var(--tx,#f0edff);text-decoration:none;flex-shrink:0;',
    '}',
    '.an-logo span{color:var(--ac,#b89fff)}',

    '.an-links{display:flex;gap:2px;align-items:center}',

    '.an-link{',
      'color:var(--mu2,#9590b8);font-size:12px;font-weight:500;',
      'text-decoration:none;padding:7px 12px;border-radius:6px;',
      'transition:all .2s;',
      'font-family:var(--font-body,"Syne",sans-serif);',
    '}',
    '.an-link:hover{color:var(--tx,#f0edff);background:rgba(255,255,255,0.04)}',
    '.an-link.active{color:var(--ac,#b89fff);background:var(--acg,rgba(184,159,255,0.07))}',

    '.an-cta{',
      'background:var(--ac,#b89fff);color:#07060d;',
      'border:none;padding:8px 18px;border-radius:6px;',
      'font-size:12px;font-weight:700;cursor:pointer;',
      'font-family:var(--font-body,"Syne",sans-serif);',
      'transition:all .2s;text-decoration:none;',
      'display:inline-flex;align-items:center;margin-left:6px;',
    '}',
    '.an-cta:hover{background:#cdb8ff;transform:translateY(-1px)}',

    '.an-right{display:flex;align-items:center;gap:4px;flex-shrink:0}',

    '.an-user{',
      'background:transparent;',
      'border:1px solid var(--bd,rgba(184,159,255,0.10));',
      'border-radius:8px;padding:7px 14px;',
      'font-size:12px;font-family:var(--font-mono,"DM Mono",monospace);',
      'color:var(--mu2,#9590b8);cursor:pointer;transition:all .2s;',
    '}',
    '.an-user:hover{color:var(--ac,#b89fff);border-color:var(--bd2,rgba(184,159,255,0.20))}',

    '.an-logout{',
      'background:transparent;border:none;',
      'color:var(--mu,#6a6690);padding:7px 10px;',
      'font-size:11px;cursor:pointer;',
      'font-family:var(--font-body,"Syne",sans-serif);transition:color .2s;',
    '}',
    '.an-logout:hover{color:var(--rd,#f87171)}',

    '.an-ham{',
      'display:none;background:none;border:none;',
      'color:var(--mu2,#9590b8);font-size:20px;cursor:pointer;padding:4px 8px;',
    '}',

    /* Notification badge dot */
    '.an-notif-dot{',
      'display:inline-flex;align-items:center;justify-content:center;',
      'background:var(--rd,#f87171);color:#fff;',
      'font-family:var(--font-mono,"DM Mono",monospace);',
      'font-size:9px;font-weight:700;',
      'min-width:16px;height:16px;border-radius:999px;',
      'padding:0 4px;margin-left:4px;line-height:1;',
    '}',

    /* Slide overlay */
    '#appSlideOverlay{',
      'position:fixed;inset:0;',
      'background:rgba(7,6,13,0.75);',
      'z-index:var(--slide-overlay-z,199);',
      'display:none;',
      'backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);',
    '}',
    '#appSlideOverlay.open{display:block}',

    /* Slide nav panel */
    '#appSlideNav{',
      'position:fixed;top:0;right:-320px;',
      'width:300px;height:100vh;',
      'background:var(--s1,#0c0a1a);',
      'border-left:1px solid var(--bd,rgba(184,159,255,0.10));',
      'z-index:var(--slide-nav-z,200);',
      'transition:right .3s cubic-bezier(.4,0,.2,1);',
      'display:flex;flex-direction:column;overflow:hidden;',
    '}',
    '#appSlideNav.open{right:0}',

    '.an-slide-head{',
      'display:flex;align-items:center;justify-content:space-between;',
      'padding:20px 20px 16px;',
      'border-bottom:1px solid var(--bd,rgba(184,159,255,0.10));',
      'flex-shrink:0;',
    '}',
    '.an-slide-logo{',
      'font-family:var(--font-display,"Bebas Neue",sans-serif);',
      'font-size:20px;letter-spacing:5px;color:var(--tx,#f0edff);',
    '}',
    '.an-slide-logo span{color:var(--ac,#b89fff)}',
    '.an-slide-close{',
      'background:none;border:none;',
      'color:var(--mu,#6a6690);font-size:18px;',
      'cursor:pointer;padding:4px 8px;transition:color .2s;',
    '}',
    '.an-slide-close:hover{color:var(--tx,#f0edff)}',

    /* Profile card inside slide nav */
    '.an-slide-profile{',
      'display:flex;align-items:center;gap:12px;',
      'padding:16px 20px;cursor:pointer;',
      'border-bottom:1px solid var(--bd,rgba(184,159,255,0.10));',
      'flex-shrink:0;transition:background .2s;',
    '}',
    '.an-slide-profile:hover{background:rgba(255,255,255,0.025)}',
    '.an-slide-av{',
      'width:36px;height:36px;border-radius:8px;',
      'background:linear-gradient(135deg,#6d28d9,#b89fff);',
      'display:flex;align-items:center;justify-content:center;',
      'font-family:var(--font-display,"Bebas Neue",sans-serif);',
      'font-size:14px;color:#fff;flex-shrink:0;',
    '}',
    '.an-slide-pname{font-weight:700;font-size:13px;color:var(--tx,#f0edff)}',
    '.an-slide-psub{',
      'font-size:10px;color:var(--mu,#6a6690);',
      'font-family:var(--font-mono,"DM Mono",monospace);margin-top:2px;',
    '}',

    /* Links list */
    '.an-slide-links{',
      'padding:10px 8px;flex:1;overflow-y:auto;',
      'scrollbar-width:thin;scrollbar-color:rgba(184,159,255,0.15) transparent;',
    '}',
    '.an-slide-links::-webkit-scrollbar{width:3px}',
    '.an-slide-links::-webkit-scrollbar-thumb{background:rgba(184,159,255,0.15);border-radius:2px}',

    '.an-snl{',
      'display:flex;align-items:center;gap:12px;',
      'padding:10px 14px;border-radius:10px;',
      'text-decoration:none;transition:background .2s;',
      'margin-bottom:1px;',
      'color:var(--mu2,#9590b8);font-size:13px;',
      'font-family:var(--font-body,"Syne",sans-serif);',
      'position:relative;',
    '}',
    '.an-snl:hover{background:rgba(255,255,255,0.04);color:var(--tx,#f0edff)}',
    '.an-snl.active{background:var(--acg,rgba(184,159,255,0.07));color:var(--ac,#b89fff)}',
    '.an-snl-icon{font-size:16px;width:20px;text-align:center;flex-shrink:0}',
    '.an-snl-text{flex:1}',

    /* Post a Pick CTA strip */
    '.an-slide-post{',
      'padding:12px 20px;',
      'border-top:1px solid var(--bd,rgba(184,159,255,0.10));',
      'flex-shrink:0;',
    '}',
    '.an-post-cta{',
      'display:block;text-align:center;',
      'background:var(--ac,#b89fff);color:#07060d;',
      'text-decoration:none;border-radius:10px;padding:11px;',
      'font-family:var(--font-mono,"DM Mono",monospace);',
      'font-size:11px;font-weight:700;letter-spacing:2px;',
      'transition:background .2s;',
    '}',
    '.an-post-cta:hover{background:#cdb8ff}',

    /* Footer: logout or sign in */
    '.an-slide-footer{padding:10px 20px 16px;flex-shrink:0}',
    '.an-slide-logout{',
      'background:none;border:none;',
      'color:var(--mu,#6a6690);font-size:12px;cursor:pointer;',
      'font-family:var(--font-body,"Syne",sans-serif);',
      'padding:4px 0;transition:color .2s;',
      'width:100%;text-align:left;',
    '}',
    '.an-slide-logout:hover{color:var(--rd,#f87171)}',
    '.an-slide-login{',
      'display:block;text-align:center;',
      'color:var(--ac,#b89fff);font-size:12px;',
      'font-family:var(--font-mono,"DM Mono",monospace);',
      'letter-spacing:1px;padding:4px 0;',
    '}',

    /* Responsive */
    '@media(max-width:700px){',
      '.an-links,.an-user,.an-logout{display:none}',
      '.an-ham{display:block}',
    '}'
  ].join('');

  // ── NAV LINK CONFIG ───────────────────────────────────────────────────────
  // desktopVisible = true → shown in the top bar's .an-links
  var NAV_LINKS = [
    { href: '/home',         label: 'Home',         desktopLabel: 'Home',        icon: '🏠',  key: 'home',         desktopVisible: true  },
    { href: '/leaderboard',  label: 'Leaderboard',  desktopLabel: 'Leaderboard', icon: '🏆',  key: 'leaderboard',  desktopVisible: true  },
    { href: '/feed',         label: 'Live Feed',    desktopLabel: 'Feed',        icon: '🔴',  key: 'feed',         desktopVisible: true  },
    { href: '/analytics',    label: 'Analytics',    desktopLabel: 'Analytics',   icon: '📊',  key: 'analytics',    desktopVisible: true  },
    { href: '/community',    label: 'Community',    desktopLabel: 'Community',   icon: '💬',  key: 'community',    desktopVisible: true  },
    { href: '/dashboard',    label: 'Post a Pick',                               icon: '＋',  key: 'dashboard',    desktopVisible: false },
    { href: '/notifications',label: 'Notifications',                             icon: '🔔',  key: 'notifications',desktopVisible: false },
    { href: '/progress',     label: 'Progress',                                  icon: '🎮',  key: 'progress',     desktopVisible: false },
    { href: '/badges',       label: 'Badges',                                    icon: '🏅',  key: 'badges',       desktopVisible: false },
    { href: '/compare',      label: 'Compare',                                   icon: '⚖️',  key: 'compare',      desktopVisible: false },
    { href: '/simulator',    label: 'Simulator',                                 icon: '📈',  key: 'simulator',    desktopVisible: false },
    { href: '/news',         label: 'Sports Intel',                              icon: '📰',  key: 'news',         desktopVisible: false },
    { href: '/hall-of-fame', label: 'Hall of Fame',                              icon: '🏛️', key: 'hall-of-fame', desktopVisible: false },
    { href: '/settings',     label: 'Settings',                                  icon: '⚙️',  key: 'settings',     desktopVisible: false }
  ];

  // ── HELPERS ───────────────────────────────────────────────────────────────
  function _readUser() {
    try {
      var raw = localStorage.getItem('ledgr_user') || localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function _initials(username) {
    return username ? username.slice(0, 2).toUpperCase() : '?';
  }

  function _unreadCount() {
    try {
      var items = JSON.parse(localStorage.getItem('ledgr_notifications') || '[]');
      return items.filter(function (n) { return !n.readAt; }).length;
    } catch (e) { return 0; }
  }

  function _esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── ACTIONS ───────────────────────────────────────────────────────────────
  function _logout() {
    ['ledgr_token', 'ledgr_user', 'token', 'user', 'username'].forEach(function (k) {
      localStorage.removeItem(k);
    });
    window.location.href = '/';
  }

  function _open() {
    var nav = document.getElementById('appSlideNav');
    var ov  = document.getElementById('appSlideOverlay');
    if (nav) nav.classList.add('open');
    if (ov)  ov.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function _close() {
    var nav = document.getElementById('appSlideNav');
    var ov  = document.getElementById('appSlideOverlay');
    if (nav) nav.classList.remove('open');
    if (ov)  ov.classList.remove('open');
    document.body.style.overflow = '';
  }

  function _goToProfile() {
    var user = _readUser();
    if (user && user.username) {
      window.location.href = '/tipster?u=' + encodeURIComponent(user.username);
    }
  }

  function _setNotifBadge(count) {
    var badges = document.querySelectorAll('.an-notif-badge');
    for (var i = 0; i < badges.length; i++) {
      var el = badges[i];
      if (count > 0) {
        el.textContent = count > 99 ? '99+' : String(count);
        el.style.display = 'inline-flex';
      } else {
        el.style.display = 'none';
      }
    }
  }

  // ── HTML BUILDER ──────────────────────────────────────────────────────────
  function _buildHTML(active, user, showCta) {
    var username = user ? _esc(user.username) : null;
    var unread   = _unreadCount();

    /* Desktop nav links */
    var desktopLinks = NAV_LINKS
      .filter(function (l) { return l.desktopVisible; })
      .map(function (l) {
        var isActive = active === l.key;
        return '<a href="' + l.href + '" class="an-link' + (isActive ? ' active' : '') + '">'
          + _esc(l.desktopLabel || l.label)
          + '</a>';
      }).join('');

    /* Desktop CTA (hide when already on dashboard) */
    var ctaHtml = (showCta && active !== 'dashboard')
      ? '<a href="/dashboard" class="an-cta">Post a Pick</a>'
      : '';

    /* Right side: user badge + logout + hamburger */
    var rightHtml = '';
    if (username) {
      rightHtml += '<button class="an-user" id="appNavUser" onclick="window.AppNav.goToProfile()">@' + username + '</button>';
      rightHtml += '<button class="an-logout" onclick="window.AppNav.logout()">Out</button>';
    }
    rightHtml += '<button class="an-ham" id="appNavHam" onclick="window.AppNav.open()">&#9776;</button>';

    /* Slide nav profile card */
    var profileCard = '';
    if (username) {
      profileCard = '<div class="an-slide-profile" onclick="window.AppNav.goToProfile();window.AppNav.close()">'
        + '<div class="an-slide-av" id="appNavAvatar">' + _initials(user.username) + '</div>'
        + '<div>'
        + '<div class="an-slide-pname" id="appNavSlideName">@' + username + '</div>'
        + '<div class="an-slide-psub">View your profile →</div>'
        + '</div>'
        + '</div>';
    }

    /* Slide nav links — full canonical list */
    var slideLinks = NAV_LINKS.map(function (l) {
      var isActive = active === l.key;

      /* Notification badge */
      var badgeHtml = '';
      if (l.key === 'notifications') {
        var display = unread > 0 ? 'inline-flex' : 'none';
        var count   = unread > 99 ? '99+' : String(unread);
        badgeHtml = '<span class="an-notif-dot an-notif-badge" style="display:' + display + '">' + count + '</span>';
      }

      return '<a href="' + l.href + '" class="an-snl' + (isActive ? ' active' : '') + '" onclick="window.AppNav.close()">'
        + '<span class="an-snl-icon">' + l.icon + '</span>'
        + '<span class="an-snl-text">' + _esc(l.label) + '</span>'
        + badgeHtml
        + '</a>';
    }).join('');

    /* Slide footer */
    var footerHtml = username
      ? '<button class="an-slide-logout" onclick="window.AppNav.logout()">Log Out</button>'
      : '<a href="/login" class="an-slide-login">Sign In →</a>';

    return '<nav id="appNav">'
      + '<a href="/" class="an-logo">LEDG<span>R</span></a>'
      + '<div class="an-links">' + desktopLinks + ctaHtml + '</div>'
      + '<div class="an-right">' + rightHtml + '</div>'
      + '</nav>'

      + '<div id="appSlideOverlay" onclick="window.AppNav.close()"></div>'

      + '<div id="appSlideNav">'
      + '<div class="an-slide-head">'
      + '<span class="an-slide-logo">LEDG<span>R</span></span>'
      + '<button class="an-slide-close" onclick="window.AppNav.close()">✕</button>'
      + '</div>'
      + profileCard
      + '<div class="an-slide-links">' + slideLinks + '</div>'
      + '<div class="an-slide-post"><a href="/dashboard" class="an-post-cta" onclick="window.AppNav.close()">＋ POST A PICK</a></div>'
      + '<div class="an-slide-footer">' + footerHtml + '</div>'
      + '</div>';
  }

  // ── INIT ──────────────────────────────────────────────────────────────────
  function _init(opts) {
    /* Guard against double-init */
    if (document.getElementById('appNav')) return;

    opts = opts || {};
    var active  = opts.active  || '';
    var showCta = opts.showCta !== false; /* default true */

    /* Inject CSS into <head> once */
    if (!document.getElementById('app-nav-css')) {
      var style = document.createElement('style');
      style.id  = 'app-nav-css';
      style.textContent = CSS;
      document.head.appendChild(style);
    }

    var user = _readUser();
    var html = _buildHTML(active, user, showCta);

    /* Prepend to <body> before all existing content */
    document.body.insertAdjacentHTML('afterbegin', html);

    /* Back-compat: sync any #userBadge element already in page HTML */
    if (user && user.username) {
      var legacy = document.getElementById('userBadge');
      if (legacy) legacy.textContent = '@' + user.username;
    }
  }

  // ── PUBLIC API ────────────────────────────────────────────────────────────
  window.AppNav = {
    init:          _init,
    open:          _open,
    close:         _close,
    logout:        _logout,
    goToProfile:   _goToProfile,
    setNotifBadge: _setNotifBadge
  };

}());
