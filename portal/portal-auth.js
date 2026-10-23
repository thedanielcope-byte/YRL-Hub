/* ============================================================
   portal-auth.js — Auth guard for the Nomad Systems client portal
   Same Supabase project as the YRL hub, but:
     - redirects unauthenticated visitors to the portal login (index.html)
     - enforces portal membership via the client_portal_members table
       (data-driven; the hub's agent accounts are NOT allowed in here)
   Exposes window.yrlClient / window.yrlUser / window.yrlMember and the
   'yrl-auth-ready' event so admin.html works unchanged.

   Cloudflare caches this file by its .js extension and ignores the origin's
   cache-control — found this file stuck on a June-dated cached copy for months.
   Every edit to this file MUST also bump the ?v= on its <script src="portal-auth.js?v=...">
   tag in nomad-admin.html, or the edit silently never goes live.
   ============================================================ */

const _AUTH_SB_URL    = 'https://wdvolamasztetwpitbwg.supabase.co';
const _AUTH_SB_KEY    = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indkdm9sYW1hc3p0ZXR3cGl0YndnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3Nzc2MTYsImV4cCI6MjA5MTM1MzYxNn0.uiGIaZwr88ZNtAobfSV-axlpXB3sos2Rcw3FiFm6JO8';
const _AUTH_LOGIN_URL = 'index.html';

let _authClient = null;

document.documentElement.style.visibility = 'hidden';

(function () {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    s.onload  = _yrlInitAuth;
    s.onerror = function () {
        document.documentElement.style.visibility = 'visible';
    };
    document.head.appendChild(s);
})();

async function _yrlInitAuth() {
    /* Explicit persistence config — installed/standalone PWAs on iOS have been seen
       to silently fall back to in-memory storage if this is left to SDK defaults,
       which forces a fresh login on every relaunch. Being explicit removes the ambiguity. */
    _authClient = window.supabase.createClient(_AUTH_SB_URL, _AUTH_SB_KEY, {
        auth: { persistSession: true, storage: window.localStorage, autoRefreshToken: true, detectSessionInUrl: false }
    });

    const { data: { session } } = await _authClient.auth.getSession();

    if (!session) {
        sessionStorage.setItem('portal_intended', window.location.href);
        window.location.replace(_AUTH_LOGIN_URL);
        return;
    }

    const member = await _yrlResolveMember(session.user.email);
    if (!member) {
        /* Logged in but not a portal member (e.g., a hub agent account) */
        window.location.replace(_AUTH_LOGIN_URL + '?denied=1');
        return;
    }

    window.yrlUser   = session.user;
    window.yrlClient = _authClient;
    window.yrlMember = member;

    await _yrlFaceIdGate();

    document.documentElement.style.visibility = 'visible';
    _yrlPopulateUser(session.user);
    document.dispatchEvent(new CustomEvent('yrl-auth-ready', { detail: { user: session.user, member } }));

    _authClient.auth.onAuthStateChange((event, updatedSession) => {
        if (event === 'SIGNED_OUT') {
            window.location.replace(_AUTH_LOGIN_URL);
        }
        if (updatedSession) {
            window.yrlUser = updatedSession.user;
            _yrlPopulateUser(updatedSession.user);
        }
    });
}

/* Resolve the caller's active membership row. RLS returns the user's own row
   (admins get all), so we match by email. Returns the row or null. */
async function _yrlResolveMember(email) {
    const { data, error } = await _authClient
        .from('client_portal_members')
        .select('role, status, client_id, email')
        .eq('status', 'active');
    if (error || !data) return null;
    const lc = (email || '').toLowerCase();
    return data.find(r => (r.email || '').toLowerCase() === lc) || null;
}

function _yrlPopulateUser(user) {
    const displayName = user.user_metadata?.full_name
        || user.user_metadata?.name
        || user.email.split('@')[0];
    const nameEl  = document.getElementById('yrl-user-name');
    const emailEl = document.getElementById('yrl-user-email');
    if (nameEl)  nameEl.textContent  = displayName;
    if (emailEl) emailEl.textContent = user.email;
}

/* ── Face ID / Touch ID device lock (local unlock gate, no server round-trip —
   your Supabase session already handles real auth; this just re-confirms it's
   you on THIS device before showing anything). ────────────────────────────── */
const FACEID_CRED_KEY = 'nomad_faceid_cred_id';

function _b64uToBytes(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    const bin = atob(s);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
}
function _bytesToB64u(buf) {
    const arr = new Uint8Array(buf);
    let bin = '';
    for (const b of arr) bin += String.fromCharCode(b);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function yrlFaceIdSupported() {
    return !!(window.PublicKeyCredential && navigator.credentials);
}

async function yrlFaceIdEnabled() {
    return yrlFaceIdSupported() && !!localStorage.getItem(FACEID_CRED_KEY);
}

async function yrlEnableFaceId() {
    if (!yrlFaceIdSupported()) { alert('Face ID / Touch ID is not supported in this browser.'); return; }
    try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (!available) { alert('No Face ID / Touch ID available on this device.'); return; }
        const cred = await navigator.credentials.create({
            publicKey: {
                challenge: crypto.getRandomValues(new Uint8Array(32)),
                rp: { name: 'Nomad Systems Admin' },
                user: { id: new TextEncoder().encode(window.yrlUser.id), name: window.yrlUser.email, displayName: window.yrlUser.email },
                pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
                authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
                timeout: 60000,
                attestation: 'none',
            }
        });
        localStorage.setItem(FACEID_CRED_KEY, _bytesToB64u(cred.rawId));
        document.dispatchEvent(new CustomEvent('yrl-faceid-changed'));
        if (typeof toast === 'function') toast('Face ID enabled on this device.', 'success'); else alert('Face ID enabled on this device.');
    } catch (e) {
        console.error('faceid enable error', e);
        alert('Could not enable Face ID: ' + e.message);
    }
}

function yrlDisableFaceId() {
    localStorage.removeItem(FACEID_CRED_KEY);
    document.dispatchEvent(new CustomEvent('yrl-faceid-changed'));
}

/* Resolves once unlocked. No-op (resolves immediately) if Face ID isn't set up on this device. */
async function _yrlFaceIdGate() {
    const credId = localStorage.getItem(FACEID_CRED_KEY);
    if (!credId || !yrlFaceIdSupported()) return;

    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.id = 'faceIdLock';
        overlay.style.cssText = 'visibility:visible;position:fixed;inset:0;z-index:999999;background:#0f172a;'
            + 'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;'
            + 'color:#fff;font-family:Inter,Arial,sans-serif;text-align:center;padding:24px;';
        overlay.innerHTML = '<div style="font-size:34px;">🔒</div>'
            + '<div style="font-size:15px;font-weight:700;letter-spacing:0.3px;">Nomad Admin is locked</div>'
            + '<button id="faceIdUnlockBtn" style="background:#0d9488;color:#fff;border:none;border-radius:10px;'
            + 'padding:12px 22px;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;margin-top:4px;">Unlock with Face ID</button>'
            + '<div id="faceIdErr" style="font-size:12.5px;color:#fca5a5;min-height:16px;"></div>'
            + '<a href="#" id="faceIdSignOutLink" style="font-size:12px;color:#94a3b8;margin-top:4px;">Sign out instead</a>'
            + '<a href="#" id="faceIdResetLink" style="font-size:11px;color:#64748b;margin-top:14px;">Trouble unlocking? Turn off Face ID lock</a>';
        document.body.appendChild(overlay);

        async function attempt() {
            const errEl = document.getElementById('faceIdErr');
            errEl.textContent = '';
            try {
                await navigator.credentials.get({
                    publicKey: {
                        challenge: crypto.getRandomValues(new Uint8Array(32)),
                        allowCredentials: [{ id: _b64uToBytes(credId), type: 'public-key' }],
                        userVerification: 'required',
                        timeout: 60000,
                    }
                });
                overlay.remove();
                resolve();
            } catch (e) {
                errEl.textContent = 'Face ID failed — try again.';
            }
        }
        document.getElementById('faceIdUnlockBtn').addEventListener('click', attempt);
        document.getElementById('faceIdSignOutLink').addEventListener('click', (e) => { e.preventDefault(); yrlSignOut(); });
        document.getElementById('faceIdResetLink').addEventListener('click', (e) => {
            e.preventDefault();
            yrlDisableFaceId();
            overlay.remove();
            resolve();
        });
    });
}

function yrlSignOut() {
    if (_authClient) {
        _authClient.auth.signOut().then(() => {
            window.location.replace(_AUTH_LOGIN_URL);
        });
    } else {
        window.location.replace(_AUTH_LOGIN_URL);
    }
}
