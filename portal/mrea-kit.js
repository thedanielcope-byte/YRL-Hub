/* ============================================================
   mrea-kit.js — shared helpers for The Millionaire Agent Path.
   Loads AFTER yrl-tiger.js on every MREA module page.

   Gives each module:
     MREA.num(v)            → parse "275,000" / "$3.5%" → number
     MREA.money(n)          → "$275,000"
     MREA.bind(ids, fn)     → recalc on input + after hydrate
     MREA.set(id, html)     → write into an output element
     MREA.verdict(el, cls, head, paras)
     MREA.publish({k:v})    → merge into mrea:v1:metrics:<email>
     MREA.metrics()         → Promise of the merged metrics object

   The metrics bridge is the point of the whole curriculum: numbers an
   agent works out in a training module become available to the MREA
   Marketing tools and the Scorecard without re-entering anything.
   ============================================================ */
(function () {
  'use strict';

  const VERSION = 'v1';

  function email() {
    const u = window.yrlUser;
    if (u && u.email) return u.email.toLowerCase();
    return (localStorage.getItem('yrl_agent_email') || 'anon').toLowerCase();
  }
  const metricsKey = () => `mrea:${VERSION}:metrics:${email()}`;

  /* ---------- parsing / formatting ---------- */
  function num(v) {
    if (typeof v === 'number') return isFinite(v) ? v : 0;
    if (v && v.value !== undefined) v = v.value;
    const n = parseFloat(String(v == null ? '' : v).replace(/[^0-9.\-]/g, ''));
    return isFinite(n) ? n : 0;
  }
  function money(n, dp) {
    const v = Math.round((n || 0) * Math.pow(10, dp || 0)) / Math.pow(10, dp || 0);
    return '$' + v.toLocaleString(undefined, { minimumFractionDigits: dp || 0, maximumFractionDigits: dp || 0 });
  }
  function round(n, dp) {
    const f = Math.pow(10, dp || 0);
    return Math.round((n || 0) * f) / f;
  }
  function cnt(n, dp) {
    return round(n, dp === undefined ? 1 : dp).toLocaleString();
  }

  /* ---------- DOM ---------- */
  function $(id) { return document.getElementById(id); }
  function set(id, html) { const el = $(id); if (el) el.innerHTML = html; }
  function val(id) { const el = $(id); return el ? el.value : ''; }
  function nval(id) { return num(val(id)); }

  function stat(id, value, label, note) {
    set(id, '<span class="sv">' + value + '</span><span class="sl">' + label + '</span>' +
            (note ? '<span class="sn">' + note + '</span>' : ''));
  }

  function verdict(id, cls, head, paras) {
    const el = $(id);
    if (!el) return;
    el.className = 'mrea-verdict' + (cls ? ' is-' + cls : '');
    const body = (Array.isArray(paras) ? paras : [paras]).filter(Boolean)
      .map(p => '<p class="vp">' + p + '</p>').join('');
    el.innerHTML = '<p class="vt">What this means</p><h3 class="vh">' + head + '</h3>' + body;
  }

  /* Bind a recalc function to a list of input ids. Runs once now, again
     after auth hydrate (so saved values are in place), and on every edit. */
  function bind(ids, fn) {
    (ids || []).forEach(function (id) {
      const el = $(id);
      if (!el) return;
      const ev = (el.type === 'checkbox' || el.type === 'range') ? 'input' : 'input';
      el.addEventListener(ev, fn);
      if (el.type === 'checkbox') el.addEventListener('change', fn);
    });
    document.addEventListener('yrl-auth-ready', function () { setTimeout(fn, 350); });
    setTimeout(fn, 400);
    setTimeout(fn, 1400);   // safety net if auth is slow
  }

  /* Also recalc when any dynamic list row changes (lists render late). */
  function bindLists(fn) {
    document.addEventListener('input', function (e) {
      if (e.target.closest && e.target.closest('.tiger-list-row')) fn();
    });
    document.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('.tiger-list-add, .tiger-list-del')) setTimeout(fn, 60);
    });
  }

  /* ---------- metrics bridge ---------- */
  /* NOTE: hub-data.js's loadHubContent() does not reject when the Supabase
     client isn't ready — it simply never settles. A bare `await` on it would
     hang forever and a try/catch would never fire, so every read below is
     raced against a timeout and localStorage is always written first. Nothing
     here may depend on the network to persist. */
  const CLOUD_MS = 2500;

  function withTimeout(p, ms, fallback) {
    return Promise.race([
      Promise.resolve(p).catch(function () { return fallback; }),
      new Promise(function (res) { setTimeout(function () { res(fallback); }, ms || CLOUD_MS); })
    ]);
  }

  function readLocal() {
    try { return JSON.parse(localStorage.getItem(metricsKey())) || {}; } catch (e) { return {}; }
  }
  function writeLocal(m) {
    try { localStorage.setItem(metricsKey(), JSON.stringify(m)); } catch (e) {}
  }

  let _cache = null;
  let _pubTimer = null;
  let _pending = {};

  async function metrics() {
    if (_cache) return _cache;
    let m = readLocal();
    if (typeof loadHubContent === 'function') {
      const c = await withTimeout(loadHubContent(metricsKey()), CLOUD_MS, null);
      if (c && typeof c === 'object') m = Object.assign(m, c);
    }
    _cache = m;
    return m;
  }

  function publish(obj) {
    if (!obj) return;
    Object.keys(obj).forEach(function (k) {
      const v = obj[k];
      if (v === null || v === undefined || v === '' || (typeof v === 'number' && !isFinite(v))) return;
      _pending[k] = v;
    });
    if (!Object.keys(_pending).length) return;
    clearTimeout(_pubTimer);
    _pubTimer = setTimeout(function () {
      // Merge onto whatever is already local and write immediately — never
      // behind an await, so a stalled network can't lose the agent's numbers.
      const m = Object.assign({}, readLocal(), _cache || {}, _pending, { updated: new Date().toISOString() });
      _pending = {};
      _cache = m;
      writeLocal(m);
      if (typeof saveHubContent === 'function') {
        try { Promise.resolve(saveHubContent(metricsKey(), m)).catch(function () {}); } catch (e) {}
      }
    }, 1200);
  }

  /* ---------- slider labels ---------- */
  function wireScales() {
    document.querySelectorAll('.mrea-scale input[type=range]').forEach(function (r) {
      const out = r.parentElement.querySelector('.sl-val');
      const paint = function () { if (out) out.textContent = r.value; };
      r.addEventListener('input', paint);
      document.addEventListener('yrl-auth-ready', function () { setTimeout(paint, 400); });
      setTimeout(paint, 450);
      setTimeout(paint, 1450);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireScales);
  } else { wireScales(); }

  window.MREA = {
    num: num, money: money, round: round, cnt: cnt,
    $: $, set: set, val: val, nval: nval, stat: stat, verdict: verdict,
    bind: bind, bindLists: bindLists, withTimeout: withTimeout,
    publish: publish, metrics: metrics, metricsKey: metricsKey, email: email
  };
})();
