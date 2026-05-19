(function(){
  'use strict';

  var ARCHETYPES = {
    'sharp':         { icon:'⚡', name:'The Sharp',           color:'#38bdf8', desc:'Consistently finds value the market underprices. Beats the closing line.' },
    'value-hunter':  { icon:'💎', name:'The Value Hunter',    color:'#fbbf24', desc:'Targets mispriced odds. High-odds picks, positive long-run EV.' },
    'underdog-king': { icon:'🐉', name:'The Underdog Hunter', color:'#fb923c', desc:'Backs underdogs. Wins where the crowd bets wrong.' },
    'grinder':       { icon:'⚙️', name:'The Grinder',         color:'#b89fff', desc:'Volume, consistency, steady edge. Wins through repetition.' },
    'specialist':    { icon:'🎯', name:'The Specialist',      color:'#34d399', desc:'Dominates one sport. Focus is the edge.' },
    'data-nerd':     { icon:'📊', name:'The Documentarian',   color:'#38bdf8', desc:'Data-first. Confident when the edge is real. Calibrated, not verbose.' },
    'high-stakes':   { icon:'🃏', name:'The High Stakes',     color:'#fbbf24', desc:'Maximum conviction, maximum stake. Swings big when the edge is real.' },
    'contender':     { icon:'🥊', name:'The Contender',       color:'#94a3b8', desc:'Identity in formation. The record is being written.' },
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
    'diamond-mind':     'sharp',
    'shark':            'specialist',
    'iceblood':         'specialist',
    'storm':            'contender',
    'kingmaker':        'contender',
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
