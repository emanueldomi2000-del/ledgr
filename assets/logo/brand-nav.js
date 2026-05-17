// LEDGR brand constants
const LEDGR_BRAND = {
  logoSrc:  '/assets/logo/ledgr-logo.svg',
  iconSrc:  '/assets/logo/ledgr-icon.png',
  logoAlt:  'LEDGR',
  logoHeight: { desktop: 32, mobile: 28 },
};

// Inject favicon if not already set
(function injectFavicon() {
  if (!document.querySelector('link[rel="icon"]')) {
    const link = document.createElement('link');
    link.rel  = 'icon';
    link.type = 'image/png';
    link.href = LEDGR_BRAND.iconSrc;
    document.head.appendChild(link);
  }
})();

// Apply saved profile theme color on every page
(function applyProfileTheme() {
  const theme = localStorage.getItem('ledgr_profile_theme');
  if (theme) {
    const r = document.documentElement;
    r.style.setProperty('--profile-accent', theme);
    r.style.setProperty('--profile-glow', theme + '59');
    r.style.setProperty('--profile-highlight', theme + 'cc');
    r.style.setProperty('--profile-card-border', theme);
  }
})();

// Replace any .logo <a> elements that still contain raw text
function patchLogoImages() {
  document.querySelectorAll('a.logo').forEach(a => {
    if (a.querySelector('img.logo-img')) return;
    const img = document.createElement('img');
    img.src     = LEDGR_BRAND.logoSrc;
    img.alt     = LEDGR_BRAND.logoAlt;
    img.className = 'logo-img';
    img.style.cssText = 'height:32px;width:auto;display:block;object-fit:contain';
    img.onerror = () => { img.style.display = 'none'; };
    a.textContent = '';
    a.appendChild(img);
  });
}
