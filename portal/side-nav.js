/* ══════════════════════════════════════════════════════════════════════
   side-nav.js — left-hand section navigation for multi-section pages
   ----------------------------------------------------------------------
   Two modes:
     • scroll (default) — sticky rail of jump links; all sections stacked.
     • panel  (opts.panel:true) — boxed side layout matching the tile-grid
       'side' look: grey sidebar of button items + white panel that shows
       ONE section at a time; clicking a rail item switches the panel.
   Rebuilds automatically when sections re-render (dynamic pages) and
   collapses to a horizontal bar on narrow screens.

   Usage:
     SideNav.mount({
       container: '.main',                    // element holding the sections
       sectionSelector: '.guide-section',     // each section
       labelSelector: '.guide-section-label', // heading text inside a section
       panel: true,                           // boxed section-switcher layout
       key: 'yrl-scripts'                      // (panel) localStorage key for active section
     });
   ══════════════════════════════════════════════════════════════════════ */
(function () {
    const esc = (s) => String(s == null ? '' : s)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

    let stylesInjected = false;
    function injectStyles() {
        if (stylesInjected) return; stylesInjected = true;
        const css = `
        .sn-row{display:flex;gap:30px;align-items:flex-start;}
        .sn-rail{position:sticky;top:16px;flex:0 0 200px;max-height:calc(100vh - 32px);overflow-y:auto;
            display:flex;flex-direction:column;gap:4px;padding-right:6px;}
        .sn-rail .sn-heading{font-family:'Bebas Neue',sans-serif;font-size:14px;letter-spacing:1.5px;
            color:var(--text-muted,#9ca3af);text-transform:uppercase;padding:4px 12px 8px;}
        .sn-rail a{display:block;font-size:12.8px;font-weight:600;color:var(--text-sec,#5a6270);
            text-decoration:none;padding:8px 12px;border-radius:8px;border-left:3px solid transparent;
            white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:all .12s;}
        .sn-rail a:hover{background:var(--surface-2,#f7f8fa);color:var(--red,#c03926);}
        .sn-rail a.sn-active{background:rgba(192,57,38,0.08);color:var(--red,#c03926);border-left-color:var(--red,#c03926);}
        .sn-content{flex:1;min-width:0;}
        /* the old top chip bar is redundant once the rail exists */
        .sn-content .section-nav{display:none !important;}
        @media(max-width:900px){
            .sn-row{flex-direction:column;gap:0;}
            .sn-rail{position:sticky;top:0;z-index:20;flex-direction:row;flex-basis:auto;width:100%;
                max-height:none;overflow-x:auto;overflow-y:hidden;gap:6px;padding:10px 0;margin-bottom:14px;
                background:var(--bg,#f2f4f7);border-bottom:1px solid var(--border,#e2e5ea);}
            .sn-rail .sn-heading{display:none;}
            .sn-rail a{border-left:none;border:1.5px solid var(--border,#e2e5ea);border-radius:100px;
                background:#fff;padding:6px 14px;flex-shrink:0;}
            .sn-rail a.sn-active{border-color:var(--red,#c03926);}
        }
        /* ── panel mode: boxed side layout (matches tile-grid 'side') ── */
        .sn-row.sn-panel{gap:0;align-items:stretch;background:var(--surface,#fff);
            border:1px solid var(--border,#e2e5ea);border-radius:16px;overflow:hidden;
            box-shadow:0 4px 20px rgba(0,0,0,0.05);}
        .sn-row.sn-panel > .sn-rail{position:static;flex:0 0 244px;max-height:none;overflow:visible;
            background:var(--surface-2,#f7f8fa);border-right:1px solid var(--border,#e2e5ea);
            padding:16px 14px;gap:5px;}
        .sn-row.sn-panel > .sn-rail a{white-space:normal;line-height:1.25;border:1px solid var(--border,#e2e5ea);
            border-radius:10px;background:var(--surface,#fff);padding:10px 12px;font-size:13px;color:var(--text-sec,#5a6270);}
        .sn-row.sn-panel > .sn-rail a:hover{background:var(--surface-2,#f7f8fa);border-color:var(--text-muted,#9ca3af);color:var(--text,#1a1d22);}
        .sn-row.sn-panel > .sn-rail a.sn-active{background:var(--red,#c03926);border-color:var(--red,#c03926);color:#fff;font-weight:700;}
        .sn-row.sn-panel > .sn-content{padding:22px 24px;min-width:0;}
        @media(max-width:900px){
            .sn-row.sn-panel{flex-direction:column;align-items:stretch;}
            .sn-row.sn-panel > .sn-rail{flex-direction:row;overflow-x:auto;overflow-y:hidden;
                border-right:none;border-bottom:1px solid var(--border,#e2e5ea);margin-bottom:0;}
            .sn-row.sn-panel > .sn-rail a{flex-shrink:0;border-radius:100px;}
            .sn-row.sn-panel > .sn-content{padding:16px;}
            .sn-row.sn-panel > .sn-rail.sn-hasmsel{display:block !important;flex:0 0 auto;overflow:visible;padding:14px;}
            .sn-row.sn-panel > .sn-rail.sn-hasmsel a{display:none;}
            .sn-rail .sn-msel{display:flex;}
        }
        .sn-msel{display:none;position:relative;align-items:center;width:100%;}
        .sn-msel select{width:100%;appearance:none;-webkit-appearance:none;background:var(--surface,#fff);border:1.5px solid var(--border,#e2e5ea);border-radius:12px;padding:13px 42px 13px 14px;font-family:'Inter',sans-serif;font-size:15px;font-weight:700;color:var(--text,#1a1d22);cursor:pointer;}
        .sn-msel select:focus{outline:none;border-color:var(--red,#c03926);}
        .sn-msel i{position:absolute;right:15px;pointer-events:none;color:var(--red,#c03926);font-size:13px;}`;
        const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    }

    function mount(opts) {
        injectStyles();
        const root = document.querySelector(opts.container);
        if (!root || root.querySelector(':scope > .sn-row')) return;
        const secSel = opts.sectionSelector;
        const labSel = opts.labelSelector;
        const heading = opts.navTitle || 'On this page';
        const PANEL = !!opts.panel;
        const LS = 'sn-active:' + (opts.key || opts.container);

        /* Build the two-column layout once. */
        const row = document.createElement('div'); row.className = 'sn-row' + (PANEL ? ' sn-panel' : '');
        const rail = document.createElement('aside'); rail.className = 'sn-rail';
        const content = document.createElement('div'); content.className = 'sn-content';
        /* opts.hide = drop redundant top nav; opts.above = keep intros/disclaimers above the boxed row */
        const above = [];
        [...root.childNodes].forEach((c) => {
            if (c.nodeType === 1 && opts.hide && c.matches && c.matches(opts.hide)) { root.removeChild(c); return; }
            if (c.nodeType === 1 && opts.above && c.matches && c.matches(opts.above)) { above.push(c); return; }
            content.appendChild(c);
        });
        row.appendChild(rail); row.appendChild(content);
        above.forEach((el) => root.appendChild(el));
        root.appendChild(row);

        const label = (sec) => {
            const el = sec.querySelector(labSel);
            let t = el ? el.textContent.trim() : (sec.getAttribute('data-nav') || 'Section');
            return t.replace(/\s+/g, ' ').trim();
        };

        let activeId = null;
        try { activeId = localStorage.getItem(LS); } catch (e) { /* */ }

        /* A tab asked for by the hub sidebar may arrive before a dynamic page has rendered
           its sections — hold it (wantId) until that section exists instead of falling back. */
        let wantId = null;
        function applyPanel() {
            if (!PANEL) return;
            const secs = [...content.querySelectorAll(secSel)];
            if (wantId && secs.some(s => s.id === wantId)) { activeId = wantId; wantId = null; }
            if (!secs.some(s => s.id === activeId)) activeId = secs[0] ? secs[0].id : null;
            secs.forEach(s => { s.style.display = (s.id === activeId) ? '' : 'none'; });
            rail.querySelectorAll('a').forEach(a => a.classList.toggle('sn-active', a.getAttribute('href') === '#' + activeId));
            const ms = rail.querySelector('.sn-msel select'); if (ms && activeId) ms.value = activeId;
            // hub sidebar highlight follows whichever section is showing (only when it actually changes)
            if (activeId && activeId !== lastReported && window.__yrlTabChanged) { lastReported = activeId; window.__yrlTabChanged(activeId); }
        }
        let lastReported = null;

        let building = false;
        function build() {
            if (building) return;
            const secs = [...content.querySelectorAll(secSel)];
            secs.forEach((s, i) => { if (!s.id) s.id = 'sn-sec-' + i; s.style.scrollMarginTop = '16px'; });
            /* panel mode on phones: the section chips become one dropdown (CSS swaps at ≤900px) */
            const msel = PANEL && secs.length > 2
                ? `<label class="sn-msel"><select aria-label="Choose a section">${secs.map(s => `<option value="${esc(s.id)}">${esc(label(s))}</option>`).join('')}</select><i class="fa-solid fa-chevron-down"></i></label>`
                : '';
            rail.classList.toggle('sn-hasmsel', !!msel);
            rail.innerHTML = msel + (secs.length && !PANEL ? `<div class="sn-heading">${esc(heading)}</div>` : '') +
                secs.map(s => `<a href="#${s.id}">${esc(label(s))}</a>`).join('');
            rail.style.display = secs.length > 1 ? '' : 'none';
            if (PANEL) applyPanel();
        }
        build();

        /* Hub sidebar 3rd level: let the hub switch the visible section. */
        if (PANEL && window.__yrlRegisterTabs) {
            window.__yrlRegisterTabs(function (id) {
                wantId = id;
                try { localStorage.setItem(LS, id); } catch (_) { /* */ }
                applyPanel();
            });
        }

        /* Dynamic pages rebuild their sections — keep the rail in sync. */
        let t;
        const obs = new MutationObserver(() => { clearTimeout(t); t = setTimeout(build, 60); });
        obs.observe(content, { childList: true, subtree: true });

        rail.addEventListener('change', (e) => {
            const sel = e.target.closest('.sn-msel select'); if (!sel || !PANEL) return;
            activeId = sel.value;
            try { localStorage.setItem(LS, activeId); } catch (_) { /* */ }
            applyPanel();
            row.scrollIntoView({ block: 'nearest' });
        });
        rail.addEventListener('click', (e) => {
            const a = e.target.closest('a'); if (!a) return;
            e.preventDefault();
            if (PANEL) {
                activeId = a.getAttribute('href').slice(1);
                try { localStorage.setItem(LS, activeId); } catch (_) { /* */ }
                applyPanel();
                row.scrollIntoView({ block: 'nearest' });
            } else {
                const target = document.querySelector(a.getAttribute('href'));
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });

        /* scroll-spy only in scroll mode */
        if (!PANEL) {
            const spy = new IntersectionObserver((entries) => {
                entries.forEach(en => {
                    if (!en.isIntersecting) return;
                    rail.querySelectorAll('a').forEach(a => a.classList.toggle('sn-active', a.getAttribute('href') === '#' + en.target.id));
                });
            }, { rootMargin: '-10% 0px -80% 0px' });
            content.querySelectorAll(secSel).forEach(s => spy.observe(s));
        }
        obs.takeRecords();
    }

    window.SideNav = { mount };
})();
