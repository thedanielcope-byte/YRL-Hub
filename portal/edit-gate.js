/* ══════════════════════════════════════════════════════════════════════
   edit-gate.js  —  shared "enter PIN to edit" safeguard
   ----------------------------------------------------------------------
   A soft confirmation gate: before entering edit mode on any hub page, the
   user must type the edit PIN (1984). This guards against accidental or
   casual edits to shared content — it is NOT the security boundary (Supabase
   RLS already decides who can actually write). Once entered correctly, the
   session stays unlocked for this browser tab so the user isn't re-prompted
   on every page or every edit.

   Usage on a page:
     <script src="edit-gate.js"></script>
     ...wrap the "enter edit mode" call:
         editGate(function(){ enterEditMode(); });
   ══════════════════════════════════════════════════════════════════════ */
(function () {
    var EDIT_PINS = ['1984', '2302', '2301'];   // 1984 = admin · 2302 = YRL agent hub · 2301 = Janet (her login PIN, also unlocks edit)
    var UNLOCK_KEY = 'yrl_edit_unlocked';

    function isUnlocked() {
        try { return sessionStorage.getItem(UNLOCK_KEY) === '1'; } catch (e) { return false; }
    }
    function setUnlocked() {
        try { sessionStorage.setItem(UNLOCK_KEY, '1'); } catch (e) {}
    }

    var overlay = null;
    function buildModal() {
        if (overlay) return;
        overlay = document.createElement('div');
        overlay.id = 'editGateOverlay';
        overlay.style.cssText =
            'position:fixed;inset:0;background:rgba(15,23,42,.55);display:none;' +
            'align-items:center;justify-content:center;z-index:9999;padding:20px;' +
            'font-family:Inter,system-ui,sans-serif;';
        overlay.innerHTML =
            '<div style="background:#fff;border-radius:16px;max-width:340px;width:100%;padding:26px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.3);">' +
              '<div style="width:48px;height:48px;border-radius:50%;background:rgba(192,57,38,.10);color:#c03926;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:20px;">' +
                '<i class="fa-solid fa-lock"></i>' +
              '</div>' +
              '<h3 style="font-family:\'Bebas Neue\',sans-serif;font-size:22px;letter-spacing:1px;margin:0 0 4px;color:#1a1d22;">Enter Edit PIN</h3>' +
              '<p style="font-size:12.5px;color:#9ca3af;margin:0 0 16px;">Editing is protected. Enter the PIN to make changes.</p>' +
              '<input id="editGateInput" type="password" inputmode="numeric" maxlength="8" autocomplete="off" placeholder="••••" ' +
                'style="width:100%;text-align:center;font-size:22px;letter-spacing:8px;padding:12px;border:1.5px solid #e2e5ea;border-radius:10px;outline:none;font-family:Inter,sans-serif;">' +
              '<div id="editGateError" style="display:none;color:#dc2626;font-size:12.5px;font-weight:600;margin-top:8px;">Incorrect PIN — try again.</div>' +
              '<div style="display:flex;gap:10px;margin-top:18px;">' +
                '<button id="editGateCancel" style="flex:1;background:#f7f8fa;border:1.5px solid #e2e5ea;color:#5a6270;border-radius:9px;padding:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:Inter,sans-serif;">Cancel</button>' +
                '<button id="editGateOk" style="flex:1;background:#c03926;border:none;color:#fff;border-radius:9px;padding:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:Inter,sans-serif;">Unlock</button>' +
              '</div>' +
            '</div>';
        document.body.appendChild(overlay);

        var input = overlay.querySelector('#editGateInput');
        var err   = overlay.querySelector('#editGateError');

        function submit() {
            if (EDIT_PINS.indexOf(input.value) !== -1) {
                setUnlocked();
                hide();
                if (pendingCb) { var cb = pendingCb; pendingCb = null; cb(); }
            } else {
                err.style.display = 'block';
                input.value = '';
                input.focus();
            }
        }
        overlay.querySelector('#editGateOk').addEventListener('click', submit);
        overlay.querySelector('#editGateCancel').addEventListener('click', function () { pendingCb = null; hide(); });
        input.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
        overlay.addEventListener('click', function (e) { if (e.target === overlay) { pendingCb = null; hide(); } });
    }

    var pendingCb = null;
    function show() {
        buildModal();
        overlay.style.display = 'flex';
        var input = overlay.querySelector('#editGateInput');
        var err   = overlay.querySelector('#editGateError');
        input.value = ''; err.style.display = 'none';
        setTimeout(function () { input.focus(); }, 60);
    }
    function hide() { if (overlay) overlay.style.display = 'none'; }

    /* Public: run onOk() only after the edit PIN is confirmed (or already
       unlocked this session). */
    window.editGate = function (onOk) {
        if (typeof onOk !== 'function') return;
        if (isUnlocked()) { onOk(); return; }
        pendingCb = onOk;
        show();
    };
    /* Synchronous check — true if this tab is already unlocked. Lets a function
       gate itself: `if (!editGatePassed()) return editGate(() => thisFn(args));` */
    window.editGatePassed = isUnlocked;

    /* Optional: force a re-prompt (e.g. a "lock editing" button could call this). */
    window.editGateLock = function () {
        try { sessionStorage.removeItem(UNLOCK_KEY); } catch (e) {}
    };
})();
