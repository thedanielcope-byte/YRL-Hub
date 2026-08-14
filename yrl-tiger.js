/* ============================================================
   yrl-tiger.js — Tiger Training interactive engine
   Shared by every Tiger Training module page.

   Requires (loaded before this file):
     • yrl-auth.js  → window.yrlUser (the signed-in agent)
     • yrl-hub.js   → saveHubContent(key,val) / loadHubContent(key)

   A module page opts in with:
     <body data-tiger-module="1.1" data-tiger-title="Your Big Why & Goals">
   and marks up interactive elements:
     <input  data-tiger="income_goal">
     <textarea data-tiger="big_why"></textarea>
     <input type="checkbox" data-tiger-check="read_scripts">
     <div class="tiger-list" data-list="soi" data-min="5"
          data-placeholder="Name — how you know them"></div>

   Buttons (anywhere on the page):
     <button data-tiger-action="save">Save</button>
     <button data-tiger-action="pdf">Download PDF</button>
     <button data-tiger-action="txt">Download list</button>
     <button data-tiger-action="complete">Mark complete</button>
     <button data-tiger-action="reset">Clear</button>
   ============================================================ */
(function () {
  'use strict';

  const VERSION = 'v1';
  const body = document.body;
  const MODULE_ID = body.getAttribute('data-tiger-module') || 'unknown';
  const MODULE_TITLE = body.getAttribute('data-tiger-title') || document.title;

  let email = 'anon';
  let hydrated = false;
  let cloudTimer = null;
  let localTimer = null;

  /* ---------- identity ---------- */
  function resolveEmail() {
    const u = window.yrlUser;
    if (u && u.email) return u.email.toLowerCase();
    // fall back to whatever the hub stored locally
    const stored = localStorage.getItem('yrl_agent_email')
      || localStorage.getItem('AGENT_NAME_KEY');
    return stored ? stored.toLowerCase() : 'anon';
  }
  const dataKey = () => `tiger:${VERSION}:${MODULE_ID}:${email}`;
  const progressKey = () => `tiger:${VERSION}:progress:${email}`;

  /* ---------- collect / apply state ---------- */
  function collect() {
    const fields = {}, checks = {}, lists = {};
    document.querySelectorAll('[data-tiger]').forEach(el => {
      fields[el.getAttribute('data-tiger')] = el.value;
    });
    document.querySelectorAll('[data-tiger-check]').forEach(el => {
      checks[el.getAttribute('data-tiger-check')] = el.checked;
    });
    document.querySelectorAll('.tiger-list[data-list]').forEach(box => {
      const key = box.getAttribute('data-list');
      lists[key] = [...box.querySelectorAll('.tiger-list-row input')]
        .map(i => i.value).filter(v => v.trim() !== '');
    });
    return { fields, checks, lists, savedAt: new Date().toISOString() };
  }

  function apply(state) {
    if (!state) return;
    const { fields = {}, checks = {}, lists = {} } = state;
    document.querySelectorAll('[data-tiger]').forEach(el => {
      const k = el.getAttribute('data-tiger');
      if (k in fields) el.value = fields[k];
    });
    document.querySelectorAll('[data-tiger-check]').forEach(el => {
      const k = el.getAttribute('data-tiger-check');
      if (k in checks) el.checked = !!checks[k];
    });
    document.querySelectorAll('.tiger-list[data-list]').forEach(box => {
      const key = box.getAttribute('data-list');
      const rows = lists[key] || [];
      renderList(box, rows);
    });
  }

  /* ---------- progress ---------- */
  function computeProgress() {
    let total = 0, filled = 0;
    document.querySelectorAll('[data-tiger]').forEach(el => {
      total++; if (el.value.trim() !== '') filled++;
    });
    document.querySelectorAll('[data-tiger-check]').forEach(el => {
      total++; if (el.checked) filled++;
    });
    document.querySelectorAll('.tiger-list[data-list]').forEach(box => {
      total++;
      if (box.querySelectorAll('.tiger-list-row input')
             .length && [...box.querySelectorAll('.tiger-list-row input')]
             .some(i => i.value.trim() !== '')) filled++;
    });
    return total ? Math.round((filled / total) * 100) : 0;
  }

  async function writeProgress(markDone) {
    const pct = computeProgress();
    let idx = {};
    try { idx = JSON.parse(localStorage.getItem(progressKey())) || {}; } catch {}
    const prev = idx[MODULE_ID] || {};
    idx[MODULE_ID] = {
      pct,
      done: markDone === true ? true : (markDone === false ? false : !!prev.done),
      title: MODULE_TITLE,
      updated: new Date().toISOString()
    };
    localStorage.setItem(progressKey(), JSON.stringify(idx));
    if (typeof saveHubContent === 'function') {
      try { await saveHubContent(progressKey(), idx); } catch {}
    }
    paintProgressUI(pct, idx[MODULE_ID].done);
  }

  function paintProgressUI(pct, done) {
    const bar = document.getElementById('tigerProgressBar');
    const lbl = document.getElementById('tigerProgressLabel');
    if (bar) bar.style.width = pct + '%';
    if (lbl) lbl.textContent = done ? 'Completed' : pct + '% complete';
    body.classList.toggle('tiger-done', !!done);
  }

  /* ---------- save (local now, cloud debounced) ---------- */
  function saveLocal() {
    try { localStorage.setItem(dataKey(), JSON.stringify(collect())); } catch {}
  }
  async function saveCloud(silent) {
    if (typeof saveHubContent !== 'function') return false;
    let ok = false;
    try { ok = await saveHubContent(dataKey(), collect()); } catch {}
    await writeProgress();
    if (!silent) toast(ok ? 'Saved to your account' : 'Saved on this device');
    return ok;
  }
  function scheduleAutosave() {
    if (!hydrated) return;
    clearTimeout(localTimer);
    localTimer = setTimeout(() => { saveLocal(); writeProgress(); }, 400);
    clearTimeout(cloudTimer);
    cloudTimer = setTimeout(() => saveCloud(true), 3500);
  }

  /* ---------- dynamic "add your own" lists ---------- */
  function renderList(box, rows) {
    const min = parseInt(box.getAttribute('data-min') || '3', 10);
    const ph = box.getAttribute('data-placeholder') || 'Type here…';
    let host = box.querySelector('.tiger-list-rows');
    if (!host) {
      host = document.createElement('div');
      host.className = 'tiger-list-rows';
      box.appendChild(host);
      const add = document.createElement('button');
      add.type = 'button';
      add.className = 'tiger-list-add';
      add.innerHTML = '<i class="fa-solid fa-plus"></i> Add row';
      add.addEventListener('click', () => { addRow(host, ph, ''); focusLast(host); scheduleAutosave(); });
      box.appendChild(add);
    }
    host.innerHTML = '';
    const values = rows.length ? rows.slice() : [];
    while (values.length < min) values.push('');
    values.forEach((v, i) => addRow(host, ph, v, i + 1));
  }
  function addRow(host, ph, value, n) {
    const row = document.createElement('div');
    row.className = 'tiger-list-row';
    const num = document.createElement('span');
    num.className = 'tiger-list-num';
    num.textContent = (n || host.children.length + 1) + '.';
    const inp = document.createElement('input');
    inp.type = 'text'; inp.placeholder = ph; inp.value = value || '';
    inp.addEventListener('input', scheduleAutosave);
    const del = document.createElement('button');
    del.type = 'button'; del.className = 'tiger-list-del';
    del.setAttribute('aria-label', 'Remove row');
    del.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    del.addEventListener('click', () => { row.remove(); renumber(host); scheduleAutosave(); });
    row.append(num, inp, del);
    host.appendChild(row);
  }
  function renumber(host) {
    [...host.children].forEach((r, i) => {
      const n = r.querySelector('.tiger-list-num'); if (n) n.textContent = (i + 1) + '.';
    });
  }
  function focusLast(host) {
    const inputs = host.querySelectorAll('input'); if (inputs.length) inputs[inputs.length - 1].focus();
  }

  /* ---------- downloads ---------- */
  function agentName() {
    const u = window.yrlUser;
    return (u && (u.user_metadata?.full_name || u.user_metadata?.name))
      || (email !== 'anon' ? email.split('@')[0] : 'Agent');
  }
  function fileStub() {
    return `Tiger-Training-${MODULE_ID}-${agentName()}`.replace(/[^a-zA-Z0-9._-]+/g, '-');
  }
  function downloadPDF() { window.print(); }

  function downloadTxt() {
    const s = collect();
    const lines = [];
    lines.push(`TIGER TRAINING — Module ${MODULE_ID}: ${MODULE_TITLE}`);
    lines.push(`Your Realty Link · ${agentName()} · ${new Date().toLocaleDateString()}`);
    lines.push('='.repeat(56), '');
    document.querySelectorAll('[data-tiger],[data-tiger-check],.tiger-list[data-list]').forEach(el => {
      if (el.matches('[data-tiger]')) {
        const label = fieldLabel(el);
        lines.push(label + ':', '  ' + (el.value.trim() || '—'), '');
      } else if (el.matches('[data-tiger-check]')) {
        lines.push(`[${el.checked ? 'x' : ' '}] ${fieldLabel(el)}`);
      } else {
        const label = el.getAttribute('data-list-title') || el.getAttribute('data-list');
        lines.push(label + ':');
        const vals = (s.lists[el.getAttribute('data-list')] || []);
        if (!vals.length) lines.push('  —');
        vals.forEach((v, i) => lines.push(`  ${i + 1}. ${v}`));
        lines.push('');
      }
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    triggerDownload(blob, fileStub() + '.txt');
  }
  function fieldLabel(el) {
    const id = el.id;
    if (id) { const l = document.querySelector(`label[for="${id}"]`); if (l) return l.textContent.trim(); }
    const wrap = el.closest('.field, .tiger-field, label');
    const lab = wrap && wrap.querySelector('.field-label, .tiger-label, label');
    if (lab && lab !== el) return lab.textContent.trim();
    return el.getAttribute('data-tiger') || el.getAttribute('data-tiger-check') || 'Field';
  }
  function triggerDownload(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* ---------- toast ---------- */
  let toastEl = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'tiger-toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  /* ---------- actions ---------- */
  function bindActions() {
    document.querySelectorAll('[data-tiger-action]').forEach(btn => {
      const act = btn.getAttribute('data-tiger-action');
      btn.addEventListener('click', async () => {
        if (act === 'save') { saveLocal(); await saveCloud(false); }
        else if (act === 'pdf') downloadPDF();
        else if (act === 'txt') downloadTxt();
        else if (act === 'complete') {
          saveLocal(); await saveCloud(true); await writeProgress(true);
          toast('Module marked complete 🐯');
        }
        else if (act === 'reset') {
          if (!confirm('Clear your answers on this module? This cannot be undone.')) return;
          localStorage.removeItem(dataKey());
          apply({ fields: {}, checks: {}, lists: {} });
          await writeProgress(false); await saveCloud(true);
          toast('Cleared');
        }
      });
    });
  }

  function bindInputs() {
    document.querySelectorAll('[data-tiger],[data-tiger-check]').forEach(el => {
      const ev = (el.type === 'checkbox') ? 'change' : 'input';
      el.addEventListener(ev, scheduleAutosave);
    });
  }

  /* ---------- boot ---------- */
  async function hydrate() {
    email = resolveEmail();
    // ensure list widgets exist even if there is no saved data
    document.querySelectorAll('.tiger-list[data-list]').forEach(box => renderList(box, []));

    let state = null;
    try { state = JSON.parse(localStorage.getItem(dataKey())); } catch {}
    if (typeof loadHubContent === 'function') {
      try {
        const cloud = await loadHubContent(dataKey());
        if (cloud) state = cloud;               // cloud is source of truth when present
      } catch {}
    }
    apply(state);
    bindInputs();
    bindActions();
    hydrated = true;
    await writeProgress();

    // stamp identity + date into any print/summary chrome
    const nameSlots = document.querySelectorAll('[data-tiger-name]');
    nameSlots.forEach(n => n.textContent = agentName());
    const dateSlots = document.querySelectorAll('[data-tiger-date]');
    dateSlots.forEach(n => n.textContent = new Date().toLocaleDateString());
  }

  // Wait for auth to establish identity, then hydrate.
  if (window.yrlUser) hydrate();
  else {
    document.addEventListener('yrl-auth-ready', hydrate, { once: true });
    // safety net: if auth never fires (e.g. CDN down), still load local data
    setTimeout(() => { if (!hydrated) hydrate(); }, 4000);
  }

  // expose a tiny API for pages that want it
  window.Tiger = { save: () => saveCloud(false), pdf: downloadPDF, txt: downloadTxt, progress: computeProgress };
})();
