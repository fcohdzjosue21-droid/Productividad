/* ═══════════════════════════════════════════════════════
   ZenFlow — Service Worker
   Handles: auto-update, offline cache, mobile notifications
═══════════════════════════════════════════════════════ */

const CACHE_NAME = 'zenflow-v1';
const ASSETS_TO_CACHE = ['/', '/index.html', '/favicon.svg'];

// ── Install ──────────────────────────────────────────────
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
    // Take control immediately (auto-update on new deploy)
    self.skipWaiting();
});

// ── Activate ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    );
    // Claim all open clients so the new SW takes over immediately
    self.clients.claim();
});

// ── Fetch — Network first, fallback to cache ─────────────
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Cache fresh responses
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});

// ── Message from App — Show notification via SW ──────────
// This is needed for mobile (Android/iOS) where new Notification() doesn't work
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const { title, body, tag } = event.data;
        self.registration.showNotification(title, {
            body,
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            tag: tag || 'zenflow-reminder',
            vibrate: [200, 100, 200],
            renotify: true,
            requireInteraction: false,
            actions: [{ action: 'open', title: 'Ver agenda' }],
        });
    }

    // Auto-refresh signal: tell all clients to reload (new version available)
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// ── Notification click — open/focus the app ──────────────
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // If app is already open, focus it
            for (const client of windowClients) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise open a new window
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});
