window.LedgrIdentity = {

  API: 'https://ledgr-backend-production-c132.up.railway.app',

  load: async function() {
    const user = JSON.parse(localStorage.getItem('ledgr_user') || 'null');
    const token = localStorage.getItem('ledgr_token');
    if (!user || !token) return;

    // Apply from localStorage immediately (no flash)
    this.applyAll();

    // Then sync from backend
    try {
      const r = await fetch(this.API + '/profile', {
        headers: { Authorization: 'Bearer ' + token }
      });
      if (!r.ok) return;
      const pd = await r.json();

      if (pd.bannerPack) localStorage.setItem('ledgr_banner_pack', pd.bannerPack);
      if (pd.avatarBorder) localStorage.setItem('ledgr_avatar_border', pd.avatarBorder);
      if (pd.profileTheme) localStorage.setItem('ledgr_profile_theme', pd.profileTheme);

      // Apply synced values
      this.applyAll();
    } catch (e) {}
  },

  applyAll: function() {
    this.applyTheme();
    this.applyBanner();
    this.applyBorder();
    this.applyAvatar();
  },

  applyTheme: function() {
    const theme = localStorage.getItem('ledgr_profile_theme') || '#7B2CFF';
    document.documentElement.style.setProperty('--ac', theme);
    document.documentElement.style.setProperty('--profile-accent', theme);
  },

  applyBanner: function() {
    const pack = localStorage.getItem('ledgr_banner_pack') || 'midnight';
    const heroes = document.querySelectorAll(
      '.tipster-hero,.profile-hero,.hero-banner,' +
      '[class*="hero-card"],[class*="banner-area"],' +
      '.lp-banner,#lpBanner'
    );
    heroes.forEach(el => {
      [...el.classList].forEach(c => { if (c.startsWith('bp-')) el.classList.remove(c); });
      el.classList.add('bp-' + pack);
    });
    document.documentElement.setAttribute('data-banner', pack);
  },

  applyBorder: function() {
    const border = localStorage.getItem('ledgr_avatar_border') || 'none';
    const avatars = document.querySelectorAll(
      '.tipster-avatar,[class*="avatar-ring"],' +
      '#idAvatar,.id-av,.pod-av,.hero-avatar,' +
      '.lp-avatar,#lpAvatar'
    );
    const borderCSS = {
      none:             'none',
      clean:            '2px solid rgba(255,255,255,0.08)',
      blue:             '2px solid #4FC3F7',
      'crystal-orbit':  '2px solid rgba(79,195,247,0.6)',
      'pulse-ring':     '2px solid rgba(150,100,255,0.6)',
      'frost-edge':     '2px solid rgba(147,210,255,0.8)',
      'electric-surge': '2px solid transparent',
      'inferno-core':   '2px solid #FF6B35',
      'cosmic-rift':    '3px solid transparent',
      'dragon-soul':    '3px solid #FF3355',
      'crown-halo':     '3px solid transparent',
      'void-king':      '3px solid rgba(80,0,160,0.9)',
      'celestial-orbit':'2px solid rgba(170,120,255,0.5)',
      'time-collapse':  '2px solid rgba(255,107,255,0.7)',
      singularity:      '3px solid transparent',
      'unknown-signal': '2px solid rgba(0,255,80,0.4)',
      redacted:         '3px solid #FF6BFF',
    };
    avatars.forEach(av => {
      av.style.border = borderCSS[border] || 'none';
      [...av.classList].forEach(c => { if (c.startsWith('ab-')) av.classList.remove(c); });
      if (border !== 'none') av.classList.add('ab-' + border);
    });
  },

  applyAvatar: function() {
    const user = JSON.parse(localStorage.getItem('ledgr_user') || 'null');
    if (!user) return;
    const photo = localStorage.getItem('ledgr_avatar_' + user.id)
      || localStorage.getItem('ledgr_avatar');
    const avatars = document.querySelectorAll(
      '.tipster-avatar,[class*="avatar"],.id-av,' +
      '#idAvatar,.pod-av,.hero-avatar,#lpAvatar'
    );
    avatars.forEach(av => {
      if (photo && !av.style.backgroundImage.includes(photo)) {
        av.style.backgroundImage = 'url(' + photo + ')';
        av.style.backgroundSize = 'cover';
        av.style.backgroundPosition = 'center';
        av.style.color = 'transparent';
        av.textContent = '';
      } else if (!photo && user.username) {
        if (!av.style.backgroundImage) {
          av.textContent = user.username.slice(0, 2).toUpperCase();
        }
      }
    });
  },

  save: async function(key, value) {
    localStorage.setItem('ledgr_' + key, value);

    const token = localStorage.getItem('ledgr_token');
    if (!token) return;

    const bodyMap = {
      banner_pack:   { bannerPack: value },
      avatar_border: { avatarBorder: value },
      profile_theme: { profileTheme: value },
    };

    const body = bodyMap[key];
    if (!body) return;

    try {
      await fetch(this.API + '/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(body)
      });
    } catch (e) {}
  }
};

// Auto-run on every page
document.addEventListener('DOMContentLoaded', () => {
  LedgrIdentity.load();
});
