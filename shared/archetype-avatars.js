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

  // Resolve a performance key to cosmetic data.
  // Accepts: 'sharp', 'high-stakes', 'oracle', 'reaper', etc.
  function resolve(perfKey) {
    if (!perfKey) return null;
    var k = String(perfKey).trim().toLowerCase();

    // Direct cosmetic key (e.g. someone stored 'reaper' already)
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

  // Get the current logged-in user's archetype key from localStorage.
  function getCurrentArchetypeKey() {
    var arch = null;
    try {
      var cust = JSON.parse(localStorage.getItem('ledgr_profile_customization') || '{}');
      arch = cust.archetype;
    } catch (e) {}
    if (!arch) {
      try {
        var u = JSON.parse(localStorage.getItem('ledgr_user') || 'null');
        if (u) arch = u.archetype || (u.settings && u.settings.archetype) || null;
      } catch (e) {}
    }
    return arch || null;
  }

  // Generate a standalone avatar HTML string.
  // perfKey: the performance archetype key (e.g. 'sharp', 'high-stakes')
  // size:    pixel integer (e.g. 36, 48, 80, 96)
  // opts:    { shape: 'circle'|'rounded', initials: 'AB' }
  function avatarHTML(perfKey, size, opts) {
    size = size || 36;
    opts = opts || {};
    var cosmetic = resolve(perfKey);
    var radius = opts.shape === 'rounded'
      ? Math.round(size * 0.22) + 'px'
      : '50%';

    if (!cosmetic) {
      var initials = opts.initials ? opts.initials.slice(0, 2).toUpperCase() : '';
      return '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:' + radius + ';' +
        'background:#1A1A1A;border:1.5px solid #2A2A2A;' +
        'display:flex;align-items:center;justify-content:center;' +
        'font-size:' + Math.round(size * 0.3) + 'px;' +
        'color:#6B6B6B;flex-shrink:0;font-family:\'Bebas Neue\',sans-serif;">' +
        initials + '</div>';
    }

    var iconPx  = Math.round(size * 0.44);
    var glowPx  = Math.round(size * 0.25);
    var borderW = size >= 64 ? 2 : 1.5;

    return '<div style="' +
      'width:' + size + 'px;height:' + size + 'px;' +
      'border-radius:' + radius + ';' +
      'background:' + cosmetic.color + '14;' +
      'border:' + borderW + 'px solid ' + cosmetic.color + '60;' +
      'box-shadow:0 0 ' + glowPx + 'px ' + cosmetic.color + '40;' +
      'display:flex;align-items:center;justify-content:center;' +
      'font-size:' + iconPx + 'px;' +
      'flex-shrink:0;cursor:default;position:relative;' +
      '" title="' + cosmetic.name + '" ' +
      'data-arch-av="' + perfKey + '">' +
      cosmetic.badge +
    '</div>';
  }

  // Apply archetype styling to an existing DOM element in-place.
  // el: the avatar DOM element
  // perfKey: the archetype key
  // preservePhoto: if true and element has an <img> child, do nothing
  function applyToElement(el, perfKey, preservePhoto) {
    if (!el) return;
    if (preservePhoto && el.querySelector('img')) return;
    var cosmetic = resolve(perfKey);
    if (!cosmetic) return;

    var size = el.offsetWidth || 48;
    var iconPx = Math.round(size * 0.44) || 20;

    el.style.background    = cosmetic.color + '14';
    el.style.borderColor   = cosmetic.color + '60';
    el.style.boxShadow     = '0 0 ' + Math.round(size * 0.25) + 'px ' + cosmetic.color + '40';
    el.style.color         = cosmetic.color;
    el.setAttribute('title', cosmetic.name);
    el.setAttribute('data-arch-av', perfKey);

    // Preserve child nodes we care about (.id-verified, .av-ring, etc.)
    var keepEls = Array.from(el.children).filter(function (c) {
      return c.classList.contains('id-verified') ||
             c.classList.contains('av-ring') ||
             c.classList.contains('live-dot');
    });
    el.textContent = '';
    var icon = document.createElement('span');
    icon.textContent  = cosmetic.badge;
    icon.style.fontSize = iconPx + 'px';
    icon.style.lineHeight = '1';
    el.appendChild(icon);
    keepEls.forEach(function (c) { el.appendChild(c); });
  }

  window.LedgrArchetypeAvatar = {
    resolve:             resolve,
    avatarHTML:          avatarHTML,
    applyToElement:      applyToElement,
    getCurrentArchetypeKey: getCurrentArchetypeKey,
    COSMETIC:            COSMETIC,
    COSMETIC_MAP:        PERF_TO_COSMETIC
  };

})();
