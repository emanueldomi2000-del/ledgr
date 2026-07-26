/* LEDGR Brand Nav — shared across all pages */

function brandMenuToggle() {
  document.getElementById('brandSlideMenu').classList.toggle('open');
  document.getElementById('brandOverlay').classList.toggle('open');
}

function _brandLogout() {
  ['ledgr_token','ledgr_user','token','user'].forEach(k => localStorage.removeItem(k));
  window.location.replace('/');
}

function brandNavInit() {
  const raw = localStorage.getItem('ledgr_user') || localStorage.getItem('user');
  const authEl = document.getElementById('brandSlideAuth');
  const profileLink = document.getElementById('profileNavLink');
  const logoLink = document.querySelector('nav.brand-nav .logo');
  const slideLinks = document.querySelector('.brand-slide-links');

  if (raw) {
    try {
      const u = JSON.parse(raw);
      const nav = document.querySelector('nav.brand-nav');
      if (nav) nav.classList.add('app-context');
      if (u && u.username) {
        if (profileLink) profileLink.href = '/tipster?u=' + u.username;
        if (logoLink) logoLink.href = '/home';
      }

      // Inject standard logged-in hamburger links
      if (slideLinks) {
        slideLinks.innerHTML = [
          ['Post a Pick',     '/dashboard'],
          ['Simulator',       '/simulator'],
          ['Compare Tipsters','/compare'],
          ['Badges',          '/badges'],
          ['Progress',        '/progress'],
          ['Hall of Fame',    '/hall-of-fame'],
          ['Settings',        '/settings'],
          ['Notifications',   '/notifications'],
        ].map(([label, href]) => '<a href="' + href + '" class="brand-snl">' + label + '</a>').join('');
      }

      // Auth section: username + logout
      if (authEl) {
        authEl.innerHTML =
          '<div style="padding:14px 20px;border-top:1px solid var(--color-border)">' +
          '<div style="font-family:\'JetBrains Mono\',monospace;font-size:11px;color:var(--color-muted);margin-bottom:10px;letter-spacing:1px">@' + (u.username || 'user') + '</div>' +
          '<button onclick="_brandLogout()" ' +
          'style="width:100%;background:transparent;border:1px solid var(--color-border);color:var(--color-muted);border-radius:8px;padding:10px;font-size:12px;cursor:pointer;font-family:\'Barlow\',sans-serif;transition:border-color .2s,color .2s" ' +
          'onmouseover="this.style.borderColor=\'#f87171\';this.style.color=\'#f87171\'" ' +
          'onmouseout="this.style.borderColor=\'var(--color-border)\';this.style.color=\'var(--color-muted)\'">Log Out</button>' +
          '</div>';
      }
    } catch (e) {}
  } else {
    // Not logged in — guest slide menu
    if (slideLinks) {
      slideLinks.innerHTML =
        '<a href="/leaderboard" class="brand-snl">Leaderboard</a>' +
        '<a href="/become-a-tipster" class="brand-snl">Become a Tipster</a>';
    }
    if (authEl) {
      authEl.innerHTML =
        '<div style="padding:14px 20px;border-top:1px solid var(--color-border)">' +
        '<button onclick="if(typeof openAuth===\'function\'){openAuth()}else{window.location.href=\'/\'}" ' +
        'style="width:100%;text-align:center;background:var(--color-purple);color:#fff;border:none;border-radius:8px;padding:10px;font-size:13px;font-weight:500;cursor:pointer;font-family:\'Barlow\',sans-serif;transition:background .2s" ' +
        'onmouseover="this.style.background=\'var(--color-purple-light)\'" ' +
        'onmouseout="this.style.background=\'var(--color-purple)\'">Log In / Sign Up</button>' +
        '</div>';
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', brandNavInit);
} else {
  brandNavInit();
}
