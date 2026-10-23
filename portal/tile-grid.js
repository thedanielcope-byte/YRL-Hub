/* ══════════════════════════════════════════════════════════════════════
   tile-grid.js — editable tiles for a hub sub-page, in two layouts
   ----------------------------------------------------------------------
   Store shape (hub_content):
     { sections:[{id,name,icon,desc,tiles:[{id,title,desc,icon,pill,link}]}] }

   Two layouts:
     • 'grid' (default) — card sections (Buyer & Seller tool pages).
     • 'list' — collapsible sections + a searchable row list where clicking
       a row expands its detail INLINE (no popup). Used by the Marketing page.

   Owner/admin edit (PIN 1984 via editGate): add/edit/delete tiles, drag to
   reorder (within & across sections), add/rename/delete sections.

   Depends on: hub-data.js, portal-auth.js, edit-gate.js.
   Mount:  TileGrid.mount({ container:'#el', key:'yrl-…', layout:'list' })
   ══════════════════════════════════════════════════════════════════════ */
(function () {
    const uid = () => Math.random().toString(36).slice(2, 9);
    const esc = (s) => String(s == null ? '' : s)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const isOwner = () => !!(window.yrlMember && (window.yrlMember.role === 'owner' || window.yrlMember.role === 'nomad_admin'));
    const isExt = (l) => /^https?:\/\//i.test(l || '');
    const isMail = (l) => /^mailto:/i.test(l || '');
    const hasLink = (l) => !!(l && l.trim());
    /* A link that points at an actual FILE should DOWNLOAD on click, not open a tab.
       Site pages / forms / .html tools still open. Supabase storage forces the
       download via its ?download= param (a cross-origin `download` attr alone won't). */
    const FILE_RX = /\.(pdf|png|jpe?g|gif|webp|svg|docx?|xlsx?|pptx?|csv|txt|zip)(\?|#|$)/i;
    const IMG_RX = /\.(png|jpe?g|gif|webp|svg|avif)(\?|#|$)/i;
    const isImg = (l) => IMG_RX.test(l || '');
    const isStorage = (l) => /\/storage\/v1\/object\/public\//i.test(l || '');
    const isDownloadable = (l) => !!l && (isStorage(l) || FILE_RX.test(l));
    const downloadHref = (l) => isStorage(l) ? (l + (l.indexOf('?') > -1 ? '&' : '?') + 'download=') : l;

    async function mount(opts) {
        const el = typeof opts.container === 'string' ? document.querySelector(opts.container) : opts.container;
        if (!el) return;
        const KEY = opts.key;
        const LAYOUT = opts.layout || 'grid';
        // ?subtabs (added by the hub's nomad frame) → render the 'side' category rail as a horizontal top-tab strip
        let SUBTABS = false; try { SUBTABS = new URLSearchParams(location.search).has('subtabs'); } catch (e) {}
        const RAIL = !!opts.rail;   // force the LEFT COLUMN rail even with ≤4 categories (e.g. Meetings by year)
        const TOP = !!opts.top;     // force the TOP-TAB row even with 5+ categories (e.g. Brand Assets)
        const TILES = !!opts.tiles; // render view-mode items as TILE CARDS (grid) instead of list rows (e.g. Brand Assets)
        const SIDEBAR_LINKS = Array.isArray(opts.sidebarLinks) ? opts.sidebarLinks : [];
        let state = { sections: [] };
        let edit = false;
        let drag = null; // { secId, tileId }

        /* list/side-mode UI state */
        let query = '';
        const openSecs = new Set();
        const openItems = new Set();
        let activeSec = null;
        let refocusSearch = false;
        const OPEN_LS = 'tg-open:' + KEY;
        const ACTIVE_LS = 'tg-active:' + KEY;
        try { activeSec = localStorage.getItem(ACTIVE_LS) || null; } catch (e) { /* */ }
        try {
            const saved = JSON.parse(localStorage.getItem(OPEN_LS) || '[]');
            if (Array.isArray(saved)) saved.forEach(id => openSecs.add(id));
        } catch (e) { /* */ }
        function persistOpen() {
            try { localStorage.setItem(OPEN_LS, JSON.stringify(Array.from(openSecs))); } catch (e) {}
        }

        try {
            const data = (typeof loadHubContent === 'function') ? await loadHubContent(KEY) : null;
            if (data && Array.isArray(data.sections)) state = data;
        } catch (e) { /* */ }

        /* ── Sourced sections: tiles come LIVE from another hub_content key (single source of
              truth). e.g. Buyer Tools "Lenders & Financing" mirrors the Vendor Directory's
              lenders category — `section.source = "yrl-vendors-state:lenders"`. We hydrate the
              tiles at load, never persist them, and render them read-only (edit in the source). */
        function vendorToTile(v) {
            const site = String(v.website || '').trim();
            const link = site ? (/^https?:\/\//i.test(site) ? site : 'https://' + site)
                              : (v.email ? 'mailto:' + v.email : '');
            const desc = [v.contact, v.phone, v.email, v.notes].filter(Boolean).join(' · ');
            return { id: 'src_' + (v.id || uid()), title: (v.company || v.contact || 'Vendor'),
                     desc: desc, icon: 'fa-solid fa-building-columns', pill: 'Lender', link: link };
        }
        async function hydrateSources() {
            const sourced = (state.sections || []).filter(s => s.source);
            for (const s of sourced) {
                s._sourced = true;
                try {
                    const bits = String(s.source).split(':');
                    const data = (typeof loadHubContent === 'function') ? await loadHubContent(bits[0]) : null;
                    const cats = (data && Array.isArray(data.categories)) ? data.categories : [];
                    const cat = cats.find(c => c.id === bits[1]) || null;
                    s.tiles = (cat && Array.isArray(cat.vendors)) ? cat.vendors.map(vendorToTile) : [];
                } catch (e) { s.tiles = []; }
            }
        }
        await hydrateSources();

        async function save() {
            // Never persist a sourced section's live tiles — keep only the pointer.
            const clean = Object.assign({}, state, { sections: (state.sections || []).map(function (s) {
                const c = Object.assign({}, s); delete c._sourced;
                if (s.source) c.tiles = [];
                return c;
            }) });
            try { if (typeof saveHubContent === 'function') await saveHubContent(KEY, clean); }
            catch (e) { alert('Could not save: ' + (e.message || e)); }
        }
        const sec = id => state.sections.find(s => s.id === id);

        /* ════════════════ GRID LAYOUT (unchanged) ════════════════ */
        function tileHtml(s, t) {
            const ext = isExt(t.link);
            const inner = `
                <div class="card-icon"><i class="${esc(t.icon || 'fa-solid fa-star')}"></i></div>
                <h3>${esc(t.title)}</h3>
                <p>${esc(t.desc || '')}</p>
                <div class="card-footer"><span class="pill">${esc(t.pill || 'Tool')}</span><i class="fa-solid fa-arrow-right"></i></div>`;
            if (edit) {
                return `<div class="card tg-edit" data-sec="${s.id}" data-tile="${t.id}" draggable="true"
                    ondragstart="__tg_dragStart('${s.id}','${t.id}')" ondragend="__tg_dragEnd()"
                    ondragover="__tg_over(event,'${s.id}','${t.id}')" ondrop="__tg_drop(event,'${s.id}','${t.id}')"
                    onclick="__tg_editTile('${s.id}','${t.id}')">
                    <button class="tg-x" title="Delete" onclick="event.stopPropagation();__tg_delTile('${s.id}','${t.id}')">&times;</button>
                    ${inner}<div class="tg-hint">Drag to move · click to edit</div></div>`;
            }
            const attrs = ext ? ' target="_blank" rel="noopener"' : '';
            return `<a href="${esc(t.link || '#')}"${attrs} class="card">${inner}</a>`;
        }

        function renderGrid() {
            const canEdit = isOwner();
            const editBtn = canEdit
                ? `<button class="tg-editbtn ${edit ? 'on' : ''}" onclick="__tg_toggle()">${edit ? '<i class="fa-solid fa-check"></i> Done editing' : '<i class="fa-solid fa-pen"></i> Edit tools'}</button>`
                : '';
            let html = `<div class="tg-top">${editBtn}</div>`;
            state.sections.forEach(s => {
                const ctrl = edit ? `<span class="tg-secctrl">
                    <button title="Rename" onclick="__tg_renameSec('${s.id}')"><i class="fa-solid fa-pen"></i></button>
                    <button title="Delete section" onclick="__tg_delSec('${s.id}')"><i class="fa-solid fa-trash"></i></button></span>` : '';
                html += `<section class="section" id="tgsec-${s.id}">
                    <div class="sec-header">
                        <div class="sec-icon"><i class="${esc(s.icon || 'fa-solid fa-folder')}"></i></div>
                        <div><h2>${esc(s.name)}${ctrl}</h2>${s.desc ? `<p>${esc(s.desc)}</p>` : ''}</div>
                    </div>
                    <div class="card-grid" ondragover="__tg_over(event,'${s.id}',null)" ondrop="__tg_drop(event,'${s.id}',null)">
                        ${(s.tiles || []).map(t => tileHtml(s, t)).join('')}
                        ${edit ? `<button class="tg-add" onclick="__tg_addTile('${s.id}')"><i class="fa-solid fa-plus"></i> Add tile</button>` : ''}
                    </div>
                </section>`;
            });
            if (edit) html += `<button class="tg-addsec" onclick="__tg_addSec()"><i class="fa-solid fa-plus"></i> Add section</button>`;
            el.innerHTML = html;
        }

        /* ════════════════ LIST LAYOUT (collapsible + search + inline detail) ════════════════ */
        function pillClass(p) {
            const v = String(p || '').toLowerCase();
            if (v === 'soon') return 'tg-p-soon';
            if (v === 'training' || v === 'external' || v === 'link') return 'tg-p-blue';
            return 'tg-p-red';
        }
        function matchQ(t) {
            if (!query) return true;
            const q = query.toLowerCase();
            return (t.title || '').toLowerCase().includes(q) || (t.desc || '').toLowerCase().includes(q);
        }
        function actionHtml(t) {
            if (!hasLink(t.link)) return `<span class="tg-soon"><i class="fa-regular fa-clock"></i> Coming soon</span>`;
            const ext = isExt(t.link), mail = isMail(t.link);
            const attrs = ext ? ' target="_blank" rel="noopener"' : '';
            const label = mail ? 'Send request' : (ext ? 'Open' : 'Open / Download');
            const icon = mail ? 'fa-solid fa-paper-plane' : (ext ? 'fa-solid fa-arrow-up-right-from-square' : 'fa-solid fa-arrow-right');
            return `<a class="tg-open" href="${esc(t.link)}"${attrs}>${label} <i class="${icon}"></i></a>`;
        }
        function rowHtml(s, t) {
            const open = openItems.has(t.id);
            const pill = `<span class="tg-lipill ${pillClass(t.pill)}">${esc(t.pill || 'Tool')}</span>`;
            if (edit) {
                return `<div class="tg-li tg-liedit" draggable="true"
                    ondragstart="__tg_dragStart('${s.id}','${t.id}')" ondragend="__tg_dragEnd()"
                    ondragover="__tg_over(event,'${s.id}','${t.id}')" ondrop="__tg_drop(event,'${s.id}','${t.id}')">
                    <span class="tg-ligrip" title="Drag to reorder"><i class="fa-solid fa-grip-vertical"></i></span>
                    <span class="tg-liicon"><i class="${esc(t.icon || 'fa-solid fa-star')}"></i></span>
                    <span class="tg-lititle">${esc(t.title)}</span>
                    ${pill}
                    <button class="tg-liedbtn" title="Edit" onclick="__tg_editTile('${s.id}','${t.id}')"><i class="fa-solid fa-pen"></i></button>
                    <button class="tg-lix" title="Delete" onclick="__tg_delTile('${s.id}','${t.id}')">&times;</button>
                </div>`;
            }
            return `<div class="tg-li${open ? ' open' : ''}">
                <button class="tg-lihead" onclick="__tg_toggleItem('${t.id}')">
                    <span class="tg-liicon"><i class="${esc(t.icon || 'fa-solid fa-star')}"></i></span>
                    <span class="tg-lititle">${esc(t.title)}</span>
                    ${pill}
                    <i class="tg-lichev fa-solid fa-chevron-down"></i>
                </button>
                ${open ? `<div class="tg-lidetail">
                    <p>${esc(t.desc) || '<span class="tg-nodesc">No description yet.</span>'}</p>
                    ${actionHtml(t)}
                </div>` : ''}
            </div>`;
        }
        function renderList() {
            const canEdit = isOwner();
            const editBtn = canEdit
                ? `<button class="tg-editbtn ${edit ? 'on' : ''}" onclick="__tg_toggle()">${edit ? '<i class="fa-solid fa-check"></i> Done editing' : '<i class="fa-solid fa-pen"></i> Edit tools'}</button>`
                : '';
            let html = `<div class="tg-ltop">
                ${edit ? '' : `<div class="tg-search"><i class="fa-solid fa-magnifying-glass"></i>
                    <input id="tg-q" type="search" placeholder="Search marketing…" value="${esc(query)}" oninput="__tg_search(this.value)">
                    ${query ? `<button class="tg-qx" title="Clear" onclick="__tg_search('')">&times;</button>` : ''}</div>
                    <div class="tg-allbtns"><button class="tg-xall" onclick="__tg_expandAll()">Expand all</button><button class="tg-xall" onclick="__tg_collapseAll()">Collapse all</button></div>`}
                ${editBtn}
            </div>`;

            let shown = 0;
            state.sections.forEach(s => {
                const all = (s.tiles || []);
                const tiles = all.filter(matchQ);
                if (query && !tiles.length) return;                 // hide empty sections while searching
                const isOpen = edit || query ? true : openSecs.has(s.id);
                shown++;
                html += `<div class="tg-lsec">
                    <button class="tg-lsec-bar${isOpen ? ' open' : ''}" onclick="__tg_toggleSec('${s.id}')">
                        <span class="tg-lsec-icon"><i class="${esc(s.icon || 'fa-solid fa-folder')}"></i></span>
                        <span class="tg-lsec-txt"><span class="tg-lsec-name">${esc(s.name)}</span>${s.desc ? `<span class="tg-lsec-desc">${esc(s.desc)}</span>` : ''}</span>
                        <span class="tg-lsec-count">${tiles.length}${query ? ' found' : ''}</span>
                        ${edit ? `<span class="tg-secctrl" onclick="event.stopPropagation()">
                            <button title="Rename" onclick="__tg_renameSec('${s.id}')"><i class="fa-solid fa-pen"></i></button>
                            <button title="Delete section" onclick="__tg_delSec('${s.id}')"><i class="fa-solid fa-trash"></i></button></span>` : ''}
                        <i class="tg-lsec-chev fa-solid fa-chevron-down"></i>
                    </button>
                    ${isOpen ? `<div class="tg-lsec-list" ondragover="__tg_over(event,'${s.id}',null)" ondrop="__tg_drop(event,'${s.id}',null)">
                        ${tiles.map(t => rowHtml(s, t)).join('') || (edit ? '' : '<div class="tg-liempty">Nothing here yet.</div>')}
                        ${edit ? `<button class="tg-liadd" onclick="__tg_addTile('${s.id}')"><i class="fa-solid fa-plus"></i> Add item</button>` : ''}
                    </div>` : ''}
                </div>`;
            });
            if (query && !shown) html += `<div class="tg-noresults">No marketing items match “${esc(query)}”.</div>`;
            if (edit) html += `<button class="tg-addsec" onclick="__tg_addSec()"><i class="fa-solid fa-plus"></i> Add section</button>`;
            el.innerHTML = html;

            if (refocusSearch) {
                const q = document.getElementById('tg-q');
                if (q) { q.focus(); const v = q.value; q.value = ''; q.value = v; }
                refocusSearch = false;
            }
        }

        /* ════════════════ SIDE LAYOUT (left section menu + content panel) ════════════════ */
        const hexOf = (t) => { const m = (String(t.title || '') + ' ' + String(t.desc || '')).match(/#[0-9a-fA-F]{3,8}\b/); return m ? m[0] : null; };
        function actionHtmlSide(t) {
            if (t.noaction) return '';   // "info only" tile (e.g. a brand color) — no link, no "Coming soon"
            if (!hasLink(t.link)) return `<span class="tg-ic-soon"><i class="fa-regular fa-clock"></i> Coming soon</span>`;
            const dl = isDownloadable(t.link), mail = isMail(t.link), ext = isExt(t.link) && !dl;
            const label = dl ? 'Download' : (mail ? 'Send request' : 'Open');
            const icon = dl ? 'fa-solid fa-download' : (mail ? 'fa-solid fa-paper-plane' : (ext ? 'fa-solid fa-arrow-up-right-from-square' : 'fa-solid fa-arrow-right'));
            return `<span class="tg-ic-open">${label} <i class="${icon}"></i></span>`;
        }
        function itemCardSide(s, t, ro) {
            ro = ro || !!s.source;   // sourced (synced) sections are read-only here
            /* a "heading" tile is a sub-divider inside a section (e.g. "Handouts") */
            if (t.heading) {
                if (!edit) return `<div class="tg-subhead">${esc(t.title || 'Section')}</div>`;
                return `<div class="tg-subhead tg-subhead-edit" draggable="true"
                    ondragstart="__tg_dragStart('${s.id}','${t.id}')" ondragend="__tg_dragEnd()"
                    ondragover="__tg_over(event,'${s.id}','${t.id}')" ondrop="__tg_drop(event,'${s.id}','${t.id}')"
                    onclick="__tg_editTile('${s.id}','${t.id}')">
                    <span class="tg-ligrip"><i class="fa-solid fa-grip-vertical"></i></span>
                    <span class="tg-subhead-lbl">${esc(t.title || 'Section')}</span>
                    <span class="tg-subhead-tag">heading</span>
                    <button class="tg-x" title="Delete" onclick="event.stopPropagation();__tg_delTile('${s.id}','${t.id}')">&times;</button></div>`;
            }
            const hasImg = isImg(t.link);
            const swatch = t.noaction ? hexOf(t) : null;   // brand-color tiles show a swatch
            const media = swatch ? `<div class="tg-ic-swatch" style="background:${esc(swatch)}"></div>`
                : (hasImg ? `<div class="tg-ic-thumb"><img src="${esc(t.link)}" alt="" loading="lazy"></div>` : '');
            const inner = `
                ${media}
                <div class="tg-ic-top">${(hasImg || swatch) ? '' : `<span class="tg-ic-icon"><i class="${esc(t.icon || 'fa-solid fa-star')}"></i></span>`}<span class="tg-lipill ${pillClass(t.pill)}">${esc(t.pill || 'Tool')}</span></div>
                <div class="tg-ic-title">${esc(t.title)}</div>
                ${t.desc ? `<div class="tg-ic-desc">${esc(t.desc)}</div>` : ''}
                ${actionHtmlSide(t)}`;
            if (edit) {
                return `<div class="tg-ic tg-ic-edit" draggable="true"
                    ondragstart="__tg_dragStart('${s.id}','${t.id}')" ondragend="__tg_dragEnd()"
                    ondragover="__tg_over(event,'${s.id}','${t.id}')" ondrop="__tg_drop(event,'${s.id}','${t.id}')"
                    onclick="__tg_editTile('${s.id}','${t.id}')">
                    <button class="tg-x" title="Delete" onclick="event.stopPropagation();__tg_delTile('${s.id}','${t.id}')">&times;</button>
                    ${inner}<div class="tg-hint">Drag · click to edit</div></div>`;
            }
            if (edit && ro) return `<div class="tg-ic tg-ic-ro">${inner}</div>`;   // synced tile, not editable here
            /* TILES view mode = a clickable card (grid), like Buyer/Seller tool tiles */
            if (TILES) {
                if (t.noaction) return `<div class="tg-ic tg-ic-info">${inner}</div>`;
                if (!hasLink(t.link)) return `<div class="tg-ic tg-ic-soon-card">${inner}</div>`;
                const dl2 = isDownloadable(t.link);
                const ext2 = isExt(t.link) && !dl2;
                const href2 = dl2 ? downloadHref(t.link) : t.link;
                const attrs2 = dl2 ? ' download' : (ext2 ? ' target="_blank" rel="noopener"' : '');
                return `<a class="tg-ic" href="${esc(href2)}"${attrs2}>${inner}</a>`;
            }
            /* view mode = list row */
            const rowInner = `
                <span class="tg-ic-icon"><i class="${esc(t.icon || 'fa-solid fa-star')}"></i></span>
                <div class="tg-lrow-main">
                    <div class="tg-lrow-head"><span class="tg-ic-title">${esc(t.title)}</span><span class="tg-lipill ${pillClass(t.pill)}">${esc(t.pill || 'Tool')}</span></div>
                    ${t.desc ? `<div class="tg-ic-desc">${esc(t.desc)}</div>` : ''}
                </div>
                ${actionHtmlSide(t)}`;
            if (t.noaction) return `<div class="tg-ic tg-lrow tg-ic-info">${rowInner}</div>`;
            if (!hasLink(t.link)) return `<div class="tg-ic tg-lrow tg-ic-soon-card">${rowInner}</div>`;
            const dl = isDownloadable(t.link);
            const ext = isExt(t.link) && !dl;
            const href = dl ? downloadHref(t.link) : t.link;
            const attrs = dl ? ' download' : (ext ? ' target="_blank" rel="noopener"' : '');
            return `<a class="tg-ic tg-lrow" href="${esc(href)}"${attrs}>${rowInner}</a>`;
        }
        function pinnedTileHtml(t) {
            const dl = isDownloadable(t.link), ext = isExt(t.link) && !dl, has = hasLink(t.link);
            const href = has ? (dl ? downloadHref(t.link) : t.link) : '#';
            const attrs = dl ? ' download' : (ext ? ' target="_blank" rel="noopener"' : '');
            const go = dl ? 'fa-download' : (ext ? 'fa-arrow-up-right-from-square' : 'fa-arrow-right');
            return `<a class="tg-pin" href="${esc(href)}"${attrs}>
                <span class="tg-pin-ic"><i class="${esc(t.icon || 'fa-solid fa-link')}"></i></span>
                <span class="tg-pin-name">${esc(t.title)}</span>
                <i class="tg-pin-go fa-solid ${go}"></i></a>`;
        }
        function renderSide() {
            const canEdit = isOwner();
            // Pinned sections render as TILES on top (view mode) and drop out of the tab row.
            const pinnedSecs = state.sections.filter(s => s.pinned);
            const tabSecs = edit ? state.sections : state.sections.filter(s => !s.pinned);
            if (!activeSec || !tabSecs.some(s => s.id === activeSec)) activeSec = tabSecs[0] ? tabSecs[0].id : null;
            /* In the nomad frame (SUBTABS): ≤4 TABBED categories → segmented TOP-TAB row;
               5+ keep the LEFT COLUMN rail. Pinned sections don't count toward the tabs. */
            const useTop = SUBTABS && !RAIL && (TOP || tabSecs.length <= 4);
            const editBtn = canEdit
                ? `<button class="tg-editbtn ${edit ? 'on' : ''}" onclick="__tg_toggle()">${edit ? '<i class="fa-solid fa-check"></i> Done editing' : '<i class="fa-solid fa-pen"></i> Edit tools'}</button>`
                : '';

            /* pinned quick-access tiles (Important-#'s style), above the tabs — view mode only.
               Each pinned section shows its NAME as a heading (editable via the section modal). */
            let pinnedHtml = '';
            if (!edit && !query && pinnedSecs.length) {
                pinnedHtml = pinnedSecs.map(s => {
                    const pt = (s.tiles || []).filter(t => !t.heading && hasLink(t.link));
                    if (!pt.length) return '';
                    return `<div class="tg-pinsec">${s.name ? `<div class="tg-pinlbl">${esc(s.name)}</div>` : ''}<div class="tg-pinned">${pt.map(pinnedTileHtml).join('')}</div></div>`;
                }).join('');
            }

            /* left menu (from the tabbed sections only) */
            let nav = '';
            /* link-out items (e.g. MREA Marketing) — live outside state.sections (never clobbered);
               their POSITION is stored in state.linkPos so the owner can reorder them in edit mode */
            const hasLinks = SIDEBAR_LINKS.length > 0;
            const linkPos = hasLinks ? Math.max(0, Math.min(typeof state.linkPos === 'number' ? state.linkPos : 0, tabSecs.length)) : 0;
            const _ext = '<i class="fa-solid fa-arrow-up-right-from-square"></i>';
            function renderLinks() {
                if (!hasLinks) return '';
                if (edit) {
                    const rows = SIDEBAR_LINKS.map((lnk) => `<span class="tg-navsel" style="cursor:default;">
                        <span class="tg-navicon"><i class="${esc(lnk.icon || 'fa-solid fa-arrow-up-right-from-square')}"></i></span>
                        <span class="tg-navname">${esc(lnk.name || 'Link')}</span>
                        <span class="tg-navcount">${_ext}</span></span>`).join('');
                    return `<div class="tg-navitem tg-navedit tg-navlink">${rows}
                        <span class="tg-navctrl">
                            <button title="Move up" onclick="__tg_moveLink(-1)" ${linkPos <= 0 ? 'disabled' : ''}><i class="fa-solid fa-chevron-up"></i></button>
                            <button title="Move down" onclick="__tg_moveLink(1)" ${linkPos >= tabSecs.length ? 'disabled' : ''}><i class="fa-solid fa-chevron-down"></i></button>
                        </span></div>`;
                }
                return SIDEBAR_LINKS.map((lnk) => `<a class="tg-navitem tg-navlink" href="${esc(lnk.href || '#')}">
                    <span class="tg-navicon"><i class="${esc(lnk.icon || 'fa-solid fa-arrow-up-right-from-square')}"></i></span>
                    <span class="tg-navname">${esc(lnk.name || 'Link')}</span>
                    <span class="tg-navcount">${_ext}</span></a>`).join('');
            }
            tabSecs.forEach((s, i) => {
                if (hasLinks && i === linkPos) nav += renderLinks();
                const on = s.id === activeSec && !query;
                const cnt = (s.tiles || []).filter(t => !t.heading).length;
                if (edit) {
                    nav += `<div class="tg-navitem tg-navedit${on ? ' on' : ''}${s.pinned ? ' tg-navpinned' : ''}">
                        <button class="tg-navsel" onclick="__tg_pick('${s.id}')">
                            <span class="tg-navicon"><i class="${esc(s.pinned ? 'fa-solid fa-thumbtack' : (s.icon || 'fa-solid fa-folder'))}"></i></span>
                            <span class="tg-navname">${esc(s.name)}${s.pinned ? ' <span class="tg-pinbadge">Pinned</span>' : ''}</span>
                            <span class="tg-navcount">${cnt}</span>
                        </button>
                        <span class="tg-navctrl">
                            <button title="Move up" onclick="__tg_moveSec('${s.id}',-1)" ${i === 0 ? 'disabled' : ''}><i class="fa-solid fa-chevron-up"></i></button>
                            <button title="Move down" onclick="__tg_moveSec('${s.id}',1)" ${i === tabSecs.length - 1 ? 'disabled' : ''}><i class="fa-solid fa-chevron-down"></i></button>
                            <button title="Rename section" onclick="__tg_renameSec('${s.id}')"><i class="fa-solid fa-pen"></i></button>
                        </span>
                    </div>`;
                } else {
                    nav += `<button class="tg-navitem${on ? ' on' : ''}" onclick="__tg_pick('${s.id}')">
                        <span class="tg-navicon"><i class="${esc(s.icon || 'fa-solid fa-folder')}"></i></span>
                        <span class="tg-navname">${esc(s.name)}</span>
                        <span class="tg-navcount">${cnt}</span>
                    </button>`;
                }
            });
            if (hasLinks && linkPos >= tabSecs.length) nav += renderLinks();
            if (edit) nav += `<button class="tg-navadd" onclick="__tg_addSec()"><i class="fa-solid fa-plus"></i> Add section</button>`;

            /* Phones: the category buttons become ONE dropdown (view mode only — edit keeps the
               buttons for their reorder controls). CSS swaps them at ≤760px. */
            let msel = '';
            if (!edit && tabSecs.length + (hasLinks ? SIDEBAR_LINKS.length : 0) > 2) {
                const opts = [];
                const linkOpts = () => SIDEBAR_LINKS.forEach((lnk, li) => opts.push(`<option value="link:${li}">${esc(lnk.name || 'Link')} ↗</option>`));
                if (query) opts.push('<option value="" selected disabled>Search results</option>');
                tabSecs.forEach((s, i) => {
                    if (hasLinks && i === linkPos) linkOpts();
                    const cnt = (s.tiles || []).filter(t => !t.heading).length;
                    opts.push(`<option value="${esc(s.id)}"${s.id === activeSec && !query ? ' selected' : ''}>${esc(s.name)} (${cnt})</option>`);
                });
                if (hasLinks && linkPos >= tabSecs.length) linkOpts();
                msel = `<label class="tg-msel"><select aria-label="Choose a category" onchange="__tg_msel(this.value)">${opts.join('')}</select><i class="fa-solid fa-chevron-down"></i></label>`;
            }

            /* right panel */
            let panel = '';
            if (query) {
                const hits = [];
                state.sections.forEach(s => (s.tiles || []).forEach(t => { if (matchQ(t)) hits.push([s, t]); }));
                panel = `<div class="tg-phead"><div><h2 class="tg-pname">${hits.length} result${hits.length === 1 ? '' : 's'}</h2><p class="tg-pdesc">Matching “${esc(query)}”</p></div></div>`;
                panel += `<div class="tg-icgrid${(edit || TILES) ? '' : ' tg-icgrid--list'}">${hits.map(([s, t]) => itemCardSide(s, t)).join('') || '<div class="tg-liempty">No matches.</div>'}</div>`;
            } else {
                const s = sec(activeSec);
                if (s) {
                    const ctrl = edit ? `<span class="tg-secctrl">
                        <button title="Rename" onclick="__tg_renameSec('${s.id}')"><i class="fa-solid fa-pen"></i></button>
                        <button title="Delete section" onclick="__tg_delSec('${s.id}')"><i class="fa-solid fa-trash"></i></button></span>` : '';
                    panel = `<div class="tg-phead">
                        <span class="tg-picon"><i class="${esc(s.icon || 'fa-solid fa-folder')}"></i></span>
                        <div><h2 class="tg-pname">${esc(s.name)}${ctrl}</h2>${s.desc ? `<p class="tg-pdesc">${esc(s.desc)}</p>` : ''}</div>
                    </div>`;
                    const drop = s.source ? '' : ` ondragover="__tg_over(event,'${s.id}',null)" ondrop="__tg_drop(event,'${s.id}',null)"`;
                    panel += (edit && s.source ? `<div class="tg-syncnote"><i class="fa-solid fa-rotate"></i> Synced from the Vendor Directory — add or remove these there and they update here automatically.</div>` : '');
                    panel += `<div class="tg-icgrid${(edit || TILES) ? '' : ' tg-icgrid--list'}"${drop}>
                        ${(s.tiles || []).map(t => itemCardSide(s, t)).join('')}
                        ${(edit && !s.source) ? `<button class="tg-icadd" onclick="__tg_addTile('${s.id}')"><i class="fa-solid fa-plus"></i> Add item</button>` : ''}
                    </div>`;
                } else {
                    panel = '<div class="tg-liempty">No sections yet.</div>';
                }
            }

            el.innerHTML = `<div class="tg-top">${editBtn}</div>
                ${pinnedHtml}
                <div class="tg-sidewrap${useTop ? ' tg-sidewrap--top' : ''}">
                    <aside class="tg-side">
                        <div class="tg-search"><i class="fa-solid fa-magnifying-glass"></i>
                            <input id="tg-q" type="search" placeholder="Search marketing…" value="${esc(query)}" oninput="__tg_search(this.value)">
                            ${query ? `<button class="tg-qx" title="Clear" onclick="__tg_search('')">&times;</button>` : ''}
                        </div>
                        ${msel}
                        <nav class="tg-nav${msel ? ' tg-nav--msel' : ''}">${nav}</nav>
                    </aside>
                    <div class="tg-panel">${panel}</div>
                </div>`;

            if (refocusSearch) {
                const q = document.getElementById('tg-q');
                if (q) { q.focus(); const v = q.value; q.value = ''; q.value = v; }
                refocusSearch = false;
            }
        }
        window.__tg_pick = function (id, fromHub) {
            activeSec = id; query = '';
            try { localStorage.setItem(ACTIVE_LS, id); } catch (e) {}
            render();
            // (a switch requested by the hub sidebar doesn't need to scroll — the hub already scrolled to top)
            if (!fromHub) { const p = el.querySelector('.tg-panel'); if (p) p.scrollIntoView({ block: 'nearest' }); }
            if (LAYOUT === 'side' && window.__yrlTabChanged) window.__yrlTabChanged(activeSec);   // keep the hub sidebar highlight in sync
        };

        function render() {
            if (LAYOUT === 'side') return renderSide();
            if (LAYOUT === 'list') return renderList();
            return renderGrid();
        }

        /* ── list view handlers ── */
        window.__tg_toggleSec = function (id) {
            if (openSecs.has(id)) openSecs.delete(id); else openSecs.add(id);
            persistOpen(); render();
        };
        window.__tg_toggleItem = function (id) {
            if (openItems.has(id)) openItems.delete(id); else openItems.add(id);
            render();
        };
        window.__tg_search = function (v) {
            query = v || ''; refocusSearch = true; render();
        };
        window.__tg_expandAll = function () {
            state.sections.forEach(s => openSecs.add(s.id)); persistOpen(); render();
        };
        window.__tg_msel = function (v) {
            if (!v) return;
            if (v.indexOf('link:') === 0) {   // link-out entries: click the (hidden) nav link so embed-mode's rewritten href is used
                const a = el.querySelectorAll('.tg-nav a.tg-navlink')[+v.slice(5)];
                if (a) a.click();
                return;
            }
            window.__tg_pick(v);
        };
        window.__tg_collapseAll = function () {
            openSecs.clear(); openItems.clear(); persistOpen(); render();
        };

        /* ── edit actions (shared by both layouts) ── */
        window.__tg_toggle = function () {
            if (edit) { edit = false; render(); return; }
            editGate(function () { edit = true; render(); });
        };
        window.__tg_addSec = function () { openSecModal(null); };
        window.__tg_renameSec = function (id) { openSecModal(id); };
        window.__tg_moveSec = async function (id, dir) {
            const i = state.sections.findIndex(s => s.id === id);
            const j = i + dir;
            if (i < 0 || j < 0 || j >= state.sections.length) return;
            const [moved] = state.sections.splice(i, 1);
            state.sections.splice(j, 0, moved);
            await save(); render();
        };
        window.__tg_moveLink = async function (dir) {
            const max = state.sections.length;
            let p = (typeof state.linkPos === 'number' ? state.linkPos : 0) + dir;
            p = Math.max(0, Math.min(p, max));
            state.linkPos = p;
            await save(); render();
        };

        /* ── section add/rename modal (name + icon, mobile-friendly) ── */
        let secModalId = null;
        function ensureSecModal() {
            if (document.getElementById('tgSecModal')) return;
            const d = document.createElement('div');
            d.id = 'tgSecModal'; d.className = 'tg-overlay';
            d.innerHTML = `<div class="tg-modal">
                <h3 id="tgSecTitle">Add section</h3>
                <label>Section name</label><input id="tgsec-name" placeholder="Buyer Marketing">
                <label>Icon (Font Awesome)</label>
                <div class="tg-iconrow"><span id="tgsec-iconprev"></span><input id="tgsec-icon" placeholder="fa-solid fa-folder" oninput="tgSecIconPreview()"></div>
                <div class="tg-hinttxt">Browse icons at fontawesome.com/icons — paste the class.</div>
                <label class="tg-check"><input type="checkbox" id="tgsec-pinned"> <span>Pin to top — show this section's items as quick tiles above the tabs (like Important #'s)</span></label>
                <div class="tg-actions">
                    <button class="tg-btn tg-del" id="tgsec-del" onclick="__tg_delSecModal()"><i class="fa-solid fa-trash"></i> Delete section</button>
                    <span style="margin-left:auto;display:flex;gap:8px;">
                        <button class="tg-btn tg-ghost" onclick="document.getElementById('tgSecModal').classList.remove('open')">Cancel</button>
                        <button class="tg-btn tg-save" onclick="__tg_saveSecModal()">Save</button>
                    </span>
                </div></div>`;
            d.addEventListener('click', e => { if (e.target === d) d.classList.remove('open'); });
            document.body.appendChild(d);
        }
        window.tgSecIconPreview = function () {
            document.getElementById('tgsec-iconprev').innerHTML = `<i class="${esc(document.getElementById('tgsec-icon').value.trim() || 'fa-solid fa-folder')}"></i>`;
        };
        function openSecModal(id) {
            secModalId = id;
            const s = id ? sec(id) : null;
            ensureSecModal();
            document.getElementById('tgSecTitle').textContent = s ? 'Rename section' : 'Add section';
            document.getElementById('tgsec-name').value = s ? s.name : '';
            document.getElementById('tgsec-icon').value = (s && s.icon) || 'fa-solid fa-folder';
            document.getElementById('tgsec-pinned').checked = !!(s && s.pinned);
            document.getElementById('tgsec-del').style.display = s ? '' : 'none';
            tgSecIconPreview();
            document.getElementById('tgSecModal').classList.add('open');
            setTimeout(() => document.getElementById('tgsec-name').focus(), 60);
        }
        window.__tg_saveSecModal = async function () {
            const name = document.getElementById('tgsec-name').value.trim();
            if (!name) { alert('Add a section name.'); return; }
            const icon = document.getElementById('tgsec-icon').value.trim() || 'fa-solid fa-folder';
            const pinned = document.getElementById('tgsec-pinned').checked;
            if (secModalId) {
                const s = sec(secModalId); if (s) { s.name = name; s.icon = icon; s.pinned = pinned; }
            } else {
                const ns = { id: uid(), name, icon, desc: '', pinned, tiles: [] };
                state.sections.push(ns); openSecs.add(ns.id); persistOpen();
                if (LAYOUT === 'side' && !pinned) activeSec = ns.id;
            }
            document.getElementById('tgSecModal').classList.remove('open');
            await save(); render();
        };
        window.__tg_delSecModal = async function () {
            if (!secModalId) return;
            const s = sec(secModalId); if (!s) return;
            if (!confirm(`Delete the "${s.name}" section and its items?`)) return;
            state.sections = state.sections.filter(x => x.id !== secModalId);
            if (activeSec === secModalId) activeSec = state.sections[0] ? state.sections[0].id : null;
            document.getElementById('tgSecModal').classList.remove('open');
            await save(); render();
        };
        window.__tg_delSec = async function (id) {
            const s = sec(id); if (!s) return;
            if (!confirm(`Delete the "${s.name}" section and its tiles?`)) return;
            state.sections = state.sections.filter(x => x.id !== id); await save(); render();
        };
        window.__tg_addTile = function (secId) { openModal(secId, null); };
        window.__tg_editTile = function (secId, tileId) { openModal(secId, tileId); };
        window.__tg_delTile = async function (secId, tileId) {
            const s = sec(secId); if (!s) return;
            s.tiles = (s.tiles || []).filter(t => t.id !== tileId); await save(); render();
        };

        /* ── drag reorder (within & across sections) ── */
        window.__tg_dragStart = function (secId, tileId) { drag = { secId, tileId }; };
        window.__tg_dragEnd = function () { drag = null; };
        window.__tg_over = function (e) { if (drag) e.preventDefault(); };
        window.__tg_drop = async function (e, toSec, beforeTile) {
            e.preventDefault(); if (!drag) return;
            const from = sec(drag.secId), to = sec(toSec); if (!from || !to) return;
            const idx = from.tiles.findIndex(t => t.id === drag.tileId); if (idx < 0) return;
            const [moved] = from.tiles.splice(idx, 1);
            if (beforeTile && beforeTile !== drag.tileId) {
                const bi = to.tiles.findIndex(t => t.id === beforeTile);
                to.tiles.splice(bi < 0 ? to.tiles.length : bi, 0, moved);
            } else {
                to.tiles.push(moved);
            }
            drag = null; await save(); render();
        };

        /* ── add/edit modal (owner editing only — not the agent viewing experience) ── */
        let modalSec = null, modalTile = null;
        function openModal(secId, tileId) {
            modalSec = secId; modalTile = tileId;
            const s = sec(secId); const t = tileId ? (s.tiles || []).find(x => x.id === tileId) : null;
            ensureModal();
            document.getElementById('tgmTitle').textContent = t ? 'Edit Item' : 'Add Item';
            document.getElementById('tgm-title').value = t?.title || '';
            document.getElementById('tgm-desc').value = t?.desc || '';
            document.getElementById('tgm-icon').value = t?.icon || 'fa-solid fa-star';
            document.getElementById('tgm-pill').value = t?.pill || 'Tool';
            document.getElementById('tgm-link').value = t?.link || '';
            document.getElementById('tgm-heading').checked = !!(t && t.heading);
            document.getElementById('tgm-noaction').checked = !!(t && t.noaction);
            document.getElementById('tgm-del').style.display = t ? '' : 'none';
            tgIconPreview();
            document.getElementById('tgModal').classList.add('open');
            setTimeout(() => document.getElementById('tgm-title').focus(), 60);
        }
        window.__tg_saveModal = async function () {
            const s = sec(modalSec); if (!s) return;
            const title = document.getElementById('tgm-title').value.trim();
            if (!title) { alert('Add an item name.'); return; }
            const heading = document.getElementById('tgm-heading').checked;
            const noaction = document.getElementById('tgm-noaction').checked;
            const rec = heading ? { title, heading: true } : {
                title,
                desc: document.getElementById('tgm-desc').value.trim(),
                icon: document.getElementById('tgm-icon').value.trim() || 'fa-solid fa-star',
                pill: document.getElementById('tgm-pill').value.trim() || 'Tool',
                link: document.getElementById('tgm-link').value.trim()
            };
            if (!heading && noaction) rec.noaction = true;
            if (modalTile) {
                const ex = (s.tiles || []).find(x => x.id === modalTile); Object.assign(ex, rec);
                if (!heading) delete ex.heading;
                if (heading || !noaction) delete ex.noaction;
            }
            else { (s.tiles = s.tiles || []).push({ id: uid(), ...rec }); }
            closeModal(); await save(); render();
        };
        window.__tg_delModal = async function () {
            if (!modalTile) return;
            await window.__tg_delTile(modalSec, modalTile); closeModal();
        };
        window.tgIconPreview = function () {
            document.getElementById('tgm-iconprev').innerHTML = `<i class="${esc(document.getElementById('tgm-icon').value.trim() || 'fa-solid fa-star')}"></i>`;
        };
        function closeModal() { const m = document.getElementById('tgModal'); if (m) m.classList.remove('open'); }
        window.__tg_closeModal = closeModal;

        function ensureModal() {
            if (document.getElementById('tgModal')) return;
            const d = document.createElement('div');
            d.id = 'tgModal'; d.className = 'tg-overlay';
            d.innerHTML = `<div class="tg-modal">
                <h3 id="tgmTitle">Add Item</h3>
                <label>Name</label><input id="tgm-title" placeholder="Just Listed Flyer">
                <label class="tg-check"><input type="checkbox" id="tgm-heading"> <span>This is a section heading (a divider like “Handouts”) — the fields below are ignored</span></label>
                <label>Description</label><textarea id="tgm-desc" placeholder="Short description shown when the item is opened"></textarea>
                <div class="tg-row">
                    <div><label>Icon (Font Awesome)</label>
                        <div class="tg-iconrow"><span id="tgm-iconprev"></span><input id="tgm-icon" placeholder="fa-solid fa-file-image" oninput="tgIconPreview()"></div>
                        <div class="tg-hinttxt">Browse icons at fontawesome.com/icons — paste the class.</div>
                    </div>
                    <div><label>Badge</label><input id="tgm-pill" placeholder="PDF"></div>
                </div>
                <label>Link or document</label><input id="tgm-link" placeholder="https://…  ·  yrl-page.html">
                <button type="button" id="tgm-upload" class="tg-uploadbtn"><i class="fa-solid fa-arrow-up-from-bracket"></i> Upload a document (PDF, image, or Word)</button>
                <input type="file" id="tgm-file" style="display:none" accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx">
                <div class="tg-hinttxt" id="tgm-upstatus">Paste a link, or upload a file — it fills in automatically. Leave blank to show “Coming soon”.</div>
                <label class="tg-check"><input type="checkbox" id="tgm-noaction"> <span>Info only — no file or link needed (hides “Coming soon”). Put a #hex in the name or description to show a color swatch.</span></label>
                <div class="tg-actions">
                    <button class="tg-btn tg-del" id="tgm-del" onclick="__tg_delModal()"><i class="fa-solid fa-trash"></i> Delete</button>
                    <span style="margin-left:auto;display:flex;gap:8px;">
                        <button class="tg-btn tg-ghost" onclick="__tg_closeModal()">Cancel</button>
                        <button class="tg-btn tg-save" onclick="__tg_saveModal()">Save</button>
                    </span>
                </div></div>`;
            d.addEventListener('click', e => { if (e.target === d) closeModal(); });
            document.body.appendChild(d);
            /* upload wiring — lets any tile hold an uploaded document, not just a link */
            document.getElementById('tgm-upload').onclick = () => document.getElementById('tgm-file').click();
            document.getElementById('tgm-file').onchange = async function () {
                const f = this.files && this.files[0]; if (!f) return;
                const st = document.getElementById('tgm-upstatus');
                st.style.color = 'var(--text-muted,#9ca3af)';
                st.textContent = 'Uploading “' + f.name + '”…';
                try {
                    if (typeof uploadHubFile !== 'function') throw new Error('upload unavailable');
                    const url = await uploadHubFile(f, 'marketing');
                    document.getElementById('tgm-link').value = url;
                    const pillEl = document.getElementById('tgm-pill');
                    if (!pillEl.value.trim() || pillEl.value.trim() === 'Tool' || pillEl.value.trim() === 'Soon') {
                        const ext = (f.name.split('.').pop() || '').toLowerCase();
                        pillEl.value = ext === 'pdf' ? 'PDF' : (/(png|jpe?g|webp)/.test(ext) ? 'Printable' : (/(docx?)/.test(ext) ? 'Doc' : 'File'));
                    }
                    st.style.color = 'var(--red,#c03926)';
                    st.textContent = '✓ Uploaded “' + f.name + '” — click Save to keep it.';
                } catch (e) {
                    st.style.color = '#dc2626';
                    st.textContent = 'Upload failed: ' + (e.message || e);
                }
                this.value = '';
            };
        }

        injectStyles();
        render();
        /* Hub sidebar 3rd level: only the side layout has category tabs (grid-layout mounts,
           e.g. CE & Licensing's lists, must not claim the page's tab switcher). Registered after
           the data loads + first render so a requested tab id can actually be found. */
        if (LAYOUT === 'side' && window.__yrlRegisterTabs) {
            window.__yrlRegisterTabs(function (id) {
                const tabSecs = state.sections.filter(s => !s.pinned);
                if (tabSecs.some(s => s.id === id)) window.__tg_pick(id, true);
            });
            if (window.__yrlTabChanged && activeSec) window.__yrlTabChanged(activeSec);   // tell the sidebar where we opened
        }
    }

    let stylesInjected = false;
    function injectStyles() {
        if (stylesInjected) return; stylesInjected = true;
        const css = `
        .tg-top{display:flex;justify-content:flex-end;margin-bottom:14px;}
        .tg-editbtn{display:inline-flex;align-items:center;gap:6px;background:rgba(192,57,38,0.08);color:var(--red,#c03926);border:1.5px solid var(--red,#c03926);border-radius:8px;padding:8px 15px;font-size:13px;font-weight:700;font-family:'Inter',sans-serif;cursor:pointer;}
        .tg-editbtn.on{background:var(--red,#c03926);color:#fff;}
        .card.tg-edit{cursor:pointer;border-style:dashed;}
        .tg-x{position:absolute;top:-8px;right:-8px;z-index:3;width:22px;height:22px;border:none;border-radius:50%;background:var(--red,#c03926);color:#fff;font-size:14px;cursor:pointer;line-height:1;}
        .tg-hint{position:absolute;bottom:6px;right:12px;font-size:9px;color:var(--text-muted,#9ca3af);}
        .tg-secctrl{display:inline-flex;gap:6px;margin-left:10px;vertical-align:middle;}
        .tg-secctrl button{background:var(--surface-2,#f7f8fa);border:1.5px solid var(--border,#e2e5ea);border-radius:6px;width:26px;height:26px;cursor:pointer;color:var(--text-sec,#5a6270);font-size:11px;}
        .tg-secctrl button:hover{border-color:var(--red,#c03926);color:var(--red,#c03926);}
        .tg-add,.tg-addsec{background:var(--surface-2,#f7f8fa);border:1.5px dashed var(--border,#e2e5ea);border-radius:14px;padding:18px;font-size:13px;font-weight:700;color:var(--text-sec,#5a6270);cursor:pointer;font-family:'Inter',sans-serif;display:flex;align-items:center;justify-content:center;gap:7px;}
        .tg-add:hover,.tg-addsec:hover{border-color:var(--red,#c03926);color:var(--red,#c03926);}
        .tg-addsec{width:100%;margin-top:6px;}

        /* ── list layout ── */
        .tg-ltop{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:18px;}
        .tg-search{display:flex;align-items:center;gap:9px;flex:1;min-width:220px;background:var(--surface,#fff);border:1.5px solid var(--border,#e2e5ea);border-radius:100px;padding:10px 16px;}
        .tg-search > i{color:var(--text-muted,#9ca3af);font-size:14px;}
        #tg-q{flex:1;border:none;background:none;outline:none;font-family:'Inter',sans-serif;font-size:14px;color:var(--text,#1a1d22);}
        #tg-q::-webkit-search-cancel-button{display:none;}
        .tg-qx{border:none;background:none;color:var(--text-muted,#9ca3af);font-size:19px;cursor:pointer;line-height:1;}
        .tg-qx:hover{color:var(--red,#c03926);}
        .tg-allbtns{display:flex;gap:6px;}
        .tg-xall{background:var(--surface,#fff);border:1.5px solid var(--border,#e2e5ea);border-radius:8px;padding:8px 12px;font-size:12px;font-weight:700;color:var(--text-sec,#5a6270);cursor:pointer;font-family:'Inter',sans-serif;}
        .tg-xall:hover{border-color:var(--red,#c03926);color:var(--red,#c03926);}

        .tg-lsec{margin-bottom:12px;}
        .tg-lsec-bar{display:flex;align-items:center;gap:14px;width:100%;background:var(--surface,#fff);border:1px solid var(--border,#e2e5ea);border-radius:14px;padding:15px 18px;cursor:pointer;font-family:'Inter',sans-serif;text-align:left;transition:border-color .15s,box-shadow .15s;}
        .tg-lsec-bar:hover{border-color:rgba(192,57,38,0.35);box-shadow:0 3px 16px rgba(0,0,0,0.05);}
        .tg-lsec-bar.open{border-color:rgba(192,57,38,0.30);border-bottom-left-radius:0;border-bottom-right-radius:0;}
        .tg-lsec-icon{width:42px;height:42px;flex-shrink:0;border-radius:11px;background:rgba(192,57,38,0.09);border:1px solid rgba(192,57,38,0.18);color:var(--red,#c03926);display:flex;align-items:center;justify-content:center;font-size:17px;}
        .tg-lsec-txt{display:flex;flex-direction:column;gap:2px;flex:1;min-width:0;}
        .tg-lsec-name{font-family:'Bebas Neue',sans-serif;font-size:21px;letter-spacing:1px;color:var(--text,#1a1d22);line-height:1;}
        .tg-lsec-desc{font-size:12px;color:var(--text-muted,#9ca3af);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .tg-lsec-count{flex-shrink:0;font-size:11px;font-weight:800;color:var(--text-sec,#5a6270);background:var(--surface-3,#eef0f3);border-radius:100px;padding:4px 11px;}
        .tg-lsec-chev{color:var(--text-muted,#9ca3af);font-size:14px;transition:transform .2s;flex-shrink:0;}
        .tg-lsec-bar.open .tg-lsec-chev{transform:rotate(180deg);}
        .tg-lsec-list{border:1px solid rgba(192,57,38,0.30);border-top:none;border-radius:0 0 14px 14px;background:var(--surface-2,#f7f8fa);padding:10px;display:flex;flex-direction:column;gap:7px;}

        .tg-li{background:var(--surface,#fff);border:1px solid var(--border,#e2e5ea);border-radius:10px;overflow:hidden;transition:border-color .15s;}
        .tg-li.open{border-color:rgba(192,57,38,0.35);}
        .tg-lihead{display:flex;align-items:center;gap:13px;width:100%;padding:13px 15px;background:none;border:none;cursor:pointer;text-align:left;font-family:'Inter',sans-serif;}
        .tg-lihead:hover{background:var(--surface-2,#f7f8fa);}
        .tg-liicon{width:34px;height:34px;flex-shrink:0;border-radius:9px;background:rgba(192,57,38,0.09);color:var(--red,#c03926);display:flex;align-items:center;justify-content:center;font-size:14px;}
        .tg-lititle{flex:1;min-width:0;font-size:14px;font-weight:600;color:var(--text,#1a1d22);}
        .tg-lipill{flex-shrink:0;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.7px;padding:3px 9px;border-radius:5px;}
        .tg-p-red{color:var(--red,#c03926);background:rgba(192,57,38,0.10);}
        .tg-p-blue{color:#2563eb;background:rgba(37,99,235,0.10);}
        .tg-p-soon{color:#9ca3af;background:#eef0f3;}
        .tg-lichev{flex-shrink:0;color:var(--text-muted,#9ca3af);font-size:12px;transition:transform .2s;}
        .tg-li.open .tg-lichev{transform:rotate(180deg);color:var(--red,#c03926);}
        .tg-lidetail{padding:2px 16px 16px 62px;animation:tgFade .16s ease;}
        @keyframes tgFade{from{opacity:0;transform:translateY(-3px);}to{opacity:1;transform:none;}}
        .tg-lidetail p{font-size:13px;color:var(--text-sec,#5a6270);line-height:1.55;margin:0 0 12px;}
        .tg-nodesc{color:var(--text-muted,#9ca3af);font-style:italic;}
        .tg-open{display:inline-flex;align-items:center;gap:8px;background:var(--red,#c03926);color:#fff;border-radius:8px;padding:9px 16px;font-size:13px;font-weight:700;}
        .tg-open:hover{background:var(--red-dark,#9e2e1e);}
        .tg-soon{display:inline-flex;align-items:center;gap:7px;color:var(--text-muted,#9ca3af);font-size:12.5px;font-weight:600;}
        .tg-liempty{padding:14px;text-align:center;color:var(--text-muted,#9ca3af);font-size:12.5px;}
        .tg-noresults{padding:36px;text-align:center;color:var(--text-muted,#9ca3af);font-size:14px;}

        /* list edit rows */
        .tg-liedit{display:flex;align-items:center;gap:11px;padding:11px 13px;border-style:dashed;}
        .tg-ligrip{color:var(--text-muted,#9ca3af);cursor:grab;font-size:13px;}
        .tg-liedit .tg-lititle{cursor:default;}
        .tg-liedbtn{background:var(--surface-2,#f7f8fa);border:1.5px solid var(--border,#e2e5ea);border-radius:7px;width:30px;height:30px;cursor:pointer;color:var(--text-sec,#5a6270);font-size:11px;flex-shrink:0;}
        .tg-liedbtn:hover{border-color:var(--red,#c03926);color:var(--red,#c03926);}
        .tg-lix{background:none;border:none;color:var(--red,#c03926);font-size:19px;cursor:pointer;line-height:1;flex-shrink:0;width:24px;}
        .tg-liadd{background:none;border:1.5px dashed var(--border,#e2e5ea);border-radius:9px;padding:11px;font-size:12.5px;font-weight:700;color:var(--text-sec,#5a6270);cursor:pointer;font-family:'Inter',sans-serif;}
        .tg-liadd:hover{border-color:var(--red,#c03926);color:var(--red,#c03926);}

        /* ── side layout ── */
        .tg-sidewrap{display:grid;grid-template-columns:250px minmax(0,1fr);gap:0;align-items:stretch;background:var(--surface,#fff);border:1px solid var(--border,#e2e5ea);border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.05);}
        /* ── subtabs variant: the category rail becomes a SEGMENTED CONTROL (2nd row) ── */
        .tg-sidewrap--top{display:block;background:transparent;border:none;border-radius:0;box-shadow:none;overflow:visible;}
        .tg-sidewrap--top .tg-side{flex-direction:column;gap:14px;background:transparent;border-right:none;border-bottom:none;padding:0;align-items:flex-start;}
        /* flat UNDERLINE text tabs (GHL / Nomad-OS CRM style): icon + label, active = red text + red underline, no pills */
        .tg-sidewrap--top .tg-nav{order:1;max-width:100%;flex-direction:row;flex-wrap:wrap;gap:0 4px;background:transparent;border:none;border-bottom:1px solid var(--border,#e2e5ea);border-radius:0;padding:0;}
        .tg-sidewrap--top .tg-search{order:2;align-self:stretch;margin-top:2px;}
        .tg-sidewrap--top .tg-navitem{width:auto;flex:0 0 auto;flex-direction:row;align-items:center;gap:8px;padding:11px 12px;border:none;border-bottom:2.5px solid transparent;border-radius:0;background:none;color:var(--text-sec,#5a6270);font-weight:600;white-space:nowrap;margin-bottom:-1px;}
        .tg-sidewrap--top .tg-navitem:hover{background:none;color:var(--text,#1a1d22);border-bottom-color:transparent;}
        .tg-sidewrap--top .tg-navitem.on{background:none;color:var(--red,#c03926);border-bottom-color:var(--red,#c03926);font-weight:700;box-shadow:none;}
        .tg-sidewrap--top .tg-navitem.on:hover{background:none;}
        .tg-sidewrap--top .tg-navicon{width:auto;margin-top:0;color:inherit;}
        .tg-sidewrap--top .tg-navitem.on .tg-navicon{color:var(--red,#c03926);}
        .tg-sidewrap--top .tg-navname{flex:0 0 auto;white-space:nowrap;}
        .tg-sidewrap--top .tg-navcount{margin-top:0;color:inherit;opacity:.55;font-weight:700;}
        .tg-sidewrap--top .tg-navitem.on .tg-navcount{color:var(--red,#c03926);opacity:.75;}
        /* edit mode: segments become chips carrying the reorder/rename controls */
        .tg-sidewrap--top .tg-navedit{background:var(--surface,#fff);border:1px solid var(--border,#e2e5ea);border-radius:8px;padding-left:2px;margin-bottom:0;}
        .tg-sidewrap--top .tg-navedit.on{background:var(--red,#c03926);border-color:var(--red,#c03926);}
        .tg-sidewrap--top .tg-navedit.on .tg-navsel{color:#fff;}
        .tg-sidewrap--top .tg-navsel{padding:8px 4px 8px 10px;}
        .tg-sidewrap--top .tg-navadd{flex:0 0 auto;width:auto;margin-top:0;border-radius:8px;padding:9px 14px;}
        .tg-sidewrap--top .tg-panel{padding:18px 0 0;}
        .tg-sidewrap--top .tg-phead{align-items:flex-start;text-align:left;}
        .tg-side{display:flex;flex-direction:column;gap:10px;background:var(--surface-2,#f7f8fa);border-right:1px solid var(--border,#e2e5ea);padding:16px 14px;}
        .tg-side .tg-search{flex:0 0 auto;min-width:0;}
        .tg-panel{min-width:0;padding:22px 24px;}
        .tg-nav{display:flex;flex-direction:column;gap:5px;}
        .tg-navitem{display:flex;align-items:flex-start;gap:10px;width:100%;text-align:left;padding:10px 12px;border:1px solid var(--border,#e2e5ea);border-radius:10px;background:var(--surface,#fff);cursor:pointer;font-family:'Inter',sans-serif;font-size:13px;color:var(--text-sec,#5a6270);transition:background .12s,color .12s,border-color .12s;}
        .tg-navitem:hover{background:var(--surface-2,#f7f8fa);border-color:var(--text-muted,#9ca3af);color:var(--text,#1a1d22);}
        .tg-navitem.on{background:var(--red,#c03926);border-color:var(--red,#c03926);color:#fff;font-weight:700;}
        .tg-navicon{width:20px;flex-shrink:0;text-align:center;font-size:15px;margin-top:1px;color:var(--text-muted,#9ca3af);}
        .tg-navitem.on .tg-navicon{color:#fff;}
        .tg-navname{flex:1;min-width:0;white-space:normal;overflow:visible;text-overflow:clip;line-height:1.25;}
        .tg-navcount{flex-shrink:0;font-size:11px;font-weight:700;margin-top:1px;color:var(--text-muted,#9ca3af);}
        .tg-navitem.on .tg-navcount{color:#fff;opacity:.9;}
        .tg-navlink{border-color:rgba(192,57,38,0.25);margin-bottom:4px;}
        .tg-navlink .tg-navicon,.tg-navlink .tg-navcount{color:var(--red,#c03926);}
        .tg-navlink:hover{border-color:var(--red,#c03926);background:rgba(192,57,38,0.05);}
        .tg-navadd{margin-top:6px;display:flex;align-items:center;gap:7px;justify-content:center;background:var(--surface-2,#f7f8fa);border:1.5px dashed var(--border,#e2e5ea);border-radius:9px;padding:10px;font-size:12.5px;font-weight:700;color:var(--text-sec,#5a6270);cursor:pointer;font-family:'Inter',sans-serif;}
        .tg-navadd:hover{border-color:var(--red,#c03926);color:var(--red,#c03926);}
        .tg-navedit{display:flex;align-items:center;gap:1px;border-radius:9px;}
        .tg-navedit.on{background:rgba(192,57,38,0.08);}
        .tg-navsel{flex:1;min-width:0;display:flex;align-items:center;gap:11px;background:none;border:none;cursor:pointer;font-family:'Inter',sans-serif;font-size:13px;color:var(--text-sec,#5a6270);padding:8px 4px 8px 10px;text-align:left;}
        .tg-navedit.on .tg-navsel{color:var(--red,#c03926);font-weight:700;}
        .tg-navedit.on .tg-navsel .tg-navicon{color:var(--red,#c03926);}
        .tg-navctrl{display:inline-flex;gap:0;flex-shrink:0;padding-right:4px;}
        .tg-navctrl button{width:24px;height:28px;border:none;background:none;color:var(--text-muted,#9ca3af);cursor:pointer;font-size:11px;border-radius:5px;display:flex;align-items:center;justify-content:center;}
        .tg-navctrl button:hover:not(:disabled){background:var(--surface-3,#eef0f3);color:var(--red,#c03926);}
        .tg-navctrl button:disabled{opacity:.25;cursor:default;}

        /* ── pinned quick-access tiles — a RED banner block (matches "Your Dashboard") ── */
        .tg-pinsec{margin:0 0 22px;background:linear-gradient(150deg,#8a2417 0%,#a62d1b 52%,#7a2013 100%);border-radius:16px;padding:16px 18px 18px;box-shadow:0 6px 22px rgba(138,36,23,.28);}
        .tg-pinlbl{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:1.2px;color:#fff;margin:0 0 12px;}
        .tg-pinned{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px;margin:0 0 18px;}
        .tg-pinsec .tg-pinned{margin:0;}
        /* tiles stay warm-white so they pop on the red, like the dashboard KPI cards */
        .tg-pinsec .tg-pin{border-color:transparent;box-shadow:0 2px 8px rgba(0,0,0,.14);}
        .tg-pinsec .tg-pin:hover{border-color:transparent;box-shadow:0 8px 22px rgba(0,0,0,.22);}
        .tg-pin{display:flex;align-items:center;gap:11px;background:var(--surface,#fff);border:1px solid var(--border,#e2e5ea);border-radius:12px;padding:13px 14px;text-decoration:none;transition:border-color .15s,transform .15s,box-shadow .15s;}
        .tg-pin:hover{border-color:rgba(192,57,38,0.35);transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,0.07);}
        .tg-pin-ic{width:38px;height:38px;flex-shrink:0;border-radius:10px;background:rgba(192,57,38,0.09);color:var(--red,#c03926);display:flex;align-items:center;justify-content:center;font-size:16px;}
        .tg-pin-name{flex:1;min-width:0;font-size:13.5px;font-weight:700;color:var(--text,#1a1d22);line-height:1.25;}
        .tg-pin-go{color:var(--text-muted,#c3c7cf);font-size:12px;flex-shrink:0;}
        .tg-pin:hover .tg-pin-go{color:var(--red,#c03926);}
        /* ── sub-heading divider inside a section (e.g. "Handouts") ── */
        .tg-subhead{grid-column:1/-1;font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:1px;color:var(--text,#1a1d22);border-top:1px solid var(--border,#e2e5ea);margin:14px 0 2px;padding-top:14px;}
        .tg-icgrid--list .tg-subhead:first-child,.tg-icgrid .tg-subhead:first-child{border-top:none;margin-top:0;padding-top:0;}
        .tg-subhead-edit{display:flex;align-items:center;gap:10px;border:1.5px dashed var(--border,#e2e5ea);border-radius:10px;padding:10px 12px;cursor:pointer;background:var(--surface-2,#f7f8fa);font-size:15px;}
        .tg-subhead-lbl{flex:1;min-width:0;}
        .tg-subhead-tag{font-family:'Inter',sans-serif;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:var(--text-muted,#9ca3af);background:var(--surface-3,#eef0f3);border-radius:5px;padding:2px 7px;letter-spacing:.5px;}
        /* pinned marker in the edit nav */
        .tg-pinbadge{font-family:'Inter',sans-serif;font-size:8.5px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:var(--red,#c03926);background:rgba(192,57,38,0.1);border-radius:4px;padding:1px 5px;margin-left:5px;vertical-align:middle;}
        /* checkbox rows in the modals */
        .tg-check{display:flex!important;align-items:flex-start;gap:8px;text-transform:none!important;letter-spacing:0!important;font-weight:500!important;font-size:12px!important;color:var(--text-sec,#5a6270)!important;margin:12px 0 2px!important;cursor:pointer;}
        .tg-check input{width:auto!important;margin-top:2px;flex-shrink:0;}
        .tg-phead{display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px;margin:0 0 20px;padding-bottom:16px;border-bottom:1px solid var(--border,#e2e5ea);}
        .tg-picon{width:46px;height:46px;flex-shrink:0;border-radius:12px;background:rgba(192,57,38,0.08);border:1px solid rgba(192,57,38,0.2);color:var(--red,#c03926);display:flex;align-items:center;justify-content:center;font-size:18px;}
        .tg-pname{font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:1.5px;color:var(--text,#1a1d22);line-height:1.05;}
        .tg-pdesc{font-size:12.5px;color:var(--text-muted,#9ca3af);margin-top:4px;white-space:pre-line;}
        .tg-syncnote{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;color:var(--text-sec,#5a6270);background:var(--surface-2,#f7f8fa);border:1px solid var(--border,#e2e5ea);border-radius:9px;padding:8px 12px;margin-bottom:12px;}
        .tg-syncnote i{color:var(--red,#c03926);}
        .tg-ic-ro{opacity:.9;}
        .tg-icgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px;}
        .tg-ic{position:relative;display:flex;flex-direction:column;gap:9px;background:var(--surface,#fff);border:1px solid var(--border,#e2e5ea);border-radius:12px;padding:16px;transition:border-color .15s,transform .15s,box-shadow .15s;}
        .tg-ic:not(.tg-ic-soon-card):not(.tg-ic-edit):hover{border-color:rgba(192,57,38,0.32);transform:translateY(-3px);box-shadow:0 6px 22px rgba(0,0,0,0.07);}
        .tg-ic-thumb{width:100%;height:132px;border-radius:9px;overflow:hidden;background:var(--surface-2,#f7f8fa);border:1px solid var(--border,#e2e5ea);display:flex;align-items:center;justify-content:center;}
        .tg-ic-thumb img{width:100%;height:100%;object-fit:contain;display:block;}
        .tg-ic-swatch{width:100%;height:132px;border-radius:9px;border:1px solid var(--border,#e2e5ea);}
        .tg-ic-top{display:flex;align-items:center;justify-content:space-between;}
        .tg-ic-icon{width:38px;height:38px;border-radius:10px;background:rgba(192,57,38,0.09);color:var(--red,#c03926);display:flex;align-items:center;justify-content:center;font-size:15px;}
        .tg-ic-title{font-size:14px;font-weight:700;color:var(--text,#1a1d22);line-height:1.3;}
        .tg-ic-desc{font-size:12px;color:var(--text-sec,#5a6270);line-height:1.5;flex:1;}
        .tg-ic-open{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--red,#c03926);margin-top:2px;}
        .tg-ic:hover .tg-ic-open i{transform:translateX(2px);}
        .tg-ic-soon{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:600;color:var(--text-muted,#9ca3af);margin-top:2px;}
        .tg-ic-soon-card{opacity:.72;}
        .tg-ic-edit{cursor:pointer;border-style:dashed;}
        .tg-icadd{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:120px;background:var(--surface-2,#f7f8fa);border:1.5px dashed var(--border,#e2e5ea);border-radius:12px;font-size:12.5px;font-weight:700;color:var(--text-sec,#5a6270);cursor:pointer;font-family:'Inter',sans-serif;}
        .tg-icadd:hover{border-color:var(--red,#c03926);color:var(--red,#c03926);}
        /* ── list rows (view mode) ── */
        .tg-icgrid--list{grid-template-columns:minmax(0,1fr);gap:0;}
        .tg-ic.tg-lrow{display:flex;flex-direction:row;align-items:center;gap:14px;background:none;border:none;border-bottom:1px solid var(--border,#e2e5ea);border-radius:0;padding:14px 6px;}
        .tg-icgrid--list .tg-ic.tg-lrow:last-child{border-bottom:none;}
        .tg-ic.tg-lrow:not(.tg-ic-soon-card):hover{transform:none;box-shadow:none;background:var(--surface-2,#f7f8fa);border-radius:10px;}
        .tg-lrow .tg-ic-icon{flex-shrink:0;}
        .tg-lrow-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;}
        .tg-lrow-head{display:flex;align-items:center;gap:9px;flex-wrap:wrap;}
        .tg-lrow .tg-ic-desc{flex:none;}
        .tg-lrow .tg-ic-open,.tg-lrow .tg-ic-soon{flex-shrink:0;margin-top:0;margin-left:auto;white-space:nowrap;}
        @media(max-width:760px){
            .tg-sidewrap{grid-template-columns:minmax(0,1fr);gap:0;}
            .tg-side{position:static;border-right:none;border-bottom:1px solid var(--border,#e2e5ea);}
            .tg-panel{padding:16px;}
            .tg-nav{flex-direction:row;flex-wrap:wrap;gap:6px;padding-bottom:4px;}
            .tg-navitem{flex:1 1 100px;flex-direction:column;gap:4px;min-width:92px;text-align:center;padding:10px 8px;border:1px solid var(--border,#e2e5ea);}
            .tg-navitem .tg-navname{white-space:normal;font-size:11px;line-height:1.2;}
            .tg-navcount{position:absolute;}
            .tg-navadd{flex-shrink:0;}
            .tg-nav.tg-nav--msel{display:none;}
            .tg-side .tg-msel{display:flex;}
        }
        /* phone category dropdown (shown ≤760px, see above) */
        .tg-msel{display:none;position:relative;align-items:center;margin:0 0 4px;width:100%;flex:1 1 100%;}
        .tg-msel select{width:100%;appearance:none;-webkit-appearance:none;background:var(--surface,#fff);border:1.5px solid var(--border,#e2e5ea);border-radius:12px;padding:13px 42px 13px 14px;font-family:'Inter',sans-serif;font-size:15px;font-weight:700;color:var(--text,#1a1d22);cursor:pointer;}
        .tg-msel select:focus{outline:none;border-color:var(--red,#c03926);}
        .tg-msel i{position:absolute;right:15px;pointer-events:none;color:var(--red,#c03926);font-size:13px;}

        /* modal (edit only) */
        .tg-overlay{position:fixed;inset:0;background:rgba(15,23,42,.55);display:none;align-items:center;justify-content:center;z-index:9000;padding:20px;}
        .tg-overlay.open{display:flex;}
        .tg-modal{background:#fff;border-radius:16px;max-width:520px;width:100%;padding:24px;max-height:90vh;overflow:auto;font-family:'Inter',sans-serif;}
        .tg-modal h3{font-family:'Bebas Neue',sans-serif;font-size:23px;letter-spacing:1px;margin:0 0 12px;}
        .tg-modal label{display:block;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:var(--text-sec,#5a6270);margin:12px 0 5px;}
        .tg-modal input,.tg-modal textarea{width:100%;background:var(--surface-2,#f7f8fa);border:1.5px solid var(--border,#e2e5ea);border-radius:9px;padding:10px 12px;font-size:14px;font-family:'Inter',sans-serif;outline:none;}
        .tg-modal textarea{min-height:60px;resize:vertical;}
        .tg-modal input:focus,.tg-modal textarea:focus{border-color:var(--red,#c03926);}
        .tg-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
        @media(max-width:520px){.tg-row{grid-template-columns:1fr;}.tg-lidetail{padding-left:16px;}}
        .tg-iconrow{display:flex;align-items:center;gap:8px;}
        .tg-iconrow span{width:40px;height:40px;flex-shrink:0;border-radius:10px;background:rgba(192,57,38,0.1);color:var(--red,#c03926);display:flex;align-items:center;justify-content:center;font-size:16px;}
        .tg-hinttxt{font-size:11px;color:var(--text-muted,#9ca3af);margin-top:4px;}
        .tg-uploadbtn{width:100%;margin-top:8px;display:flex;align-items:center;justify-content:center;gap:8px;background:var(--surface-2,#f7f8fa);border:1.5px dashed var(--border,#c9ccd3);border-radius:9px;padding:11px;font-size:13px;font-weight:700;color:var(--text-sec,#5a6270);cursor:pointer;font-family:'Inter',sans-serif;}
        .tg-uploadbtn:hover{border-color:var(--red,#c03926);color:var(--red,#c03926);}
        .tg-actions{display:flex;align-items:center;gap:8px;margin-top:20px;}
        .tg-btn{border:none;border-radius:9px;padding:10px 16px;font-size:13px;font-weight:700;font-family:'Inter',sans-serif;cursor:pointer;}
        .tg-save{background:var(--red,#c03926);color:#fff;}
        .tg-ghost{background:var(--surface-2,#f7f8fa);color:var(--text-sec,#5a6270);border:1.5px solid var(--border,#e2e5ea);}
        .tg-del{background:none;color:var(--red,#c03926);}`;
        const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    }

    window.TileGrid = { mount };
})();
