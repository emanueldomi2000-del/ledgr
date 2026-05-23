/**
 * LEDGR /app-nav.js
 * Unified app navigation — desktop bar + identity cluster + mobile slide nav.
 * Self-contained IIFE. No external dependencies.
 *
 * Usage:
 *   <script src="/app-nav.js"></script>
 *   <script>AppNav.init({ active: 'feed' });</script>
 *
 * API:
 *   AppNav.init({ active, showCta })  — render and inject nav
 *   AppNav.open()                     — open slide nav
 *   AppNav.close()                    — close slide nav
 *   AppNav.logout()                   — clear auth keys and redirect to /
 *   AppNav.goToProfile()              — navigate to /tipster?u=username
 *   AppNav.setNotifBadge(count)       — update bell badge count
 *   AppNav.toggleDropdown(evt)        — toggle identity dropdown
 *   AppNav.closeDropdown()            — close identity dropdown
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
      'padding:0 28px;',
      'background:rgba(7,6,13,0.92);',
      'backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);',
      'border-bottom:1px solid var(--bd,rgba(184,159,255,0.10));',
      'flex-shrink:0;',
    '}',

    '.an-logo{display:flex;align-items:center;gap:8px;text-decoration:none;flex-shrink:0}',
    '.an-logo-img{width:24px;height:24px;object-fit:contain;flex-shrink:0}',
    '.an-logo-wordmark{',
      'font-family:var(--font-display,"Bebas Neue",sans-serif);',
      'font-size:22px;letter-spacing:3px;color:var(--tx,#f0edff);',
    '}',
    '.an-logo-wordmark .logo-accent{color:var(--ac,#b89fff)}',

    '.an-links{display:flex;gap:2px;align-items:center}',

    '.an-link{',
      'color:var(--mu2,#9590b8);font-size:12px;font-weight:500;',
      'text-decoration:none;padding:7px 12px;border-radius:6px;',
      'transition:all .2s;font-family:var(--font-body,"Syne",sans-serif);',
    '}',
    '.an-link:hover{color:var(--tx,#f0edff);background:rgba(255,255,255,0.04)}',
    '.an-link.active{color:var(--ac,#b89fff);background:var(--acg,rgba(184,159,255,0.07))}',

    /* Post Pick — accented nav link */
    '.an-link.an-link-post{',
      'background:var(--ac,#b89fff);color:#07060d;',
      'font-weight:700;margin-left:4px;',
    '}',
    '.an-link.an-link-post:hover{background:#cdb8ff;color:#07060d}',
    '.an-link.an-link-post.active{background:var(--ac,#b89fff);color:#07060d}',

    '.an-right{display:flex;align-items:center;gap:8px;flex-shrink:0}',

    /* Identity cluster */
    '.an-identity{display:flex;align-items:center;gap:6px;position:relative}',

    /* Bell button */
    '.an-bell{',
      'position:relative;background:transparent;border:none;',
      'width:34px;height:34px;border-radius:8px;',
      'display:flex;align-items:center;justify-content:center;',
      'color:var(--mu2,#9590b8);font-size:15px;cursor:pointer;',
      'transition:all .2s;text-decoration:none;flex-shrink:0;',
    '}',
    '.an-bell:hover{color:var(--tx,#f0edff);background:rgba(255,255,255,0.04)}',
    '.an-bell-badge{',
      'position:absolute;top:3px;right:3px;',
      'background:var(--rd,#f87171);color:#fff;',
      'font-family:var(--font-mono,"DM Mono",monospace);',
      'font-size:8px;font-weight:700;',
      'min-width:14px;height:14px;border-radius:999px;',
      'display:none;align-items:center;justify-content:center;',
      'padding:0 3px;line-height:1;pointer-events:none;',
    '}',

    /* User dropdown button */
    '.an-user-btn{',
      'background:transparent;',
      'border:1px solid var(--bd,rgba(184,159,255,0.10));',
      'border-radius:8px;padding:6px 12px;',
      'font-size:12px;font-family:var(--font-mono,"DM Mono",monospace);',
      'color:var(--mu2,#9590b8);cursor:pointer;',
      'display:flex;align-items:center;gap:6px;',
      'transition:all .2s;white-space:nowrap;',
    '}',
    '.an-user-btn:hover{color:var(--ac,#b89fff);border-color:rgba(184,159,255,0.25)}',
    '.an-user-btn.open{color:var(--ac,#b89fff);border-color:rgba(184,159,255,0.25)}',
    '.an-user-caret{font-size:9px;opacity:0.5;transition:transform .2s;line-height:1}',
    '.an-user-btn.open .an-user-caret{transform:rotate(180deg)}',

    /* Dropdown panel */
    '.an-dropdown{',
      'position:absolute;top:calc(100% + 8px);right:0;',
      'background:var(--s1,#0c0a1a);',
      'border:1px solid var(--bd,rgba(184,159,255,0.10));',
      'border-radius:12px;min-width:176px;',
      'box-shadow:0 16px 48px rgba(0,0,0,0.6);',
      'z-index:400;overflow:hidden;',
      'display:none;padding:4px 0;',
    '}',
    '.an-dropdown.open{display:block;animation:anDropIn .15s ease}',
    '@keyframes anDropIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}',

    '.an-dd-item{',
      'display:flex;align-items:center;gap:10px;',
      'padding:9px 16px;text-decoration:none;',
      'color:var(--mu2,#9590b8);',
      'font-size:12px;font-family:var(--font-body,"Syne",sans-serif);',
      'transition:background .12s,color .12s;cursor:pointer;',
      'border:none;background:none;width:100%;text-align:left;box-sizing:border-box;',
    '}',
    '.an-dd-item:hover{background:rgba(255,255,255,0.04);color:var(--tx,#f0edff)}',
    '.an-dd-icon{font-size:13px;width:16px;text-align:center;flex-shrink:0;opacity:0.7}',
    '.an-dd-sep{height:1px;background:var(--bd,rgba(184,159,255,0.10));margin:3px 0}',
    '.an-dd-logout:hover{color:var(--rd,#f87171)!important}',

    /* Hamburger */
    '.an-ham{',
      'display:none;background:none;border:none;',
      'color:var(--mu2,#9590b8);font-size:20px;cursor:pointer;padding:4px 8px;',
    '}',

    /* Notification dot (kept for compat with any page-level badge elements) */
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
    '.an-slide-logo{display:flex;align-items:center;gap:8px}',
    '.an-slide-logo img{width:20px;height:20px;object-fit:contain}',
    '.an-slide-logo-text{',
      'font-family:var(--font-display,"Bebas Neue",sans-serif);',
      'font-size:20px;letter-spacing:5px;color:var(--tx,#f0edff);',
    '}',
    '.an-slide-logo-text .logo-accent{color:var(--ac,#b89fff)}',
    '.an-slide-close{',
      'background:none;border:none;',
      'color:var(--mu,#6a6690);font-size:18px;',
      'cursor:pointer;padding:4px 8px;transition:color .2s;',
    '}',
    '.an-slide-close:hover{color:var(--tx,#f0edff)}',

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

    /* Divider inside slide nav between primary and secondary links */
    '.an-snl-divider{',
      'height:1px;background:var(--bd,rgba(184,159,255,0.10));',
      'margin:6px 14px;',
    '}',

    /* Section label inside slide nav */
    '.an-snl-section{',
      'padding:10px 14px 3px;',
      'font-family:var(--font-mono,"DM Mono",monospace);',
      'font-size:9px;letter-spacing:2px;color:var(--mu,#6a6690);',
    '}',

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
      '.an-links{display:none}',
      '.an-ham{display:block}',
      '.an-logo-wordmark{display:none}',
      '.an-user-btn{display:none}',
    '}'
  ].join('');

  // ── NAV LINK CONFIG ───────────────────────────────────────────────────────
  // desktopVisible = true  → shown in the top bar .an-links
  // desktopVisible = false → slide menu only
  // dynamicUser = true     → href computed from logged-in username at render time
  var NAV_LINKS = [
    // ── PRIMARY — desktop bar + slide primary section ────────────────────────
    { href: '/home',         label: 'Home',         desktopLabel: 'Home',        icon: '🏠',  key: 'home',         desktopVisible: true  },
    { href: '/leaderboard',  label: 'Leaderboard',  desktopLabel: 'Leaderboard', icon: '🏆',  key: 'leaderboard',  desktopVisible: true  },
    { href: '/progress',     label: 'Progress',     desktopLabel: 'Progress',    icon: '🎮',  key: 'progress',     desktopVisible: true  },
    { href: '/feed',         label: 'Feed',         desktopLabel: 'Feed',        icon: '🔴',  key: 'feed',         desktopVisible: true  },
    { href: '/community',    label: 'Community',    desktopLabel: 'Community',   icon: '💬',  key: 'community',    desktopVisible: true  },
    { href: null,            label: 'Profile',      desktopLabel: 'Profile',     icon: '👤',  key: 'profile',      desktopVisible: true,  dynamicUser: true },
    // ── SECONDARY — slide menu only ──────────────────────────────────────────
    { href: '/hall-of-fame', label: 'Hall of Fame',  icon: '🏆',  key: 'hall-of-fame',  desktopVisible: false, section: 'explore' },
    { href: '/compare',      label: 'Compare',        icon: '⚖️',  key: 'compare',       desktopVisible: false, section: 'explore' },
    { href: '/simulator',    label: 'Simulator',      icon: '📊',  key: 'simulator',     desktopVisible: false, section: 'explore' },
    { href: '/analytics',    label: 'Analytics',      icon: '📈',  key: 'analytics',     desktopVisible: false, section: 'explore' },
    { href: '/badges',       label: 'Badges',         icon: '🎖️', key: 'badges',        desktopVisible: false, section: 'explore' },
    { href: '/news',         label: 'Sports Intel',   icon: '📰',  key: 'news',          desktopVisible: false, section: 'explore' },
    { href: '/archetypes',   label: 'Archetypes',     icon: '🧬',  key: 'archetypes',    desktopVisible: false, section: 'explore' },
    { href: '/settings',     label: 'Settings',       icon: '⚙️',  key: 'settings',      desktopVisible: false, section: 'account' },
    { href: '/notifications', label: 'Notifications', icon: '🔔',  key: 'notifications', desktopVisible: false, section: 'account' }
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
      return items.filter(function (n) { return !n.read; }).length;
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
    _closeDropdown();
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

  function _toggleDropdown(evt) {
    if (evt) evt.stopPropagation();
    var btn = document.getElementById('appNavUserBtn');
    var dd  = document.getElementById('appNavDropdown');
    if (!btn || !dd) return;
    if (dd.classList.contains('open')) {
      dd.classList.remove('open');
      btn.classList.remove('open');
    } else {
      dd.classList.add('open');
      btn.classList.add('open');
    }
  }

  function _closeDropdown() {
    var btn = document.getElementById('appNavUserBtn');
    var dd  = document.getElementById('appNavDropdown');
    if (btn) btn.classList.remove('open');
    if (dd)  dd.classList.remove('open');
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
  function _buildHTML(active, user) {
    var username = user ? _esc(user.username) : null;
    var unread   = _unreadCount();

    /* Desktop nav links */
    var desktopLinks = NAV_LINKS
      .filter(function (l) { return l.desktopVisible; })
      .map(function (l) {
        var isActive = active === l.key;
        var href;
        if (l.dynamicUser) {
          if (!username) return '';
          href = '/tipster?u=' + encodeURIComponent(user.username);
        } else {
          href = l.href;
        }
        return '<a href="' + href + '" class="an-link' + (isActive ? ' active' : '') + '">'
          + _esc(l.desktopLabel || l.label)
          + '</a>';
      }).join('');

    /* Right side: identity cluster + hamburger */
    var rightHtml = '';
    if (username) {
      var badgeDisplay = unread > 0 ? 'inline-flex' : 'none';
      var badgeText    = unread > 99 ? '99+' : String(unread);
      var profileHref  = '/tipster?u=' + encodeURIComponent(user.username);

      rightHtml +=
        '<div class="an-identity">'

        /* Bell */
        + '<a href="/notifications" class="an-bell" title="Notifications">'
        + '🔔'
        + '<span class="an-bell-badge an-notif-badge" style="display:' + badgeDisplay + '">' + badgeText + '</span>'
        + '</a>'

        /* User dropdown button */
        + '<div style="position:relative">'
        + '<button class="an-user-btn" id="appNavUserBtn" onclick="window.AppNav.toggleDropdown(event)">'
        + '@' + username
        + '<span class="an-user-caret">▾</span>'
        + '</button>'

        /* Dropdown panel */
        + '<div class="an-dropdown" id="appNavDropdown">'
        + '<a class="an-dd-item" href="' + profileHref + '" onclick="window.AppNav.closeDropdown()"><span class="an-dd-icon">👤</span>Profile</a>'
        + '<a class="an-dd-item" href="/progress" onclick="window.AppNav.closeDropdown()"><span class="an-dd-icon">🎮</span>Progress</a>'
        + '<a class="an-dd-item" href="/badges" onclick="window.AppNav.closeDropdown()"><span class="an-dd-icon">🏅</span>Badges</a>'
        + '<a class="an-dd-item" href="/archetypes" onclick="window.AppNav.closeDropdown()"><span class="an-dd-icon">⚡</span>Archetypes</a>'
        + '<a class="an-dd-item" href="/settings" onclick="window.AppNav.closeDropdown()"><span class="an-dd-icon">⚙️</span>Settings</a>'
        + '<div class="an-dd-sep"></div>'
        + '<button class="an-dd-item an-dd-logout" onclick="window.AppNav.logout()"><span class="an-dd-icon">↪</span>Log Out</button>'
        + '</div>'
        + '</div>'

        + '</div>';
    }
    rightHtml += '<button class="an-ham" id="appNavHam" onclick="window.AppNav.open()">&#9776;</button>';

    /* Slide nav links — primary section (desktop links), divider, then secondary */
    var primaryLinks   = NAV_LINKS.filter(function (l) { return l.desktopVisible; });
    var secondaryLinks = NAV_LINKS.filter(function (l) { return !l.desktopVisible; });

    function _slideLink(l) {
      var isActive = active === l.key;
      var href;
      if (l.dynamicUser) {
        if (!username) return '';
        href = '/tipster?u=' + encodeURIComponent(user.username);
      } else {
        href = l.href;
      }
      return '<a href="' + href + '" class="an-snl' + (isActive ? ' active' : '') + '" onclick="window.AppNav.close()">'
        + '<span class="an-snl-icon">' + l.icon + '</span>'
        + '<span class="an-snl-text">' + _esc(l.label) + '</span>'
        + '</a>';
    }

    var slideLinks = primaryLinks.map(_slideLink).join('');
    slideLinks += '<div class="an-snl-divider"></div>';
    var _seenSection = {};
    var _sectionLabels = { explore: 'EXPLORE', account: 'ACCOUNT' };
    secondaryLinks.forEach(function(l) {
      var sec = l.section || '';
      if (sec && !_seenSection[sec]) {
        _seenSection[sec] = true;
        slideLinks += '<div class="an-snl-section">' + (_sectionLabels[sec] || sec.toUpperCase()) + '</div>';
      }
      slideLinks += _slideLink(l);
    });

    /* Slide footer */
    var footerHtml = username
      ? '<button class="an-slide-logout" onclick="window.AppNav.logout()">Log Out</button>'
      : '<a href="/login" class="an-slide-login">Sign In →</a>';

    var logoHref = username ? '/home' : '/';
    var logoHtml = '<a href="' + logoHref + '" class="an-logo">'
      + '<picture>'
      + '<source media="(max-width:768px)" srcset="/assets/logo/ledgr-icon.png">'
      + '<img src="/assets/logo/ledgr-logo.png" alt="LEDGR" style="height:32px;width:auto;display:block;" loading="eager">'
      + '</picture>'
      + '</a>';

    return '<nav id="appNav">'
      + logoHtml
      + '<div class="an-links">' + desktopLinks + '</div>'
      + '<div class="an-right">' + rightHtml + '</div>'
      + '</nav>'

      + '<div id="appSlideOverlay" onclick="window.AppNav.close()"></div>'

      + '<div id="appSlideNav">'
      + '<div class="an-slide-head">'
      + '<span class="an-slide-logo"><img src="/assets/logo/ledgr-icon.png" alt="LEDGR"><span class="an-slide-logo-text"><span class="logo-accent">L</span>EDGR</span></span>'
      + '<button class="an-slide-close" onclick="window.AppNav.close()">✕</button>'
      + '</div>'
      + '<div class="an-slide-links">' + slideLinks + '</div>'
      + '<div class="an-slide-post"><a href="/dashboard" class="an-post-cta" onclick="window.AppNav.close()">＋ POST A PICK</a></div>'
      + '<div class="an-slide-footer">' + footerHtml + '</div>'
      + '</div>';
  }

  // ── INIT ──────────────────────────────────────────────────────────────────
  function _init(opts) {
    if (document.getElementById('appNav')) return;

    opts = opts || {};
    var active = opts.active || '';

    if (!document.getElementById('app-nav-css')) {
      var style = document.createElement('style');
      style.id  = 'app-nav-css';
      style.textContent = CSS;
      document.head.appendChild(style);
    }

    var user = _readUser();
    var html = _buildHTML(active, user);
    document.body.insertAdjacentHTML('afterbegin', html);

    /* Back-compat: sync any #userBadge element already in page HTML */
    if (user && user.username) {
      var legacy = document.getElementById('userBadge');
      if (legacy) legacy.textContent = '@' + user.username;
    }

    /* Close dropdown on outside click */
    document.addEventListener('click', function (e) {
      var dd  = document.getElementById('appNavDropdown');
      var btn = document.getElementById('appNavUserBtn');
      if (!dd || !dd.classList.contains('open')) return;
      if (btn && btn.contains(e.target)) return;
      if (!dd.contains(e.target)) _closeDropdown();
    });
  }

  // ── PUBLIC API ────────────────────────────────────────────────────────────
  window.AppNav = {
    init:           _init,
    open:           _open,
    close:          _close,
    logout:         _logout,
    goToProfile:    _goToProfile,
    setNotifBadge:  _setNotifBadge,
    toggleDropdown: _toggleDropdown,
    closeDropdown:  _closeDropdown
  };

}());
