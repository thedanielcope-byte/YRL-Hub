/* ══════════════════════════════════════════════════════════════════════
   help-box.js  —  per-section "?" help button + popup (SOP / training).
   Mount a small "?" that opens a popup with the section's help:
       HelpBox.mount({ container:'#helpTop', key:'yrl-transactions', label:'Transactions' })
   Or open one programmatically:  HelpBox.open('hub-my-tools', 'My Tools')
   Content lives in Supabase (hub_help, per page_key), editable by owner/admin.
   Depends on: portal-auth.js (window.yrlClient / window.yrlMember).
   (Replaces the old always-on collapsible bar — same content, cleaner UI.)
   ══════════════════════════════════════════════════════════════════════ */
(function () {
    let SB, ME, ROLE, CID, CANEDIT = false, EDITMODE = false, _booted = false, _cssDone = false;
    const MOUNTS = [], DATA = {};

    window.HelpBox = { mount, open: openPublic, edit: editPublic, get: getPublic, canEdit: canEditPublic };
    function mount(opts){ MOUNTS.push(opts); if (_booted) renderOne(opts); }
    function openPublic(key, label){ if (!_booted) return; ensureLoaded(key).then(() => openRead(key, label, null)); }
    /* Open the SAME editor/save flow programmatically (used by the Help Center page). */
    function editPublic(key, label, onDone){ if (!_booted || !CANEDIT) return; ensureLoaded(key).then(() => openEditor(key, label, null, onDone)); }
    /* Load + return a section's help row (or null) — lets another page render the same content. */
    function getPublic(key){ return _booted ? ensureLoaded(key) : Promise.resolve(null); }
    /* Is the current user an owner/admin? (for showing edit affordances elsewhere) */
    function canEditPublic(){ return !!CANEDIT; }

    document.addEventListener('yrl-auth-ready', boot);
    if (window.yrlMember && window.yrlClient) boot();

    async function boot(){
        if (_booted) return; _booted = true;
        SB = window.yrlClient; ME = window.yrlMember; ROLE = ME.role; CID = ME.client_id;
        if (ROLE === 'txn_client') return;
        CANEDIT = (ROLE === 'owner' || ROLE === 'nomad_admin');
        // Edit affordances on help appear ONLY when the master "Edit Site" mode is on.
        // On the hub page that's body.hub-edit-mode; inside an embedded tool we hear the hub's broadcast.
        EDITMODE = document.body.classList.contains('hub-edit-mode');
        window.addEventListener('message', function (e) {
            var d = e.data; if (d && d.__yrlEdit) setEditMode(!!d.on);
        });
        try {
            new MutationObserver(function () { setEditMode(document.body.classList.contains('hub-edit-mode')); })
                .observe(document.body, { attributes: true, attributeFilter: ['class'] });
        } catch (e) {}
        injectCss();
        for (const m of MOUNTS) await renderOne(m);
    }
    function setEditMode(on){ if (EDITMODE === on) return; EDITMODE = on; MOUNTS.forEach(function (m) { renderOne(m); }); }
    function canEditNow(){ return CANEDIT && EDITMODE; }

    function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
    function arr(v){ return Array.isArray(v) ? v : []; }
    function hasContent(row){ return !!(row && (row.summary || arr(row.steps).length || arr(row.tips).length || row.video_url)); }

    async function load(key){
        try { const r = await SB.from('hub_help').select('*').eq('page_key', key).limit(1); DATA[key] = (r.data && r.data[0]) || null; }
        catch (e) { DATA[key] = null; }
        return DATA[key];
    }
    function ensureLoaded(key){ return (key in DATA) ? Promise.resolve(DATA[key]) : load(key); }
    function collapsed(key){ try { return localStorage.getItem('hbc:'+key) !== '0'; } catch(e){ return true; } } // default COLLAPSED
    function setCollapsed(key, v){ try { localStorage.setItem('hbc:'+key, v ? '1' : '0'); } catch(e){} }

    /* ── Render (mode:'button' = compact "?" popup; mode:'box' = permanent
          expanded card). Default 'box' — the shell passes mode:'button' for
          the per-section "?" by the name. ─────────────────────────────── */
    async function renderOne(m){
        const host = typeof m.container === 'string' ? document.querySelector(m.container) : m.container;
        if (!host) return;
        const row = await load(m.key);
        const has = hasContent(row);
        if (!has && !canEditNow()) { host.innerHTML = ''; return; }   // nothing to show unless owner is in Edit Site mode
        const mode = m.mode || 'box';
        if (mode === 'button') {
            host.innerHTML = '<button class="hb-q' + (has ? '' : ' hb-q-add') + '" title="' +
                esc((has ? 'Help' : 'Add help') + (m.label ? ' — ' + m.label : '')) +
                '"><i class="fa-solid fa-circle-question"></i></button>';
            host.querySelector('.hb-q').onclick = (e) => { e.preventDefault(); e.stopPropagation(); openRead(m.key, m.label, host); };
            return;
        }
        // box mode — collapsible expanded card (default open)
        host.innerHTML = boxHtml(m.key, row, m.label, has);
        host.querySelectorAll('[data-hbedit]').forEach(b => b.onclick = (e) => { e.stopPropagation(); openEditor(m.key, m.label, host, () => renderOne(m)); });
        const tg = host.querySelector('[data-hbtoggle]');
        if (tg) tg.onclick = () => {
            const box = host.querySelector('.hb-box');
            const willCol = !box.classList.contains('hb-box-col');
            box.classList.toggle('hb-box-col', willCol);
            setCollapsed(m.key, willCol);
        };
    }

    function boxHtml(key, row, label, has){
        const title = (row && row.title) || label || 'this page';
        if (!has){   // owner only reaches here (agents were returned empty)
            return '<div class="hb-box hb-box-add"><button class="hb-editbtn" data-hbedit><i class="fa-solid fa-plus"></i> Add help for ' + esc(title) + '</button></div>';
        }
        const steps = arr(row.steps), tips = arr(row.tips), col = collapsed(key);
        const body =
              (row.summary ? '<p class="hb-rs">' + esc(row.summary) + '</p>' : '')
            + (steps.length ? '<div class="hb-rh">How to use it</div><ol class="hb-rlist">' + steps.map(s => '<li>' + esc(s) + '</li>').join('') + '</ol>' : '')
            + (tips.length ? '<div class="hb-rh">Tips</div><ul class="hb-rlist hb-rtips">' + tips.map(s => '<li>' + esc(s) + '</li>').join('') + '</ul>' : '')
            + (row.video_url ? '<a class="hb-video" href="' + esc(row.video_url) + '" target="_blank" rel="noopener"><i class="fa-solid fa-play"></i> Watch the walkthrough</a>' : '')
            + (canEditNow() ? '<div class="hb-rfoot"><button class="hb-editbtn" data-hbedit><i class="fa-solid fa-pen"></i> Edit</button></div>' : '');
        return '<div class="hb-box ' + (col ? 'hb-box-col' : '') + '">'
            + '<button class="hb-boxbar" data-hbtoggle><span class="hb-boxhead"><span class="hb-bic"><i class="fa-solid fa-circle-question"></i></span>' + esc(title) + '</span><i class="fa-solid fa-chevron-down hb-boxchev"></i></button>'
            + '<div class="hb-box-body">' + body + '</div>'
            + '</div>';
    }

    /* ── Read popup ───────────────────────────────────────────────── */
    function ensureRead(){
        if (document.getElementById('hbRead')) return;
        const w = document.createElement('div'); w.id = 'hbRead';
        w.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(15,23,42,.5);z-index:10001;align-items:center;justify-content:center;padding:18px;';
        w.innerHTML = '<div id="hbReadCard" style="background:#fff;border-radius:14px;width:100%;max-width:460px;max-height:84vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.3);padding:24px 26px;position:relative;font-family:\'Inter\',sans-serif;"></div>';
        document.body.appendChild(w);
        w.addEventListener('click', e => { if (e.target === w) w.style.display = 'none'; });
    }
    function closeRead(){ const w = document.getElementById('hbRead'); if (w) w.style.display = 'none'; }
    async function openRead(key, label, host){
        ensureRead();
        const row = await ensureLoaded(key);
        const card = document.getElementById('hbReadCard');
        const title = (row && row.title) || label || 'Help';
        const closeBtn = '<button class="hb-x" data-hbx>&times;</button>';
        if (!hasContent(row)){
            card.innerHTML = closeBtn
                + '<h3 class="hb-rt"><span class="hb-ric"><i class="fa-solid fa-circle-question"></i></span>' + esc(title) + '</h3>'
                + '<p class="hb-rs">No help has been added for this section yet.' + (canEditNow() ? ' Add one so your agents have guidance.' : '') + '</p>'
                + (canEditNow() ? '<div class="hb-rfoot"><button class="hb-editbtn hb-radd"><i class="fa-solid fa-plus"></i> Add help</button></div>' : '');
        } else {
            const steps = arr(row.steps), tips = arr(row.tips);
            card.innerHTML = closeBtn
                + '<h3 class="hb-rt"><span class="hb-ric"><i class="fa-solid fa-circle-question"></i></span>' + esc(title) + '</h3>'
                + (row.summary ? '<p class="hb-rs">' + esc(row.summary) + '</p>' : '')
                + (steps.length ? '<div class="hb-rh">How to use it</div><ol class="hb-rlist">' + steps.map(s => '<li>' + esc(s) + '</li>').join('') + '</ol>' : '')
                + (tips.length ? '<div class="hb-rh">Tips</div><ul class="hb-rlist hb-rtips">' + tips.map(s => '<li>' + esc(s) + '</li>').join('') + '</ul>' : '')
                + (row.video_url ? '<a class="hb-video" href="' + esc(row.video_url) + '" target="_blank" rel="noopener"><i class="fa-solid fa-play"></i> Watch the walkthrough</a>' : '')
                + (canEditNow() ? '<div class="hb-rfoot"><button class="hb-editbtn hb-redit"><i class="fa-solid fa-pen"></i> Edit this help</button></div>' : '');
        }
        const xb = card.querySelector('[data-hbx]'); if (xb) xb.onclick = closeRead;
        const editBtn = card.querySelector('.hb-redit, .hb-radd');
        if (editBtn) editBtn.onclick = () => { closeRead(); openEditor(key, label, host, () => openRead(key, label, host)); };
        document.getElementById('hbRead').style.display = 'flex';
    }

    /* ── Editor (owner/admin) ─────────────────────────────────────── */
    function ensureModal(){
        if (document.getElementById('hbModal')) return;
        const L='display:block;font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:#5a6270;margin:12px 0 4px;';
        const I="width:100%;border:1.5px solid #e2e5ea;border-radius:8px;padding:9px 12px;font-size:13.5px;font-family:'Inter',sans-serif;outline:none;box-sizing:border-box;";
        const B="border:none;border-radius:8px;padding:9px 18px;font-size:13.5px;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;";
        const w = document.createElement('div'); w.id='hbModal';
        w.style.cssText='display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:10002;align-items:center;justify-content:center;padding:18px;';
        w.innerHTML =
            '<div style="background:#fff;border-radius:16px;width:100%;max-width:560px;max-height:92vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.35);">'
          + '<div style="padding:16px 22px;border-bottom:1px solid #e2e5ea;font-family:\'Bebas Neue\',sans-serif;font-size:22px;letter-spacing:1px;color:#1a1d22;">Edit help &amp; SOP</div>'
          + '<div style="padding:6px 22px 18px;">'
          +   '<label style="'+L+'">Title</label><input id="hbTitle" style="'+I+'" placeholder="e.g. Managing a Transaction File">'
          +   '<label style="'+L+'">What this section is</label><textarea id="hbSummary" rows="2" style="'+I+'resize:vertical;" placeholder="One or two plain-English sentences."></textarea>'
          +   '<label style="'+L+'">How to use it <span style="font-weight:500;text-transform:none;letter-spacing:0;color:#9ca3af;">(one step per line)</span></label><textarea id="hbSteps" rows="6" style="'+I+'resize:vertical;" placeholder="Open My Contacts and pick a client\nLog a touch as you reach out\n..."></textarea>'
          +   '<label style="'+L+'">Tips <span style="font-weight:500;text-transform:none;letter-spacing:0;color:#9ca3af;">(one per line)</span></label><textarea id="hbTips" rows="3" style="'+I+'resize:vertical;" placeholder="Set a next-touch date on every contact\n..."></textarea>'
          +   '<label style="'+L+'">Walkthrough video URL <span style="font-weight:500;text-transform:none;letter-spacing:0;color:#9ca3af;">(optional)</span></label><input id="hbVideo" style="'+I+'" placeholder="https://...">'
          + '</div>'
          + '<div style="padding:14px 22px;border-top:1px solid #e2e5ea;display:flex;justify-content:space-between;gap:8px;">'
          +   '<button id="hbDelete" style="'+B+'background:#fff;color:#dc2626;border:1px solid #fecaca;display:none;">Delete</button>'
          +   '<div style="display:flex;gap:8px;margin-left:auto;"><button id="hbCancel" style="'+B+'background:#eef0f3;color:#1a1d22;">Cancel</button><button id="hbSave" style="'+B+'background:#c03926;color:#fff;">Save</button></div>'
          + '</div></div>';
        document.body.appendChild(w);
        w.addEventListener('click', e => { if (e.target === w) w.style.display='none'; });
        document.getElementById('hbCancel').onclick = () => w.style.display='none';
    }
    function splitLines(v){ return v.split('\n').map(s=>s.trim()).filter(Boolean); }
    function openEditor(key, label, host, onDone){
        if (!CANEDIT) return;
        ensureModal();
        const row = DATA[key] || {};
        document.getElementById('hbTitle').value   = row.title || label || '';
        document.getElementById('hbSummary').value = row.summary || '';
        document.getElementById('hbSteps').value   = arr(row.steps).join('\n');
        document.getElementById('hbTips').value    = arr(row.tips).join('\n');
        document.getElementById('hbVideo').value   = row.video_url || '';
        const del = document.getElementById('hbDelete');
        del.style.display = row.id ? '' : 'none';
        del.onclick = async () => {
            if (!confirm('Delete the help for this section?')) return;
            try {
                await SB.from('hub_help').delete().eq('page_key', key).eq('client_id', CID);
                DATA[key] = null;
                document.getElementById('hbModal').style.display='none';
                if (host) await renderOne({ key, container: host, label });
                if (onDone) onDone();
            } catch(e){ alert('Delete failed: '+e.message); }
        };
        document.getElementById('hbSave').onclick = async () => {
            const payload = {
                client_id: CID, page_key: key,
                title: document.getElementById('hbTitle').value.trim() || label || null,
                summary: document.getElementById('hbSummary').value.trim() || null,
                steps: splitLines(document.getElementById('hbSteps').value),
                tips: splitLines(document.getElementById('hbTips').value),
                video_url: document.getElementById('hbVideo').value.trim() || null,
                updated_at: new Date().toISOString()
            };
            try {
                const { error } = await SB.from('hub_help').upsert(payload, { onConflict: 'client_id,page_key' });
                if (error) throw error;
                DATA[key] = payload;
                document.getElementById('hbModal').style.display='none';
                if (host) await renderOne({ key, container: host, label });
                if (onDone) onDone();
            } catch(e){ alert('Save failed: '+e.message); }
        };
        document.getElementById('hbModal').style.display='flex';
        setTimeout(()=>document.getElementById('hbTitle').focus(), 50);
    }

    /* ── Styles ───────────────────────────────────────────────────── */
    function injectCss(){
        if (_cssDone) return; _cssDone = true;
        const css = `
        .hb-q{background:none;border:none;color:var(--text-muted,#94a3b8);font-size:16px;line-height:1;cursor:pointer;padding:2px;display:inline-flex;align-items:center;}
        .hb-q:hover{color:var(--red,#c03926);}
        .hb-q-add{color:var(--red,#c03926);}
        .hb-x{position:absolute;top:12px;right:14px;background:none;border:none;font-size:24px;color:#94a3b8;cursor:pointer;line-height:1;}
        .hb-x:hover{color:#0f172a;}
        .hb-rt{font-size:18px;margin-bottom:2px;display:flex;align-items:center;gap:10px;color:#0f172a;padding-right:26px;line-height:1.25;}
        .hb-ric{width:32px;height:32px;border-radius:9px;background:rgba(192,57,38,.1);color:#c03926;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;}
        .hb-rs{font-size:13.5px;color:#475569;line-height:1.6;margin:10px 0 4px;}
        .hb-rh{font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:#94a3b8;font-weight:800;margin:15px 0 7px;}
        .hb-rlist{margin:0 0 4px 18px;font-size:13px;color:#0f172a;line-height:1.7;}
        .hb-rtips{list-style:disc;}
        .hb-rfoot{margin-top:16px;}
        .hb-video{display:inline-flex;align-items:center;gap:8px;background:#c03926;color:#fff;text-decoration:none;font-size:13px;font-weight:700;padding:8px 15px;border-radius:8px;margin-top:14px;}
        .hb-editbtn{background:#fff;border:1px solid #e2e5ea;border-radius:8px;padding:7px 13px;font-size:12.5px;font-weight:700;color:#c03926;cursor:pointer;font-family:'Inter',sans-serif;display:inline-flex;gap:6px;align-items:center;}
        .hb-editbtn:hover{border-color:#c03926;}
        .hb-box{background:linear-gradient(135deg,#fff7ed,#ffffff);border:1px solid #fde3c7;border-left:4px solid var(--red,#c03926);border-radius:12px;padding:14px 18px;margin:0 0 16px;box-shadow:0 1px 3px rgba(15,23,42,.05);}
        .hb-box-add{background:#f7f8fa;border:1px dashed #d8dce2;border-left:1px dashed #d8dce2;padding:10px 14px;}
        .hb-boxbar{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;background:none;border:none;cursor:pointer;padding:0;font-family:'Inter',sans-serif;text-align:left;}
        .hb-boxhead{display:flex;align-items:center;gap:9px;font-size:14px;font-weight:800;color:#9a3412;}
        .hb-boxhead .hb-bic{width:26px;height:26px;border-radius:7px;background:rgba(192,57,38,.1);color:var(--red,#c03926);display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;}
        .hb-boxchev{color:var(--red,#c03926);font-size:13px;transition:transform .2s;flex-shrink:0;}
        .hb-box.hb-box-col .hb-boxchev{transform:rotate(-90deg);}
        .hb-box-body{margin-top:8px;}
        .hb-box.hb-box-col .hb-box-body{display:none;}
        .hb-box .hb-rs{margin:2px 0 4px;}
        .hb-box .hb-rfoot{margin-top:12px;padding-top:10px;border-top:1px solid #fde3c7;}
        `;
        const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    }
})();
