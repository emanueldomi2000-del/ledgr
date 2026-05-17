/* LEDGR identity.js — profile theme persistence across all pages */
(function () {
  'use strict';

  const THEME_META = {
    '#7B2CFF': { glow: 'rgba(123,44,255,0.35)',  light: '#B14CFF' },
    '#FFD700': { glow: 'rgba(255,215,0,0.35)',   light: '#FFE14D' },
    '#00E5A0': { glow: 'rgba(0,229,160,0.35)',   light: '#33EBB5' },
    '#FF3355': { glow: 'rgba(255,51,85,0.35)',   light: '#FF6680' },
    '#4FC3F7': { glow: 'rgba(79,195,247,0.35)',  light: '#80D4FA' },
    '#FF6B35': { glow: 'rgba(255,107,53,0.35)',  light: '#FF8F65' },
    '#E040FB': { glow: 'rgba(224,64,251,0.35)',  light: '#EB80FC' },
    '#FFFFFF': { glow: 'rgba(255,255,255,0.18)', light: '#FFFFFF' },
  };

  function applyProfileTheme(color) {
    if (!color) return;
    const hex = color.toUpperCase();
    const meta = THEME_META[hex] || { glow: hex + '59', light: hex };
    const r = document.documentElement;
    r.style.setProperty('--profile-accent',      color);
    r.style.setProperty('--profile-glow',        meta.glow);
    r.style.setProperty('--profile-highlight',   meta.light);
    r.style.setProperty('--profile-card-border', color);
  }

  // Apply immediately on load from localStorage
  const saved = localStorage.getItem('ledgr_profile_theme');
  if (saved) applyProfileTheme(saved);

  // Expose for settings page
  window.applyProfileTheme = applyProfileTheme;
})();
