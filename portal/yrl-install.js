/* ══════════════════════════════════════════════════════════════════════
   yrl-install.js — nudges agents on a phone to add the hub to their home
   screen (manifest-yrl.json). Shows a small bar at the bottom of the hub:
     • iPhone/iPad Safari → "Tap Share, then Add to Home Screen"
     • Android Chrome     → an Install button (beforeinstallprompt)
   Hidden when already running as the installed app, on desktop, or once the
   agent dismisses it (remembered per device).
   ══════════════════════════════════════════════════════════════════════ */
(function () {
    var KEY = 'yrl-install-dismissed';
    try { if (localStorage.getItem(KEY)) return; } catch (e) {}
    if (/[?&]embed=1/.test(location.search)) return;
    var standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
    if (standalone) return;

    var ua = navigator.userAgent || '';
    var isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var isAndroid = /Android/.test(ua);
    if (!isIOS && !isAndroid) return;
    var deferred = null;

    function bar(html) {
        if (document.getElementById('yrlInstallBar')) return;
        var css = document.createElement('style');
        css.textContent =
            '#yrlInstallBar{position:fixed;left:12px;right:12px;bottom:calc(92px + env(safe-area-inset-bottom));z-index:400;background:#fff;border:1px solid #e2e5ea;border-radius:14px;box-shadow:0 10px 30px rgba(15,23,42,.18);padding:12px 12px 12px 14px;display:flex;align-items:center;gap:12px;font-family:Inter,sans-serif;}' +
            '#yrlInstallBar img{width:40px;height:40px;border-radius:10px;flex-shrink:0;}' +
            '#yrlInstallBar .t{flex:1;min-width:0;font-size:13px;line-height:1.35;color:#1a1d22;}' +
            '#yrlInstallBar .t b{display:block;font-size:13.5px;}' +
            '#yrlInstallBar .t i.fa-arrow-up-from-bracket{color:#2563eb;}' +
            '#yrlInstallBar button{border:none;cursor:pointer;font-family:inherit;}' +
            '#yrlInstallBar .go{background:#c03926;color:#fff;font-weight:700;font-size:13px;padding:9px 14px;border-radius:9px;flex-shrink:0;}' +
            '#yrlInstallBar .x{background:none;color:#9ca3af;font-size:16px;width:30px;height:30px;flex-shrink:0;}';
        document.head.appendChild(css);
        var el = document.createElement('div');
        el.id = 'yrlInstallBar';
        el.innerHTML = '<img src="yrl-apple-touch-icon.png?v=20260927a" alt="">' + html +
            '<button class="x" aria-label="Dismiss"><i class="fa-solid fa-xmark"></i></button>';
        document.body.appendChild(el);
        el.querySelector('.x').onclick = function () {
            try { localStorage.setItem(KEY, '1'); } catch (e) {}
            el.remove();
        };
        var go = el.querySelector('.go');
        if (go) go.onclick = function () {
            if (!deferred) return;
            deferred.prompt();
            deferred.userChoice.then(function () { deferred = null; el.remove(); });
        };
    }

    if (isAndroid) {
        window.addEventListener('beforeinstallprompt', function (e) {
            e.preventDefault(); deferred = e;
            bar('<div class="t"><b>Get the YRL Hub app</b>Opens full screen from your home screen.</div><button class="go">Install</button>');
        });
    } else {
        var show = function () {
            bar('<div class="t"><b>Add YRL Hub to your home screen</b>Tap <i class="fa-solid fa-arrow-up-from-bracket"></i> Share, then <b style="display:inline">Add to Home Screen</b>.</div>');
        };
        if (document.readyState === 'complete') setTimeout(show, 1500);
        else window.addEventListener('load', function () { setTimeout(show, 1500); });
    }
})();
