(function() {
  'use strict';
  var API = 'https://ledgr-backend-production-c132.up.railway.app';

  function applyTheme() {
    var theme = localStorage.getItem('ledgr_profile_theme') || '#7B2CFF';
    document.documentElement.style.setProperty('--ac', theme);
    document.documentElement.style.setProperty('--profile-accent', theme);
  }

  function applyBanner() {
    var pack = localStorage.getItem('ledgr_banner_pack') || 'midnight';
    var heroes = document.querySelectorAll('.tipster-hero,.profile-hero,.hero-banner,.lp-banner,#lpBanner');
    heroes.forEach(function(el) {
      el.className.split(' ').forEach(function(c) { if (c.startsWith('bp-')) el.classList.remove(c); });
      el.classList.add('bp-' + pack);
    });
  }

  function applyBorder() {
    var border = localStorage.getItem('ledgr_avatar_border') || 'none';
    var avatars = document.querySelectorAll('.tipster-avatar,.id-av,#idAvatar,.pod-av,#lpAvatar');
    var styles = {
      'none':            'none',
      'clean':           '2px solid rgba(255,255,255,0.08)',
      'blue':            '2px solid #4FC3F7',
      'bronze-frame':    '2px solid #CD7F32',
      'crystal-orbit':   '2px solid rgba(79,195,247,0.6)',
      'pulse-ring':      '2px solid rgba(150,100,255,0.6)',
      'frost-edge':      '2px solid rgba(147,210,255,0.8)',
      'dragon-soul':     '3px solid #FF3355',
      'crown-halo':      '3px solid transparent',
      'electric-surge':  '2px solid #7B2CFF',
      'inferno-core':    '2px solid #FF6B35',
      'cosmic-rift':     '3px solid transparent',
      'void-king':       '3px solid rgba(80,0,160,0.9)',
      'celestial-orbit': '2px solid rgba(170,120,255,0.5)',
      'singularity':     '3px solid transparent',
      'time-collapse':   '2px solid rgba(255,107,255,0.7)',
      'unknown-signal':  '2px solid rgba(0,255,80,0.4)',
      'redacted':        '3px solid #FF6BFF',
      'halloween':       '2px solid #FF6B00',
      'winter-elite':    '2px solid #A8D8FF',
      'summer-champion': '2px solid #FFD700'
    };
    avatars.forEach(function(av) {
      av.style.border = styles[border] || 'none';
      av.className.split(' ').forEach(function(c) { if (c.startsWith('ab-')) av.classList.remove(c); });
      if (border !== 'none') av.classList.add('ab-' + border);
    });
  }

  function applyAvatar() {
    var user = null;
    try { user = JSON.parse(localStorage.getItem('ledgr_user') || 'null'); } catch (e) { return; }
    if (!user) return;
    var photo = localStorage.getItem('ledgr_avatar_' + user.id) || localStorage.getItem('ledgr_avatar');
    var avatars = document.querySelectorAll('.tipster-avatar,.id-av,#idAvatar,.pod-av,#lpAvatar');
    avatars.forEach(function(av) {
      if (photo) {
        av.style.backgroundImage = 'url(' + photo + ')';
        av.style.backgroundSize = 'cover';
        av.style.backgroundPosition = 'center';
        av.style.color = 'transparent';
        av.textContent = '';
      }
    });
  }

  function syncFromBackend() {
    var token = localStorage.getItem('ledgr_token');
    if (!token) return;
    fetch(API + '/profile', { headers: { 'Authorization': 'Bearer ' + token } })
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(pd) {
        if (!pd) return;
        if (pd.bannerPack) localStorage.setItem('ledgr_banner_pack', pd.bannerPack);
        if (pd.avatarBorder) localStorage.setItem('ledgr_avatar_border', pd.avatarBorder);
        if (pd.profileTheme) { localStorage.setItem('ledgr_profile_theme', pd.profileTheme); applyTheme(); }
        applyBanner();
        applyBorder();
      }).catch(function() {});
  }

  window.LedgrIdentity = {
    load: function() { applyTheme(); applyBanner(); applyBorder(); applyAvatar(); syncFromBackend(); },
    applyAll: function() { applyTheme(); applyBanner(); applyBorder(); applyAvatar(); },
    applyTheme: applyTheme,
    applyBanner: applyBanner,
    applyBorder: applyBorder,
    applyAvatar: applyAvatar,
    save: function(key, value) {
      localStorage.setItem('ledgr_' + key, value);
      var token = localStorage.getItem('ledgr_token');
      if (!token) return;
      var bodyMap = {
        'banner_pack':   { bannerPack: value },
        'avatar_border': { avatarBorder: value },
        'profile_theme': { profileTheme: value }
      };
      var body = bodyMap[key];
      if (!body) return;
      fetch(API + '/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify(body)
      }).catch(function() {});
    }
  };

  document.addEventListener('DOMContentLoaded', function() { LedgrIdentity.load(); });
})();
