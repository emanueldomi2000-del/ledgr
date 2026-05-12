/* ═══ LEDGR Service Worker ════════════════════════════════════ */

self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// ── Push received ──────────────────────────────────────────────
self.addEventListener('push', function (event) {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) {}

  const title   = data.title  || 'LEDGR';
  const options = {
    body:    data.body  || 'New activity on LEDGR',
    icon:    data.icon  || '/icon-192.png',
    badge:   data.badge || '/icon-192.png',
    data:    { url: data.url || '/notifications' },
    vibrate: [120, 60, 120],
    tag:     'ledgr-push',
    renotify: true,
    actions: [
      { action: 'view',    title: 'View Pick' },
      { action: 'dismiss', title: 'Dismiss'   }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ── Notification click ─────────────────────────────────────────
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/notifications';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (list) {
        // Focus an existing LEDGR tab if available
        for (const client of list) {
          if ('focus' in client) {
            client.focus();
            if ('navigate' in client) client.navigate(url);
            return;
          }
        }
        return self.clients.openWindow(url);
      })
  );
});
