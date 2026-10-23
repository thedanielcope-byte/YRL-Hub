/* ============================================================
   mrea-nav.js — builds The Millionaire Agent Path sidebar.
   Sibling of tiger-nav.js. Requires an empty
   <aside class="tiger-side" id="tigerSide"></aside>.

   The page marks the active entry via <body> data attributes:
       data-tiger-module="2.1"        (a module page)
       data-tiger-page="overview" | "tracker"
   and opts into the MREA namespace with:
       data-tiger-ns="mrea"
       data-tiger-program="Millionaire Agent Path"

   Reads progress from mrea:v1:progress:<email> (localStorage + hub_content),
   so MREA progress never collides with Tiger Training progress.
   ============================================================ */
(function () {
  'use strict';

  // Single source of truth for the whole path. href = built & linkable.
  const PHASES = [
    { n: '01', title: 'Think It', mods: [
      { id: '1.1', name: "The Three L's Diagnostic", href: 'yrl-mrea-1-1-three-ls.html' },
      { id: '1.2', name: 'The Six MythUnderstandings', href: 'yrl-mrea-1-2-myths.html' },
      { id: '1.3', name: 'The 80/20 Audit', href: 'yrl-mrea-1-3-eighty-twenty.html' },
    ]},
    { n: '02', title: 'Know Your Numbers', mods: [
      { id: '2.1', name: 'Your Economic Model', href: 'yrl-mrea-2-1-economic-model.html' },
      { id: '2.2', name: 'Your Conversion Rates', href: 'yrl-mrea-2-2-conversion-rates.html' },
      { id: '2.3', name: 'The Budget Model', href: 'yrl-mrea-2-3-budget-model.html' },
      { id: '2.4', name: 'Database Sizing', href: 'yrl-mrea-2-4-database-sizing.html' },
      { id: '2.5', name: 'Red Light, Green Light', href: 'yrl-mrea-2-5-red-light.html' },
    ]},
    { n: '03', title: 'Build the Machine', mods: [
      { id: '3.1', name: "Met vs Haven't Met", href: 'yrl-mrea-3-1-met-havent-met.html' },
      { id: '3.2', name: 'The 8×8 Builder', href: 'yrl-mrea-3-2-eight-by-eight.html' },
      { id: '3.3', name: 'The 33 Touch Planner', href: 'yrl-mrea-3-3-33-touch.html' },
      { id: '3.4', name: 'The 12 Direct Planner', href: 'yrl-mrea-3-4-12-direct.html' },
      { id: '3.5', name: 'Lead Source Audit', href: 'yrl-mrea-3-5-lead-source-audit.html' },
      { id: '3.6', name: 'Listings as a Lead Engine', href: 'yrl-mrea-3-6-listing-engine.html' },
      { id: '3.7', name: 'The Referral Reward Loop', href: 'yrl-mrea-3-7-referral-loop.html' },
    ]},
    { n: '04', title: 'Leverage & the 7th Level', mods: [
      { id: '4.1', name: 'Capacity vs Cul-de-sac Talent', href: 'yrl-mrea-4-1-capacity-talent.html' },
      { id: '4.2', name: 'Your Three Key Hires', href: 'yrl-mrea-4-2-three-key-hires.html' },
      { id: '4.3', name: 'The 7th Level Locator', href: 'yrl-mrea-4-3-seventh-level.html' },
    ]},
  ];

  const side = document.getElementById('tigerSide');
  if (!side) return;
  const body = document.body;
  const activeMod = body.getAttribute('data-tiger-module');
  const activePage = body.getAttribute('data-tiger-page');

  function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}

  function shell() {
    let total = 0, built = 0;
    const groups = PHASES.map(ph => {
      const rows = ph.mods.map(m => {
        total++; if (m.href) built++;
        const isActive = m.id === activeMod;
        const cls = 'tnav-item' + (m.href ? '' : ' locked') + (isActive ? ' active' : '');
        const inner =
          `<span class="num">${m.id}</span>` +
          `<span class="ttl">${esc(m.name)}</span>` +
          `<span class="tnav-badge" data-badge="${m.id}"></span>`;
        return m.href
          ? `<a class="${cls}" href="${m.href}" data-mod="${m.id}">${inner}</a>`
          : `<div class="${cls}" data-mod="${m.id}">${inner}</div>`;
      }).join('');
      return `<div class="phase-lbl"><span class="pn">${ph.n}</span> ${esc(ph.title)}</div>${rows}`;
    }).join('');

    side.innerHTML = `
      <div class="side-head">
        <a class="brand" href="yrl-mrea-training.html" style="text-decoration:none;color:inherit">
          <span class="mark"><i class="fa-solid fa-mountain-sun"></i></span>
          <span class="wm">Millionaire Agent Path<small>Your Realty Link</small></span>
        </a>
        <div class="side-prog">
          <div class="track"><i id="sideProgBar"></i></div>
          <div class="lbl" id="sideProgLbl">Loading…</div>
        </div>
      </div>
      <nav class="tiger-nav">${groups}</nav>
      <div class="side-pinned">
        <a class="pin-item ${activePage==='overview'?'active':''}" href="yrl-mrea-training.html"><i class="fa-solid fa-compass"></i> Overview</a>
        <a class="pin-item ${activePage==='tracker'?'active':''}" href="yrl-mrea-tracker.html"><i class="fa-solid fa-chart-line"></i> My Scorecard</a>
        <a class="pin-item" href="yrl-mrea-marketing.html"><i class="fa-solid fa-bullhorn"></i> MREA Marketing</a>
      </div>`;
    side._total = total;
  }

  function paint(progress) {
    let done = 0;
    PHASES.forEach(ph => ph.mods.forEach(m => {
      const el = side.querySelector(`[data-badge="${m.id}"]`);
      if (!el) return;
      const p = progress[m.id] || {};
      if (p.done) { el.className = 'tnav-badge done'; el.innerHTML = '<i class="fa-solid fa-check"></i>'; done++; }
      else if (p.pct > 0) { el.className = 'tnav-badge pct'; el.textContent = p.pct + '%'; }
      else if (m.href) { el.className = 'tnav-badge dot'; el.textContent = ''; }
      else { el.className = 'tnav-badge soon'; el.textContent = 'Soon'; }
    }));
    const total = side._total || 1;
    const pct = Math.round((done / total) * 100);
    const bar = document.getElementById('sideProgBar');
    const lbl = document.getElementById('sideProgLbl');
    if (bar) bar.style.width = pct + '%';
    if (lbl) lbl.textContent = pct + '% complete · ' + done + '/' + total;
  }

  function email() {
    const u = window.yrlUser;
    if (u && u.email) return u.email.toLowerCase();
    return (localStorage.getItem('yrl_agent_email') || 'anon').toLowerCase();
  }

  async function loadProgress() {
    const key = `mrea:v1:progress:${email()}`;
    let prog = {};
    try { prog = JSON.parse(localStorage.getItem(key)) || {}; } catch {}
    paint(prog);
    if (typeof loadHubContent === 'function') {
      try { const cloud = await loadHubContent(key); if (cloud) paint(cloud); } catch {}
    }
  }

  /* mobile drawer */
  function wireDrawer() {
    const btn = document.getElementById('tigerMenuBtn');
    const back = document.getElementById('tigerBackdrop');
    const toggle = () => body.classList.toggle('nav-open');
    if (btn) btn.addEventListener('click', toggle);
    if (back) back.addEventListener('click', () => body.classList.remove('nav-open'));
  }

  // module→href lookup for other pages (overview continue button, scorecard)
  window.mreaHref = function (id) {
    for (const ph of PHASES) for (const m of ph.mods) if (m.id === id) return m.href || null;
    return null;
  };
  window.mreaPhases = PHASES;

  shell();
  wireDrawer();
  if (window.yrlUser) loadProgress();
  else {
    document.addEventListener('yrl-auth-ready', loadProgress, { once: true });
    setTimeout(loadProgress, 3000);
  }
})();
