/* ============================================================
   tiger-nav.js — builds the Tiger Training sidebar on every page.
   Requires an empty <aside class="tiger-side" id="tigerSide"></aside>.
   The page marks the active entry via <body> data attributes:
       data-tiger-module="1.1"   (a module page)
       data-tiger-page="overview" | "tracker"
   Reads progress from tiger:v1:progress:<email> (localStorage + hub_content).
   ============================================================ */
(function () {
  'use strict';

  // Single source of truth for the whole path. href = built & linkable.
  const PHASES = [
    { n: '00', title: 'Get in the Game', mods: [
      { id: '0.1', name: 'Getting Licensed & Joining MIBOR', href: 'yrl-tiger-0-1-license-mibor.html' },
      { id: '0.2', name: 'Setting Up Dotloop', href: 'yrl-tiger-0-2-dotloop-setup.html' },
      { id: '0.3', name: 'YRL Tech & Tools Tour', href: 'yrl-tiger-0-3-tech-tools.html' },
      { id: '0.4', name: 'Your Brand & Agent Profile', href: 'yrl-tiger-0-4-brand-profile.html' },
      { id: '0.5', name: 'Office SOPs & How We Work', href: 'yrl-tiger-0-5-office-sops.html' },
    ]},
    { n: '01', title: 'Mindset, Goals & Plan', mods: [
      { id: '1.1', name: 'Your Big Why & Goals', href: 'yrl-tiger-1-1-big-why-goals.html' },
      { id: '1.2', name: 'The Numbers: How Agents Get Paid', href: 'yrl-tiger-1-2-the-numbers.html' },
      { id: '1.3', name: 'Business Planning Clinic', href: 'yrl-tiger-1-3-business-planning.html' },
      { id: '1.4', name: 'Daily Schedule & Time-Blocking', href: 'yrl-tiger-1-4-time-blocking.html' },
    ]},
    { n: '02', title: 'Lead Generation', mods: [
      { id: '2.1', name: 'Your Database / Sphere of Influence', href: 'yrl-tiger-2-1-database-sphere.html' },
      { id: '2.2', name: 'Open Houses That Generate Leads', href: 'yrl-tiger-2-2-open-houses.html' },
      { id: '2.3', name: 'Daily Prospecting & the Pipeline', href: 'yrl-tiger-2-3-prospecting.html' },
      { id: '2.4', name: 'FSBO & Expired Listings', href: 'yrl-tiger-2-4-fsbo-expired.html' },
      { id: '2.5', name: 'Online & Social Media Leads', href: 'yrl-tiger-2-5-online-social-leads.html' },
      { id: '2.6', name: 'Referrals & Past-Client Follow-Up', href: 'yrl-tiger-2-6-referrals-past-clients.html' },
    ]},
    { n: '03', title: 'The Buyer Track', mods: [
      { id: '3.1', name: 'Buyer Consultation + Buyer Rep Agreement', href: 'yrl-tiger-3-1-buyer-consultation-bra.html' },
      { id: '3.2', name: 'Finding & Showing Homes', href: 'yrl-tiger-3-2-finding-showing-homes.html' },
      { id: '3.3', name: 'Writing Offers', href: 'yrl-tiger-3-3-writing-offers.html' },
      { id: '3.4', name: 'Negotiating Win-Win Agreements', href: 'yrl-tiger-3-4-negotiating.html' },
      { id: '3.5', name: 'Buyer Contract-to-Close', href: 'yrl-tiger-3-5-buyer-contract-to-close.html' },
    ]},
    { n: '04', title: 'The Listing Track', mods: [
      { id: '4.1', name: 'Finding Seller Leads', href: 'yrl-tiger-4-1-finding-seller-leads.html' },
      { id: '4.2', name: 'Your Prelisting Packet', href: 'yrl-tiger-4-2-prelisting-packet.html' },
      { id: '4.3', name: 'Pricing Right & Presenting the CMA', href: 'yrl-tiger-4-3-pricing-cma.html' },
      { id: '4.4', name: 'List a Home for Sale', href: 'yrl-tiger-4-4-list-a-home.html' },
      { id: '4.5', name: 'The Listing Appointment', href: 'yrl-tiger-4-5-listing-appointment.html' },
      { id: '4.6', name: 'Marketing & Servicing Your Listings', href: 'yrl-tiger-4-6-marketing-servicing.html' },
      { id: '4.7', name: 'Seller Contract-to-Close', href: 'yrl-tiger-4-7-seller-contract-to-close.html' },
    ]},
    { n: '05', title: 'Systems & Compliance', mods: [
      { id: '5.1', name: 'Dotloop File Compliance', href: 'yrl-tiger-5-1-dotloop-compliance.html' },
      { id: '5.2', name: 'Getting Reviews & Referrals', href: 'yrl-tiger-5-2-reviews-referrals.html' },
      { id: '5.3', name: 'Client Experience & Follow-Up', href: 'yrl-tiger-5-3-client-experience.html' },
    ]},
    { n: '06', title: 'Level Up', mods: [
      { id: '6.1', name: 'Video & Social Presence', href: 'yrl-tiger-6-1-video-social.html' },
      { id: '6.2', name: 'Geographic Farming', href: 'yrl-tiger-6-2-geographic-farming.html' },
      { id: '6.3', name: 'Working with Investors', href: 'yrl-tiger-6-3-investors.html' },
      { id: '6.4', name: 'New Construction', href: 'yrl-tiger-6-4-new-construction.html' },
      { id: '6.5', name: 'Luxury / Move-Up Buyers', href: 'yrl-tiger-6-5-luxury-moveup.html' },
      { id: '6.6', name: 'Building Toward a Team', href: 'yrl-tiger-6-6-building-a-team.html' },
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
        <a class="brand" href="yrl-tiger-training.html" style="text-decoration:none;color:inherit">
          <span class="mark"><i class="fa-solid fa-fire"></i></span>
          <span class="wm">Tiger Training<small>Your Realty Link</small></span>
        </a>
        <div class="side-prog">
          <div class="track"><i id="sideProgBar"></i></div>
          <div class="lbl" id="sideProgLbl">Loading…</div>
        </div>
      </div>
      <nav class="tiger-nav">${groups}</nav>
      <div class="side-pinned">
        <a class="pin-item ${activePage==='overview'?'active':''}" href="yrl-tiger-training.html"><i class="fa-solid fa-compass"></i> Overview</a>
        <a class="pin-item ${activePage==='tracker'?'active':''}" href="yrl-tiger-tracker.html"><i class="fa-solid fa-chart-line"></i> Tiger Tracker</a>
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
    const key = `tiger:v1:progress:${email()}`;
    let prog = {};
    try { prog = JSON.parse(localStorage.getItem(key)) || {}; } catch {}
    paint(prog);                                   // instant paint from local
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

  // expose a module→href lookup for other pages (e.g. the overview continue button)
  window.tigerHref = function (id) {
    for (const ph of PHASES) for (const m of ph.mods) if (m.id === id) return m.href || null;
    return null;
  };

  shell();
  wireDrawer();
  if (window.yrlUser) loadProgress();
  else {
    document.addEventListener('yrl-auth-ready', loadProgress, { once: true });
    setTimeout(loadProgress, 3000); // local-only fallback if auth is slow/down
  }
})();
