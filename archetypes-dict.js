(function(){
  'use strict';

  var ARCHETYPES = {
    'sharp':         { icon:'👁',  name:'The Oracle',        color:'#00D4FF', cosmeticKey:'oracle',       desc:'Reads the market before it moves. Beats the closing line.' },
    'value-hunter':  { icon:'💎', name:'The Diamond Mind',  color:'#80E8FF', cosmeticKey:'diamond-mind', desc:'Elite precision at finding mispriced odds. Always calculated.' },
    'underdog-king': { icon:'🐉', name:'The Dragon Soul',   color:'#FF3322', cosmeticKey:'dragon-soul',  desc:'Backs underdogs. Ancient power. Forged against the crowd.' },
    'grinder':       { icon:'🦈', name:'The Shark',         color:'#5878A0', cosmeticKey:'shark',        desc:'Apex predator. Cold, calculated volume. Wins through repetition.' },
    'specialist':    { icon:'👑', name:'The Kingmaker',     color:'#C8A000', cosmeticKey:'kingmaker',    desc:'Dominates one sport. Others follow. Others profit.' },
    'data-nerd':     { icon:'⬡',  name:'The Void Emperor',  color:'#8B00FF', cosmeticKey:'void-emperor', desc:'Operates on a different plane. Data beyond classification.' },
    'high-stakes':   { icon:'💀', name:'The Reaper',        color:'#FF1515', cosmeticKey:'reaper',       desc:'Maximum conviction. Cold. Precise. Untraceable.' },
    'contender':     { icon:'🥊', name:'The Contender',     color:'#94a3b8', cosmeticKey:null,           desc:'Identity in formation. The record is being written.' },
    // Deprecated — kept for display only
    'sniper':        { icon:'🎯', name:'The Sniper',          color:'#34d399', desc:'' },
    'demon':         { icon:'😈', name:'The Demon',           color:'#f87171', desc:'' },
    'lock-machine':  { icon:'🔒', name:'The Lock Machine',    color:'#94a3b8', desc:'' },
    'ice-cold':      { icon:'🧊', name:'The Ice Cold',        color:'#38bdf8', desc:'' },
    'profit-farmer': { icon:'🌾', name:'The Profit Farmer',   color:'#34d399', desc:'' },
    'momentum-monster':{ icon:'🔥', name:'The Momentum Monster', color:'#fb923c', desc:'' },
  };

  // Slug aliases — maps non-canonical IDs to canonical keys
  var ALIASES = {
    // Display name variants
    'underdog-hunter':  'underdog-king',
    'documentarian':    'data-nerd',
    // Archetypes page IDs
    'hunter':           'value-hunter',
    'gambler':          'high-stakes',
    'reaper':           'high-stakes',
    'ghost':            'sharp',
    'diamond-mind':     'value-hunter',
    'shark':            'grinder',
    'iceblood':         'specialist',
    'storm':            'contender',
    'kingmaker':        'specialist',
    'night-owl':        'contender',
    'hybrid':           'contender',
  };

  // Display name → slug lookup (built once at load)
  var NAME_TO_SLUG = {};
  Object.keys(ARCHETYPES).forEach(function(slug){
    var raw = ARCHETYPES[slug].name;                      // "The Sharp"
    var short = raw.replace(/^The\s+/i, '');              // "Sharp"
    NAME_TO_SLUG[raw.toLowerCase()]   = slug;
    NAME_TO_SLUG[short.toLowerCase()] = slug;
  });

  /**
   * resolveArchetype(key) → archetype object or null
   * Accepts: slug ("sharp"), display name ("Value Hunter"), "The X" form,
   *          aliases, archetypes-page IDs, and deprecated keys.
   * Returns the canonical archetype entry, or a default contender entry.
   */
  function resolveArchetype(key){
    if(!key) return ARCHETYPES['contender'];
    var k = String(key).trim();

    // 1. Direct slug match
    if(ARCHETYPES[k]) return ARCHETYPES[k];

    // 2. Alias match (before lowercasing to preserve any case)
    var lower = k.toLowerCase();
    if(ALIASES[lower]) return ARCHETYPES[ALIASES[lower]];

    // 3. Display name match ("Sharp", "Value Hunter", "The Sharp")
    if(NAME_TO_SLUG[lower]) return ARCHETYPES[NAME_TO_SLUG[lower]];

    // 4. Try stripping "The " prefix then re-resolve
    var stripped = lower.replace(/^the\s+/, '');
    if(NAME_TO_SLUG[stripped]) return ARCHETYPES[NAME_TO_SLUG[stripped]];

    // 5. Fallback
    return ARCHETYPES['contender'];
  }

  window.ARCHETYPES       = ARCHETYPES;
  window.resolveArchetype = resolveArchetype;
})();
