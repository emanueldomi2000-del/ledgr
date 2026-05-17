// LEDGR brand constants — import or include in any page
const LEDGR_BRAND = {
  logoSrc:  '/assets/logo/ledgr-logo.svg',
  iconSrc:  '/assets/logo/ledgr-icon.png',
  logoAlt:  'LEDGR',
  logoHeight: { desktop: 32, mobile: 28 },
};

// Inject correct favicon if one isn't already set
(function injectFavicon() {
  if (!document.querySelector('link[rel="icon"]')) {
    const link = document.createElement('link');
    link.rel  = 'icon';
    link.type = 'image/png';
    link.href = LEDGR_BRAND.iconSrc;
    document.head.appendChild(link);
  }
})();

// Replace any .logo <a> elements that still contain raw text (not an img)
// Call after DOMContentLoaded if needed, or include at end of <body>
function patchLogoImages() {
  document.querySelectorAll('a.logo').forEach(a => {
    if (a.querySelector('img.logo-img')) return; // already patched
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
