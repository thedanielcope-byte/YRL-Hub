/* ══════════════════════════════════════════════════════════════════════
   yrl-push.js — turns on phone notifications for an agent in the YRL hub.
   • Shows a "Turn on notifications" bar once (iPhone: only inside the
     installed home-screen app — Safari tabs can't get push on iOS).
   • On tap: asks permission, subscribes this device (VAPID), saves it with
     the hub_push_subscribe RPC, then sends a test push (hub_push_test).
   • If permission is already granted, quietly re-saves the device each
     session (new login on a shared phone, rotated subscription, etc.).
   Sender: the hub-push edge function (9 AM summary, 5 PM key-date heads-up,
   broker-assigned tasks, announcements). Worker: sw.js (branded by host).
   ══════════════════════════════════════════════════════════════════════ */
(function () {
    var VAPID = 'BK160tCoqh3VQg66Si4w16q2BZKqwvbfTjmosMC9rAVGFCfZEor1k1QbgCU7RRuIAblh4WYni5yf0Lzh4GsZ63c';
    var SW = 'sw.js?v=20260927a';
    var SNOOZE = 'yrl-push-snooze';     // "Not now" hides the bar for 30 days
    if (/[?&]embed=1/.test(location.search)) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return;
    var ua = navigator.userAgent || '';
    var isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
    // register the worker on every hub load (also what makes Android offer "Install app")
    navigator.serviceWorker.register(SW).catch(function () {});
    if (isIOS && !standalone) return;

    function key(s) {
        var p = '='.repeat((4 - s.length % 4) % 4), b = atob((s + p).replace(/-/g, '+').replace(/_/g, '/'));
        var out = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) out[i] = b.charCodeAt(i); return out;
    }
    function ready() { return navigator.serviceWorker.register(SW).then(function () { return navigator.serviceWorker.ready; }); }
    function subscribe(reg) {
        return reg.pushManager.getSubscription().then(function (s) {
            return s || reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key(VAPID) });
        });
    }
    function save(sub) {
        var j = sub.toJSON();
        return window.yrlClient.rpc('hub_push_subscribe', { p_endpoint: j.endpoint, p_p256dh: j.keys.p256dh, p_auth: j.keys.auth, p_user_agent: ua })
            .then(function (r) { if (r && r.error) throw r.error; });
    }

    function bar(html) {
        var old = document.getElementById('yrlPushBar'); if (old) old.remove();
        if (!document.getElementById('yrlPushCss')) {
            var css = document.createElement('style'); css.id = 'yrlPushCss';
            css.textContent =
                '#yrlPushBar{position:fixed;left:12px;right:12px;bottom:calc(92px + env(safe-area-inset-bottom));z-index:401;background:#fff;border:1px solid #e2e5ea;border-radius:14px;box-shadow:0 10px 30px rgba(15,23,42,.18);padding:12px 12px 12px 14px;display:flex;align-items:center;gap:12px;font-family:Inter,sans-serif;max-width:560px;margin:0 auto;}' +
                '#yrlPushBar .ic{width:40px;height:40px;border-radius:10px;background:#c03926;color:#fff;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;}' +
                '#yrlPushBar .t{flex:1;min-width:0;font-size:13px;line-height:1.35;color:#1a1d22;}' +
                '#yrlPushBar .t b{display:block;font-size:13.5px;}' +
                '#yrlPushBar button{border:none;cursor:pointer;font-family:inherit;}' +
                '#yrlPushBar .go{background:#c03926;color:#fff;font-weight:700;font-size:13px;padding:9px 14px;border-radius:9px;flex-shrink:0;}' +
                '#yrlPushBar .go:disabled{opacity:.6;}' +
                '#yrlPushBar .x{background:none;color:#9ca3af;font-size:16px;width:30px;height:30px;flex-shrink:0;}';
            document.head.appendChild(css);
        }
        var el = document.createElement('div'); el.id = 'yrlPushBar';
        el.innerHTML = '<div class="ic"><i class="fa-solid fa-bell"></i></div>' + html;
        document.body.appendChild(el);
        var x = el.querySelector('.x');
        if (x) x.onclick = function () { try { localStorage.setItem(SNOOZE, String(Date.now())); } catch (e) {} el.remove(); };
        return el;
    }
    function done(msg) {
        var el = bar('<div class="t">' + msg + '</div><button class="x" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>');
        el.querySelector('.x').onclick = function () { el.remove(); };
        setTimeout(function () { if (el.parentNode) el.remove(); }, 8000);
    }

    function enable(btn) {
        btn.disabled = true; btn.textContent = 'Turning on…';
        Notification.requestPermission().then(function (perm) {
            if (perm !== 'granted') {
                done('<b>Notifications are off</b>You can turn them on later in your phone\'s Settings for YRL Hub.');
                return;
            }
            return ready().then(subscribe).then(save).then(function () {
                // supabase-js builders are lazy — .then() is what actually sends the request
                window.yrlClient.rpc('hub_push_test').then(function () {}, function () {});
                done('<b>You\'re all set</b>A test notification is on its way.');
            });
        }).catch(function (e) {
            console.warn('push enable failed', e);
            done('<b>Couldn\'t turn on notifications</b>Please try again in a minute.');
        });
    }

    function offer() {
        if (document.getElementById('yrlInstallBar')) { setTimeout(offer, 20000); return; }   // don't stack with the install bar
        try { var t = +localStorage.getItem(SNOOZE); if (t && Date.now() - t < 30 * 864e5) return; } catch (e) {}
        var el = bar('<div class="t"><b>Turn on notifications</b>Your 9 AM daily summary, deal reminders, tasks from your broker and announcements.</div>' +
            '<button class="go">Turn on</button><button class="x" aria-label="Not now"><i class="fa-solid fa-xmark"></i></button>');
        el.querySelector('.go').onclick = function () { enable(this); };
    }

    function start() {
        if (!window.yrlClient || !window.yrlClient.rpc) return;
        if (Notification.permission === 'granted') {
            // already allowed — make sure THIS device is saved for the signed-in agent (once per session)
            try { if (sessionStorage.getItem('yrl-push-saved')) return; } catch (e) {}
            ready().then(subscribe).then(save).then(function () { try { sessionStorage.setItem('yrl-push-saved', '1'); } catch (e) {} })
                .catch(function (e) { console.warn('push resave failed', e); });
        } else if (Notification.permission === 'default') {
            setTimeout(offer, 4000);
        }
    }
    window.yrlPushEnable = function () { var b = document.createElement('button'); enable(b); };   // for a Help/settings link
    if (window.yrlClient) start(); else document.addEventListener('yrl-auth-ready', function () { setTimeout(start, 500); });
})();
