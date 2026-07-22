(function(){
  'use strict';

  // ── CSS ────────────────────────────────────────────────────────────────────
  var CSS = `
/* ─── Insight Deck ─── */
.ig-deck{position:relative;margin-bottom:20px}
.ig-deck-inner{position:relative;min-height:60px;overflow:hidden}
.ig-card{
  background:var(--s1,#0c0a1a);
  border:1px solid rgba(255,255,255,.06);
  border-radius:14px;padding:16px 18px;
  position:absolute;inset:0;
  opacity:0;transform:translateY(10px);
  transition:opacity .4s ease,transform .4s ease;
  pointer-events:none;display:flex;flex-direction:column;justify-content:space-between;
}
.ig-card.ig-active{opacity:1;transform:translateY(0);pointer-events:auto;position:relative}
.ig-card.ig-exit{opacity:0;transform:translateY(-10px)}

.ig-card-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px}
.ig-cat{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:var(--mu,#6b6b6b);padding:2px 7px;border-radius:4px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06)}
.ig-cat.sport{background:rgba(52,211,153,.07);border-color:rgba(52,211,153,.18);color:#34d399}
.ig-cat.market{background:rgba(56,189,248,.07);border-color:rgba(56,189,248,.18);color:#38bdf8}
.ig-cat.pattern{background:rgba(184,159,255,.07);border-color:rgba(184,159,255,.18);color:#b89fff}
.ig-cat.form{background:rgba(251,191,36,.07);border-color:rgba(251,191,36,.18);color:#fbbf24}
.ig-cat.risk{background:rgba(248,113,113,.07);border-color:rgba(248,113,113,.18);color:#f87171}
.ig-cat.moment{background:rgba(184,159,255,.12);border-color:rgba(184,159,255,.3);color:#b89fff}

.ig-conf{display:flex;gap:2px;align-items:center}
.ig-conf-dot{width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,.12)}
.ig-conf-dot.on{background:#b89fff}

.ig-headline{font-family:'Syne',system-ui,sans-serif;font-size:15px;font-weight:700;color:#e6e6e6;line-height:1.35;margin-bottom:8px}
.ig-headline em{font-style:normal;color:#b89fff}

.ig-support{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.ig-metric{font-family:'Bebas Neue','DM Mono',monospace;font-size:20px;line-height:1;letter-spacing:.5px}
.ig-metric.pos{color:#34d399}.ig-metric.neg{color:#f87171}.ig-metric.ac{color:#b89fff}.ig-metric.gold{color:#fbbf24}
.ig-meta{font-family:'DM Mono',monospace;font-size:9px;color:var(--mu,#6b6b6b);letter-spacing:.8px}
.ig-delta{font-family:'DM Mono',monospace;font-size:9px;padding:2px 6px;border-radius:4px;letter-spacing:.5px}
.ig-delta.up{background:rgba(52,211,153,.1);color:#34d399}
.ig-delta.down{background:rgba(248,113,113,.1);color:#f87171}
.ig-delta.same{background:rgba(255,255,255,.05);color:var(--mu,#6b6b6b)}

/* Deck dots */
.ig-dots{display:flex;gap:5px;justify-content:center;margin-top:10px}
.ig-dot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.12);transition:background .2s,transform .2s;cursor:pointer}
.ig-dot.on{background:#b89fff;transform:scale(1.3)}

/* ─── Moment Overlay ─── */
.ig-moment-overlay{
  position:fixed;inset:0;z-index:99998;
  background:rgba(7,6,13,.85);backdrop-filter:blur(8px);
  display:flex;align-items:center;justify-content:center;
  animation:ig-moment-in .3s ease;
}
@keyframes ig-moment-in{from{opacity:0}to{opacity:1}}
.ig-moment-card{
  width:min(340px,92vw);
  background:rgba(12,10,26,.98);
  border:1px solid rgba(184,159,255,.22);
  border-radius:18px;padding:26px 24px;
  box-shadow:0 0 60px rgba(184,159,255,.12),0 24px 60px rgba(0,0,0,.8);
  animation:ig-card-reveal .5s cubic-bezier(.34,1.56,.64,1) both;
}
@keyframes ig-card-reveal{
  0%{transform:scale(.88) translateY(20px);opacity:0;filter:blur(6px)}
  100%{transform:scale(1) translateY(0);opacity:1;filter:blur(0)}
}
.ig-moment-eye{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:3px;color:#b89fff;text-transform:uppercase;display:flex;align-items:center;gap:8px;margin-bottom:16px}
.ig-moment-eye::before{content:'';display:inline-block;width:6px;height:6px;border-radius:50%;background:#b89fff;animation:ig-pulse 1.6s ease-in-out infinite}
@keyframes ig-pulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(184,159,255,.4)}50%{opacity:.6;box-shadow:0 0 0 6px rgba(184,159,255,0)}}
.ig-moment-title{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:3px;color:#e6e6e6;margin-bottom:6px;line-height:1}
.ig-moment-body{font-size:14px;color:rgba(230,230,230,.8);line-height:1.5;margin-bottom:18px}
.ig-moment-body strong{color:#b89fff}
.ig-moment-dismiss{width:100%;background:rgba(184,159,255,.1);border:1px solid rgba(184,159,255,.2);border-radius:8px;padding:10px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:1.5px;color:#b89fff;cursor:pointer;transition:all .2s}
.ig-moment-dismiss:hover{background:rgba(184,159,255,.18)}

/* ─── Trend Panel ─── */
.ig-trend-list{display:flex;flex-direction:column;gap:6px}
.ig-trend-item{
  display:flex;align-items:center;gap:10px;
  background:rgba(255,255,255,.025);
  border:1px solid rgba(255,255,255,.05);
  border-radius:10px;padding:10px 12px;
  transition:border-color .2s;
}
.ig-trend-item:hover{border-color:rgba(184,159,255,.15)}
.ig-trend-item.hot{border-color:rgba(251,191,36,.12)}
.ig-trend-item.rising{border-color:rgba(52,211,153,.12)}
.ig-trend-item.cooling{border-color:rgba(56,189,248,.1)}
.ig-trend-icon{font-size:14px;flex-shrink:0;width:20px;text-align:center}
.ig-trend-body{flex:1;min-width:0}
.ig-trend-title{font-size:12px;font-weight:700;color:#e6e6e6;line-height:1.3}
.ig-trend-sub{font-family:'DM Mono',monospace;font-size:9px;color:var(--mu,#6b6b6b);margin-top:2px}
.ig-trend-badge{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:1px;padding:2px 6px;border-radius:4px;flex-shrink:0;font-weight:700;text-transform:uppercase}
.ig-trend-badge.hot{background:rgba(251,191,36,.12);color:#fbbf24;border:1px solid rgba(251,191,36,.22)}
.ig-trend-badge.rising{background:rgba(52,211,153,.1);color:#34d399;border:1px solid rgba(52,211,153,.2)}
.ig-trend-badge.active{background:rgba(184,159,255,.1);color:#b89fff;border:1px solid rgba(184,159,255,.2)}
.ig-trend-badge.cold{background:rgba(56,189,248,.08);color:#38bdf8;border:1px solid rgba(56,189,248,.18)}
.ig-trend-empty{font-family:'DM Mono',monospace;font-size:11px;color:var(--mu,#6b6b6b);padding:16px 0;text-align:center}

/* ─── Alert Strip ─── */
.ig-alert-strip{display:flex;flex-direction:column;gap:6px;margin-bottom:20px}
.ig-alert{
  display:flex;align-items:center;gap:10px;
  border-radius:10px;padding:10px 14px;
  border-left:3px solid transparent;
  animation:ig-alert-in .35s ease both;
}
@keyframes ig-alert-in{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}
.ig-alert.milestone{background:rgba(184,159,255,.06);border-left-color:#b89fff}
.ig-alert.streak{background:rgba(251,191,36,.05);border-left-color:#fbbf24}
.ig-alert.rank{background:rgba(52,211,153,.05);border-left-color:#34d399}
.ig-alert.badge{background:rgba(251,146,60,.05);border-left-color:#fb923c}
.ig-alert-icon{font-size:14px;flex-shrink:0}
.ig-alert-text{flex:1;font-size:12px;color:#e6e6e6;line-height:1.4}
.ig-alert-text strong{color:#b89fff}

/* ─── Personality Panel ─── */
.ig-personality{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:16px;margin-bottom:16px}
.ig-personality-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.ig-personality-title{font-family:'Bebas Neue',sans-serif;font-size:15px;letter-spacing:3px;color:var(--mu2,#a0a0a0)}
.ig-personality-tag{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:1px;color:#b89fff;background:rgba(184,159,255,.1);border:1px solid rgba(184,159,255,.2);padding:2px 8px;border-radius:4px}
.ig-traits{display:flex;flex-direction:column;gap:8px;margin-bottom:12px}
.ig-trait-row{display:flex;align-items:center;gap:10px}
.ig-trait-lbl{font-family:'DM Mono',monospace;font-size:9px;color:var(--mu,#6b6b6b);letter-spacing:.8px;width:72px;flex-shrink:0}
.ig-trait-bar{flex:1;height:3px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden}
.ig-trait-fill{height:100%;border-radius:2px;transition:width 1s ease}
.ig-trait-val{font-family:'DM Mono',monospace;font-size:9px;color:var(--mu2,#a0a0a0);width:28px;text-align:right;flex-shrink:0}
.ig-personality-sum{font-family:'DM Mono',monospace;font-size:10px;color:var(--mu2,#a0a0a0);font-style:italic;line-height:1.6;border-top:1px solid rgba(255,255,255,.04);padding-top:10px}

/* ─── Pattern List ─── */
.ig-patterns{display:flex;flex-direction:column;gap:5px;margin-bottom:16px}
.ig-pattern{
  display:flex;align-items:center;gap:10px;
  background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);
  border-radius:8px;padding:9px 12px;
}
.ig-pattern-icon{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1px;padding:2px 6px;border-radius:4px;flex-shrink:0;font-weight:700;text-transform:uppercase}
.ig-pattern-icon.best{background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.2);color:#34d399}
.ig-pattern-icon.warn{background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.18);color:#f87171}
.ig-pattern-icon.info{background:rgba(184,159,255,.08);border:1px solid rgba(184,159,255,.18);color:#b89fff}
.ig-pattern-body{flex:1;min-width:0}
.ig-pattern-title{font-size:12px;font-weight:700;color:#e6e6e6}
.ig-pattern-sub{font-family:'DM Mono',monospace;font-size:9px;color:var(--mu,#6b6b6b);margin-top:2px}
.ig-pattern-stat{font-family:'Bebas Neue',sans-serif;font-size:17px;line-height:1;flex-shrink:0}
.ig-pattern-stat.pos{color:#34d399}.ig-pattern-stat.neg{color:#f87171}.ig-pattern-stat.ac{color:#b89fff}
`;

  if(!document.getElementById('ig-css')){
    var s=document.createElement('style');s.id='ig-css';s.textContent=CSS;
    document.head.appendChild(s);
  }

  // ── Core stat helpers ─────────────────────────────────────────────────────
  function settled(picks){return picks.filter(function(p){return p.result==='win'||p.result==='loss';});}
  function wins(picks){return picks.filter(function(p){return p.result==='win';});}

  function computeROI(picks){
    var s=settled(picks);if(!s.length)return null;
    var stake=s.reduce(function(a,p){return a+(parseFloat(p.stake)||1);},0);
    var pnl=s.reduce(function(a,p){return a+(p.pnl||0);},0);
    return stake>0?(pnl/stake)*100:null;
  }

  function computeWR(picks){
    var s=settled(picks);if(!s.length)return null;
    return(wins(s).length/s.length)*100;
  }

  function fmtROI(r){if(r==null)return'—';return(r>=0?'+':'')+r.toFixed(1)+'%';}
  function fmtWR(w){if(w==null)return'—';return w.toFixed(0)+'%';}

  // Group picks by a key function, return object {key→picks[]}
  function groupBy(picks,keyFn){
    var g={};
    picks.forEach(function(p){
      var k=keyFn(p);
      if(k==null||k==='')return;
      if(!g[k])g[k]=[];
      g[k].push(p);
    });
    return g;
  }

  // Day-of-week name
  var _DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  function dayName(p){return _DAYS[new Date(p.createdAt).getDay()];}

  // Confidence bracket label
  function confLabel(c){
    if(!c)return null;
    var n=parseInt(c);
    if(n<=4)return'1–4 (low)';
    if(n<=7)return'5–7 (mid)';
    return'8–10 (high)';
  }

  // Confidence bucket key
  function confKey(p){return confLabel(p.confidence);}

  // Odds bracket
  function oddsBracket(p){
    var o=parseFloat(p.odds)||1.5;
    if(o<1.6)return'short';
    if(o<2.0)return'medium';
    if(o<3.0)return'value';
    return'longshot';
  }

  // ── Smart Insights computation ────────────────────────────────────────────
  function computeInsights(picks){
    var s=settled(picks);
    if(s.length<8)return[];
    var insights=[];
    var overallROI=computeROI(s)||0;
    var overallWR=computeWR(s)||0;

    // A. Sport champion — best/worst performer
    var bySport=groupBy(s,function(p){return p.sport;});
    var bestSport=null,bestSportROI=-999;
    Object.keys(bySport).forEach(function(sp){
      if(bySport[sp].length<5)return;
      var r=computeROI(bySport[sp]);
      if(r!=null&&r>bestSportROI){bestSportROI=r;bestSport=sp;}
    });
    if(bestSport&&Math.abs(bestSportROI-overallROI)>6){
      var wr=computeWR(bySport[bestSport]);
      insights.push({
        type:'sport',cat:'SPORT',catCls:'sport',
        headline:'<em>'+bestSport+'</em> is your strongest market',
        metric:fmtROI(bestSportROI),metricCls:bestSportROI>=0?'pos':'neg',
        meta:wins(bySport[bestSport]).length+'W–'+(bySport[bestSport].length-wins(bySport[bestSport]).length)+'L · '+fmtWR(wr)+' WR',
        delta:bestSportROI>overallROI?{label:(bestSportROI-overallROI).toFixed(1)+'% above avg',cls:'up'}:{label:(overallROI-bestSportROI).toFixed(1)+'% below avg',cls:'down'},
        conf:Math.min(5,Math.round(bySport[bestSport].length/4)),
      });
    }

    // B. High-odds vs low-odds performance
    var hiOdds=s.filter(function(p){return parseFloat(p.odds||0)>=2.5;});
    var loOdds=s.filter(function(p){return parseFloat(p.odds||0)<2.5;});
    if(hiOdds.length>=5&&loOdds.length>=5){
      var hiROI=computeROI(hiOdds)||0;
      var loROI=computeROI(loOdds)||0;
      var diff=Math.abs(hiROI-loROI);
      if(diff>8){
        var better=hiROI>loROI?'high':'low';
        insights.push({
          type:'risk',cat:'RISK PROFILE',catCls:'risk',
          headline:better==='high'
            ?'<em>Value picks</em> outperform favorites by '+diff.toFixed(0)+'%'
            :'ROI drops <em>'+diff.toFixed(0)+'%</em> on high-odds picks',
          metric:fmtROI(better==='high'?hiROI:loROI),metricCls:(better==='high'?hiROI:loROI)>=0?'pos':'neg',
          meta:hiOdds.length+' high-odds · '+loOdds.length+' short-odds',
          delta:{label:'±2.50 odds split',cls:'same'},
          conf:Math.min(5,Math.round(Math.min(hiOdds.length,loOdds.length)/4)),
        });
      }
    }

    // C. Confidence zone
    var byConf=groupBy(s,confKey);
    var bestConf=null,bestConfROI=-999,bestConfWR=-1;
    Object.keys(byConf).forEach(function(ck){
      if(byConf[ck].length<5)return;
      var r=computeROI(byConf[ck])||0;
      var w=computeWR(byConf[ck])||0;
      if(w>bestConfWR){bestConfWR=w;bestConf=ck;bestConfROI=r;}
    });
    if(bestConf&&bestConfWR>overallWR+8){
      insights.push({
        type:'conf',cat:'CONFIDENCE',catCls:'pattern',
        headline:'You peak at confidence <em>'+bestConf+'</em>',
        metric:fmtWR(bestConfWR),metricCls:'pos',
        meta:byConf[bestConf].length+' picks · '+fmtROI(bestConfROI)+' ROI',
        delta:{label:(bestConfWR-overallWR).toFixed(0)+'% above avg WR',cls:'up'},
        conf:Math.min(5,Math.round(byConf[bestConf].length/4)),
      });
    }

    // D. Day of week
    var byDay=groupBy(s,dayName);
    var bestDay=null,bestDayROI=-999;
    Object.keys(byDay).forEach(function(d){
      if(byDay[d].length<4)return;
      var r=computeROI(byDay[d]);
      if(r!=null&&r>bestDayROI){bestDayROI=r;bestDay=d;}
    });
    if(bestDay&&bestDayROI>overallROI+8){
      insights.push({
        type:'day',cat:'TIMING',catCls:'form',
        headline:'<em>'+bestDay+'</em> is your most profitable day',
        metric:fmtROI(bestDayROI),metricCls:'gold',
        meta:byDay[bestDay].length+' picks on '+bestDay+'s',
        delta:{label:(bestDayROI-overallROI).toFixed(1)+'% above avg',cls:'up'},
        conf:Math.min(5,Math.round(byDay[bestDay].length/3)),
      });
    }

    // E. Market leader
    var byMarket=groupBy(s,function(p){return p.market;});
    var bestMarket=null,bestMarketROI=-999;
    Object.keys(byMarket).forEach(function(m){
      if(byMarket[m].length<5)return;
      var r=computeROI(byMarket[m]);
      if(r!=null&&r>bestMarketROI){bestMarketROI=r;bestMarket=m;}
    });
    if(bestMarket&&bestMarketROI>overallROI+8){
      var mwr=computeWR(byMarket[bestMarket]);
      insights.push({
        type:'market',cat:'MARKET',catCls:'market',
        headline:'<em>'+bestMarket+'</em> is your highest-ROI market',
        metric:fmtROI(bestMarketROI),metricCls:bestMarketROI>=0?'pos':'neg',
        meta:byMarket[bestMarket].length+' picks · '+fmtWR(mwr)+' WR',
        delta:{label:(bestMarketROI-overallROI).toFixed(1)+'% above avg',cls:'up'},
        conf:Math.min(5,Math.round(byMarket[bestMarket].length/4)),
      });
    }

    // F. Recent form vs historical
    var recent=s.slice(-10);
    if(recent.length>=8){
      var recentWR=computeWR(recent)||0;
      var diff2=recentWR-overallWR;
      if(Math.abs(diff2)>=15){
        var hot=diff2>0;
        insights.push({
          type:'form',cat:'CURRENT FORM',catCls:'form',
          headline:hot?'You\'re on fire — <em>last 10 picks hitting</em>':'Form dip — <em>recent WR below average</em>',
          metric:fmtWR(recentWR),metricCls:hot?'pos':'neg',
          meta:'Last 10 vs career '+fmtWR(overallWR)+' avg',
          delta:{label:(hot?'+':'')+diff2.toFixed(0)+'% vs career',cls:hot?'up':'down'},
          conf:3,
        });
      }
    }

    // G. Underdog vs favorites this month
    var monthAgo=Date.now()-30*24*3600*1000;
    var recent30=s.filter(function(p){return new Date(p.createdAt).getTime()>monthAgo;});
    if(recent30.length>=8){
      var underdogs=recent30.filter(function(p){return parseFloat(p.odds||0)>=2.0;});
      var favs=recent30.filter(function(p){return parseFloat(p.odds||0)<2.0;});
      if(underdogs.length>=4&&favs.length>=4){
        var udROI=computeROI(underdogs)||0;
        var fvROI=computeROI(favs)||0;
        if(Math.abs(udROI-fvROI)>10){
          var udBetter=udROI>fvROI;
          insights.push({
            type:'underdog',cat:'THIS MONTH',catCls:'pattern',
            headline:udBetter?'<em>Underdogs</em> outperforming favorites this month':'<em>Favorites</em> outperforming underdogs this month',
            metric:fmtROI(udBetter?udROI:fvROI),metricCls:(udBetter?udROI:fvROI)>=0?'pos':'neg',
            meta:underdogs.length+' underdogs · '+favs.length+' favorites in 30d',
            delta:{label:Math.abs(udROI-fvROI).toFixed(1)+'% edge',cls:udBetter?'up':'same'},
            conf:Math.min(4,Math.round(Math.min(underdogs.length,favs.length)/3)),
          });
        }
      }
    }

    // H. Tilt detection — avg odds after loss vs after win
    if(s.length>=12){
      var avgOddsAfterLoss=0,cntAfterLoss=0,avgOddsAfterWin=0,cntAfterWin=0;
      for(var i=1;i<s.length;i++){
        var prev=s[i-1];var cur=s[i];
        var o=parseFloat(cur.odds)||1.5;
        if(prev.result==='loss'){avgOddsAfterLoss+=o;cntAfterLoss++;}
        else if(prev.result==='win'){avgOddsAfterWin+=o;cntAfterWin++;}
      }
      if(cntAfterLoss>=4&&cntAfterWin>=4){
        var aAL=avgOddsAfterLoss/cntAfterLoss;
        var aAW=avgOddsAfterWin/cntAfterWin;
        if(aAL>aAW*1.25){
          insights.push({
            type:'tilt',cat:'BEHAVIOUR',catCls:'risk',
            headline:'Odds increase <em>'+((aAL/aAW-1)*100).toFixed(0)+'%</em> after a loss',
            metric:aAL.toFixed(2)+'x',metricCls:'neg',
            meta:'avg odds: '+aAW.toFixed(2)+' post-win vs '+aAL.toFixed(2)+' post-loss',
            delta:{label:'watch tilt zone',cls:'down'},
            conf:Math.min(4,Math.round(cntAfterLoss/3)),
          });
        }
      }
    }

    return insights;
  }

  // ── Market Personality ────────────────────────────────────────────────────
  function computePersonality(picks){
    var s=settled(picks);
    if(s.length<8)return null;

    var avgOdds=s.reduce(function(a,p){return a+(parseFloat(p.odds)||1.5);},0)/s.length;
    var stakes=s.map(function(p){return parseFloat(p.stake)||1;});
    var avgStake=stakes.reduce(function(a,b){return a+b;},0)/stakes.length;
    var stakeSD=Math.sqrt(stakes.reduce(function(a,b){return a+Math.pow(b-avgStake,2);},0)/stakes.length);
    var stakeCV=avgStake>0?stakeSD/avgStake:0;

    var highConfPicks=s.filter(function(p){return parseInt(p.confidence||0)>=8;});
    var highConfWR=highConfPicks.length>=4?computeWR(highConfPicks):null;
    var overallWR=computeWR(s)||0;

    var avgConf=s.filter(function(p){return p.confidence;}).reduce(function(a,p){return a+parseInt(p.confidence);},0)/(s.filter(function(p){return p.confidence;}).length||1);

    // Risk score 0-100 (100 = very high risk)
    var riskScore=Math.min(100,Math.round(((avgOdds-1.2)/3)*70+(stakeCV*30)));
    // Discipline score (low CV = high discipline)
    var disciplineScore=Math.min(100,Math.round((1-Math.min(1,stakeCV))*100));
    // Confidence calibration
    var calibrationScore=highConfPicks.length>=4&&highConfWR!=null
      ?Math.min(100,Math.round((highConfWR/Math.max(overallWR,1))*65+(1-Math.abs(highConfWR-75)/75)*35))
      :50;
    // Edge-seeking (positive ROI bias)
    var roi=computeROI(s)||0;
    var edgeScore=Math.min(100,Math.max(0,50+roi*1.5));

    var traits=[
      {label:'RISK',pct:riskScore,color:riskScore>65?'#f87171':riskScore>40?'#fbbf24':'#34d399'},
      {label:'DISCIPLINE',pct:disciplineScore,color:'#b89fff'},
      {label:'CALIBRATION',pct:calibrationScore,color:'#38bdf8'},
      {label:'EDGE SEEKING',pct:edgeScore,color:'#34d399'},
    ];

    // Personality tag
    var tag;
    if(avgOdds<1.7&&stakeCV<0.3) tag='CONSERVATIVE';
    else if(avgOdds>=2.5&&roi>0) tag='VALUE HUNTER';
    else if(stakeCV>0.5) tag='MOMENTUM BETTOR';
    else if(highConfWR!=null&&highConfWR>70) tag='CALIBRATED SHARP';
    else if(roi>15&&s.length>=20) tag='EDGE FINDER';
    else tag='BALANCED';

    // Summary sentence
    var avgOddsStr=avgOdds.toFixed(2);
    var cvStr=(stakeCV*100).toFixed(0)+'%';
    var sums=[];
    if(avgOdds<1.7) sums.push('prefers short odds');
    else if(avgOdds>2.5) sums.push('hunts value at '+avgOddsStr+'x avg');
    else sums.push('balanced odds selection at '+avgOddsStr+'x avg');
    if(stakeCV<0.2) sums.push('flat staking discipline');
    else if(stakeCV>0.5) sums.push('variable stakes — swings on conviction');
    else sums.push('moderate stake variation ('+cvStr+' CV)');
    if(highConfWR!=null&&highConfPicks.length>=4){
      if(highConfWR>=70) sums.push('high confidence picks deliver: '+fmtWR(highConfWR)+' WR');
      else sums.push('high confidence WR ('+fmtWR(highConfWR)+') trails expectation');
    }

    return{traits:traits,tag:tag,summary:sums.join(' · ')};
  }

  // ── Pick Pattern Discovery ────────────────────────────────────────────────
  function computePatterns(picks){
    var s=settled(picks);
    if(s.length<8)return[];
    var patterns=[];
    var overallROI=computeROI(s)||0;
    var overallWR=computeWR(s)||0;

    // Best day
    var byDay=groupBy(s,dayName);
    var bestDay=null,bestDayROI=-999;
    Object.keys(byDay).forEach(function(d){
      if(byDay[d].length<3)return;
      var r=computeROI(byDay[d]);if(r!=null&&r>bestDayROI){bestDayROI=r;bestDay=d;}
    });
    if(bestDay) patterns.push({
      icon:'BEST DAY',iconCls:'best',title:bestDay,sub:byDay[bestDay].length+' picks · '+fmtWR(computeWR(byDay[bestDay]))+' WR',
      stat:fmtROI(bestDayROI),statCls:bestDayROI>=0?'pos':'neg',
    });

    // Best market
    var byMkt=groupBy(s,function(p){return p.market;});
    var bestMkt=null,bestMktROI=-999;
    Object.keys(byMkt).forEach(function(m){
      if(byMkt[m].length<4)return;
      var r=computeROI(byMkt[m]);if(r!=null&&r>bestMktROI){bestMktROI=r;bestMkt=m;}
    });
    if(bestMkt) patterns.push({
      icon:'TOP MARKET',iconCls:'best',title:bestMkt,sub:byMkt[bestMkt].length+' picks · '+fmtWR(computeWR(byMkt[bestMkt]))+' WR',
      stat:fmtROI(bestMktROI),statCls:bestMktROI>=0?'pos':'neg',
    });

    // Best sport
    var bySp=groupBy(s,function(p){return p.sport;});
    var bestSp=null,bestSpROI=-999;
    Object.keys(bySp).forEach(function(sp){
      if(bySp[sp].length<5)return;
      var r=computeROI(bySp[sp]);if(r!=null&&r>bestSpROI){bestSpROI=r;bestSp=sp;}
    });
    if(bestSp&&Math.abs(bestSpROI-overallROI)>5) patterns.push({
      icon:'BEST SPORT',iconCls:'best',title:bestSp,sub:bySp[bestSp].length+' picks · '+fmtWR(computeWR(bySp[bestSp]))+' WR',
      stat:fmtROI(bestSpROI),statCls:bestSpROI>=0?'pos':'neg',
    });

    // Best confidence zone
    var byConf=groupBy(s,confKey);
    var bestCz=null,bestCzWR=-1;
    Object.keys(byConf).forEach(function(c){
      if(byConf[c].length<5)return;
      var w=computeWR(byConf[c])||0;if(w>bestCzWR){bestCzWR=w;bestCz=c;}
    });
    if(bestCz&&bestCzWR>overallWR+8) patterns.push({
      icon:'SWEET ZONE',iconCls:'info',title:'Confidence '+bestCz,sub:byConf[bestCz].length+' picks · '+fmtROI(computeROI(byConf[bestCz]))+' ROI',
      stat:fmtWR(bestCzWR),statCls:'pos',
    });

    // Worst day (warning)
    var worstDay=null,worstDayROI=999;
    Object.keys(byDay).forEach(function(d){
      if(byDay[d].length<3)return;
      var r=computeROI(byDay[d]);if(r!=null&&r<worstDayROI){worstDayROI=r;worstDay=d;}
    });
    if(worstDay&&worstDayROI<overallROI-10) patterns.push({
      icon:'WEAK SPOT',iconCls:'warn',title:worstDay+' struggles',sub:byDay[worstDay].length+' picks · avg '+fmtROI(worstDayROI)+' ROI',
      stat:fmtROI(worstDayROI),statCls:'neg',
    });

    return patterns.slice(0,5);
  }

  // ── Trend Detection (all tipsters' picks) ────────────────────────────────
  function computeTrends(allPicks){
    var now=Date.now();
    var h24=now-24*3600*1000;
    var h48=now-48*3600*1000;

    var today=allPicks.filter(function(p){return new Date(p.createdAt).getTime()>h24;});
    var this48=allPicks.filter(function(p){return new Date(p.createdAt).getTime()>h48;});
    var historical=allPicks.filter(function(p){return p.result==='win'||p.result==='loss';});

    var trends=[];

    // Market hot streaks — compare today's WR to overall WR for that market
    var todayByMkt=groupBy(settled(today),function(p){return p.market;});
    var histByMkt=groupBy(historical,function(p){return p.market;});
    var mktScores=[];
    Object.keys(todayByMkt).forEach(function(m){
      var td=todayByMkt[m];if(td.length<3)return;
      var tdWR=computeWR(td)||0;
      var histWR=histByMkt[m]&&histByMkt[m].length>=5?computeWR(histByMkt[m])||0:50;
      var lift=tdWR-histWR;
      mktScores.push({market:m,tdWR:tdWR,histWR:histWR,lift:lift,count:td.length,wins:wins(td).length});
    });
    mktScores.sort(function(a,b){return b.lift-a.lift;});

    if(mktScores.length>0){
      var top=mktScores[0];
      if(top.tdWR>=60){
        trends.push({
          icon:'🔥',cls:'hot',badge:'HOT',badgeCls:'hot',
          title:top.market+' hitting',
          sub:top.wins+'/'+(top.count)+' today ('+top.tdWR.toFixed(0)+'% WR)',
        });
      }
    }
    if(mktScores.length>1){
      var sec=mktScores[1];
      if(sec.lift>8&&sec.count>=3){
        trends.push({
          icon:'📈',cls:'rising',badge:'RISING',badgeCls:'rising',
          title:sec.market+' heating up',
          sub:sec.count+' picks today · '+sec.lift.toFixed(0)+'% above avg WR',
        });
      }
    }

    // Sport activity surge
    var todayBySp=groupBy(today,function(p){return p.sport;});
    var days=Math.max(1,(Date.now()-new Date(allPicks[allPicks.length-1]&&allPicks[allPicks.length-1].createdAt||Date.now()).getTime())/(24*3600*1000));
    var histBySp=groupBy(allPicks,function(p){return p.sport;});
    var spScores=[];
    Object.keys(todayBySp).forEach(function(sp){
      var tc=todayBySp[sp].length;
      var histAvg=histBySp[sp]?histBySp[sp].length/Math.max(days,1):1;
      var surge=histAvg>0?tc/histAvg:tc;
      spScores.push({sport:sp,count:tc,surge:surge});
    });
    spScores.sort(function(a,b){return b.surge-a.surge;});
    if(spScores.length>0&&spScores[0].surge>=2&&spScores[0].count>=3){
      var topSp=spScores[0];
      trends.push({
        icon:'⚡',cls:'rising',badge:'ACTIVE',badgeCls:'active',
        title:topSp.sport+' activity up',
        sub:topSp.count+' picks today · '+topSp.surge.toFixed(0)+'x daily avg',
      });
    }

    // Underdog hits today
    var todayUnderdogs=settled(today).filter(function(p){return parseFloat(p.odds||0)>=2.0;});
    if(todayUnderdogs.length>=3){
      var udWR=computeWR(todayUnderdogs)||0;
      if(udWR>=60){
        trends.push({
          icon:'🐉',cls:'hot',badge:'HOT',badgeCls:'hot',
          title:'Underdogs hitting today',
          sub:wins(todayUnderdogs).length+'/'+todayUnderdogs.length+' at odds 2.0+ ('+udWR.toFixed(0)+'%)',
        });
      }
    }

    // Volume spike (overall today vs daily avg)
    if(allPicks.length>20){
      var dayCount=today.length;
      var dailyAvg=allPicks.length/Math.max(days,7);
      if(dayCount>=dailyAvg*1.5&&dayCount>=5){
        trends.push({
          icon:'📊',cls:'rising',badge:'SURGE',badgeCls:'active',
          title:'Pick volume up today',
          sub:dayCount+' picks posted ('+((dayCount/dailyAvg-1)*100).toFixed(0)+'% above avg)',
        });
      }
    }

    // Cooling market (win rate falling)
    if(mktScores.length>0){
      var coldMkts=mktScores.filter(function(m){return m.lift<-10&&m.count>=3;});
      if(coldMkts.length>0){
        var cold=coldMkts[0];
        trends.push({
          icon:'❄️',cls:'cooling',badge:'COOLING',badgeCls:'cold',
          title:cold.market+' cooling off',
          sub:cold.count+' picks today · '+cold.tdWR.toFixed(0)+'% WR (avg '+cold.histWR.toFixed(0)+'%)',
        });
      }
    }

    return trends.slice(0,5);
  }

  // ── Personal Alerts (home) ────────────────────────────────────────────────
  function computeAlerts(picks,rankings){
    var alerts=[];
    var s=settled(picks);
    var total=picks.length;

    // Rank-based alert
    if(rankings&&rankings.rank){
      var rank=rankings.rank;
      if(rank<=15&&rank>10){
        alerts.push({type:'rank',icon:'🏆',text:'You\'re ranked <strong>#'+rank+'</strong> — top 10 is within reach.'});
      }else if(rank<=25&&rank>15){
        alerts.push({type:'rank',icon:'⚡',text:'<strong>#'+rank+'</strong> ranked — '+(rank-10)+' spots to top 10.'});
      }
    }

    // Milestone: next pick count threshold
    var milestones=[10,25,50,100,200,500];
    for(var i=0;i<milestones.length;i++){
      if(total<milestones[i]){
        var left=milestones[i]-total;
        alerts.push({type:'milestone',icon:'📌',text:'<strong>'+left+' more pick'+(left===1?'':'s')+'</strong> to reach the '+milestones[i]+'-pick milestone.'});
        break;
      }
    }

    // Streak record within reach
    if(rankings){
      var cur=rankings.currentStreak||0;
      var best=rankings.bestStreak||0;
      if(rankings.streakType==='win'&&cur>0&&best>0&&best-cur<=2&&best>3){
        alerts.push({type:'streak',icon:'🔥',text:'Just <strong>'+(best-cur)+' win'+(best-cur===1?'':'s')+'</strong> from your personal streak record ('+best+'W).'});
      }
    }

    // ROI milestone
    var roi=computeROI(s);
    if(roi!=null&&s.length>=10){
      if(roi>=15&&roi<20) alerts.push({type:'milestone',icon:'💰',text:'ROI at <strong>'+fmtROI(roi)+'</strong> — 5% away from the +20% elite tier.'});
      else if(roi>=8&&roi<10) alerts.push({type:'milestone',icon:'📈',text:'ROI climbing — <strong>'+fmtROI(roi)+'</strong>. The +10% mark is close.'});
    }

    // Win rate milestone
    var wr=computeWR(s);
    if(wr!=null&&s.length>=10){
      if(wr>=58&&wr<60) alerts.push({type:'badge',icon:'🎯',text:'Win rate at <strong>'+fmtWR(wr)+'</strong> — just past 60% unlocks Sharp Picker status.'});
    }

    return alerts.slice(0,3);
  }

  // ── Insight Moment detection ──────────────────────────────────────────────
  function detectMoment(picks){
    var s=settled(picks);
    if(s.length<10)return null;
    var sk=sessionStorage.getItem('ig_moment_shown');
    if(sk)return null;

    var last5=s.slice(-5);
    var allWins=last5.length===5&&last5.every(function(p){return p.result==='win';});
    var avgOdds5=last5.reduce(function(a,p){return a+(parseFloat(p.odds)||1.5);},0)/5;
    if(allWins&&avgOdds5>=1.8){
      return{
        title:'PERFECT RUN DETECTED',
        body:'5 consecutive wins at average odds <strong>'+avgOdds5.toFixed(2)+'x</strong>. Pattern identified from your last '+s.length+' picks.'
      };
    }

    var roi=computeROI(s);
    if(roi!=null&&roi>=20&&s.length>=15){
      return{
        title:'ROI THRESHOLD CROSSED',
        body:'Sustained ROI of <strong>'+fmtROI(roi)+'</strong> over '+s.length+' picks. This puts you in the top tier of verified tipsters.'
      };
    }

    var byMarket=groupBy(s,function(p){return p.market;});
    var standoutMarket=null,standoutROI=-999;
    Object.keys(byMarket).forEach(function(m){
      if(byMarket[m].length<6)return;
      var r=computeROI(byMarket[m])||0;
      if(r>30&&r>standoutROI){standoutROI=r;standoutMarket=m;}
    });
    if(standoutMarket){
      return{
        title:'MARKET EDGE IDENTIFIED',
        body:'Your <strong>'+standoutMarket+'</strong> picks show a consistent '+fmtROI(standoutROI)+' ROI over '+byMarket[standoutMarket].length+' picks. Statistically significant edge.'
      };
    }

    return null;
  }

  // ── HTML builders ─────────────────────────────────────────────────────────
  function confDots(n){
    var h='<div class="ig-conf">';
    for(var i=0;i<5;i++) h+='<div class="ig-conf-dot'+(i<n?' on':'')+'"></div>';
    return h+'</div>';
  }

  function insightCardHTML(ins){
    return'<div class="ig-card">'
      +'<div>'
        +'<div class="ig-card-top">'
          +'<span class="ig-cat '+ins.catCls+'">'+ins.cat+'</span>'
          +confDots(ins.conf||2)
        +'</div>'
        +'<div class="ig-headline">'+ins.headline+'</div>'
      +'</div>'
      +'<div class="ig-support">'
        +'<span class="ig-metric '+ins.metricCls+'">'+ins.metric+'</span>'
        +'<span class="ig-meta">'+ins.meta+'</span>'
        +(ins.delta?'<span class="ig-delta '+ins.delta.cls+'">'+ins.delta.label+'</span>':'')
      +'</div>'
    +'</div>';
  }

  function trendItemHTML(t){
    return'<div class="ig-trend-item '+t.cls+'">'
      +'<div class="ig-trend-icon">'+t.icon+'</div>'
      +'<div class="ig-trend-body">'
        +'<div class="ig-trend-title">'+t.title+'</div>'
        +'<div class="ig-trend-sub">'+t.sub+'</div>'
      +'</div>'
      +'<span class="ig-trend-badge '+t.badgeCls+'">'+t.badge+'</span>'
    +'</div>';
  }

  function alertHTML(al,delay){
    return'<div class="ig-alert '+al.type+'" style="animation-delay:'+delay+'ms">'
      +'<span class="ig-alert-icon">'+al.icon+'</span>'
      +'<span class="ig-alert-text">'+al.text+'</span>'
    +'</div>';
  }

  function personalityHTML(p){
    var traitsHtml=p.traits.map(function(t){
      return'<div class="ig-trait-row">'
        +'<span class="ig-trait-lbl">'+t.label+'</span>'
        +'<div class="ig-trait-bar"><div class="ig-trait-fill" data-pct="'+t.pct+'" style="width:0%;background:'+t.color+'"></div></div>'
        +'<span class="ig-trait-val">'+t.pct+'</span>'
      +'</div>';
    }).join('');
    return'<div class="ig-personality">'
      +'<div class="ig-personality-head">'
        +'<span class="ig-personality-title">BETTING PERSONALITY</span>'
        +'<span class="ig-personality-tag">'+p.tag+'</span>'
      +'</div>'
      +'<div class="ig-traits">'+traitsHtml+'</div>'
      +'<div class="ig-personality-sum">'+p.summary+'</div>'
    +'</div>';
  }

  function patternHTML(pt){
    return'<div class="ig-pattern">'
      +'<span class="ig-pattern-icon '+pt.iconCls+'">'+pt.icon+'</span>'
      +'<div class="ig-pattern-body">'
        +'<div class="ig-pattern-title">'+pt.title+'</div>'
        +'<div class="ig-pattern-sub">'+pt.sub+'</div>'
      +'</div>'
      +'<div class="ig-pattern-stat '+pt.statCls+'">'+pt.stat+'</div>'
    +'</div>';
  }

  // ── Deck renderer (rotating) ───────────────────────────────────────────────
  function renderDeck(containerId, picks){
    var el=document.getElementById(containerId);
    if(!el)return;
    var insights=computeInsights(picks);
    if(!insights.length){
      el.innerHTML='';
      return;
    }

    var cur=0;
    var inner='<div class="ig-deck"><div class="ig-deck-inner" id="'+containerId+'_inner">';
    insights.forEach(function(ins,i){
      inner+=insightCardHTML(ins);
    });
    inner+='</div><div class="ig-dots" id="'+containerId+'_dots">';
    insights.forEach(function(_,i){inner+='<div class="ig-dot'+(i===0?' on':'')+'" onclick="igGoTo(\''+containerId+'\','+i+')"></div>';});
    inner+='</div></div>';
    el.innerHTML=inner;

    // Activate first card
    var innerEl=document.getElementById(containerId+'_inner');
    var cards=innerEl.querySelectorAll('.ig-card');
    if(cards[0])cards[0].classList.add('ig-active');
    if(innerEl)innerEl.style.minHeight='0';

    // Store state
    el._igCur=0;
    el._igCards=cards;
    el._igDots=document.getElementById(containerId+'_dots').querySelectorAll('.ig-dot');

    // Auto-rotate
    if(insights.length>1){
      el._igTimer=setInterval(function(){igNext(containerId);},6000);
      el.addEventListener('mouseenter',function(){clearInterval(el._igTimer);});
      el.addEventListener('mouseleave',function(){el._igTimer=setInterval(function(){igNext(containerId);},6000);});
    }

    // Animate personality bars after a tick
    setTimeout(function(){
      var fills=el.querySelectorAll('.ig-trait-fill');
      fills.forEach(function(f){f.style.width=(f.dataset.pct||0)+'%';});
    },120);
  }

  window.igGoTo=function(cid,n){
    var el=document.getElementById(cid);
    if(!el||!el._igCards)return;
    var cards=el._igCards,dots=el._igDots;
    cards[el._igCur].classList.remove('ig-active');
    if(dots[el._igCur])dots[el._igCur].classList.remove('on');
    el._igCur=n;
    cards[el._igCur].classList.add('ig-active');
    if(dots[el._igCur])dots[el._igCur].classList.add('on');
  };

  window.igNext=function(cid){
    var el=document.getElementById(cid);
    if(!el||!el._igCards)return;
    var next=(el._igCur+1)%el._igCards.length;
    igGoTo(cid,next);
  };

  // ── Trend panel renderer ──────────────────────────────────────────────────
  function renderTrends(containerId, allPicks){
    var el=document.getElementById(containerId);
    if(!el)return;
    var trends=computeTrends(allPicks);
    if(!trends.length){
      el.innerHTML='<div class="ig-trend-empty">Not enough settled data yet.</div>';
      return;
    }
    el.innerHTML='<div class="ig-trend-list">'+trends.map(trendItemHTML).join('')+'</div>';
  }

  // ── Alert strip renderer ─────────────────────────────────────────────────
  function renderAlerts(containerId, picks, rankings){
    var el=document.getElementById(containerId);
    if(!el)return;
    var alerts=computeAlerts(picks,rankings);
    if(!alerts.length){el.innerHTML='';return;}
    el.innerHTML='<div class="ig-alert-strip">'+alerts.map(function(a,i){return alertHTML(a,i*80);}).join('')+'</div>';
  }

  // ── Full analytics section renderer ──────────────────────────────────────
  function renderAnalytics(containerId, picks){
    var el=document.getElementById(containerId);
    if(!el)return;
    var settled_=settled(picks);
    if(settled_.length<8){
      el.innerHTML='<div style="font-family:var(--font-mono,monospace);font-size:11px;color:var(--mu,#6b6b6b);padding:16px 0">Post at least 8 settled picks to unlock Intelligence.</div>';
      return;
    }

    var html='';

    // Rotating insight deck
    var insights=computeInsights(picks);
    if(insights.length){
      html+='<div id="igDeckAnchor"></div>';
    }

    // Personality panel
    var personality=computePersonality(picks);
    if(personality) html+=personalityHTML(personality);

    // Pattern list
    var patterns=computePatterns(picks);
    if(patterns.length){
      html+='<div class="ig-patterns">'+patterns.map(patternHTML).join('')+'</div>';
    }

    el.innerHTML=html;

    if(insights.length) renderDeck('igDeckAnchor',picks);

    // Animate personality bars
    setTimeout(function(){
      var fills=el.querySelectorAll('.ig-trait-fill');
      fills.forEach(function(f){f.style.width=(f.dataset.pct||0)+'%';});
    },120);

    // Check for insight moment (once per session)
    var moment=detectMoment(picks);
    if(moment) renderMoment(moment);
  }

  // ── Insight Moment overlay ───────────────────────────────────────────────
  function renderMoment(moment){
    if(!moment)return;
    if(sessionStorage.getItem('ig_moment_shown'))return;
    sessionStorage.setItem('ig_moment_shown','1');

    var overlay=document.createElement('div');
    overlay.className='ig-moment-overlay';
    overlay.innerHTML='<div class="ig-moment-card">'
      +'<div class="ig-moment-eye">NEW PATTERN DETECTED</div>'
      +'<div class="ig-moment-title">'+moment.title+'</div>'
      +'<div class="ig-moment-body">'+moment.body+'</div>'
      +'<button class="ig-moment-dismiss" onclick="this.closest(\'.ig-moment-overlay\').remove()">ACKNOWLEDGE</button>'
    +'</div>';
    overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
    document.body.appendChild(overlay);
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  window.Insights={
    compute:   computeInsights,
    personality: computePersonality,
    patterns:  computePatterns,
    trends:    computeTrends,
    alerts:    computeAlerts,
    detectMoment: detectMoment,
    renderDeck:     renderDeck,
    renderTrends:   renderTrends,
    renderAlerts:   renderAlerts,
    renderAnalytics: renderAnalytics,
    renderMoment:   renderMoment,
  };

})();
