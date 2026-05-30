(function() {
  'use strict';
  var API = 'https://ledgr-backend-production-c132.up.railway.app';

  function getCustomization() {
    try { return JSON.parse(localStorage.getItem('ledgr_profile_customization') || '{}'); } catch (e) { return {}; }
  }

  function setCustomization(key, value) {
    var cust = getCustomization();
    cust[key] = value;
    localStorage.setItem('ledgr_profile_customization', JSON.stringify(cust));
  }

  function applyTheme() {
    var cust = getCustomization();
    var theme = cust.themeId || localStorage.getItem('ledgr_profile_theme') || '#7B2CFF';
    document.documentElement.style.setProperty('--ac', theme);
    document.documentElement.style.setProperty('--profile-accent', theme);
  }

  function applyBanner() {
    var cust = getCustomization();
    var pack = cust.bannerId || localStorage.getItem('ledgr_banner_pack') || 'midnight';
    var heroes = document.querySelectorAll('.tipster-hero,.profile-hero,.hero-banner,.lp-banner,#lpBanner');
    heroes.forEach(function(el) {
      el.className.split(' ').forEach(function(c) { if (c.startsWith('bp-')) el.classList.remove(c); });
      el.classList.add('bp-' + pack);
    });
  }

  function applyBorder() {
    var cust = getCustomization();
    var border = cust.borderId || localStorage.getItem('ledgr_avatar_border') || 'none';
    var avatars = document.querySelectorAll('.tipster-avatar,.id-av,#idAvatar,.pod-av,#lpAvatar');
    avatars.forEach(function(av) {
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

  function applyArchetypeAvatar() {
    if (!window.LedgrArchetypeAvatar) return;
    var archKey = window.LedgrArchetypeAvatar.getCurrentArchetypeKey();
    if (!archKey) { console.log('[LedgrArchetypeAvatar] applyArchetypeAvatar: no key — skipping'); return; }
    var selectors = ['.id-av', '#idAv', '.pod-av', '#idAvatar'];
    var applied = 0;
    selectors.forEach(function(sel) {
      document.querySelectorAll(sel).forEach(function(el) {
        window.LedgrArchetypeAvatar.applyToElement(el, archKey, true);
        applied++;
        console.log('[LedgrArchetypeAvatar] AVATAR APPLIED: identity.js →', sel, '| key:', archKey);
      });
    });
    if (applied === 0) console.log('[LedgrArchetypeAvatar] AVATAR APPLIED: identity.js → 0 elements matched selectors', selectors.join(', '));
  }

  function syncFromBackend() {
    var token = localStorage.getItem('ledgr_token');
    if (!token) return;
    fetch(API + '/profile', { headers: { 'Authorization': 'Bearer ' + token } })
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(pd) {
        if (!pd) return;
        var cust = getCustomization();
        // Accept both field name formats from backend
        var bannerId = pd.bannerPack || pd.banner;
        var borderId = pd.avatarBorder || pd.border;
        var themeId  = pd.profileTheme;
        if (bannerId) { cust.bannerId = bannerId; localStorage.setItem('ledgr_banner_pack', bannerId); }
        if (borderId) { cust.borderId = borderId; localStorage.setItem('ledgr_avatar_border', borderId); }
        if (themeId)  { cust.themeId  = themeId;  localStorage.setItem('ledgr_profile_theme', themeId); applyTheme(); }
        localStorage.setItem('ledgr_profile_customization', JSON.stringify(cust));
        applyBanner();
        applyBorder();
      }).catch(function() {});
  }

  window.LedgrIdentity = {
    load: function() { applyTheme(); applyBanner(); applyBorder(); applyAvatar(); applyArchetypeAvatar(); syncFromBackend(); },
    applyAll: function() { applyTheme(); applyBanner(); applyBorder(); applyAvatar(); applyArchetypeAvatar(); },
    applyTheme: applyTheme,
    applyBanner: applyBanner,
    applyBorder: applyBorder,
    applyAvatar: applyAvatar,
    applyArchetypeAvatar: applyArchetypeAvatar,
    getCustomization: getCustomization,
    save: function(key, value) {
      localStorage.setItem('ledgr_' + key, value);
      // Write to unified object
      var custKeyMap = { 'banner_pack': 'bannerId', 'avatar_border': 'borderId', 'profile_theme': 'themeId' };
      if (custKeyMap[key]) setCustomization(custKeyMap[key], value);
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
