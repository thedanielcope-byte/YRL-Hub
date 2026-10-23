/* Nomad Admin PWA shell worker. Bump CACHE_VERSION when the icon/manifest set changes.
   Cloudflare caches this file by its .js extension and ignores the origin's cache-control —
   every edit to this file MUST also bump the ?v= query param on its register('sw.js?v=...')
   calls in nomad-admin.html and index.html, or the edit silently never goes live. */
const CACHE_VERSION = 'nomad-admin-shell-v1';
const SHELL_ASSETS = ['manifest.json', 'icon-192.png', 'icon-512.png', 'icon-512-maskable.png', 'apple-touch-icon.png'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION).then((cache) => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin || req.method !== 'GET') return; // cross-origin (fonts/CDN) and non-GET pass straight through

    if (SHELL_ASSETS.some((a) => url.pathname.endsWith('/' + a))) {
        /* Static shell (icons/manifest): cache-first. */
        event.respondWith(
            caches.match(req).then((cached) => cached || fetch(req).then((res) => {
                caches.open(CACHE_VERSION).then((cache) => cache.put(req, res.clone()));
                return res;
            }))
        );
        return;
    }

    /* App HTML/JS/CSS: network-first, so edits are never stuck behind a stale cache. Cache is only an offline fallback. */
    event.respondWith(
        fetch(req).then((res) => {
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, res.clone()));
            return res;
        }).catch(() => caches.match(req))
    );
});

/* Push: the same worker serves portal.nomadsystems.co (Nomad Admin inbox) and yrlagent.com
   (YRL agent hub, pushes from the hub-push edge function) — brand by host. */
const IS_YRL = /(^|\.)yrlagent\.com$/.test(self.location.hostname) || self.location.hostname === 'yrl.nomadsystems.co';
self.addEventListener('push', (event) => {
    let data = {};
    try { data = event.data.json(); } catch (e) { /* ignore malformed payload */ }
    event.waitUntil(self.registration.showNotification(data.title || (IS_YRL ? 'YRL Hub' : 'Nomad Admin'), {
        body: data.body || '',
        icon: data.icon || (IS_YRL ? 'yrl-icon-192.png' : 'icon-192.png'),
        tag: data.tag || undefined,
        data: { url: data.url || (IS_YRL ? 'hub.html' : 'nomad-admin.html') },
    }));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data.url;
    // Reuse an open app window when there is one (installed PWA), else open a new one.
    event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
        for (const w of wins) {
            if (new URL(w.url).origin === self.location.origin && 'navigate' in w) {
                return w.navigate(url).then((c) => (c || w).focus()).catch(() => clients.openWindow(url));
            }
        }
        return clients.openWindow(url);
    }));
});
