(function(){
  'use strict';

  var API = 'https://ledgr-backend-production-c132.up.railway.app';

  // ── CSS ────────────────────────────────────────────────────────────────────
  var CSS = `
/* ─ Hover Popup ─ */
.sh-popup{
  position:fixed;z-index:99999;width:256px;
  background:rgba(10,8,22,0.97);
  border:1px solid rgba(255,255,255,.08);
  border-radius:14px;padding:16px;
  box-shadow:0 16px 48px rgba(0,0,0,.75),0 0 0 1px rgba(184,159,255,.06);
  backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);
  opacity:0;pointer-events:none;
  transform:translateY(8px) scale(.96);
  transition:opacity .16s ease,transform .16s ease;
  font-family:'Syne',system-ui,sans-serif;
}
.sh-popup.sh-vis{opacity:1;pointer-events:auto;transform:translateY(0) scale(1)}

/* ─ Head ─ */
.sh-head{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.sh-av-wrap{width:36px;height:36px;border-radius:10px;flex-shrink:0}
.sh-av{width:100%;height:100%;border-radius:10px;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',var(--font-display,'Bebas Neue'),sans-serif;font-size:16px;color:#fff}
.sh-id{flex:1;min-width:0;overflow:hidden}
.sh-name{font-size:13px;font-weight:700;color:#e6e6e6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.3}
.sh-arch{font-family:'DM Mono',var(--font-mono,'DM Mono'),monospace;font-size:9px;color:#b89fff;margin-top:2px;letter-spacing:.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sh-div-pill{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:1.5px;text-transform:uppercase;padding:2px 7px;border-radius:20px;flex-shrink:0;font-weight:700;white-space:nowrap}

/* ─ Division colours (pill + ring) ─ */
.sh-ring-bronze .sh-av,.sh-div-bronze{background:rgba(180,120,80,.12);border:1px solid rgba(180,120,80,.32);color:var(--bronze)}
.sh-ring-silver .sh-av,.sh-div-silver{background:rgba(148,163,184,.1);border:1px solid rgba(148,163,184,.28);color:var(--silver)}
.sh-ring-gold .sh-av,.sh-div-gold{background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.28);color:var(--gold)}
.sh-ring-platinum .sh-av,.sh-div-platinum{background:rgba(56,189,248,.1);border:1px solid rgba(56,189,248,.28);color:var(--cyan)}
.sh-ring-diamond .sh-av,.sh-div-diamond{background:rgba(184,159,255,.12);border:1px solid rgba(184,159,255,.32);color:var(--ac)}
.sh-ring-elite .sh-av,.sh-div-elite{background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.28);color:var(--rd)}
.sh-ring-legendary .sh-av,.sh-div-legendary{background:linear-gradient(135deg,rgba(251,191,36,.14),rgba(184,159,255,.08));border:1px solid rgba(251,191,36,.38);color:var(--gold)}
/* ring shadow on wrapper */
.sh-ring-bronze{box-shadow:0 0 0 2px rgba(180,120,80,.4)}
.sh-ring-silver{box-shadow:0 0 0 2px rgba(148,163,184,.35)}
.sh-ring-gold{box-shadow:0 0 0 2px rgba(251,191,36,.42)}
.sh-ring-platinum{box-shadow:0 0 0 2px rgba(56,189,248,.42)}
.sh-ring-diamond{box-shadow:0 0 0 2px rgba(184,159,255,.48)}
.sh-ring-elite{box-shadow:0 0 0 2px rgba(248,113,113,.42)}
.sh-ring-legendary{box-shadow:0 0 0 2px rgba(251,191,36,.55),0 0 14px rgba(251,191,36,.2)}

/* ─ Stats grid ─ */
.sh-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(255,255,255,.045);border-radius:10px;overflow:hidden;margin-bottom:10px}
.sh-stat{background:rgba(10,8,22,.85);padding:9px 4px;text-align:center}
.sh-sv{font-family:'Bebas Neue',var(--font-display),sans-serif;font-size:15px;line-height:1;letter-spacing:.5px;color:#e6e6e6}
.sh-sv.pos{color:#34d399}.sh-sv.neg{color:#f87171}
.sh-sl{font-family:'DM Mono',monospace;font-size:7px;color:#6b6b6b;letter-spacing:1.5px;text-transform:uppercase;margin-top:3px}

/* ─ Trust bar ─ */
.sh-trust-row{display:flex;align-items:center;gap:7px;margin-bottom:9px}
.sh-trust-lbl{font-family:'DM Mono',monospace;font-size:8px;color:#6b6b6b;letter-spacing:.8px;flex-shrink:0}
.sh-trust-bar{flex:1;height:3px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden}
.sh-trust-fill{height:100%;border-radius:2px;background:linear-gradient(90deg,#b89fff,#7B2CFF)}
.sh-trust-num{font-family:'DM Mono',monospace;font-size:9px;color:#b89fff;flex-shrink:0;min-width:20px;text-align:right}

/* ─ Status tags ─ */
.sh-tags{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:9px}
.sh-tag{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:.8px;padding:2px 7px;border-radius:4px;text-transform:uppercase;font-weight:700}
.sh-tag-hot{background:rgba(251,191,36,.12);border:1px solid rgba(251,191,36,.26);color:#fbbf24}
.sh-tag-run{background:rgba(251,146,60,.1);border:1px solid rgba(251,146,60,.22);color:#fb923c}
.sh-tag-roi{background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.22);color:#34d399}
.sh-tag-sharp{background:rgba(184,159,255,.12);border:1px solid rgba(184,159,255,.26);color:#b89fff}
.sh-tag-consistent{background:rgba(56,189,248,.08);border:1px solid rgba(56,189,248,.2);color:#38bdf8}
.sh-tag-underdog{background:rgba(251,146,60,.1);border:1px solid rgba(251,146,60,.22);color:#fb923c}
.sh-tag-rising{background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.18);color:#34d399}
.sh-tag-risk{background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.18);color:#f87171}

/* ─ Recent pick dots ─ */
.sh-recent{display:flex;align-items:center;gap:5px;margin-bottom:10px}
.sh-recent-lbl{font-family:'DM Mono',monospace;font-size:8px;color:#6b6b6b;letter-spacing:.8px;margin-right:2px}
.sh-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.sh-dot-win{background:#34d399}
.sh-dot-loss{background:#f87171}
.sh-dot-push{background:rgba(255,255,255,.15)}
.sh-dot-pending{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15)}

/* ─ View CTA ─ */
.sh-cta{display:block;text-align:center;background:rgba(184,159,255,.08);border:1px solid rgba(184,159,255,.18);border-radius:8px;padding:8px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:1.5px;color:#b89fff;text-decoration:none;transition:background .18s,border-color .18s;margin-top:2px}
.sh-cta:hover{background:rgba(184,159,255,.16);border-color:rgba(184,159,255,.32)}

/* ─ Skeleton loading ─ */
.sh-skel{border-radius:4px;background:linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.07) 50%,rgba(255,255,255,.04) 75%);background-size:400px 100%;animation:sh-shimmer 1.3s linear infinite;display:inline-block}
@keyframes sh-shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}

/* ─ Snapshot card (inline embed) ─ */
.sh-snap{display:inline-flex;align-items:center;gap:8px;background:rgba(12,10,26,.75);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:8px 12px;text-decoration:none;transition:border-color .2s}
.sh-snap:hover{border-color:rgba(184,159,255,.18)}
.sh-snap-av{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:14px;color:#fff;flex-shrink:0}
.sh-snap-info{flex:1;min-width:0}
.sh-snap-name{font-size:12px;font-weight:700;color:#e6e6e6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sh-snap-meta{font-family:'DM Mono',monospace;font-size:9px;color:#6b6b6b;margin-top:1px}
.sh-snap-roi{text-align:right;flex-shrink:0}
.sh-snap-rval{font-family:'Bebas Neue',sans-serif;font-size:17px;line-height:1}
.sh-snap-rlbl{font-family:'DM Mono',monospace;font-size:8px;color:#6b6b6b;letter-spacing:1px}

/* ─ Achievement callout ─ */
.sh-ach{display:inline-flex;align-items:center;gap:8px;border-radius:8px;padding:8px 12px;font-family:'DM Mono',monospace}
.sh-ach-icon{font-size:14px;flex-shrink:0}
.sh-ach-label{font-size:8px;letter-spacing:1px;text-transform:uppercase;font-weight:700}
.sh-ach-sub{font-size:11px;color:#e6e6e6;margin-top:1px}
.sh-ach-default{background:rgba(184,159,255,.06);border:1px solid rgba(184,159,255,.14)}
.sh-ach-default .sh-ach-label{color:#b89fff}
.sh-ach-division{background:rgba(56,189,248,.05);border:1px solid rgba(56,189,248,.16)}
.sh-ach-division .sh-ach-label{color:#38bdf8}
.sh-ach-pnl{background:rgba(52,211,153,.05);border:1px solid rgba(52,211,153,.16)}
.sh-ach-pnl .sh-ach-label{color:#34d399}
.sh-ach-streak{background:rgba(251,191,36,.05);border:1px solid rgba(251,191,36,.16)}
.sh-ach-streak .sh-ach-label{color:#fbbf24}
.sh-ach-picks{background:rgba(184,159,255,.05);border:1px solid rgba(184,159,255,.14)}
.sh-ach-picks .sh-ach-label{color:#b89fff}
.sh-ach-archetype{background:rgba(184,159,255,.06);border:1px solid rgba(184,159,255,.16)}
.sh-ach-archetype .sh-ach-label{color:#b89fff}

/* ─ Rivalry card ─ */
.sh-rival{background:rgba(12,10,26,.92);border:1px solid rgba(248,113,113,.16);border-radius:12px;padding:14px 16px}
.sh-rival-head{font-family:'DM Mono',monospace;font-size:8px;color:#f87171;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;display:flex;align-items:center;gap:6px}
.sh-rival-head::before{content:'';width:4px;height:4px;background:#f87171;border-radius:50%;animation:sh-riv-pulse 1.4s ease-in-out infinite}
@keyframes sh-riv-pulse{0%,100%{opacity:1}50%{opacity:.4}}
.sh-rival-players{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px;margin-bottom:10px}
.sh-rival-p{display:flex;flex-direction:column}
.sh-rival-p.right{align-items:flex-end}
.sh-rival-pname{font-size:12px;font-weight:700;color:#e6e6e6}
.sh-rival-proi{font-family:'Bebas Neue',sans-serif;font-size:18px;line-height:1}
.sh-rival-vs{font-family:'DM Mono',monospace;font-size:9px;color:#6b6b6b;text-align:center;white-space:nowrap}
.sh-rival-meter{position:relative;height:4px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden}
.sh-rival-mfill-l{position:absolute;left:0;top:0;height:100%;border-radius:2px;background:linear-gradient(90deg,#b89fff,rgba(184,159,255,.3));transition:width .9s cubic-bezier(.4,0,.2,1)}
.sh-rival-mfill-r{position:absolute;right:0;top:0;height:100%;border-radius:2px;background:linear-gradient(270deg,#f87171,rgba(248,113,113,.3));transition:width .9s cubic-bezier(.4,0,.2,1)}
.sh-rival-tension{font-family:'DM Mono',monospace;font-size:9px;color:#6b6b6b;text-align:center;margin-top:8px;letter-spacing:.5px}
.sh-rival-tension strong{color:#f87171}
`;

  // ── Inject styles (once) ────────────────────────────────────────────────────
  if(!document.getElementById('sh-css')){
    var s=document.createElement('style');
    s.id='sh-css';s.textContent=CSS;
    document.head.appendChild(s);
  }

  // ── State ───────────────────────────────────────────────────────────────────
  var _cache    = {};
  var _fetching = {};
  var _popup    = null;
  var _showTimer = null;
  var _hideTimer = null;
  var _activeTgt = null;
  var _attached  = new WeakSet();

  // ── Utilities ───────────────────────────────────────────────────────────────
  function avColor(u){
    if(!u)return'#b89fff';
    var h=0;for(var i=0;i<u.length;i++){h=u.charCodeAt(i)+((h<<5)-h);h|=0;}
    var hue=Math.abs(h)%360;
    return'hsl('+hue+',55%,38%)';
  }

  function divisionClass(div){
    if(!div)return'sh-ring-bronze';
    var d=div.toLowerCase();
    if(d.includes('legend'))return'sh-ring-legendary';
    if(d.includes('elite'))return'sh-ring-elite';
    if(d.includes('diamond'))return'sh-ring-diamond';
    if(d.includes('platinum'))return'sh-ring-platinum';
    if(d.includes('gold'))return'sh-ring-gold';
    if(d.includes('silver'))return'sh-ring-silver';
    return'sh-ring-bronze';
  }

  function divPillClass(div){
    return divisionClass(div).replace('sh-ring-','sh-div-');
  }

  function computeTags(r){
    var tags=[];
    var settled=(r.wins||0)+(r.losses||0);
    if(r.streakType==='win'&&r.currentStreak>=5) tags.push({label:'HOT STREAK',cls:'hot'});
    else if(r.streakType==='win'&&r.currentStreak>=3) tags.push({label:'ON A RUN',cls:'run'});
    if(r.roi>=20&&r.totalPicks>=10) tags.push({label:'TOP ROI',cls:'roi'});
    if(r.winRate>=65&&settled>=15) tags.push({label:'SHARP PICKER',cls:'sharp'});
    if(r.winRate>=60&&settled>=25) tags.push({label:'CONSISTENT',cls:'consistent'});
    if(r.avgOdds>=3.0&&r.roi>0) tags.push({label:'UNDERDOG HUNTER',cls:'underdog'});
    if(r.totalPicks<25&&r.roi>10) tags.push({label:'RISING',cls:'rising'});
    if(r.avgOdds>=3.5&&r.totalPicks>=8) tags.push({label:'HIGH RISK',cls:'risk'});
    return tags.slice(0,2);
  }

  function recentDotsHTML(picks){
    if(!picks||!picks.length)return'';
    return picks.slice(0,5).map(function(p){
      if(p.result==='win')return'<span class="sh-dot sh-dot-win"></span>';
      if(p.result==='loss')return'<span class="sh-dot sh-dot-loss"></span>';
      if(p.result==='push')return'<span class="sh-dot sh-dot-push"></span>';
      return'<span class="sh-dot sh-dot-pending"></span>';
    }).join('');
  }

  function fmt(n,dec){return n!=null?((n>=0?'+':'')+parseFloat(n).toFixed(dec!=null?dec:1)):'—';}
  function fmtROI(r){
    if(r==null)return'—';
    return(r>=0?'+':'')+parseFloat(r).toFixed(1)+'%';
  }

  // ── Data fetching ──────────────────────────────────────────────────────────
  function getRanking(username){
    if(_cache[username]!==undefined)return Promise.resolve(_cache[username]);
    if(_fetching[username])return _fetching[username];
    _fetching[username]=fetch(API+'/rankings/'+encodeURIComponent(username),{cache:'no-store'})
      .then(function(r){return r.ok?r.json():null;})
      .then(function(d){
        _cache[username]=d;
        delete _fetching[username];
        return d;
      })
      .catch(function(){
        _cache[username]=null;
        delete _fetching[username];
        return null;
      });
    return _fetching[username];
  }

  // ── Popup HTML ────────────────────────────────────────────────────────────
  function skeletonHTML(username){
    var av=avColor(username);
    return'<div class="sh-head">'
      +'<div class="sh-av-wrap sh-ring-bronze"><div class="sh-av" style="background:'+av+'">'+username.slice(0,2).toUpperCase()+'</div></div>'
      +'<div class="sh-id">'
        +'<div class="sh-skel" style="width:80px;height:12px;margin-bottom:6px"></div>'
        +'<div class="sh-skel" style="width:55px;height:9px"></div>'
      +'</div>'
    +'</div>'
    +'<div class="sh-stats">'
      +'<div class="sh-stat"><div class="sh-skel" style="width:38px;height:15px;margin:0 auto 6px"></div><div class="sh-skel" style="width:24px;height:7px;margin:0 auto"></div></div>'
      +'<div class="sh-stat"><div class="sh-skel" style="width:46px;height:15px;margin:0 auto 6px"></div><div class="sh-skel" style="width:28px;height:7px;margin:0 auto"></div></div>'
      +'<div class="sh-stat"><div class="sh-skel" style="width:32px;height:15px;margin:0 auto 6px"></div><div class="sh-skel" style="width:24px;height:7px;margin:0 auto"></div></div>'
    +'</div>';
  }

  function buildCardHTML(username,r){
    var av=avColor(username);
    if(!r){
      return'<div class="sh-head">'
        +'<div class="sh-av-wrap sh-ring-bronze"><div class="sh-av" style="background:'+av+'">'+username.slice(0,2).toUpperCase()+'</div></div>'
        +'<div class="sh-id"><div class="sh-name">@'+username+'</div><div class="sh-arch" style="color:var(--mu,#6b6b6b)">No data yet</div></div>'
        +'</div>'
        +'<a href="/tipster?u='+username+'" class="sh-cta">VIEW PROFILE</a>';
    }

    var ringCls=divisionClass(r.division);
    var pillCls=divPillClass(r.division);
    var arch=r.archetype||{};
    var roi=fmtROI(r.roi);
    var roiCls=r.roi>=0?'pos':'neg';
    var wl=(r.wins||0)+'W–'+(r.losses||0)+'L';
    var streak='—';
    if(r.currentStreak>0&&r.streakType){
      streak=(r.streakType==='win'?'🔥':'❄️')+' '+r.currentStreak+(r.streakType==='win'?'W':'L');
    }
    var tags=computeTags(r);
    var dots=recentDotsHTML(r.recentPicks||[]);
    var trust=r.reliabilityScore?Math.round(r.reliabilityScore):0;
    var archName=arch.name?(arch.name.replace(/^The /,'')):null;
    var rankTxt=r.rank?'#'+r.rank+' RANKED':'';

    return''
      +'<div class="sh-head">'
        +'<div class="sh-av-wrap '+ringCls+'"><div class="sh-av" style="background:'+av+'">'+username.slice(0,2).toUpperCase()+'</div></div>'
        +'<div class="sh-id">'
          +'<div class="sh-name">@'+username+'</div>'
          +(archName?'<div class="sh-arch">'+(arch.icon||'')+(arch.icon?' ':'')+archName+'</div>':'')
        +'</div>'
        +'<div class="sh-div-pill '+pillCls+'">'+(r.division||'—')+'</div>'
      +'</div>'

      +'<div class="sh-stats">'
        +'<div class="sh-stat"><div class="sh-sv '+roiCls+'">'+roi+'</div><div class="sh-sl">ROI</div></div>'
        +'<div class="sh-stat"><div class="sh-sv">'+wl+'</div><div class="sh-sl">RECORD</div></div>'
        +'<div class="sh-stat"><div class="sh-sv">'+streak+'</div><div class="sh-sl">STREAK</div></div>'
      +'</div>'

      +(trust>0
        ?'<div class="sh-trust-row"><span class="sh-trust-lbl">TRUST</span><div class="sh-trust-bar"><div class="sh-trust-fill" style="width:'+trust+'%"></div></div><span class="sh-trust-num">'+trust+'</span></div>'
        :'')

      +(tags.length
        ?'<div class="sh-tags">'+tags.map(function(t){return'<span class="sh-tag sh-tag-'+t.cls+'">'+t.label+'</span>';}).join('')+'</div>'
        :'')

      +(dots
        ?'<div class="sh-recent"><span class="sh-recent-lbl">LAST 5</span>'+dots+'</div>'
        :'')

      +'<a href="/tipster?u='+username+'" class="sh-cta">VIEW PROFILE'+(rankTxt?' · '+rankTxt:'')+'</a>';
  }

  // ── Popup lifecycle ───────────────────────────────────────────────────────
  function ensurePopup(){
    if(_popup)return;
    _popup=document.createElement('div');
    _popup.className='sh-popup';
    document.body.appendChild(_popup);
    _popup.addEventListener('mouseenter',function(){
      clearTimeout(_hideTimer);
    });
    _popup.addEventListener('mouseleave',function(){
      scheduleHide();
    });
  }

  function positionPopup(tgt){
    var r=tgt.getBoundingClientRect();
    var pw=260,ph=320;
    var left=r.left,top=r.bottom+8;
    if(left+pw>window.innerWidth-12)left=window.innerWidth-pw-12;
    if(top+ph>window.innerHeight-12)top=r.top-ph-8;
    left=Math.max(12,left);
    top=Math.max(12,top);
    _popup.style.left=left+'px';
    _popup.style.top=top+'px';
  }

  function scheduleHide(){
    clearTimeout(_hideTimer);
    _hideTimer=setTimeout(function(){
      if(_popup){_popup.classList.remove('sh-vis');}
      _activeTgt=null;
    },180);
  }

  function showFor(username,tgt){
    clearTimeout(_hideTimer);
    clearTimeout(_showTimer);
    ensurePopup();
    _activeTgt=tgt;

    _showTimer=setTimeout(function(){
      if(_activeTgt!==tgt)return;
      positionPopup(tgt);
      _popup.innerHTML=skeletonHTML(username);
      _popup.classList.add('sh-vis');

      getRanking(username).then(function(r){
        if(_activeTgt!==tgt)return;
        _popup.innerHTML=buildCardHTML(username,r);
        positionPopup(tgt);
      });
    },320);
  }

  // ── Element attachment ────────────────────────────────────────────────────
  function getUsername(el){
    if(el.dataset&&el.dataset.shUser)return el.dataset.shUser;
    var href=el.href||el.getAttribute('href')||'';
    var m=href.match(/[?&]u=([^&#]+)/);
    if(m)return decodeURIComponent(m[1]);
    return null;
  }

  function attachEl(el){
    if(_attached.has(el))return;
    var username=getUsername(el);
    if(!username)return;
    _attached.add(el);
    el.addEventListener('mouseenter',function(){showFor(username,el);});
    el.addEventListener('mouseleave',function(){scheduleHide();});
    el.addEventListener('focus',function(){showFor(username,el);});
    el.addEventListener('blur',function(){scheduleHide();});
  }

  function attach(root){
    var r=root||document;
    r.querySelectorAll('a[href*="/tipster?u="]').forEach(attachEl);
    r.querySelectorAll('[data-sh-user]').forEach(attachEl);

    var obs=new MutationObserver(function(muts){
      muts.forEach(function(m){
        m.addedNodes.forEach(function(n){
          if(n.nodeType!==1)return;
          if(n.matches&&(n.matches('a[href*="/tipster?u="]')||n.matches('[data-sh-user]')))attachEl(n);
          if(n.querySelectorAll){
            n.querySelectorAll('a[href*="/tipster?u="],  [data-sh-user]').forEach(attachEl);
          }
        });
      });
    });
    obs.observe(root||document.body,{childList:true,subtree:true});
  }

  // ── Snapshot card (inline embed) ──────────────────────────────────────────
  function snapshotCard(username,r){
    var av=avColor(username);
    var roi=r?fmtROI(r.roi):'—';
    var roiCls=r&&r.roi>=0?'pos':'neg';
    var arch=r&&r.archetype?r.archetype:{};
    var archStr=arch.name?(arch.name.replace(/^The /,'')):null;
    var ringCls=r?divisionClass(r.division):'sh-ring-bronze';
    return'<a class="sh-snap" href="/tipster?u='+username+'">'
      +'<div class="sh-snap-av '+ringCls+'" style="background:'+av+'">'+username.slice(0,2).toUpperCase()+'</div>'
      +'<div class="sh-snap-info">'
        +'<div class="sh-snap-name">@'+username+'</div>'
        +(archStr?'<div class="sh-snap-meta">'+archStr+'</div>':'')
      +'</div>'
      +'<div class="sh-snap-roi">'
        +'<div class="sh-snap-rval '+roiCls+'">'+roi+'</div>'
        +'<div class="sh-snap-rlbl">ROI</div>'
      +'</div>'
    +'</a>';
  }

  // ── Achievement callout ───────────────────────────────────────────────────
  var _achConfig={
    division:{icon:'⬆️',label:'DIVISION UP',cls:'sh-ach-division'},
    archetype:{icon:'⚡',label:'IDENTITY UNLOCKED',cls:'sh-ach-archetype'},
    pnl:{icon:'💰',label:'PROFIT MILESTONE',cls:'sh-ach-pnl'},
    streak:{icon:'🔥',label:'WIN STREAK',cls:'sh-ach-streak'},
    picks:{icon:'📌',label:'MILESTONE PICK',cls:'sh-ach-picks'},
  };

  function achievementCallout(type,data){
    var cfg=_achConfig[type]||{icon:'🏆',label:'ACHIEVEMENT',cls:'sh-ach-default'};
    var sub=data&&data.sub?data.sub:(data&&data.label?data.label:'');
    return'<div class="sh-ach '+cfg.cls+'">'
      +'<span class="sh-ach-icon">'+cfg.icon+'</span>'
      +'<div>'
        +'<div class="sh-ach-label">'+cfg.label+'</div>'
        +(sub?'<div class="sh-ach-sub">'+sub+'</div>':'')
      +'</div>'
    +'</div>';
  }

  // ── Rivalry card ──────────────────────────────────────────────────────────
  function rivalryCard(u1,u1roi,u2,u2roi){
    var r1=parseFloat(u1roi)||0;
    var r2=parseFloat(u2roi)||0;
    var spread=Math.abs(r1-r2);
    var total=Math.abs(r1)+Math.abs(r2)||1;

    // Tension: high when spread is small relative to both ROIs
    var tension=Math.max(0,Math.min(100,Math.round(100-(spread/Math.max(total,0.1))*80)));

    // Each side gets a % of the bar proportional to its absolute ROI
    var leftPct=Math.round((Math.abs(r1)/total)*100);
    var rightPct=Math.round((Math.abs(r2)/total)*100);

    var tensionLabel=tension>=80?'DEAD HEAT':tension>=55?'CLOSE RACE':tension>=30?'PULLING AHEAD':'DOMINANT EDGE';

    return'<div class="sh-rival">'
      +'<div class="sh-rival-head">RIVALRY ACTIVE</div>'
      +'<div class="sh-rival-players">'
        +'<div class="sh-rival-p">'
          +'<div class="sh-rival-pname">@'+u1+'</div>'
          +'<div class="sh-rival-proi" style="color:'+(r1>=0?'#34d399':'#f87171')+'">'+fmtROI(r1)+'</div>'
        +'</div>'
        +'<div class="sh-rival-vs">VS</div>'
        +'<div class="sh-rival-p right">'
          +'<div class="sh-rival-pname">@'+u2+'</div>'
          +'<div class="sh-rival-proi" style="color:'+(r2>=0?'#34d399':'#f87171')+'">'+fmtROI(r2)+'</div>'
        +'</div>'
      +'</div>'
      +'<div class="sh-rival-meter">'
        +'<div class="sh-rival-mfill-l" style="width:'+leftPct+'%"></div>'
        +'<div class="sh-rival-mfill-r" style="width:'+rightPct+'%"></div>'
      +'</div>'
      +'<div class="sh-rival-tension">Tension <strong>'+tension+'%</strong> · '+tensionLabel+'</div>'
    +'</div>';
  }

  // ── Auto-init ─────────────────────────────────────────────────────────────
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){attach();});
  }else{
    attach();
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  window.Social={
    card:     buildCardHTML,
    snap:     snapshotCard,
    tags:     computeTags,
    attach:   attach,
    achievement: achievementCallout,
    rivalry:  rivalryCard,
    preload:  getRanking,
  };

})();
