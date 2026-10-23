/* ══════════════════════════════════════════════════════════════════════
   resource-list.js — categorized document/resource lists for a hub page
   ----------------------------------------------------------------------
   Renders a store of { categories:[{id,name,guides:[{id,title,link}]}] } from
   hub_content into a container, with owner/admin edit (add/rename/delete
   categories & items, upload files, paste links). Used by the Buyer and Seller
   pages to hold the marketing/resource content that used to live on the
   dissolved Marketing page. Edit entry is protected by editGate (PIN 1984).

   Depends on: hub-data.js (loadHubContent/saveHubContent/uploadHubFile),
   portal-auth.js (window.yrlMember/yrlClient), edit-gate.js (editGate).

   Mount:  ResourceList.mount({ container:'#id', key:'yrl-buyer-resources' })
   ══════════════════════════════════════════════════════════════════════ */
(function () {
    const uid = () => Math.random().toString(36).slice(2, 9);
    const esc = (s) => String(s == null ? '' : s)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const isOwner = () => !!(window.yrlMember && (window.yrlMember.role === 'owner' || window.yrlMember.role === 'nomad_admin'));

    /* Row-list skin (overrides the older per-page `.rl-grid` card grid). Appended
       at mount → wins the cascade over the page <style> + hub-theme.css, so every
       ResourceList (Buyer Financing Handouts, CE & Licensing, …) reads as a clean
       list of rows: title left, Open/Secure/Coming-soon label right. */
    function injectCss() {
        if (document.getElementById('rl-list-css')) return;
        const st = document.createElement('style'); st.id = 'rl-list-css';
        st.textContent = [
            '.rl-top{display:flex;justify-content:flex-end;margin-bottom:10px;}',
            '.rl-empty{color:var(--text-muted,#9CA3AF);font-size:13px;padding:10px 0;}',
            '.rl-cat{margin-bottom:22px;}',
            '.rl-catname{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.7px;color:var(--text-muted,#9CA3AF);margin-bottom:9px;display:flex;align-items:center;gap:8px;}',
            /* list, not grid */
            '.rl-grid{display:flex;flex-direction:column;gap:8px;}',
            '.rl-item{display:flex;align-items:center;gap:8px;}',
            '.rl-tile{flex:1;min-width:0;display:flex;align-items:center;justify-content:space-between;gap:12px;background:var(--surface,#FDFAF6);border:1px solid var(--border-light,#EDE6D6);border-radius:8px;padding:11px 15px;text-decoration:none;color:var(--text,#2C3340);font-family:inherit;font-weight:600;font-size:13.5px;transition:border-color .12s,background .12s;}',
            '.rl-tile:hover{border-color:var(--red,#c03926);background:var(--surface-2,#F0EADF);}',
            '.rl-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
            '.rl-badge{flex-shrink:0;font-size:10px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;color:var(--red,#c03926);}',
            '.rl-soon{flex-shrink:0;font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--text-muted,#9CA3AF);}',
            '.rl-tile.rl-dim{opacity:.65;cursor:default;background:var(--surface-2,#F0EADF);}',
            '.rl-tile.rl-dim:hover{border-color:var(--border-light,#EDE6D6);background:var(--surface-2,#F0EADF);}',
            '.rl-tile.rl-edit{cursor:pointer;}',
            '.rl-hint{flex-shrink:0;font-size:10px;color:var(--text-muted,#9CA3AF);font-weight:600;}',
            '.rl-x{flex-shrink:0;width:26px;height:26px;border:none;background:none;color:var(--red,#c03926);font-size:19px;line-height:1;cursor:pointer;border-radius:6px;}',
            '.rl-x:hover{background:rgba(192,57,38,.10);}',
            '.rl-up{flex-shrink:0;width:30px;height:30px;border:1px solid var(--border,#E2D9C8);background:var(--surface,#FDFAF6);border-radius:7px;color:var(--text-sec,#5B6472);cursor:pointer;font-size:12px;}',
            '.rl-catctrl{display:inline-flex;gap:4px;margin-left:2px;}',
            '.rl-catctrl button{border:none;background:none;color:var(--text-muted,#9CA3AF);cursor:pointer;font-size:11px;padding:2px 4px;border-radius:5px;}',
            '.rl-catctrl button:hover{color:var(--red,#c03926);background:rgba(192,57,38,.08);}',
            '.rl-add,.rl-addcat{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;background:none;border:1.5px dashed var(--border,#E2D9C8);border-radius:8px;padding:11px;font-size:12.5px;font-weight:700;color:var(--text-sec,#5B6472);cursor:pointer;font-family:inherit;}',
            '.rl-addcat{margin-top:8px;padding:13px;font-size:13px;}',
            '.rl-add:hover,.rl-addcat:hover{border-color:var(--red,#c03926);color:var(--red,#c03926);}',
            '.rl-editbtn{display:inline-flex;align-items:center;gap:6px;background:rgba(192,57,38,.08);color:var(--red,#c03926);border:1.5px solid var(--red,#c03926);border-radius:8px;padding:7px 14px;font-size:12.5px;font-weight:700;font-family:inherit;cursor:pointer;}',
            '.rl-editbtn.on{background:var(--red,#c03926);color:#fff;}'
        ].join('\n');
        (document.head || document.documentElement).appendChild(st);
    }

    async function mount(opts) {
        const el = typeof opts.container === 'string' ? document.querySelector(opts.container) : opts.container;
        if (!el) return;
        injectCss();
        const KEY = opts.key;
        let state = { categories: [] };
        let edit = false;

        try {
            const data = (typeof loadHubContent === 'function') ? await loadHubContent(KEY) : null;
            if (data && Array.isArray(data.categories)) state = data;
        } catch (e) { /* empty */ }

        async function save() {
            try { if (typeof saveHubContent === 'function') await saveHubContent(KEY, state); }
            catch (e) { alert('Could not save: ' + (e.message || e)); }
        }

        function itemHtml(cat, g) {
            const secure = (g.link || '').startsWith('secure:');
            const has = !!(g.link && g.link.trim());
            const badge = !has ? '<span class="rl-soon">Coming soon</span>'
                        : secure ? '<span class="rl-badge">Secure</span>'
                        : '<span class="rl-badge">Open</span>';
            const del = edit ? `<button class="rl-x" title="Remove" onclick="__rl_del('${cat.id}','${g.id}')">&times;</button>` : '';
            const up = edit ? `<button class="rl-up" title="Upload a file" onclick="event.stopPropagation();this.nextElementSibling.click();"><i class="fa-solid fa-arrow-up-from-bracket"></i></button><input type="file" style="display:none" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onchange="__rl_upload('${cat.id}','${g.id}',this)">` : '';
            const inner = `<span class="rl-name">${esc(g.title)}</span>${badge}`;
            let tile;
            if (edit) {
                tile = `<div class="rl-tile rl-edit" onclick="__rl_edit('${cat.id}','${g.id}')">${inner}<span class="rl-hint">Click to edit</span></div>`;
            } else if (secure) {
                tile = `<a class="rl-tile" href="#" onclick="__rl_secure(event,'${esc(g.link.slice(7))}')">${inner}</a>`;
            } else if (has) {
                tile = `<a class="rl-tile" href="${esc(g.link)}" target="_blank" rel="noopener">${inner}</a>`;
            } else {
                tile = `<div class="rl-tile rl-dim">${inner}</div>`;
            }
            return `<div class="rl-item">${del}${tile}</div>`;
        }

        function render() {
            const canEdit = isOwner();
            const editBtn = canEdit
                ? `<button class="rl-editbtn ${edit ? 'on' : ''}" onclick="__rl_toggle()">${edit ? '<i class="fa-solid fa-check"></i> Done' : '<i class="fa-solid fa-pen"></i> Edit'}</button>`
                : '';
            let html = `<div class="rl-top"><div></div>${editBtn}</div>`;
            if (!state.categories.length) {
                html += `<div class="rl-empty">No resources yet.${canEdit ? ' Turn on Edit to add some.' : ''}</div>`;
            }
            state.categories.forEach(cat => {
                const catCtrl = edit
                    ? `<span class="rl-catctrl">
                         <button onclick="__rl_renameCat('${cat.id}')" title="Rename"><i class="fa-solid fa-pen"></i></button>
                         <button onclick="__rl_delCat('${cat.id}')" title="Delete section"><i class="fa-solid fa-trash"></i></button>
                       </span>` : '';
                html += `<div class="rl-cat">
                    <div class="rl-catname">${esc(cat.name)}${catCtrl}</div>
                    <div class="rl-grid">
                        ${(cat.guides || []).map(g => itemHtml(cat, g)).join('')}
                        ${edit ? `<button class="rl-add" onclick="__rl_addItem('${cat.id}')"><i class="fa-solid fa-plus"></i> Add item</button>` : ''}
                    </div>
                </div>`;
            });
            if (edit) html += `<button class="rl-addcat" onclick="__rl_addCat()"><i class="fa-solid fa-plus"></i> Add section</button>`;
            el.innerHTML = html;
        }

        /* ── edit actions (exposed globally, namespaced) ── */
        window.__rl_toggle = function () {
            if (edit) { edit = false; render(); return; }
            editGate(function () { edit = true; render(); });
        };
        window.__rl_secure = async function (e, path) {
            e.preventDefault();
            try {
                const bucket = path.includes('/') ? 'hub-files' : 'hub-files';
                const { data, error } = await window.yrlClient.storage.from('hub-files').createSignedUrl(path, 120);
                if (error || !data) throw error || new Error('no url');
                window.open(data.signedUrl, '_blank', 'noopener');
            } catch (_e) { alert('This file is restricted. Contact your broker.'); }
        };
        const cat = id => state.categories.find(c => c.id === id);
        window.__rl_addCat = async function () {
            const name = prompt('Section name (emoji optional):', '📁 New Section');
            if (!name) return;
            state.categories.push({ id: uid(), name: name.trim(), guides: [] });
            await save(); render();
        };
        window.__rl_renameCat = async function (id) {
            const c = cat(id); if (!c) return;
            const name = prompt('Rename section:', c.name);
            if (name == null) return;
            c.name = name.trim() || c.name; await save(); render();
        };
        window.__rl_delCat = async function (id) {
            const c = cat(id); if (!c) return;
            if (!confirm(`Delete the "${c.name}" section and all its items?`)) return;
            state.categories = state.categories.filter(x => x.id !== id); await save(); render();
        };
        window.__rl_addItem = function (catId) {
            const c = cat(catId); if (!c) return;
            openRlModal({ head: 'Add Item', title: '', link: '', onSave: async ({ title, link }) => {
                (c.guides = c.guides || []).push({ id: uid(), title, link: link || null });
                await save(); render();
            }});
        };
        window.__rl_del = async function (catId, gId) {
            const c = cat(catId); if (!c) return;
            c.guides = (c.guides || []).filter(g => g.id !== gId); await save(); render();
        };
        window.__rl_edit = function (catId, gId) {
            const c = cat(catId); if (!c) return;
            const g = (c.guides || []).find(x => x.id === gId); if (!g) return;
            const secure = !!(g.link && g.link.startsWith('secure:'));
            openRlModal({
                head: 'Edit Item',
                title: g.title,
                link: secure ? '' : (g.link || ''),
                secureNote: secure,
                onSave: async ({ title, link }) => {
                    g.title = title || g.title;
                    if (link) g.link = link;            // typed a link or uploaded a file → use it
                    else if (!secure) g.link = null;    // cleared, and there was no attached file
                    // secure file + left blank → keep the existing attachment
                    await save(); render();
                }
            });
        };
        window.__rl_upload = async function (catId, gId, input) {
            const c = cat(catId); if (!c) return;
            const g = (c.guides || []).find(x => x.id === gId); if (!g) return;
            const f = input.files && input.files[0]; if (!f) return;
            try {
                if (typeof uploadHubFile !== 'function') throw new Error('upload unavailable');
                const url = await uploadHubFile(f, 'marketing');
                if (url) { g.link = url; await save(); render(); }
            } catch (e) { alert('Upload failed: ' + (e.message || e)); }
        };

        render();
    }

    /* ── Shared add/edit modal (title + link + upload, one popup) ──── */
    let _rlSaveCb = null;
    function closeRlModal(){ const m = document.getElementById('rlItemModal'); if (m) m.style.display = 'none'; _rlSaveCb = null; }
    function ensureRlModal(){
        if (document.getElementById('rlItemModal')) return;
        const L = 'display:block;font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:#5a6270;margin-bottom:4px;';
        const I = "width:100%;border:1.5px solid #e2e5ea;border-radius:8px;padding:10px 12px;font-size:14px;font-family:'Inter',sans-serif;outline:none;box-sizing:border-box;";
        const B = "border:none;border-radius:8px;padding:10px 18px;font-size:13.5px;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;";
        const wrap = document.createElement('div');
        wrap.id = 'rlItemModal';
        wrap.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:10000;align-items:center;justify-content:center;padding:18px;';
        wrap.innerHTML =
            '<div style="background:#fff;border-radius:16px;width:100%;max-width:440px;box-shadow:0 20px 60px rgba(0,0,0,.35);overflow:hidden;">'
          + '<div id="rlmHead" style="padding:16px 20px;border-bottom:1px solid #e2e5ea;font-family:\'Bebas Neue\',sans-serif;font-size:21px;letter-spacing:1px;color:#1a1d22;">Add Item</div>'
          + '<div style="padding:18px 20px;">'
          +   '<label style="'+L+'">Name</label>'
          +   '<input id="rlmTitle" style="'+I+'margin-bottom:14px;" placeholder="e.g. Pre-Listing Checklist">'
          +   '<label style="'+L+'">Link</label>'
          +   '<input id="rlmLink" style="'+I+'" placeholder="Paste a link…">'
          +   '<div style="display:flex;align-items:center;gap:10px;margin:14px 0 2px;"><div style="flex:1;height:1px;background:#eef0f3;"></div><span style="font-size:11px;color:#9ca3af;font-weight:700;">OR</span><div style="flex:1;height:1px;background:#eef0f3;"></div></div>'
          +   '<input type="file" id="rlmFile" style="display:none" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx">'
          +   '<button type="button" id="rlmUpload" style="width:100%;margin-top:8px;display:flex;align-items:center;justify-content:center;gap:8px;background:#f7f8fa;border:1.5px dashed #c9ccd3;border-radius:8px;padding:11px;font-size:13px;font-weight:700;color:#5a6270;cursor:pointer;font-family:\'Inter\',sans-serif;"><i class="fa-solid fa-arrow-up-from-bracket"></i> Upload a file</button>'
          +   '<div id="rlmStatus" style="font-size:12px;color:#9ca3af;margin-top:7px;text-align:center;min-height:14px;"></div>'
          + '</div>'
          + '<div style="padding:14px 20px;border-top:1px solid #e2e5ea;display:flex;justify-content:flex-end;gap:8px;">'
          +   '<button type="button" id="rlmCancel" style="'+B+'background:#eef0f3;color:#1a1d22;">Cancel</button>'
          +   '<button type="button" id="rlmSave" style="'+B+'background:#c03926;color:#fff;">Save</button>'
          + '</div></div>';
        document.body.appendChild(wrap);
        wrap.addEventListener('click', e => { if (e.target === wrap) closeRlModal(); });
        document.getElementById('rlmCancel').onclick = closeRlModal;
        document.getElementById('rlmUpload').onclick = () => document.getElementById('rlmFile').click();
        document.getElementById('rlmFile').onchange = async function(){
            const f = this.files && this.files[0]; if (!f) return;
            const st = document.getElementById('rlmStatus'); st.textContent = 'Uploading…'; st.style.color = '#9ca3af';
            try {
                if (typeof uploadHubFile !== 'function') throw new Error('upload unavailable on this page');
                const url = await uploadHubFile(f, 'marketing');
                if (!url) throw new Error('no url returned');
                document.getElementById('rlmLink').value = url;
                st.textContent = '✓ ' + f.name + ' attached'; st.style.color = '#16a34a';
            } catch (e) { st.textContent = 'Upload failed: ' + (e.message || e); st.style.color = '#dc2626'; }
            this.value = '';
        };
        document.getElementById('rlmSave').onclick = async function(){
            const title = document.getElementById('rlmTitle').value.trim();
            const link  = document.getElementById('rlmLink').value.trim();
            if (!title) { document.getElementById('rlmTitle').focus(); return; }
            const cb = _rlSaveCb; if (!cb) { closeRlModal(); return; }
            closeRlModal();
            await cb({ title, link: link || null });
        };
        document.getElementById('rlmTitle').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('rlmLink').focus(); } });
    }
    function openRlModal(opts){
        ensureRlModal();
        document.getElementById('rlmHead').textContent = opts.head || 'Add Item';
        document.getElementById('rlmTitle').value = opts.title || '';
        document.getElementById('rlmLink').value = opts.link || '';
        document.getElementById('rlmStatus').textContent = opts.secureNote ? '🔒 A file is already attached — leave blank to keep it, or upload/paste to replace.' : '';
        document.getElementById('rlmStatus').style.color = '#9ca3af';
        _rlSaveCb = opts.onSave;
        document.getElementById('rlItemModal').style.display = 'flex';
        setTimeout(() => document.getElementById('rlmTitle').focus(), 50);
    }

    window.ResourceList = { mount };
})();
