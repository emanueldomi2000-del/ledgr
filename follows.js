(function () {
  'use strict';

  const API = 'https://ledgr-backend-7hmh.onrender.com';

  // ── Cache ────────────────────────────────────────────────────────
  // Keyed by followerId so it works correctly when multiple users
  // share a browser session (edge case, but safe).
  let _cache = null;          // Set of followingId strings
  let _cacheFor = null;       // userId the cache belongs to

  // ── Helpers ──────────────────────────────────────────────────────
  function getCurrentUser() {
    try {
      const raw = localStorage.getItem('ledgr_user') || localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function headers() {
    const tok = localStorage.getItem('ledgr_token') || localStorage.getItem('token');
    const h = { 'Content-Type': 'application/json' };
    if (tok) h['Authorization'] = 'Bearer ' + tok;
    return h;
  }

  // ── Core API calls ───────────────────────────────────────────────

  async function followUser(followerId, followingId) {
    const r = await fetch(API + '/follow', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ followerId, followingId })
    });
    // 409 = already following — treat as success
    if (!r.ok && r.status !== 409) throw new Error('Follow request failed');
    if (_cache) _cache.add(followingId);
    return true;
  }

  async function unfollowUser(followerId, followingId) {
    await fetch(API + '/follow', {
      method: 'DELETE',
      headers: headers(),
      body: JSON.stringify({ followerId, followingId })
    });
    if (_cache) _cache.delete(followingId);
  }

  async function getFollowerCount(userId) {
    try {
      const r = await fetch(API + '/followers/' + userId, { cache: 'no-store' });
      if (!r.ok) return 0;
      const data = await r.json();
      return data.count || 0;
    } catch (e) { return 0; }
  }

  // Returns a Set of user IDs that `userId` is following
  async function loadFollowingSet(userId) {
    if (_cache && _cacheFor === userId) return _cache;
    try {
      const r = await fetch(API + '/following/' + userId, { cache: 'no-store' });
      if (!r.ok) throw new Error('bad response');
      const data = await r.json();
      _cacheFor = userId;
      _cache = new Set((data.following || []).map(function (u) { return u.id; }));
      return _cache;
    } catch (e) {
      _cacheFor = userId;
      _cache = new Set();
      return _cache;
    }
  }

  // ── Button state helper ──────────────────────────────────────────

  function setBtn(btn, isF) {
    if (isF) {
      btn.classList.add('following');
      btn.textContent = 'Following ✓';
    } else {
      btn.classList.remove('following');
      btn.textContent = 'Follow';
    }
    btn.disabled = false;
  }

  // ── initFollowButtons ────────────────────────────────────────────
  // Finds every .follow-btn[data-user-id] on the page, checks
  // follow status from the API, and wires up real click handlers.

  async function initFollowButtons() {
    const btns = document.querySelectorAll('.follow-btn[data-user-id]');
    if (!btns.length) return;

    const me = getCurrentUser();

    // No logged-in user — buttons redirect to login
    if (!me || !me.id) {
      btns.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          window.location.href = '/login';
        });
      });
      return;
    }

    // Load who the current user already follows
    const followingSet = await loadFollowingSet(me.id);

    btns.forEach(function (btn) {
      // Skip buttons we've already wired up this render cycle
      if (btn.getAttribute('data-ff-init')) return;
      btn.setAttribute('data-ff-init', '1');

      const targetId = btn.getAttribute('data-user-id');

      // Hide button for self-follow or when targetId is unknown
      if (!targetId || targetId === me.id) {
        btn.style.display = 'none';
        return;
      }

      // Set initial state from cache
      setBtn(btn, followingSet.has(targetId));

      btn.addEventListener('click', async function (e) {
        e.stopPropagation();
        const wasFollowing = btn.classList.contains('following');

        // Optimistic update
        setBtn(btn, !wasFollowing);
        btn.disabled = true;

        try {
          if (wasFollowing) {
            await unfollowUser(me.id, targetId);
          } else {
            await followUser(me.id, targetId);
            if (typeof showToast === 'function') showToast('Following ✓');
          }
        } catch (_err) {
          // Revert on failure
          setBtn(btn, wasFollowing);
        }
      });
    });
  }

  // ── Public API ───────────────────────────────────────────────────
  window.Follows = {
    followUser:        followUser,
    unfollowUser:      unfollowUser,
    getFollowerCount:  getFollowerCount,
    loadFollowingSet:  loadFollowingSet,
    initFollowButtons: initFollowButtons,
    getCurrentUser:    getCurrentUser
  };

})();
