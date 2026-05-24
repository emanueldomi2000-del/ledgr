window.LedgrAvatar = {
  get: function(userId) {
    if (userId) {
      var v = localStorage.getItem('ledgr_avatar_' + userId);
      if (v) return v;
    }
    return localStorage.getItem('ledgr_avatar')
      || localStorage.getItem('user_avatar')
      || null;
  },

  apply: function(el, userId, fallbackInitials) {
    if (!el) return;
    var photo = this.get(userId);
    if (photo) {
      if (el.tagName === 'IMG') {
        el.src = photo;
      } else {
        el.style.background = '';
        el.style.backgroundImage = 'url(' + photo + ')';
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
        el.style.color = 'transparent';
        el.style.fontSize = '0';
        Array.from(el.childNodes).filter(function(n){ return n.nodeType === 3; }).forEach(function(n){ n.remove(); });
      }
    } else if (fallbackInitials) {
      var hasText = Array.from(el.childNodes).some(function(n){ return n.nodeType === 3 && n.textContent.trim(); });
      if (!hasText) el.textContent = fallbackInitials.slice(0, 2).toUpperCase();
    }
  },

  save: function(userId, dataUrl) {
    if (userId) localStorage.setItem('ledgr_avatar_' + userId, dataUrl);
    localStorage.setItem('ledgr_avatar', dataUrl);
  }
};
