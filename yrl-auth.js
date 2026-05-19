/* ============================================================
   yrl-auth.js — Supabase Auth guard for all YRL hub pages
   Include in <head> of every protected page:
       <script src="yrl-auth.js"></script>
   ============================================================ */

const _AUTH_SB_URL    = 'https://khhfkxfxefjgunhrihyx.supabase.co';
const _AUTH_SB_KEY    = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoaGZreGZ4ZWZqZ3VuaHJpaHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NzYwMjcsImV4cCI6MjA5MTM1MjAyN30.bYW68xMDUEXBRC1bxOLdj77xCcjXb3wIuHbPAPFdSGo';
const _AUTH_LOGIN_URL = 'yrl-login.html';

let _authClient = null;

/* ── Immediately hide the page to prevent a flash of content
       before the auth check completes ── */
document.documentElement.style.visibility = 'hidden';

/* ── Dynamically load the Supabase JS SDK then run auth check ── */
(function () {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    s.onload  = _yrlInitAuth;
    s.onerror = function () {
        /* CDN failed — show page anyway so agents aren't locked out */
        document.documentElement.style.visibility = 'visible';
    };
    document.head.appendChild(s);
})();

/* ── Check session, redirect to login if missing ── */
async function _yrlInitAuth() {
    _authClient = window.supabase.createClient(_AUTH_SB_URL, _AUTH_SB_KEY);

    const { data: { session } } = await _authClient.auth.getSession();

    if (!session) {
        /* Save where they were trying to go so login can send them back */
        sessionStorage.setItem('yrl_intended', window.location.href);
        window.location.replace(_AUTH_LOGIN_URL);
        return;
    }

    /* Authenticated — expose user globally and reveal the page */
    window.yrlUser   = session.user;
    window.yrlClient = _authClient;

    document.documentElement.style.visibility = 'visible';

    /* Populate any user-display elements already in the DOM */
    _yrlPopulateUser(session.user);

    /* Notify pages that need the user identity before initialising */
    document.dispatchEvent(new CustomEvent('yrl-auth-ready', { detail: { user: session.user } }));

    /* Keep session fresh via Supabase's built-in token refresh */
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

/* ── Fill in name/email elements if present in the page ── */
function _yrlPopulateUser(user) {
    const displayName = user.user_metadata?.full_name
        || user.user_metadata?.name
        || user.email.split('@')[0];

    const nameEl  = document.getElementById('yrl-user-name');
    const emailEl = document.getElementById('yrl-user-email');
    if (nameEl)  nameEl.textContent  = displayName;
    if (emailEl) emailEl.textContent = user.email;
}

/* ── Sign out — callable from any page ── */
function yrlSignOut() {
    if (_authClient) {
        _authClient.auth.signOut().then(() => {
            window.location.replace(_AUTH_LOGIN_URL);
        });
    } else {
        window.location.replace(_AUTH_LOGIN_URL);
    }
}
