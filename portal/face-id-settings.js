/* ══════════════════════════════════════════════════════════════════════
   face-id-settings.js — the agent's Face ID card (sidebar → Face ID).
   Lists the devices that can sign in to the hub with Face ID / Touch ID,
   removes one, or turns it on for this device. Server: hub-passkey edge fn
   (list / remove / register-*), authorised with the agent's own session.
   The sign-in side lives in index.html (pkLogin / pkOfferAfterPin).
   ══════════════════════════════════════════════════════════════════════ */
(function () {
    var PK_URL = 'https://wdvolamasztetwpitbwg.supabase.co/functions/v1/hub-passkey';
    var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indkdm9sYW1hc3p0ZXR3cGl0YndnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3Nzc2MTYsImV4cCI6MjA5MTM1MzYxNn0.uiGIaZwr88ZNtAobfSV-axlpXB3sos2Rcw3FiFm6JO8';
    var LIB = 'https://cdn.jsdelivr.net/npm/@simplewebauthn/browser@14.0.0/dist/bundle/index.umd.min.js';
    var libP = null;

    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function setLS(k, v) { try { if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); } catch (e) {} }
    function lib() {
        if (window.SimpleWebAuthnBrowser) return Promise.resolve();
        return libP = libP || new Promise(function (res, rej) {
            var s = document.createElement('script'); s.src = LIB; s.onload = res;
            s.onerror = function () { libP = null; rej(new Error("Couldn't load Face ID support — check your connection.")); };
            document.head.appendChild(s);
        });
    }
    function token() {
        return window.yrlClient.auth.getSession().then(function (r) { return r && r.data && r.data.session ? r.data.session.access_token : null; });
    }
    function call(body) {
        return token().then(function (tk) {
            if (!tk) throw new Error('Please sign in again.');
            return fetch(PK_URL, { method: 'POST', headers: { apikey: SB_KEY, Authorization: 'Bearer ' + tk, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        }).then(function (r) { return r.json().catch(function () { return { ok: false, error: 'No response' }; }); })
          .then(function (d) { if (!d.ok) throw new Error(d.error || 'Something went wrong'); return d; });
    }
    function deviceLabel() {
        var ua = navigator.userAgent;
        var dev = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows PC' : 'Device';
        var br = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) && !/Chromium/.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : /Firefox\//.test(ua) ? 'Firefox' : '';
        return dev + (br ? ' \u00b7 ' + br : '');
    }
    function day(s) { try { return new Date(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); } catch (e) { return ''; } }

    function css() {
        if (document.getElementById('fidCss')) return;
        var st = document.createElement('style'); st.id = 'fidCss';
        st.textContent =
            '#fidBack{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:9000;display:flex;align-items:center;justify-content:center;padding:16px;font-family:Inter,sans-serif;}' +
            '#fidBox{background:#fff;border-radius:16px;width:100%;max-width:440px;max-height:calc(100vh - 32px);overflow:auto;box-shadow:0 20px 50px rgba(15,23,42,.3);padding:22px 22px 18px;color:#1a1d22;}' +
            '#fidBox h3{margin:0 0 6px;font-size:18px;display:flex;align-items:center;gap:10px;}' +
            '#fidBox h3 i{color:#c03926;}' +
            '#fidBox .sub{font-size:13px;color:#6b7280;line-height:1.5;margin:0 0 14px;}' +
            '#fidBox .row{display:flex;align-items:center;gap:10px;padding:10px 0;border-top:1px solid #eef0f3;font-size:13.5px;}' +
            '#fidBox .row b{display:block;font-size:13.5px;}' +
            '#fidBox .row small{color:#6b7280;font-size:12px;}' +
            '#fidBox .rm{margin-left:auto;background:#fff;border:1px solid #e2e5ea;color:#991b1b;border-radius:8px;padding:6px 11px;font:600 12px Inter,sans-serif;cursor:pointer;flex-shrink:0;}' +
            '#fidBox .go{width:100%;margin-top:14px;background:#c03926;color:#fff;border:none;border-radius:10px;padding:12px;font:700 14px Inter,sans-serif;cursor:pointer;}' +
            '#fidBox .go:disabled{opacity:.6;}' +
            '#fidBox .x{display:block;margin:12px auto 0;background:none;border:none;color:#6b7280;font:600 13px Inter,sans-serif;cursor:pointer;}' +
            '#fidBox .msg{font-size:13px;border-radius:9px;padding:10px 12px;margin-top:12px;display:none;}' +
            '#fidBox .msg.ok{display:block;background:#dcfce7;color:#166534;}' +
            '#fidBox .msg.err{display:block;background:#fee2e2;color:#991b1b;}' +
            '#fidBox .empty{font-size:13px;color:#6b7280;padding:10px 0;border-top:1px solid #eef0f3;}';
        document.head.appendChild(st);
    }

    function close() { var b = document.getElementById('fidBack'); if (b) b.remove(); }
    function say(t, cls) { var m = document.getElementById('fidMsg'); if (m) { m.textContent = t; m.className = 'msg ' + (cls || ''); } }

    function render(list, supported) {
        var box = document.getElementById('fidBox'); if (!box) return;
        var rows = list.length ? list.map(function (p) {
            return '<div class="row"><i class="fa-solid fa-mobile-screen" style="color:#9ca3af;width:16px;text-align:center;"></i><div><b>' + esc(p.label || 'Device') + '</b>' +
                '<small>Added ' + esc(day(p.created_at)) + (p.last_used_at ? ' \u00b7 last used ' + esc(day(p.last_used_at)) : ' \u00b7 not used yet') + '</small></div>' +
                '<button class="rm" data-id="' + esc(p.id) + '">Remove</button></div>';
        }).join('') : '<div class="empty">Face ID isn\'t on for any of your devices yet.</div>';
        box.innerHTML =
            '<h3><i class="fa-solid fa-face-smile"></i> Face ID sign-in</h3>' +
            '<p class="sub">Sign in with Face ID or Touch ID instead of your PIN. Your PIN always still works. Set it up once on your iPhone and it works in Safari and the home-screen app.</p>' +
            rows +
            (supported ? '<button class="go" id="fidAdd"><i class="fa-solid fa-plus"></i> Turn on Face ID for this device</button>'
                       : '<div class="empty" style="border:none;">This device or browser doesn\'t support Face ID / Touch ID. Open the hub on your iPhone to turn it on.</div>') +
            '<div class="msg" id="fidMsg"></div>' +
            '<button class="x" id="fidClose">Close</button>';
        box.querySelector('#fidClose').onclick = close;
        Array.prototype.forEach.call(box.querySelectorAll('.rm'), function (b) {
            b.onclick = function () {
                if (!confirm('Remove Face ID for this device? It will need your PIN next time.')) return;
                b.disabled = true;
                call({ action: 'remove', id: b.getAttribute('data-id') }).then(load).catch(function (e) { b.disabled = false; say(e.message, 'err'); });
            };
        });
        var add = box.querySelector('#fidAdd');
        if (add) add.onclick = function () {
            add.disabled = true; add.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Waiting for Face ID\u2026';
            var opts;
            lib().then(function () { return call({ action: 'register-options' }); })
                .then(function (o) { opts = o.options; return window.SimpleWebAuthnBrowser.startRegistration({ optionsJSON: opts }); })
                .then(function (response) { return call({ action: 'register-verify', challenge: opts.challenge, response: response, label: deviceLabel() }); })
                .then(function () { setLS('yrl_pk_on', '1'); return load().then(function () { say('Face ID is on for this device.', 'ok'); }); })
                .catch(function (e) {
                    add.disabled = false; add.innerHTML = '<i class="fa-solid fa-plus"></i> Turn on Face ID for this device';
                    if (e && e.name === 'InvalidStateError') { setLS('yrl_pk_on', '1'); say('Face ID is already on for this device.', 'ok'); return; }
                    if (e && e.name === 'NotAllowedError') return;   // cancelled
                    say("Couldn't turn on Face ID: " + ((e && e.message) || e), 'err');
                });
        };
    }

    function load() {
        var supportedP = (window.PublicKeyCredential && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable)
            ? PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().catch(function () { return false; }) : Promise.resolve(false);
        return Promise.all([call({ action: 'list' }), supportedP]).then(function (r) {
            var list = r[0].passkeys || [];
            if (!list.length) setLS('yrl_pk_on', null);
            render(list, r[1]);
        }).catch(function (e) {
            var box = document.getElementById('fidBox');
            if (box) box.innerHTML = '<h3><i class="fa-solid fa-face-smile"></i> Face ID sign-in</h3><div class="msg err" style="display:block;">' + esc(e.message) + '</div><button class="x" id="fidClose">Close</button>';
            var c = document.getElementById('fidClose'); if (c) c.onclick = close;
        });
    }

    window.yrlFaceIdSettings = function () {
        if (!window.yrlClient) return;
        css(); close();
        var back = document.createElement('div'); back.id = 'fidBack';
        back.innerHTML = '<div id="fidBox"><h3><i class="fa-solid fa-face-smile"></i> Face ID sign-in</h3><p class="sub">Loading\u2026</p></div>';
        back.addEventListener('click', function (e) { if (e.target === back) close(); });
        document.body.appendChild(back);
        load();
    };
})();
