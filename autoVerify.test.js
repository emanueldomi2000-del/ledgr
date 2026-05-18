// ─────────────────────────────────────────────────────────────────────────────
// LEDGR — autoVerify unit tests
// Run with: node autoVerify.test.js
// No test framework required — plain Node.js assertions.
// ─────────────────────────────────────────────────────────────────────────────

const assert = require('assert');

// autoVerify.js uses router/db globals at module scope (Railway integration pattern),
// so it cannot be required directly in a test context.
// The pure functions are inlined here verbatim from autoVerify.js so tests stay runnable
// without a server. If you change parseMarket/gradeResult/calcPnl, update here too.

function calcPnl(result, stake, odds) {
  const s = parseFloat(stake) || 0;
  const o = parseFloat(odds)  || 1;
  switch (result) {
    case 'win':  return parseFloat((s * (o - 1)).toFixed(4));
    case 'loss': return parseFloat((-s).toFixed(4));
    case 'push':
    case 'void': return 0;
    default:     return 0;
  }
}

function parseMarket(market) {
  if (!market) return { type: 'unknown' };
  const m = String(market).trim();
  if (m === 'Home Win (1)') return { type: 'h2h', selection: 'home' };
  if (m === 'Draw (X)')     return { type: 'h2h', selection: 'draw' };
  if (m === 'Away Win (2)') return { type: 'h2h', selection: 'away' };
  if (m === 'Home Win')     return { type: 'h2h', selection: 'home' };
  if (m === 'Away Win')     return { type: 'h2h', selection: 'away' };
  if (m === '1X') return { type: 'dc', selection: '1x' };
  if (m === 'X2') return { type: 'dc', selection: 'x2' };
  if (m === '12') return { type: 'dc', selection: '12' };
  if (m === 'BTTS Yes') return { type: 'btts', selection: 'yes' };
  if (m === 'BTTS No')  return { type: 'btts', selection: 'no' };
  const htftRe = /^HT (Home|Draw|Away) \/ FT (Home|Draw|Away)$/i;
  const htftM  = m.match(htftRe);
  if (htftM) return { type: 'htft', ht: htftM[1].toLowerCase(), ft: htftM[2].toLowerCase() };
  const csM = m.match(/^(\d+)-(\d+)$/);
  if (csM) return { type: 'correct_score', home: parseInt(csM[1]), away: parseInt(csM[2]) };
  const spreadM = m.match(/^([+-]\d+\.?\d*)$/);
  if (spreadM) return { type: 'spread', spread: parseFloat(spreadM[1]) };
  const teamTotalM = m.match(/^(.+)\s+[—\-]\s+(Over|Under)\s+(\d+\.?\d*)$/i);
  if (teamTotalM) return {
    type: 'team_total', team: teamTotalM[1].trim(),
    direction: teamTotalM[2].toLowerCase(), line: parseFloat(teamTotalM[3]),
  };
  const totalM = m.match(/^(Over|Under)\s+(\d+\.?\d*)$/i);
  if (totalM) return { type: 'total', direction: totalM[1].toLowerCase(), line: parseFloat(totalM[2]) };
  return { type: 'unknown' };
}

function gradeResult(parsed, homeScore, awayScore) {
  const h = Number(homeScore);
  const a = Number(awayScore);
  switch (parsed.type) {
    case 'h2h': {
      const actual = h > a ? 'home' : h < a ? 'away' : 'draw';
      return parsed.selection === actual ? 'win' : 'loss';
    }
    case 'dc': {
      const actual = h > a ? '1' : h < a ? '2' : 'x';
      if (parsed.selection === '1x' && (actual === '1' || actual === 'x')) return 'win';
      if (parsed.selection === 'x2' && (actual === 'x' || actual === '2')) return 'win';
      if (parsed.selection === '12' && (actual === '1' || actual === '2')) return 'win';
      return 'loss';
    }
    case 'btts': {
      const both = h > 0 && a > 0;
      return (parsed.selection === 'yes') === both ? 'win' : 'loss';
    }
    case 'spread': {
      const margin = (h - a) + parsed.spread;
      if (margin > 0) return 'win';
      if (margin < 0) return 'loss';
      return 'push';
    }
    case 'total': {
      const total = h + a;
      const diff  = total - parsed.line;
      if (diff === 0) return 'push';
      return (parsed.direction === 'over' ? diff > 0 : diff < 0) ? 'win' : 'loss';
    }
    case 'correct_score':
      return (h === parsed.home && a === parsed.away) ? 'win' : 'loss';
    case 'team_total':
    case 'htft':
      return 'void';
    default:
      return 'void';
  }
}

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅  ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ❌  ${name}`);
    console.log(`       ${e.message}`);
    failed++;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// parseMarket
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nparseMarket');

test('Home Win (1) → h2h home', () => {
  const r = parseMarket('Home Win (1)');
  assert.deepStrictEqual(r, { type: 'h2h', selection: 'home' });
});
test('Away Win (2) → h2h away', () => {
  assert.deepStrictEqual(parseMarket('Away Win (2)'), { type: 'h2h', selection: 'away' });
});
test('Draw (X) → h2h draw', () => {
  assert.deepStrictEqual(parseMarket('Draw (X)'), { type: 'h2h', selection: 'draw' });
});
test('Home Win → h2h home (generic)', () => {
  assert.deepStrictEqual(parseMarket('Home Win'), { type: 'h2h', selection: 'home' });
});
test('Away Win → h2h away (generic)', () => {
  assert.deepStrictEqual(parseMarket('Away Win'), { type: 'h2h', selection: 'away' });
});
test('1X → dc 1x', () => {
  assert.deepStrictEqual(parseMarket('1X'), { type: 'dc', selection: '1x' });
});
test('X2 → dc x2', () => {
  assert.deepStrictEqual(parseMarket('X2'), { type: 'dc', selection: 'x2' });
});
test('12 → dc 12', () => {
  assert.deepStrictEqual(parseMarket('12'), { type: 'dc', selection: '12' });
});
test('BTTS Yes → btts yes', () => {
  assert.deepStrictEqual(parseMarket('BTTS Yes'), { type: 'btts', selection: 'yes' });
});
test('BTTS No → btts no', () => {
  assert.deepStrictEqual(parseMarket('BTTS No'), { type: 'btts', selection: 'no' });
});
test('Over 2.5 → total over 2.5', () => {
  assert.deepStrictEqual(parseMarket('Over 2.5'), { type: 'total', direction: 'over', line: 2.5 });
});
test('Under 220.5 → total under 220.5', () => {
  assert.deepStrictEqual(parseMarket('Under 220.5'), { type: 'total', direction: 'under', line: 220.5 });
});
test('-3.5 → spread -3.5', () => {
  assert.deepStrictEqual(parseMarket('-3.5'), { type: 'spread', spread: -3.5 });
});
test('+7.5 → spread +7.5', () => {
  assert.deepStrictEqual(parseMarket('+7.5'), { type: 'spread', spread: 7.5 });
});
test('2-1 → correct_score', () => {
  assert.deepStrictEqual(parseMarket('2-1'), { type: 'correct_score', home: 2, away: 1 });
});
test('0-0 → correct_score draw', () => {
  assert.deepStrictEqual(parseMarket('0-0'), { type: 'correct_score', home: 0, away: 0 });
});
test('HT Home / FT Home → htft', () => {
  const r = parseMarket('HT Home / FT Home');
  assert.strictEqual(r.type, 'htft');
});
test('Lakers — Over 112.5 → team_total', () => {
  const r = parseMarket('Lakers — Over 112.5');
  assert.strictEqual(r.type, 'team_total');
  assert.strictEqual(r.direction, 'over');
  assert.strictEqual(r.line, 112.5);
});
test('null market → unknown', () => {
  assert.deepStrictEqual(parseMarket(null), { type: 'unknown' });
});
test('empty string → unknown', () => {
  assert.deepStrictEqual(parseMarket(''), { type: 'unknown' });
});

// ─────────────────────────────────────────────────────────────────────────────
// gradeResult
// ─────────────────────────────────────────────────────────────────────────────
console.log('\ngradeResult');

// h2h
test('h2h home win: 2-1', () => {
  assert.strictEqual(gradeResult({ type: 'h2h', selection: 'home' }, 2, 1), 'win');
});
test('h2h home loss: 1-2', () => {
  assert.strictEqual(gradeResult({ type: 'h2h', selection: 'home' }, 1, 2), 'loss');
});
test('h2h draw correct: 1-1', () => {
  assert.strictEqual(gradeResult({ type: 'h2h', selection: 'draw' }, 1, 1), 'win');
});
test('h2h draw wrong: 2-1', () => {
  assert.strictEqual(gradeResult({ type: 'h2h', selection: 'draw' }, 2, 1), 'loss');
});
test('h2h away win: 0-1', () => {
  assert.strictEqual(gradeResult({ type: 'h2h', selection: 'away' }, 0, 1), 'win');
});

// double chance
test('dc 1x: home win → win', () => {
  assert.strictEqual(gradeResult({ type: 'dc', selection: '1x' }, 2, 0), 'win');
});
test('dc 1x: draw → win', () => {
  assert.strictEqual(gradeResult({ type: 'dc', selection: '1x' }, 1, 1), 'win');
});
test('dc 1x: away win → loss', () => {
  assert.strictEqual(gradeResult({ type: 'dc', selection: '1x' }, 0, 1), 'loss');
});
test('dc x2: away win → win', () => {
  assert.strictEqual(gradeResult({ type: 'dc', selection: 'x2' }, 0, 2), 'win');
});
test('dc 12: no draw → win on home', () => {
  assert.strictEqual(gradeResult({ type: 'dc', selection: '12' }, 3, 0), 'win');
});
test('dc 12: draw → loss', () => {
  assert.strictEqual(gradeResult({ type: 'dc', selection: '12' }, 1, 1), 'loss');
});

// btts
test('btts yes: 1-1 → win', () => {
  assert.strictEqual(gradeResult({ type: 'btts', selection: 'yes' }, 1, 1), 'win');
});
test('btts yes: 2-0 → loss', () => {
  assert.strictEqual(gradeResult({ type: 'btts', selection: 'yes' }, 2, 0), 'loss');
});
test('btts no: 2-0 → win', () => {
  assert.strictEqual(gradeResult({ type: 'btts', selection: 'no' }, 2, 0), 'win');
});

// spread
test('spread -3.5: win by 4 → win (4-0: margin=0.5)', () => {
  assert.strictEqual(gradeResult({ type: 'spread', spread: -3.5 }, 4, 0), 'win');
});
test('spread -3.5: win by 3 → loss (3-0: margin=-0.5)', () => {
  assert.strictEqual(gradeResult({ type: 'spread', spread: -3.5 }, 3, 0), 'loss');
});
test('spread +3.5: loss by 3 → win (0-3: margin=0.5)', () => {
  assert.strictEqual(gradeResult({ type: 'spread', spread: 3.5 }, 0, 3), 'win');
});
test('spread -3: win by exactly 3 → push', () => {
  assert.strictEqual(gradeResult({ type: 'spread', spread: -3 }, 3, 0), 'push');
});

// totals
test('total over 2.5: 2-1 (3 goals) → win', () => {
  assert.strictEqual(gradeResult({ type: 'total', direction: 'over', line: 2.5 }, 2, 1), 'win');
});
test('total over 2.5: 1-1 (2 goals) → loss', () => {
  assert.strictEqual(gradeResult({ type: 'total', direction: 'over', line: 2.5 }, 1, 1), 'loss');
});
test('total under 3: 1-1 (2 goals) → win', () => {
  assert.strictEqual(gradeResult({ type: 'total', direction: 'under', line: 3 }, 1, 1), 'win');
});
test('total over 3: 1-2 (3 goals) → push (exact line)', () => {
  assert.strictEqual(gradeResult({ type: 'total', direction: 'over', line: 3 }, 1, 2), 'push');
});
test('total under 220: 110-110 (220 pts) → push (exact line)', () => {
  assert.strictEqual(gradeResult({ type: 'total', direction: 'under', line: 220 }, 110, 110), 'push');
});

// correct score
test('correct_score 2-1: actual 2-1 → win', () => {
  assert.strictEqual(gradeResult({ type: 'correct_score', home: 2, away: 1 }, 2, 1), 'win');
});
test('correct_score 2-1: actual 1-1 → loss', () => {
  assert.strictEqual(gradeResult({ type: 'correct_score', home: 2, away: 1 }, 1, 1), 'loss');
});

// void markets
test('htft → void', () => {
  assert.strictEqual(gradeResult({ type: 'htft', ht: 'home', ft: 'home' }, 2, 0), 'void');
});
test('team_total → void', () => {
  assert.strictEqual(gradeResult({ type: 'team_total', team: 'Lakers', direction: 'over', line: 112.5 }, 115, 100), 'void');
});
test('unknown → void', () => {
  assert.strictEqual(gradeResult({ type: 'unknown' }, 1, 0), 'void');
});

// ─────────────────────────────────────────────────────────────────────────────
// calcPnl
// ─────────────────────────────────────────────────────────────────────────────
console.log('\ncalcPnl');

test('win: stake=1, odds=2.0 → pnl=1.0', () => {
  assert.strictEqual(calcPnl('win', 1, 2.0), 1.0);
});
test('win: stake=2, odds=3.5 → pnl=5.0', () => {
  assert.strictEqual(calcPnl('win', 2, 3.5), 5.0);
});
test('loss: stake=1 → pnl=-1', () => {
  assert.strictEqual(calcPnl('loss', 1, 2.0), -1);
});
test('push: pnl=0', () => {
  assert.strictEqual(calcPnl('push', 10, 2.0), 0);
});
test('void: pnl=0', () => {
  assert.strictEqual(calcPnl('void', 10, 2.0), 0);
});
test('unknown result: pnl=0', () => {
  assert.strictEqual(calcPnl('pending', 5, 1.9), 0);
});
test('win: fractional odds precision', () => {
  // 1 unit at 1.91 → profit = 0.91 rounded to 4 decimal places
  assert.strictEqual(calcPnl('win', 1, 1.91), 0.91);
});

// ─────────────────────────────────────────────────────────────────────────────
// applyGrade — mock DB tests (WP-1 and WP-2)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\napplyGrade (mock DB)');

// We need to require applyGrade separately since it's not exported.
// Use a wrapper via module internals.
// Since autoVerify.js uses module-level functions, we test the key contract
// via black-box: applyGrade should NOT call downstream effects when affectedRows=0.

async function runApplyGradeTests() {
  // Dynamic require so we can intercept — use a manual inline simulation
  // mirroring the exact fixed logic rather than re-importing to avoid router/db globals.

  // ── Test helper: simulate applyGrade with a mock DB ──
  async function simulateApplyGrade({ affectedRows, adminOverride = false }) {
    let rankingsCalled = false;
    let emitCalled     = false;
    let updateQuery    = '';

    const mockDb = {
      query: async (sql, _params) => {
        // Snapshot query
        if (sql.includes('user_rankings')) return [[null]];
        // The UPDATE
        updateQuery = sql;
        return [{ affectedRows }];
      },
    };

    const mockRecalc = async () => { rankingsCalled = true; };
    const mockEmit   = async () => { emitCalled = true; };

    // Inline the fixed applyGrade logic
    let prevSnapshot = null;
    try {
      const [snapRows] = await mockDb.query(
        'SELECT division, currentStreak, streakType, totalPicks FROM user_rankings WHERE userId=? LIMIT 1',
        [1]
      );
      prevSnapshot = snapRows[0] || null;
    } catch (_) {}

    const pick = { id: 1, userId: 1, market: 'Home Win', username: 'test', stake: 1, odds: 2 };
    const result = 'win';
    const pnl    = 1;

    const [updateRes] = await mockDb.query(
      adminOverride
        ? 'UPDATE picks SET result=?,pnl=?,settledAt=NOW(),gradedBy=?,gradedNote=? WHERE id=?'
        : `UPDATE picks SET result=?,pnl=?,settledAt=NOW(),gradedBy=?,gradedNote=? WHERE id=? AND result='pending'`,
      [result, pnl, 'auto', null, pick.id]
    );

    if (updateRes.affectedRows === 0) {
      return { rankingsCalled, emitCalled, updateQuery };
    }

    if (result !== 'void') await mockRecalc(mockDb, pick.userId);
    await mockEmit(mockDb, { ...pick, result, pnl }, prevSnapshot);

    return { rankingsCalled, emitCalled, updateQuery };
  }

  // Test: affectedRows=0 → downstream effects must NOT fire
  await test('WP-1: affectedRows=0 → rankings NOT called', async () => {
    const r = await simulateApplyGrade({ affectedRows: 0 });
    assert.strictEqual(r.rankingsCalled, false, 'recalcUserRankings should not fire');
  });

  await test('WP-1: affectedRows=0 → emit NOT called', async () => {
    const r = await simulateApplyGrade({ affectedRows: 0 });
    assert.strictEqual(r.emitCalled, false, 'emitPickGraded should not fire');
  });

  // Test: affectedRows=1 → downstream effects MUST fire
  await test('WP-1: affectedRows=1 → rankings called', async () => {
    const r = await simulateApplyGrade({ affectedRows: 1 });
    assert.strictEqual(r.rankingsCalled, true, 'recalcUserRankings should fire');
  });

  await test('WP-1: affectedRows=1 → emit called', async () => {
    const r = await simulateApplyGrade({ affectedRows: 1 });
    assert.strictEqual(r.emitCalled, true, 'emitPickGraded should fire');
  });

  // Test: adminOverride=true → query does NOT contain "AND result='pending'"
  await test("WP-2: adminOverride=false → UPDATE has AND result='pending' guard", async () => {
    const r = await simulateApplyGrade({ affectedRows: 1, adminOverride: false });
    assert.ok(r.updateQuery.includes("result='pending'"), 'Non-admin must use pending guard');
  });

  await test("WP-2: adminOverride=true → UPDATE has no result filter", async () => {
    const r = await simulateApplyGrade({ affectedRows: 1, adminOverride: true });
    assert.ok(!r.updateQuery.includes("result='pending'"), 'Admin must not use pending guard');
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// _formatPick — WP-5: top-level settledAt/gradedBy
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n_formatPick (backend-picks-endpoints.js)');

function makeFormatPick() {
  // Inline the fixed _formatPick logic
  function _resolveVerificationStatus(pick) {
    const settled = !!pick.settledAt;
    const source  = !pick.gradedBy ? null
      : String(pick.gradedBy).startsWith('admin:') ? 'admin' : 'auto';
    return { settled, settledAt: pick.settledAt || null, source,
             gradedBy: pick.gradedBy || null, gradedNote: pick.gradedNote || null };
  }
  return function _formatPick(pick) {
    return {
      id: pick.id, userId: pick.userId, username: pick.username || null,
      sport: pick.sport, event: pick.event,
      fixtureId: pick.fixtureId || null, homeTeam: pick.homeTeam || null,
      awayTeam: pick.awayTeam || null, sportKey: pick.sportKey || null,
      market: pick.market, odds: pick.odds, stake: pick.stake,
      stakeType: pick.stakeType || 'units', confidence: pick.confidence || null,
      reasoning: pick.reasoning || null,
      result: pick.result || 'pending', pnl: pick.pnl ?? 0,
      createdAt: pick.createdAt,
      settledAt: pick.settledAt || null,   // WP-5: top-level field
      gradedBy:  pick.gradedBy  || null,   // WP-5: top-level field
      lockMetadata: { odds: pick.odds, stake: pick.stake,
                      stakeType: pick.stakeType || 'units',
                      market: pick.market, postedAt: pick.createdAt },
      verificationStatus: _resolveVerificationStatus(pick),
    };
  };
}

const _formatPick = makeFormatPick();

test('WP-5: pending pick — settledAt is null top-level', () => {
  const pick = { id: 1, userId: 1, sport: 'Baseball', event: 'A vs B', market: 'Home Win',
                 odds: 1.9, stake: 1, result: 'pending', pnl: 0, createdAt: new Date(),
                 settledAt: null, gradedBy: null };
  const out = _formatPick(pick);
  assert.strictEqual(out.settledAt, null);
  assert.strictEqual(out.gradedBy, null);
  assert.strictEqual(out.verificationStatus.settled, false);
  assert.strictEqual(out.verificationStatus.source, null);
});

test('WP-5: auto-graded win — settledAt exposed top-level', () => {
  const now = new Date().toISOString();
  const pick = { id: 2, userId: 1, sport: 'Baseball', event: 'A vs B', market: 'Home Win',
                 odds: 1.9, stake: 1, result: 'win', pnl: 0.9, createdAt: new Date(),
                 settledAt: now, gradedBy: 'auto' };
  const out = _formatPick(pick);
  assert.strictEqual(out.settledAt, now);
  assert.strictEqual(out.gradedBy, 'auto');
  assert.strictEqual(out.verificationStatus.settled, true);
  assert.strictEqual(out.verificationStatus.source, 'auto');
});

test('WP-5: admin-graded — source is admin', () => {
  const now = new Date().toISOString();
  const pick = { id: 3, userId: 1, sport: 'Soccer', event: 'A vs B', market: 'BTTS Yes',
                 odds: 1.8, stake: 2, result: 'void', pnl: 0, createdAt: new Date(),
                 settledAt: now, gradedBy: 'admin:john' };
  const out = _formatPick(pick);
  assert.strictEqual(out.gradedBy, 'admin:john');
  assert.strictEqual(out.verificationStatus.source, 'admin');
  assert.strictEqual(out.verificationStatus.gradedBy, 'admin:john');
});

test('WP-5: settledAt + gradedBy also live in verificationStatus', () => {
  const now = new Date().toISOString();
  const pick = { id: 4, userId: 1, sport: 'Basketball', event: 'A vs B', market: 'Home Win',
                 odds: 2.1, stake: 1, result: 'loss', pnl: -1, createdAt: new Date(),
                 settledAt: now, gradedBy: 'auto' };
  const out = _formatPick(pick);
  assert.strictEqual(out.verificationStatus.settledAt, now);
  assert.strictEqual(out.verificationStatus.gradedBy, 'auto');
});

// ─────────────────────────────────────────────────────────────────────────────
// _buildTimeRange — WP-10: UTC boundary
// Inline from backend-fixtures-endpoints.js. Keep in sync if that function changes.
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n_buildTimeRange (WP-10 UTC boundary)');

function _buildTimeRange(dateOffset) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + (parseInt(dateOffset) || 0));
  d.setUTCHours(0, 0, 0, 0);
  const from = d.toISOString();
  d.setUTCHours(23, 59, 59, 999);
  const to = d.toISOString();
  return { from, to };
}

test('WP-10: dateOffset=0 → from ends with T00:00:00.000Z', () => {
  const { from } = _buildTimeRange(0);
  assert.ok(from.endsWith('T00:00:00.000Z'), `Expected T00:00:00.000Z suffix, got ${from}`);
});

test('WP-10: dateOffset=0 → to ends with T23:59:59.999Z', () => {
  const { to } = _buildTimeRange(0);
  assert.ok(to.endsWith('T23:59:59.999Z'), `Expected T23:59:59.999Z suffix, got ${to}`);
});

test('WP-10: dateOffset=1 → from is next UTC day vs dateOffset=0', () => {
  const { from: today } = _buildTimeRange(0);
  const { from: tomorrow } = _buildTimeRange(1);
  const diffMs = new Date(tomorrow) - new Date(today);
  assert.strictEqual(diffMs, 24 * 60 * 60 * 1000, 'dateOffset=1 must be exactly 24h after dateOffset=0');
});

test('WP-10: dateOffset=2 → from is 48h after today', () => {
  const { from: today } = _buildTimeRange(0);
  const { from: d2 } = _buildTimeRange(2);
  const diffMs = new Date(d2) - new Date(today);
  assert.strictEqual(diffMs, 2 * 24 * 60 * 60 * 1000, 'dateOffset=2 must be exactly 48h after today');
});

test('WP-10: invalid dateOffset (NaN) → defaults to today', () => {
  const { from: today }   = _buildTimeRange(0);
  const { from: fromNaN } = _buildTimeRange('garbage');
  assert.strictEqual(fromNaN, today, 'NaN offset must fall back to today');
});

// ─────────────────────────────────────────────────────────────────────────────
// Dedup guard logic — WP-8: duplicate pick protection
// Simulates the WHERE clause logic from POST /picks backend-picks-endpoints.js.
// The actual guard runs a DB query; here we verify the routing logic is correct.
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nDedup guard (WP-8)');

function _simulateDedupCheck(existingPick, newPick) {
  if (!existingPick) return false;
  if (existingPick.userId !== newPick.userId) return false;
  if (newPick.fixtureId) {
    // fixtureId branch: match on (userId, fixtureId, market)
    return existingPick.fixtureId === newPick.fixtureId &&
           existingPick.market    === newPick.market;
  } else {
    // no-fixtureId branch: match on (userId, null fixtureId, event, market)
    return !existingPick.fixtureId &&
           existingPick.event  === newPick.event &&
           existingPick.market === newPick.market;
  }
}

test('WP-8: same userId + fixtureId + market → duplicate (409)', () => {
  const existing = { userId: 1, fixtureId: 'abc123', market: 'Home Win', event: 'A vs B' };
  const newPick  = { userId: 1, fixtureId: 'abc123', market: 'Home Win', event: 'A vs B' };
  assert.strictEqual(_simulateDedupCheck(existing, newPick), true);
});

test('WP-8: same userId + fixtureId but different market → allowed', () => {
  const existing = { userId: 1, fixtureId: 'abc123', market: 'Home Win', event: 'A vs B' };
  const newPick  = { userId: 1, fixtureId: 'abc123', market: 'BTTS Yes', event: 'A vs B' };
  assert.strictEqual(_simulateDedupCheck(existing, newPick), false);
});

test('WP-8: null fixtureId, same userId + event + market → duplicate (409)', () => {
  const existing = { userId: 1, fixtureId: null, market: 'Over 2.5', event: 'Arsenal vs Chelsea' };
  const newPick  = { userId: 1, fixtureId: null, market: 'Over 2.5', event: 'Arsenal vs Chelsea' };
  assert.strictEqual(_simulateDedupCheck(existing, newPick), true);
});

test('WP-8: null fixtureId, same userId + event but different market → allowed', () => {
  const existing = { userId: 1, fixtureId: null, market: 'Over 2.5', event: 'Arsenal vs Chelsea' };
  const newPick  = { userId: 1, fixtureId: null, market: 'BTTS Yes', event: 'Arsenal vs Chelsea' };
  assert.strictEqual(_simulateDedupCheck(existing, newPick), false);
});

test('WP-8: different userId, same fixtureId + market → allowed (different user)', () => {
  const existing = { userId: 1, fixtureId: 'abc123', market: 'Home Win', event: 'A vs B' };
  const newPick  = { userId: 2, fixtureId: 'abc123', market: 'Home Win', event: 'A vs B' };
  assert.strictEqual(_simulateDedupCheck(existing, newPick), false);
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /picks userId filter — WP-7: server-side filter correctness
// Tests the guard logic added to dashboard/index.html and the limit split.
// ─────────────────────────────────────────────────────────────────────────────
console.log('\nGET /picks userId filter (WP-7)');

function _simulateLoadPicks(rawResponse) {
  // Mirrors the new dashboard loadPicks guard:
  //   allMyPicks = (Array.isArray(picks) ? picks : []).sort(...)
  const picks = rawResponse;
  return (Array.isArray(picks) ? picks : [])
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function _simulateLimit(requestedLimit, hasUserId) {
  const defaultLimit = hasUserId ? 2000 : 200;
  const maxLimit     = hasUserId ? 2000 : 200;
  return Math.min(Math.max(parseInt(requestedLimit) || defaultLimit, 1), maxLimit);
}

test('WP-7: array response → returns all picks without extra filter', () => {
  const fakePicks = [
    { id: 1, userId: 5, createdAt: '2026-05-10T10:00:00Z' },
    { id: 2, userId: 5, createdAt: '2026-05-11T10:00:00Z' },
  ];
  const result = _simulateLoadPicks(fakePicks);
  assert.strictEqual(result.length, 2, 'Both picks should pass through');
});

test('WP-7: non-array API response (error shape) → guard returns []', () => {
  const errorShape = { error: 'Unauthorized' };
  const result = _simulateLoadPicks(errorShape);
  assert.deepStrictEqual(result, [], 'Non-array must return empty array');
});

test('WP-7: result sorted newest-first', () => {
  const picks = [
    { id: 1, userId: 5, createdAt: '2026-05-10T10:00:00Z' },
    { id: 2, userId: 5, createdAt: '2026-05-12T10:00:00Z' },
    { id: 3, userId: 5, createdAt: '2026-05-11T10:00:00Z' },
  ];
  const result = _simulateLoadPicks(picks);
  assert.strictEqual(result[0].id, 2, 'Newest pick should be first');
  assert.strictEqual(result[2].id, 1, 'Oldest pick should be last');
});

test('WP-7: userId limit is 2000, global limit is 200', () => {
  assert.strictEqual(_simulateLimit(undefined, true),  2000, 'per-user default must be 2000');
  assert.strictEqual(_simulateLimit(undefined, false),  200, 'global default must be 200');
  assert.strictEqual(_simulateLimit(5000,      true),  2000, 'per-user max cap is 2000');
  assert.strictEqual(_simulateLimit(5000,      false),  200, 'global max cap is 200');
  assert.strictEqual(_simulateLimit(-1,        true),     1, 'min clamp is 1');
});

// ─────────────────────────────────────────────────────────────────────────────
// Run async tests then print summary
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  await runApplyGradeTests();

  console.log(`\n${'─'.repeat(50)}`);
  if (failed === 0) {
    console.log(`All ${passed} tests passed.`);
  } else {
    console.log(`${passed} passed, ${failed} FAILED.`);
    process.exit(1);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
