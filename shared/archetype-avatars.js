(function () {
  'use strict';

  // Maps performance archetype key → cosmetic archetype key
  var PERF_TO_COSMETIC = {
    'sharp':         'oracle',
    'value-hunter':  'diamond-mind',
    'underdog-king': 'dragon-soul',
    'grinder':       'shark',
    'specialist':    'kingmaker',
    'data-nerd':     'void-emperor',
    'high-stakes':   'reaper',
    'contender':     null
  };

  // The 7 premium cosmetic archetypes
  var COSMETIC = {
    'reaper':       { name: 'The Reaper',       color: '#FF1515', badge: '💀', desc: 'Cold. Precise. Untraceable.' },
    'kingmaker':    { name: 'The Kingmaker',     color: '#C8A000', badge: '👑', desc: 'Others follow. Others profit.' },
    'oracle':       { name: 'The Oracle',        color: '#00D4FF', badge: '👁',  desc: 'Sees three moves ahead. Always.' },
    'shark':        { name: 'The Shark',         color: '#5878A0', badge: '🦈', desc: 'Apex predator. Cold. Calculated.' },
    'dragon-soul':  { name: 'The Dragon Soul',   color: '#FF3322', badge: '🐉', desc: 'Ancient power. Forged in battle.' },
    'void-emperor': { name: 'The Void Emperor',  color: '#8B00FF', badge: '⬡',  desc: 'Beyond classification. Beyond rank.' },
    'diamond-mind': { name: 'The Diamond Mind',  color: '#80E8FF', badge: '💎', desc: 'Elite in every metric. Always.' }
  };

  // SVG mini-character portraits — one per cosmetic archetype.
  // Each function takes the color string and returns an SVG string.
  // Designed for readability at 20–96px.
  var CHAR_SVG = {
    // The Reaper — dark hooded figure, glowing eyes
    'reaper': function(c) {
      return '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">'
        + '<path d="M20 5C10.5 5 7 13.5 7 21c0 8.5 5.5 13 13 13s13-4.5 13-13c0-7.5-3.5-16-13-16z" fill="' + c + '1a" stroke="' + c + '" stroke-width="1.3"/>'
        + '<path d="M8 22c1-6 4-10 12-10s11 4 12 10" fill="' + c + '0d" stroke="' + c + '44" stroke-width="0.8"/>'
        + '<ellipse cx="15.5" cy="21" rx="3" ry="3.5" fill="' + c + '"/>'
        + '<ellipse cx="24.5" cy="21" rx="3" ry="3.5" fill="' + c + '"/>'
        + '<circle cx="15.5" cy="19.5" r="1.1" fill="rgba(255,255,255,0.42)"/>'
        + '<circle cx="24.5" cy="19.5" r="1.1" fill="rgba(255,255,255,0.42)"/>'
        + '<path d="M15.5 29q2.5 1.8 5 0q2.5-1.8 4 0" stroke="' + c + '88" stroke-width="1.2" fill="none" stroke-linecap="round"/>'
        + '</svg>';
    },
    // The Oracle — all-seeing mystical eye
    'oracle': function(c) {
      return '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">'
        + '<path d="M4 20Q20 7 36 20Q20 33 4 20z" fill="' + c + '15" stroke="' + c + '" stroke-width="1.3"/>'
        + '<circle cx="20" cy="20" r="6.5" fill="' + c + '22" stroke="' + c + '" stroke-width="1.2"/>'
        + '<circle cx="20" cy="20" r="4" fill="' + c + '55" stroke="' + c + '99" stroke-width="0.8"/>'
        + '<circle cx="20" cy="20" r="2" fill="' + c + '"/>'
        + '<circle cx="22" cy="18.5" r="1.2" fill="rgba(255,255,255,0.65)"/>'
        + '<line x1="4" y1="20" x2="13.5" y2="20" stroke="' + c + '33" stroke-width="0.7"/>'
        + '<line x1="26.5" y1="20" x2="36" y2="20" stroke="' + c + '33" stroke-width="0.7"/>'
        + '</svg>';
    },
    // The Diamond Mind — faceted crystalline gem
    'diamond-mind': function(c) {
      return '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">'
        + '<polygon points="20,5 34,17 20,37 6,17" fill="' + c + '18" stroke="' + c + '" stroke-width="1.3"/>'
        + '<polygon points="20,5 34,17 20,20 6,17" fill="' + c + '30"/>'
        + '<line x1="20" y1="5" x2="6" y2="17" stroke="' + c + '70" stroke-width="1"/>'
        + '<line x1="20" y1="5" x2="34" y2="17" stroke="' + c + 'cc" stroke-width="1.2"/>'
        + '<line x1="6" y1="17" x2="34" y2="17" stroke="' + c + '55" stroke-width="0.8"/>'
        + '<line x1="20" y1="17" x2="20" y2="37" stroke="' + c + '50" stroke-width="0.8"/>'
        + '<circle cx="20" cy="12" r="2" fill="' + c + '"/>'
        + '</svg>';
    },
    // The Shark — apex predator silhouette
    'shark': function(c) {
      return '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">'
        + '<path d="M20 35c-7 0-13-5-13-12 0-5 3-8.5 7-10.5L20 6l6 6.5c4 2 7 5.5 7 10.5 0 7-6 12-13 12z" fill="' + c + '18" stroke="' + c + '" stroke-width="1.3"/>'
        + '<line x1="20" y1="6" x2="20" y2="17" stroke="' + c + '" stroke-width="2.2" stroke-linecap="round"/>'
        + '<ellipse cx="15.5" cy="24" rx="2.2" ry="2.5" fill="' + c + 'cc"/>'
        + '<ellipse cx="24.5" cy="24" rx="2.2" ry="2.5" fill="' + c + 'cc"/>'
        + '<path d="M15 30.5q5 3.5 10 0" stroke="' + c + '" stroke-width="1.2" fill="none" stroke-linecap="round"/>'
        + '<path d="M17.5 30.5v-3M20 31.5v-3.5M22.5 30.5v-3" stroke="' + c + '88" stroke-width="1" stroke-linecap="round"/>'
        + '</svg>';
    },
    // The Dragon Soul — fierce dragon head with horns
    'dragon-soul': function(c) {
      return '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">'
        + '<path d="M10 31c0-12 3-20 10-20s10 8 10 20l-3.5-3.5-2 4-2.5-4-2 4-2.5-3.5-2.5 3z" fill="' + c + '18" stroke="' + c + '" stroke-width="1.3"/>'
        + '<line x1="13" y1="13" x2="8" y2="5" stroke="' + c + '" stroke-width="1.8" stroke-linecap="round"/>'
        + '<line x1="27" y1="13" x2="32" y2="5" stroke="' + c + '" stroke-width="1.8" stroke-linecap="round"/>'
        + '<ellipse cx="16" cy="20" rx="2.5" ry="3.2" fill="' + c + '" transform="rotate(-8,16,20)"/>'
        + '<ellipse cx="24" cy="20" rx="2.5" ry="3.2" fill="' + c + '" transform="rotate(8,24,20)"/>'
        + '<path d="M16 28q4 3 8 0" stroke="' + c + '" stroke-width="1.3" fill="none" stroke-linecap="round"/>'
        + '</svg>';
    },
    // The Void Emperor — hexagonal data entity
    'void-emperor': function(c) {
      return '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">'
        + '<polygon points="20,5 32,12.5 32,27.5 20,35 8,27.5 8,12.5" fill="' + c + '10" stroke="' + c + '" stroke-width="1.3"/>'
        + '<polygon points="20,12 27,16.5 27,25.5 20,30 13,25.5 13,16.5" fill="' + c + '22" stroke="' + c + '55" stroke-width="0.8"/>'
        + '<circle cx="20" cy="21" r="4.5" fill="' + c + 'bb"/>'
        + '<circle cx="21.5" cy="19.5" r="1.8" fill="rgba(255,255,255,0.5)"/>'
        + '<line x1="20" y1="12" x2="20" y2="16.5" stroke="' + c + '" stroke-width="0.9"/>'
        + '<line x1="27" y1="16.5" x2="23.5" y2="18.5" stroke="' + c + '" stroke-width="0.9"/>'
        + '<line x1="27" y1="25.5" x2="23.5" y2="23.5" stroke="' + c + '" stroke-width="0.9"/>'
        + '<line x1="20" y1="30" x2="20" y2="25.5" stroke="' + c + '" stroke-width="0.9"/>'
        + '<line x1="13" y1="25.5" x2="16.5" y2="23.5" stroke="' + c + '" stroke-width="0.9"/>'
        + '<line x1="13" y1="16.5" x2="16.5" y2="18.5" stroke="' + c + '" stroke-width="0.9"/>'
        + '</svg>';
    },
    // The Kingmaker — crowned regal figure
    'kingmaker': function(c) {
      return '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">'
        + '<path d="M10 22L10 14L15.5 19L20 11L24.5 19L30 14L30 22z" fill="' + c + '2a" stroke="' + c + '" stroke-width="1.3" stroke-linejoin="round"/>'
        + '<rect x="10" y="22" width="20" height="5" rx="1.5" fill="' + c + '22" stroke="' + c + '" stroke-width="1.2"/>'
        + '<circle cx="20" cy="13" r="2.2" fill="' + c + '"/>'
        + '<circle cx="11.5" cy="16.5" r="1.3" fill="' + c + 'cc"/>'
        + '<circle cx="28.5" cy="16.5" r="1.3" fill="' + c + 'cc"/>'
        + '<path d="M13 27q7 8 14 0" fill="' + c + '10" stroke="' + c + '" stroke-width="1" stroke-linecap="round"/>'
        + '</svg>';
    }
  };

  // Resolve a performance key to cosmetic data.
  // Accepts: 'sharp', 'high-stakes', 'oracle', 'reaper', etc.
  function resolve(perfKey) {
    if (!perfKey) return null;
    var k = String(perfKey).trim().toLowerCase();

    // Direct cosmetic key (e.g. 'reaper')
    if (COSMETIC[k]) return COSMETIC[k];

    // Performance → cosmetic map
    var cosmKey = PERF_TO_COSMETIC[k];
    if (cosmKey) return COSMETIC[cosmKey] || null;
    if (cosmKey === null) return null; // contender — explicitly no cosmetic

    // Unknown key — fallback: check archetypes-dict aliases if loaded
    if (window.resolveArchetype) {
      var arch = window.resolveArchetype(k);
      if (arch && arch._key) {
        var mapped = PERF_TO_COSMETIC[arch._key];
        if (mapped) return COSMETIC[mapped] || null;
      }
    }

    return null;
  }

  // Return the cosmetic key (e.g. 'reaper') for any perf or cosmetic key.
  function cosmeticKeyFor(perfKey) {
    if (!perfKey) return null;
    var k = String(perfKey).trim().toLowerCase();
    if (COSMETIC[k]) return k;
    var mapped = PERF_TO_COSMETIC[k];
    return mapped || null;
  }

  // Single-source-of-truth archetype lookup — priority: manual → rankings → legacy.
  var _archKeyCache = null;
  function getCurrentArchetypeKey() {
    var arch = null;
    var source = 'none';

    // 1. Manual override — explicitly set by user in settings
    try {
      var cust = JSON.parse(localStorage.getItem('ledgr_profile_customization') || '{}');
      if (cust.manualArchetype) { arch = cust.manualArchetype; source = 'manual override'; }
    } catch(e) {}

    // 2. Rankings fallback — performance-derived, written by identity.js syncFromBackend()
    if (!arch) {
      try {
        var cust2 = JSON.parse(localStorage.getItem('ledgr_profile_customization') || '{}');
        if (cust2.rankingsArchetype) { arch = cust2.rankingsArchetype; source = 'rankings fallback'; }
      } catch(e) {}
    }

    // 3. Per-user cache (written by syncFromBackend as secondary store)
    if (!arch) {
      try {
        var u = JSON.parse(localStorage.getItem('ledgr_user') || localStorage.getItem('user') || 'null');
        if (u) {
          var uname = u.username || u.user || u.name;
          if (uname) {
            var prof = JSON.parse(localStorage.getItem('ledgr_profile_' + uname) || '{}');
            if (prof.archetype) { arch = prof.archetype; source = 'rankings fallback'; }
          }
        }
      } catch(e) {}
    }

    // 4. Legacy keys
    if (!arch) {
      try {
        var cust4 = JSON.parse(localStorage.getItem('ledgr_profile_customization') || '{}');
        if (cust4.archetype) { arch = cust4.archetype; source = 'manual override'; }
      } catch(e) {}
    }
    if (!arch) {
      try {
        var u5 = JSON.parse(localStorage.getItem('ledgr_user') || localStorage.getItem('user') || 'null');
        if (u5) {
          var a5 = u5.archetype || (u5.settings && u5.settings.archetype) || null;
          if (a5) { arch = a5; source = 'manual override'; }
        }
      } catch(e) {}
    }

    // Promote legacy manual sources to canonical key
    if (arch && source === 'manual override' &&
        !JSON.parse(localStorage.getItem('ledgr_profile_customization') || '{}').manualArchetype) {
      try {
        var custUp = JSON.parse(localStorage.getItem('ledgr_profile_customization') || '{}');
        custUp.manualArchetype = arch;
        localStorage.setItem('ledgr_profile_customization', JSON.stringify(custUp));
      } catch(e) {}
    }

    if (_archKeyCache !== arch) {
      _archKeyCache = arch;
      console.log('[LedgrArchetypeAvatar] ARCHETYPE SOURCE:', source || 'none');
      console.log('[LedgrArchetypeAvatar] ARCHETYPE VALUE:', arch || null);
    }

    return arch || null;
  }

  // Generate a standalone archetype character avatar HTML string.
  // perfKey: performance or cosmetic archetype key
  // size:    pixel integer (e.g. 36, 48, 80, 96)
  // opts:    { shape: 'circle'|'rounded', initials: 'AB' }
  function avatarHTML(perfKey, size, opts) {
    size = size || 36;
    opts = opts || {};
    var cosmetic = resolve(perfKey);
    var radius = opts.shape === 'rounded'
      ? Math.round(size * 0.22) + 'px'
      : (opts.shape === 'square' ? Math.round(size * 0.12) + 'px' : '50%');

    if (!cosmetic) {
      var initials = opts.initials ? opts.initials.slice(0, 2).toUpperCase() : '';
      return '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:' + radius + ';'
        + 'background:#1A1A1A;border:1.5px solid #2A2A2A;'
        + 'display:flex;align-items:center;justify-content:center;'
        + 'font-size:' + Math.round(size * 0.3) + 'px;'
        + 'color:#6B6B6B;flex-shrink:0;font-family:\'Bebas Neue\',sans-serif;">'
        + initials + '</div>';
    }

    var cosKey  = cosmeticKeyFor(perfKey);
    var svgFn   = cosKey && CHAR_SVG[cosKey];
    var inner   = svgFn
      ? svgFn(cosmetic.color)
      : '<span style="font-size:' + Math.round(size * 0.44) + 'px;line-height:1">' + cosmetic.badge + '</span>';

    var glowPx  = Math.round(size * 0.3);
    var borderW = size >= 64 ? 2 : 1.5;

    return '<div class="arch-char-av" style="'
      + 'width:' + size + 'px;height:' + size + 'px;'
      + 'border-radius:' + radius + ';'
      + 'background:' + cosmetic.color + '14;'
      + 'border:' + borderW + 'px solid ' + cosmetic.color + '55;'
      + 'box-shadow:0 0 ' + glowPx + 'px ' + cosmetic.color + '35;'
      + 'display:flex;align-items:center;justify-content:center;'
      + 'overflow:hidden;flex-shrink:0;cursor:default;position:relative;'
      + '" title="' + cosmetic.name + '" data-arch-av="' + perfKey + '">'
      + inner
      + '</div>';
  }

  // Apply archetype character to an existing DOM element in-place.
  // preservePhoto: if true and element has an <img> child, do nothing (keep photo).
  function applyToElement(el, perfKey, preservePhoto) {
    if (!el) return;
    if (preservePhoto && el.querySelector('img')) return;
    var cosmetic = resolve(perfKey);
    if (!cosmetic) return;

    var size    = el.offsetWidth || 48;
    var cosKey  = cosmeticKeyFor(perfKey);
    var svgFn   = cosKey && CHAR_SVG[cosKey];

    el.style.background  = cosmetic.color + '14';
    el.style.borderColor = cosmetic.color + '55';
    el.style.boxShadow   = '0 0 ' + Math.round(size * 0.3) + 'px ' + cosmetic.color + '35';
    el.style.overflow    = 'hidden';
    el.style.color       = cosmetic.color;
    el.setAttribute('title', cosmetic.name);
    el.setAttribute('data-arch-av', perfKey);

    var keepEls = Array.from(el.children).filter(function(c) {
      return c.classList.contains('id-verified') ||
             c.classList.contains('av-ring') ||
             c.classList.contains('live-dot');
    });

    if (svgFn) {
      el.innerHTML = svgFn(cosmetic.color);
    } else {
      el.textContent = '';
      var icon = document.createElement('span');
      icon.textContent   = cosmetic.badge;
      icon.style.fontSize = Math.round(size * 0.44) + 'px';
      icon.style.lineHeight = '1';
      el.appendChild(icon);
    }
    keepEls.forEach(function(c) { el.appendChild(c); });
  }

  window.LedgrArchetypeAvatar = {
    resolve:                resolve,
    cosmeticKeyFor:         cosmeticKeyFor,
    avatarHTML:             avatarHTML,
    applyToElement:         applyToElement,
    getCurrentArchetypeKey: getCurrentArchetypeKey,
    COSMETIC:               COSMETIC,
    COSMETIC_MAP:           PERF_TO_COSMETIC,
    CHAR_SVG:               CHAR_SVG
  };

})();
