/* ═══════════════════════════════════════════════════════
   ZenFlow — Service Worker
   Handles: auto-update, offline cache, mobile notifications, Web Push
═══════════════════════════════════════════════════════ */

const CACHE_NAME = 'zenflow-v2';
const ASSETS_TO_CACHE = ['/', '/index.html', '/favicon.svg'];

// ── Install ──────────────────────────────────────────────
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
    self.skipWaiting();
});

// ── Activate ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// ── Fetch — Network first, fallback to cache ─────────────
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});

// ── Web PUSH — background notification (Android PWA) ─────
// This fires even when the app is CLOSED
self.addEventListener('push', (event) => {
    let data = { title: '📋 ZenFlow', body: 'Tienes un recordatorio pendiente.' };

    if (event.data) {
        try {
            data = event.data.json();
        } catch {
            data.body = event.data.text();
        }
    }

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            tag: data.tag || 'zenflow-push',
            vibrate: [200, 100, 200, 100, 200],
            renotify: true,
            requireInteraction: false,
            data: { url: self.registration.scope },
        })
    );
});

// ── Message from App — Show notification via SW ──────────
// Used when app IS open (foreground) — avoids needing a push server
self.addEventListener('message', (event) => {
    if (event.data?.type === 'SHOW_NOTIFICATION') {
        const { title, body, tag } = event.data;
        self.registration.showNotification(title, {
            body,
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            tag: tag || 'zenflow-reminder',
            vibrate: [200, 100, 200],
            renotify: true,
        });
    }

    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// ── Notification click — open/focus the app ──────────────
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (const client of windowClients) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) return clients.openWindow(targetUrl);
        })
    );
});
