/* ══════════════════════════════════════════════════════════════════════
   admin-commissions.js — broker side of YRL commission tracking (admin.html)

   • Commissions tab: Agent Plans (+ company defaults), Production report,
     Payments (received from title / paid out), 1099 year-end export.
   • CDA hooks for the Closings tab: live Commission Breakdown panel that
     fills the PAY-TO amounts, atomic finalize/void, and a PDF page 2
     (agent statement).
   Math lives in commission-calc.js. Data: commission_settings,
   agent_commission_plans, commission_records (+ RPCs commission_context,
   admin_list_commissions, finalize_commission, void_commission).
   ══════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';
    const CLIENT = 'cf007287-a76c-4c9a-bd33-051816db6322';
    const CC = window.CommissionCalc;
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    const st = {
        settings: null, plans: {}, agents: [], records: [], closings: [],
        loaded: false, loading: null,
        prod: { preset: 'cap', from: '', to: '' },
        payFilter: 'open',
        taxYear: new Date().getFullYear(), threshold: 2000,
        cda: {}               // closingId -> { closing, ctx, eff, calc, overrides }
    };

    const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    const $ = (id) => document.getElementById(id);
    const m$ = (v) => CC.money(v || 0);
    const today = () => new Date().toISOString().slice(0, 10);
    const num = (v) => (v === '' || v == null ? null : Number(v));
    const lc = (e) => String(e || '').trim().toLowerCase();
    const fmtD = (d) => d ? new Date(String(d).slice(0, 10) + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

    async function sb() {
        const t0 = Date.now();
        while (!window.yrlClient) {
            if (Date.now() - t0 > 7000) throw new Error('Not signed in — refresh and log in.');
            await new Promise((r) => setTimeout(r, 150));
        }
        return window.yrlClient;
    }
    const need = (res, what) => { if (res.error) throw new Error(what + ': ' + (res.error.message || res.error)); return res.data; };

    /* ════════════════════ data ════════════════════ */
    async function loadAll(force) {
        if (st.loaded && !force) return;
        if (st.loading && !force) return st.loading;
        st.loading = (async () => {
            const c = await sb();
            const [s, p, a, r, cl, al] = await Promise.all([
                c.from('commission_settings').select('*').eq('client_id', CLIENT).maybeSingle(),
                c.from('agent_commission_plans').select('*').eq('client_id', CLIENT),
                c.from('hub_authorized_agents').select('email,name,status,role').eq('client_id', CLIENT).eq('status', 'active'),
                c.rpc('admin_list_commissions', { p_from: null, p_to: null }),
                c.from('closing_requests').select('id,agent_email,agent_name,status,closing_date,total_commission,sales_price,property_address').order('closing_date', { ascending: false }),
                c.from('commission_email_aliases').select('alias_email,primary_email')
            ]);
            // one person, several logins (e.g. CSI Realty Team → Daniel Cope): alias → primary
            st.alias = {};
            (need(al, 'Aliases') || []).forEach((x) => { st.alias[lc(x.alias_email)] = lc(x.primary_email); });
            st.settings = need(s, 'Settings') || { year_start_month: 10, year_start_day: 1, default_split_pct: 70, default_post_cap_split_pct: 100, default_txn_fee: 0, default_txn_fee_payer: 'agent' };
            st.plans = {};
            (need(p, 'Plans') || []).forEach((row) => { st.plans[lc(row.agent_email)] = row; });
            const roster = {};
            (need(a, 'Agents') || []).forEach((row) => {
                if (st.alias[lc(row.email)]) return;   // alias logins roll up under their primary agent
                roster[lc(row.email)] = { email: lc(row.email), name: (row.name || '').trim() || lc(row.email).split('@')[0] };
            });
            Object.keys(st.plans).forEach((e) => { if (!roster[e]) roster[e] = { email: e, name: e.split('@')[0] }; });
            st.agents = Object.values(roster).sort((x, y) => x.name.localeCompare(y.name));
            st.records = need(r, 'Commission records') || [];
            st.closings = need(cl, 'Closings') || [];
            st.loaded = true;
        })();
        try { await st.loading; } finally { st.loading = null; }
    }
    const finals = () => st.records.filter((r) => r.status === 'final');
    const primary = (email) => (st.alias && st.alias[lc(email)]) || lc(email);
    const agentName = (email) => { const a = st.agents.find((x) => x.email === primary(email)); return a ? a.name : (email || '').split('@')[0]; };

    function capProgress(email) {
        const plan = st.plans[lc(email)] || null;
        const eff = CC.effectivePlan(st.settings, plan);
        const win = CC.capWindow(st.settings, plan, today());
        const paid = finals().filter((r) => lc(r.agent_email) === lc(email) && String(r.cap_year_start || '').slice(0, 10) === win.start)
            .reduce((s, r) => s + Number(r.cap_counted || 0), 0);
        return { eff, win, paid, cap: eff.annual_cap };
    }

    /* ════════════════════ styles ════════════════════ */
    function injectCss() {
        if ($('cm-css')) return;
        const s = document.createElement('style'); s.id = 'cm-css';
        s.textContent = `
        .cm-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;border:1px solid var(--border,#e2e5ea);border-radius:12px;background:var(--surface,#fff);}
        .cm-table{width:100%;border-collapse:collapse;font-size:13px;min-width:720px;}
        .cm-table th{font-size:10.5px;text-transform:uppercase;letter-spacing:.6px;color:var(--text-muted,#9ca3af);text-align:left;padding:10px 12px;border-bottom:1px solid var(--border,#e2e5ea);white-space:nowrap;background:var(--surface-2,#f7f8fa);}
        .cm-table td{padding:10px 12px;border-bottom:1px solid var(--border,#e2e5ea);vertical-align:middle;}
        .cm-table tr:last-child td{border-bottom:none;}
        .cm-table td.num,.cm-table th.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap;}
        .cm-table tfoot td{font-weight:800;background:var(--surface-2,#f7f8fa);}
        .cm-name{font-weight:700;}
        .cm-sub{font-size:11.5px;color:var(--text-muted,#9ca3af);}
        .cm-pill{display:inline-block;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;padding:2px 8px;border-radius:5px;background:rgba(192,57,38,.1);color:var(--red,#c03926);}
        .cm-pill.def{background:var(--surface-3,#eef0f3);color:var(--text-muted,#6b7280);}
        .cm-pill.ok{background:rgba(22,163,74,.12);color:#15803d;}
        .cm-pill.wait{background:rgba(234,179,8,.16);color:#a16207;}
        .cm-bar{height:8px;border-radius:99px;background:var(--surface-3,#eef0f3);overflow:hidden;min-width:110px;}
        .cm-bar > span{display:block;height:100%;background:var(--red,#c03926);border-radius:99px;}
        .cm-bar.full > span{background:#16a34a;}
        .cm-ctrl{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px;}
        .cm-ctrl select,.cm-ctrl input{padding:8px 10px;border:1.5px solid var(--border,#e2e5ea);border-radius:8px;font:inherit;font-size:13px;background:var(--surface,#fff);}
        .cm-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 13px;border-radius:8px;border:1.5px solid var(--red,#c03926);background:var(--red,#c03926);color:#fff;font:inherit;font-size:12.5px;font-weight:700;cursor:pointer;white-space:nowrap;}
        .cm-btn.ghost{background:transparent;color:var(--red,#c03926);}
        .cm-btn.sm{padding:5px 10px;font-size:11.5px;}
        .cm-summary{display:flex;gap:10px;flex-wrap:wrap;align-items:center;font-size:12.5px;color:var(--text-sec,#5a6270);margin-bottom:12px;}
        .cm-summary b{color:var(--text,#1a1d22);}
        .cm-empty{padding:26px;text-align:center;color:var(--text-muted,#9ca3af);font-size:13px;}
        .cm-overlay{position:fixed;inset:0;background:rgba(15,23,42,.55);display:none;align-items:center;justify-content:center;z-index:9500;padding:16px;}
        .cm-overlay.open{display:flex;}
        .cm-modal{background:#fff;border-radius:16px;max-width:620px;width:100%;max-height:92vh;overflow:auto;padding:22px;font-family:inherit;}
        .cm-modal h3{font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:1px;margin:0 0 4px;}
        .cm-modal .cm-hint{font-size:12px;color:var(--text-muted,#6b7280);margin-bottom:12px;}
        .cm-grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px 12px;}
        .cm-grid2 .full{grid-column:1/-1;}
        .cm-field label{display:block;font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:var(--text-sec,#5a6270);margin-bottom:4px;}
        .cm-field input,.cm-field select,.cm-field textarea{width:100%;box-sizing:border-box;padding:9px 11px;border:1.5px solid var(--border,#e2e5ea);border-radius:8px;font:inherit;font-size:13.5px;background:#fff;}
        .cm-field input:focus,.cm-field select:focus,.cm-field textarea:focus{outline:none;border-color:var(--red,#c03926);}
        .cm-legend{grid-column:1/-1;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.7px;color:var(--red,#c03926);margin-top:8px;border-top:1px solid var(--border,#e2e5ea);padding-top:10px;}
        .cm-actions{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin-top:18px;}
        .cm-msg{font-size:12px;margin-top:8px;}
        .cm-lines{width:100%;border-collapse:collapse;font-size:13px;}
        .cm-lines td{padding:6px 4px;border-bottom:1px dashed var(--border,#e2e5ea);}
        .cm-lines td.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap;}
        .cm-lines tr.sub td{font-weight:700;border-bottom-style:solid;}
        .cm-lines tr.tot td{font-weight:800;font-size:14px;border-bottom:none;color:#15803d;}
        .cm-lines tr.info td{color:var(--text-muted,#6b7280);font-style:italic;}
        .cm-ovr{font-size:10px;font-weight:800;color:#a16207;background:rgba(234,179,8,.16);padding:1px 6px;border-radius:4px;margin-left:6px;}
        .cm-box{border:1.5px solid rgba(192,57,38,.25);background:rgba(192,57,38,.03);border-radius:12px;padding:14px;margin-bottom:14px;}
        .cm-warn{font-size:12px;color:#b45309;background:rgba(234,179,8,.12);border-radius:8px;padding:7px 10px;margin-top:8px;}
        .cm-adj summary{cursor:pointer;font-size:12px;font-weight:700;color:var(--text-sec,#5a6270);margin-top:10px;}
        .cm-adj .cm-grid2{margin-top:8px;}
        .cm-payrow{border:1px solid var(--border,#e2e5ea);border-radius:12px;padding:12px 14px;margin-bottom:10px;background:var(--surface,#fff);}
        .cm-payhead{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:10px;}
        .cm-paygrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px 10px;align-items:end;}
        @media(max-width:560px){.cm-grid2{grid-template-columns:1fr;}.cm-modal{padding:16px;}}
        `;
        document.head.appendChild(s);
    }

    /* ════════════════════ Commissions tab ════════════════════ */
    async function open() {
        injectCss();
        ['cmPlans', 'cmProd', 'cmPay', 'cm1099'].forEach((id) => { const el = $(id); if (el && !st.loaded) el.innerHTML = '<div class="cm-empty">Loading…</div>'; });
        try { await loadAll(); renderAll(); }
        catch (e) { const el = $('cmPlans'); if (el) el.innerHTML = '<div class="cm-empty">Could not load commissions: ' + esc(e.message) + '</div>'; }
    }
    async function refresh() { try { await loadAll(true); renderAll(); } catch (e) { alert(e.message); } }
    function renderAll() { renderPlans(); renderProduction(); renderPayments(); render1099(); }

    /* ── Agent plans ── */
    function settingsSummary() {
        const s = st.settings || {};
        const cap = s.default_annual_cap != null ? m$(s.default_annual_cap) + ' cap' : 'no cap';
        return `<span>Cap year starts <b>${MONTHS[(s.year_start_month || 10) - 1]} ${s.year_start_day || 1}</b></span>
            <span>· Default <b>${Number(s.default_split_pct || 0)}/${100 - Number(s.default_split_pct || 0)}</b>, <b>${esc(cap)}</b></span>
            <span>· Txn fee <b>${m$(s.default_txn_fee || 0)}</b> (${s.default_txn_fee_payer === 'client' ? 'client pays' : 'agent pays'})</span>`;
    }
    function renderPlans() {
        const el = $('cmPlans'); if (!el) return;
        const rows = st.agents.map((a) => {
            const cp = capProgress(a.email), eff = cp.eff, custom = !!st.plans[a.email];
            const pct = cp.cap ? Math.min(100, Math.round((cp.paid / cp.cap) * 100)) : 0;
            const capCell = cp.cap == null ? '<span class="cm-sub">No cap</span>'
                : `<div class="cm-bar${pct >= 100 ? ' full' : ''}"><span style="width:${pct}%"></span></div>
                   <div class="cm-sub" style="margin-top:3px;">${m$(cp.paid)} of ${m$(cp.cap)}${pct >= 100 ? ' · <b style="color:#15803d">CAPPED</b>' : ''}</div>`;
            return `<tr>
                <td><div class="cm-name">${esc(a.name)}</div><div class="cm-sub">${esc(a.email)}</div></td>
                <td>${Number(eff.split_pct_agent)}/${100 - Number(eff.split_pct_agent)} ${custom ? '' : '<span class="cm-pill def">default</span>'}</td>
                <td class="num">${eff.annual_cap == null ? '—' : m$(eff.annual_cap)}</td>
                <td>${capCell}<div class="cm-sub">${esc(CC.capYearLabel(cp.win.start, cp.win.end))}</div></td>
                <td class="num">${m$(eff.txn_fee)}${eff.txn_fee_payer === 'client' ? '<div class="cm-sub">client pays</div>' : ''}</td>
                <td>${eff.mentor_pct ? esc(eff.mentor_name || 'Mentor') + ' · ' + eff.mentor_pct + '%' + (eff.mentor_deals_total != null ? '<div class="cm-sub">first ' + eff.mentor_deals_total + ' deals</div>' : '') : '<span class="cm-sub">—</span>'}</td>
                <td>${esc(eff.payable_to) || '<span class="cm-sub">—</span>'}</td>
                <td><button class="cm-btn ghost sm" onclick="AdminComm.openPlan('${esc(a.email)}')"><i class="fa-solid fa-pen"></i> Edit</button></td>
            </tr>`;
        }).join('');
        el.innerHTML = `
            <div class="cm-summary">${settingsSummary()}
                <button class="cm-btn ghost sm" onclick="AdminComm.openSettings()"><i class="fa-solid fa-sliders"></i> Company defaults</button>
                <button class="cm-btn ghost sm" onclick="AdminComm.refresh()"><i class="fa-solid fa-arrows-rotate"></i> Refresh</button>
            </div>
            ${st.agents.length ? `<div class="cm-scroll"><table class="cm-table">
                <thead><tr><th>Agent</th><th>Split</th><th class="num">Cap</th><th>Cap progress</th><th class="num">Txn fee</th><th>Mentor</th><th>Payable to</th><th></th></tr></thead>
                <tbody>${rows}</tbody></table></div>` : '<div class="cm-empty">No active agents found.</div>'}`;
    }

    function modal(html) {
        let ov = $('cmModal');
        if (!ov) {
            ov = document.createElement('div'); ov.id = 'cmModal'; ov.className = 'cm-overlay';
            ov.addEventListener('click', (e) => { if (e.target === ov) closeModal(); });
            document.body.appendChild(ov);
        }
        ov.innerHTML = '<div class="cm-modal">' + html + '</div>';
        ov.classList.add('open');
    }
    function closeModal() { const ov = $('cmModal'); if (ov) ov.classList.remove('open'); }

    const fld = (id, label, val, ph, type, extra) => `<div class="cm-field ${extra || ''}"><label for="${id}">${label}</label><input id="${id}" type="${type || 'text'}" ${type === 'number' ? 'step="0.01" min="0"' : ''} value="${esc(val == null ? '' : val)}" placeholder="${esc(ph || '')}"></div>`;
    const sel = (id, label, val, opts, extra) => `<div class="cm-field ${extra || ''}"><label for="${id}">${label}</label><select id="${id}">${opts.map((o) => `<option value="${esc(o[0])}"${String(val) === String(o[0]) ? ' selected' : ''}>${esc(o[1])}</option>`).join('')}</select></div>`;

    function openPlan(email) {
        email = lc(email);
        const p = st.plans[email] || {};
        const s = st.settings || {};
        const d = (v, f) => (v == null ? 'Default: ' + (f ? f(v) : '—') : '');
        const defCap = s.default_annual_cap != null ? m$(s.default_annual_cap) : 'no cap';
        modal(`
            <h3>${esc(agentName(email))} — Commission Plan</h3>
            <div class="cm-hint">${esc(email)} · Leave any field blank to use the company default.</div>
            <div class="cm-grid2">
                <div class="cm-legend">Split &amp; cap</div>
                ${fld('cp-split', 'Agent split % (agent keeps)', p.split_pct_agent, 'Default ' + (s.default_split_pct ?? 70) + '%', 'number')}
                ${fld('cp-cap', 'Annual cap ($ to company)', p.annual_cap, 'Default ' + defCap, 'number')}
                ${fld('cp-postsplit', 'Post-cap split % (agent keeps)', p.post_cap_split_pct, 'Default ' + (s.default_post_cap_split_pct ?? 100) + '%', 'number')}
                ${fld('cp-anniv', 'Own cap anniversary (optional)', p.cap_anniversary, '', 'date')}
                <div class="cm-legend">Transaction fee</div>
                ${fld('cp-fee', 'Transaction fee ($)', p.txn_fee, 'Default ' + m$(s.default_txn_fee || 0), 'number')}
                ${fld('cp-postfee', 'Post-cap transaction fee ($)', p.post_cap_txn_fee, 'Default: same as fee', 'number')}
                ${sel('cp-payer', 'Who pays the fee', p.txn_fee_payer || '', [['', 'Company default (' + (s.default_txn_fee_payer === 'client' ? 'client' : 'agent') + ')'], ['agent', 'Agent (deducted)'], ['client', 'Client (not deducted)']])}
                ${sel('cp-fcap', 'Fee counts toward cap?', p.txn_fee_counts_to_cap == null ? '' : String(p.txn_fee_counts_to_cap), [['', 'Company default (' + (s.default_txn_fee_counts_to_cap ? 'yes' : 'no') + ')'], ['true', 'Yes'], ['false', 'No']])}
                <div class="cm-legend">Team / mentor split</div>
                ${fld('cp-mname', 'Mentor / team lead name', p.mentor_name, 'e.g. Janet Giles')}
                ${fld('cp-memail', 'Mentor email', p.mentor_email, '', 'email')}
                ${fld('cp-mpct', 'Mentor % of agent share', p.mentor_pct, '0', 'number')}
                ${fld('cp-mdeals', 'For the first N deals (blank = every deal)', p.mentor_deals_total, '', 'number')}
                <div class="cm-legend">Payout details</div>
                ${fld('cp-payable', 'Payable to (LLC / corp for the CDA)', p.payable_to, 'Agent name')}
                ${fld('cp-lic', 'License #', p.license_number, '')}
                <div class="cm-field full"><label for="cp-notes">Notes</label><textarea id="cp-notes" rows="2">${esc(p.notes || '')}</textarea></div>
            </div>
            <div class="cm-msg" id="cp-msg"></div>
            <div class="cm-actions">
                ${p.id ? `<button class="cm-btn ghost" style="margin-right:auto" onclick="AdminComm.resetPlan('${esc(email)}')"><i class="fa-solid fa-rotate-left"></i> Reset to defaults</button>` : ''}
                <button class="cm-btn ghost" onclick="AdminComm.closeModal()">Cancel</button>
                <button class="cm-btn" onclick="AdminComm.savePlan('${esc(email)}')"><i class="fa-solid fa-floppy-disk"></i> Save plan</button>
            </div>`);
    }
    async function savePlan(email) {
        const g = (id) => ($(id) || {}).value;
        const msg = $('cp-msg');
        const pctOk = (v) => v === null || (v >= 0 && v <= 100);
        const row = {
            client_id: CLIENT, agent_email: lc(email),
            split_pct_agent: num(g('cp-split')), annual_cap: num(g('cp-cap')), post_cap_split_pct: num(g('cp-postsplit')),
            cap_anniversary: g('cp-anniv') || null,
            txn_fee: num(g('cp-fee')), post_cap_txn_fee: num(g('cp-postfee')),
            txn_fee_payer: g('cp-payer') || null,
            txn_fee_counts_to_cap: g('cp-fcap') === '' ? null : g('cp-fcap') === 'true',
            mentor_name: (g('cp-mname') || '').trim() || null, mentor_email: lc(g('cp-memail')) || null,
            mentor_pct: num(g('cp-mpct')), mentor_deals_total: num(g('cp-mdeals')),
            payable_to: (g('cp-payable') || '').trim() || null, license_number: (g('cp-lic') || '').trim() || null,
            notes: (g('cp-notes') || '').trim() || null,
            updated_at: new Date().toISOString(), updated_by: (window.yrlUser && window.yrlUser.email) || null
        };
        if (![row.split_pct_agent, row.post_cap_split_pct, row.mentor_pct].every(pctOk)) { msg.style.color = '#dc2626'; msg.textContent = 'Percentages must be between 0 and 100.'; return; }
        try {
            const c = await sb();
            const saved = need(await c.from('agent_commission_plans').upsert(row, { onConflict: 'client_id,agent_email' }).select().single(), 'Save');
            st.plans[lc(email)] = saved;
            closeModal(); renderAll(); remountOpenCdas();
        } catch (e) { msg.style.color = '#dc2626'; msg.textContent = e.message; }
    }
    async function resetPlan(email) {
        if (!confirm('Reset ' + agentName(email) + ' to the company default plan?')) return;
        try {
            const c = await sb();
            need(await c.from('agent_commission_plans').delete().eq('client_id', CLIENT).eq('agent_email', lc(email)), 'Reset');
            delete st.plans[lc(email)];
            closeModal(); renderAll(); remountOpenCdas();
        } catch (e) { alert(e.message); }
    }

    function openSettings() {
        const s = st.settings || {};
        const days = Array.from({ length: 28 }, (_, i) => [i + 1, String(i + 1)]);
        modal(`
            <h3>Company Commission Defaults</h3>
            <div class="cm-hint">Every agent without their own plan uses these. Changing the cap-year start affects deals finalized from now on — finalized deals keep the cap year they were recorded in.</div>
            <div class="cm-grid2">
                <div class="cm-legend">Cap year</div>
                ${sel('cs-month', 'Cap year starts — month', s.year_start_month || 10, MONTHS.map((mm, i) => [i + 1, mm]))}
                ${sel('cs-day', 'Day', s.year_start_day || 1, days)}
                <div class="cm-legend">Default plan</div>
                ${fld('cs-split', 'Agent split % (agent keeps)', s.default_split_pct ?? 70, '70', 'number')}
                ${fld('cs-cap', 'Annual cap ($ to company)', s.default_annual_cap, 'Blank = no cap', 'number')}
                ${fld('cs-postsplit', 'Post-cap split % (agent keeps)', s.default_post_cap_split_pct ?? 100, '100', 'number')}
                ${fld('cs-fee', 'Transaction fee ($)', s.default_txn_fee ?? 0, '0', 'number')}
                ${fld('cs-postfee', 'Post-cap transaction fee ($)', s.default_post_cap_txn_fee, 'Blank = same as fee', 'number')}
                ${sel('cs-payer', 'Who pays the fee', s.default_txn_fee_payer || 'agent', [['agent', 'Agent (deducted)'], ['client', 'Client (not deducted)']])}
                ${sel('cs-fcap', 'Fee counts toward cap?', String(!!s.default_txn_fee_counts_to_cap), [['false', 'No'], ['true', 'Yes']])}
            </div>
            <div class="cm-msg" id="cs-msg"></div>
            <div class="cm-actions">
                <button class="cm-btn ghost" onclick="AdminComm.closeModal()">Cancel</button>
                <button class="cm-btn" onclick="AdminComm.saveSettings()"><i class="fa-solid fa-floppy-disk"></i> Save defaults</button>
            </div>`);
    }
    async function saveSettings() {
        const g = (id) => ($(id) || {}).value;
        const msg = $('cs-msg');
        const row = {
            client_id: CLIENT,
            year_start_month: Number(g('cs-month')), year_start_day: Number(g('cs-day')),
            default_split_pct: num(g('cs-split')) ?? 70, default_annual_cap: num(g('cs-cap')),
            default_post_cap_split_pct: num(g('cs-postsplit')) ?? 100,
            default_txn_fee: num(g('cs-fee')) ?? 0, default_post_cap_txn_fee: num(g('cs-postfee')),
            default_txn_fee_payer: g('cs-payer'), default_txn_fee_counts_to_cap: g('cs-fcap') === 'true',
            updated_at: new Date().toISOString(), updated_by: (window.yrlUser && window.yrlUser.email) || null
        };
        if (!(row.default_split_pct >= 0 && row.default_split_pct <= 100) || !(row.default_post_cap_split_pct >= 0 && row.default_post_cap_split_pct <= 100)) {
            msg.style.color = '#dc2626'; msg.textContent = 'Percentages must be between 0 and 100.'; return;
        }
        try {
            const c = await sb();
            st.settings = need(await c.from('commission_settings').upsert(row, { onConflict: 'client_id' }).select().single(), 'Save');
            closeModal(); renderAll(); remountOpenCdas();
        } catch (e) { msg.style.color = '#dc2626'; msg.textContent = e.message; }
    }

    /* ── Production report ── */
    function rangeFor(preset) {
        const t = today(), y = Number(t.slice(0, 4));
        if (preset === 'cap') { const w = CC.capWindow(st.settings, null, t); return [w.start, w.end]; }
        if (preset === 'lastcap') {
            const w = CC.capWindow(st.settings, null, t);
            const prevDay = new Date(Date.parse(w.start + 'T12:00:00Z') - 86400000).toISOString().slice(0, 10);
            const p = CC.capWindow(st.settings, null, prevDay); return [p.start, p.end];
        }
        if (preset === 'ytd') return [y + '-01-01', t];
        if (preset === 'lastyear') return [(y - 1) + '-01-01', (y - 1) + '-12-31'];
        if (preset === 'custom') return [st.prod.from || null, st.prod.to || null];
        return [null, null];
    }
    const inRange = (d, f, t) => { d = String(d || '').slice(0, 10); return (!f || (d && d >= f)) && (!t || (d && d <= t)); };

    function productionRows() {
        const [f, t] = rangeFor(st.prod.preset);
        const by = {};
        const row = (email) => (email = primary(email), by[email] = by[email] || { email: email, name: agentName(email), deals: 0, volume: 0, gci: 0, referral: 0, company: 0, fees: 0, mentor: 0, net: 0, pendN: 0, pendGci: 0 });
        finals().filter((r) => inRange(r.closing_date, f, t)).forEach((r) => {
            const x = row(r.agent_email);
            x.deals++; x.volume += +r.sales_price || 0; x.gci += +r.gross || 0; x.referral += +r.referral_amount || 0;
            x.company += +r.company_dollar || 0; x.fees += +r.txn_fee || 0; x.mentor += +r.mentor_fee || 0; x.net += +r.agent_net || 0;
        });
        st.closings.filter((c) => (c.status === 'submitted' || c.status === 'in_review') && inRange(c.closing_date, f, t)).forEach((c) => {
            if (!c.agent_email) return;
            const x = row(c.agent_email); x.pendN++; x.pendGci += +c.total_commission || 0;
        });
        return { rows: Object.values(by).sort((a, b) => b.gci - a.gci), f, t };
    }
    function renderProduction() {
        const el = $('cmProd'); if (!el) return;
        const { rows, f, t } = productionRows();
        const tot = rows.reduce((s, r) => { Object.keys(s).forEach((k) => { s[k] += r[k]; }); return s; },
            { deals: 0, volume: 0, gci: 0, referral: 0, company: 0, fees: 0, mentor: 0, net: 0, pendN: 0, pendGci: 0 });
        const presets = [['cap', 'This cap year'], ['lastcap', 'Last cap year'], ['ytd', 'Calendar YTD'], ['lastyear', 'Last calendar year'], ['all', 'All time'], ['custom', 'Custom…']];
        el.innerHTML = `
            <div class="cm-ctrl">
                <select onchange="AdminComm.setProd('preset', this.value)">${presets.map((p) => `<option value="${p[0]}"${st.prod.preset === p[0] ? ' selected' : ''}>${p[1]}</option>`).join('')}</select>
                ${st.prod.preset === 'custom' ? `<input type="date" value="${esc(st.prod.from)}" onchange="AdminComm.setProd('from', this.value)"> to <input type="date" value="${esc(st.prod.to)}" onchange="AdminComm.setProd('to', this.value)">` : ''}
                <span class="cm-sub">${f || t ? esc(fmtD(f)) + ' – ' + esc(fmtD(t)) : 'All dates'}</span>
                <button class="cm-btn ghost sm" style="margin-left:auto" onclick="AdminComm.exportProduction()"><i class="fa-solid fa-file-csv"></i> Export CSV</button>
            </div>
            ${rows.length ? `<div class="cm-scroll"><table class="cm-table">
                <thead><tr><th>Agent</th><th class="num">Closed</th><th class="num">Volume</th><th class="num">GCI</th><th class="num">Referrals out</th><th class="num">Company $</th><th class="num">Txn fees</th><th class="num">Mentor</th><th class="num">Agent net</th><th class="num">Pending</th></tr></thead>
                <tbody>${rows.map((r) => `<tr><td><div class="cm-name">${esc(r.name)}</div></td>
                    <td class="num">${r.deals}</td><td class="num">${m$(r.volume)}</td><td class="num">${m$(r.gci)}</td><td class="num">${m$(r.referral)}</td>
                    <td class="num">${m$(r.company)}</td><td class="num">${m$(r.fees)}</td><td class="num">${m$(r.mentor)}</td><td class="num"><b>${m$(r.net)}</b></td>
                    <td class="num">${r.pendN ? r.pendN + ' · ' + m$(r.pendGci) : '—'}</td></tr>`).join('')}</tbody>
                <tfoot><tr><td>Team total</td><td class="num">${tot.deals}</td><td class="num">${m$(tot.volume)}</td><td class="num">${m$(tot.gci)}</td><td class="num">${m$(tot.referral)}</td>
                    <td class="num">${m$(tot.company)}</td><td class="num">${m$(tot.fees)}</td><td class="num">${m$(tot.mentor)}</td><td class="num">${m$(tot.net)}</td><td class="num">${tot.pendN ? tot.pendN + ' · ' + m$(tot.pendGci) : '—'}</td></tr></tfoot>
            </table></div>` : '<div class="cm-empty">No finalized or pending closings in this range yet. Finalizing a CDA in the Closings tab records it here.</div>'}`;
    }
    function setProd(k, v) { st.prod[k] = v; renderProduction(); }

    /* ── Payments ── */
    const settled = (r) => r.received_from_title_at && r.paid_to_agent_at && (!(+r.referral_amount) || r.referral_paid_at) && (!(+r.mentor_fee) || r.mentor_paid_at);
    function renderPayments() {
        const el = $('cmPay'); if (!el) return;
        const filters = [['open', 'Open'], ['title', 'Awaiting title'], ['agent', 'Awaiting agent payout'], ['all', 'All']];
        let list = finals();
        if (st.payFilter === 'open') list = list.filter((r) => !settled(r));
        if (st.payFilter === 'title') list = list.filter((r) => !r.received_from_title_at);
        if (st.payFilter === 'agent') list = list.filter((r) => !r.paid_to_agent_at);
        const d = (v) => esc(String(v || '').slice(0, 10));
        el.innerHTML = `
            <div class="cm-ctrl">${filters.map((f) => `<button class="sub-filter-btn${st.payFilter === f[0] ? ' active' : ''}" onclick="AdminComm.setPayFilter('${f[0]}')">${f[1]}</button>`).join('')}</div>
            ${list.length ? list.map((r) => {
                const yrl = r.calc && r.calc.yrl_payout != null ? r.calc.yrl_payout : null;
                return `<div class="cm-payrow" id="cmpay-${r.id}">
                    <div class="cm-payhead">
                        <div><div class="cm-name">${esc(r.property_address || 'Property')}</div>
                            <div class="cm-sub">${esc(r.display_name || agentName(r.agent_email))} · Closed ${esc(fmtD(r.closing_date))}</div></div>
                        <div style="text-align:right">
                            <div class="cm-sub">YRL check ${yrl != null ? '<b>' + m$(yrl) + '</b>' : '—'} · Agent net <b>${m$(r.agent_net)}</b></div>
                            ${settled(r) ? '<span class="cm-pill ok">Settled</span>' : '<span class="cm-pill wait">Open</span>'}
                        </div>
                    </div>
                    <div class="cm-paygrid">
                        <div class="cm-field"><label>Received from title</label><input type="date" id="pr-${r.id}" value="${d(r.received_from_title_at)}"></div>
                        <div class="cm-field"><label>Amount received</label><input type="number" step="0.01" min="0" id="pa-${r.id}" value="${esc(r.received_amount ?? '')}" placeholder="${yrl != null ? yrl : ''}"></div>
                        <div class="cm-field"><label>Paid to agent</label><input type="date" id="pp-${r.id}" value="${d(r.paid_to_agent_at)}"></div>
                        <div class="cm-field"><label>Method</label><select id="pm-${r.id}">${['', 'Check', 'ACH', 'Wire', 'Zelle', 'At closing (title)'].map((o) => `<option${(r.paid_method || '') === o ? ' selected' : ''}>${o}</option>`).join('')}</select></div>
                        <div class="cm-field"><label>Check # / ref</label><input id="pf-${r.id}" value="${esc(r.paid_ref || '')}"></div>
                        ${+r.referral_amount ? `<div class="cm-field"><label>Referral paid (${m$(r.referral_amount)})</label><input type="date" id="pq-${r.id}" value="${d(r.referral_paid_at)}"></div>` : ''}
                        ${+r.mentor_fee ? `<div class="cm-field"><label>Mentor paid (${m$(r.mentor_fee)})</label><input type="date" id="pt-${r.id}" value="${d(r.mentor_paid_at)}"></div>` : ''}
                        <div><button class="cm-btn sm" onclick="AdminComm.savePayment('${r.id}')"><i class="fa-solid fa-floppy-disk"></i> Save</button> <span class="cm-msg" id="pmsg-${r.id}"></span></div>
                    </div>
                </div>`;
            }).join('') : '<div class="cm-empty">Nothing here — ' + (finals().length ? 'every finalized deal in this view is settled.' : 'no finalized deals yet.') + '</div>'}`;
    }
    function setPayFilter(f) { st.payFilter = f; renderPayments(); }
    async function savePayment(id) {
        const g = (p) => ($(p + id) || {}).value;
        const msg = $('pmsg-' + id);
        const upd = {
            received_from_title_at: g('pr-') || null, received_amount: num(g('pa-')),
            paid_to_agent_at: g('pp-') || null, paid_method: g('pm-') || null, paid_ref: (g('pf-') || '').trim() || null,
            updated_at: new Date().toISOString()
        };
        if ($('pq-' + id)) upd.referral_paid_at = g('pq-') || null;
        if ($('pt-' + id)) upd.mentor_paid_at = g('pt-') || null;
        try {
            const c = await sb();
            need(await c.from('commission_records').update(upd).eq('id', id), 'Save');
            const r = st.records.find((x) => x.id === id); if (r) Object.assign(r, upd);
            if (msg) { msg.style.color = '#15803d'; msg.textContent = 'Saved'; }
            setTimeout(() => { renderPayments(); render1099(); }, 700);
        } catch (e) { if (msg) { msg.style.color = '#dc2626'; msg.textContent = e.message; } }
    }

    /* ── 1099 export (calendar tax year) ── */
    function taxRows(year) {
        const inYear = (d) => String(d || '').slice(0, 4) === String(year);
        const by = {};
        const add = (key, obj, amt) => { const x = (by[key] = by[key] || Object.assign({ total: 0, deals: 0 }, obj)); x.total += amt; x.deals++; };
        finals().forEach((r) => {
            const snap = r.plan_snapshot || {};
            if (inYear(r.paid_to_agent_at || r.closing_date) && +r.agent_net > 0)
                add('agent:' + lc(r.agent_email), { type: 'Agent', name: r.display_name || agentName(r.agent_email), email: lc(r.agent_email), payable: snap.payable_to || (st.plans[lc(r.agent_email)] || {}).payable_to || '' }, +r.agent_net);
            if (+r.mentor_fee > 0 && inYear(r.mentor_paid_at || r.closing_date))
                add('mentor:' + lc(snap.mentor_email || r.mentor_name), { type: 'Mentor', name: r.mentor_name || 'Mentor', email: lc(snap.mentor_email), payable: '' }, +r.mentor_fee);
            if (+r.referral_amount > 0 && inYear(r.referral_paid_at || r.closing_date))
                add('ref:' + lc(r.referral_payee), { type: 'Referral', name: r.referral_payee || 'Referral brokerage', email: '', payable: '' }, +r.referral_amount);
        });
        return Object.values(by).sort((a, b) => (a.type === b.type ? b.total - a.total : a.type.localeCompare(b.type)));
    }
    function render1099() {
        const el = $('cm1099'); if (!el) return;
        const y0 = new Date().getFullYear();
        const rows = taxRows(st.taxYear);
        el.innerHTML = `
            <div class="cm-ctrl">
                <select onchange="AdminComm.setTax('taxYear', this.value)">${[y0, y0 - 1, y0 - 2, y0 - 3].map((y) => `<option${String(st.taxYear) === String(y) ? ' selected' : ''}>${y}</option>`).join('')}</select>
                <label class="cm-sub">Flag at or above $<input type="number" min="0" step="1" value="${st.threshold}" style="width:90px" onchange="AdminComm.setTax('threshold', this.value)"></label>
                <button class="cm-btn ghost sm" style="margin-left:auto" onclick="AdminComm.export1099()"><i class="fa-solid fa-file-csv"></i> Export CSV</button>
            </div>
            <div class="cm-sub" style="margin-bottom:10px;">Calendar-year totals (not the cap year), by payout date — or closing date when no payout date is recorded. No SSNs/TINs are stored here; your accountant keeps the W-9s. Confirm the reporting threshold and which payees need a 1099 with your accountant.</div>
            ${rows.length ? `<div class="cm-scroll"><table class="cm-table">
                <thead><tr><th>Payee</th><th>Type</th><th>Email</th><th>Payable to</th><th class="num">Deals</th><th class="num">Total paid</th><th></th></tr></thead>
                <tbody>${rows.map((r) => `<tr><td class="cm-name">${esc(r.name)}</td><td>${esc(r.type)}</td><td class="cm-sub">${esc(r.email) || '—'}</td><td>${esc(r.payable) || '—'}</td>
                    <td class="num">${r.deals}</td><td class="num"><b>${m$(r.total)}</b></td><td>${r.total >= st.threshold ? '<span class="cm-pill">1099</span>' : ''}</td></tr>`).join('')}</tbody>
            </table></div>` : '<div class="cm-empty">No payouts recorded for ' + esc(st.taxYear) + '.</div>'}`;
    }
    function setTax(k, v) { st[k] = k === 'threshold' ? Number(v) || 0 : v; render1099(); }

    /* ── CSV ── */
    function downloadCsv(name, header, rows) {
        const q = (v) => { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
        const csv = [header].concat(rows).map((r) => r.map(q).join(',')).join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
        a.download = name; document.body.appendChild(a); a.click();
        setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    }
    function exportProduction() {
        const { rows, f, t } = productionRows();
        downloadCsv('yrl-production-' + (f || 'all') + '_' + (t || 'all') + '.csv',
            ['Agent', 'Email', 'Closed', 'Volume', 'GCI', 'Referrals out', 'Company $', 'Txn fees', 'Mentor', 'Agent net', 'Pending deals', 'Pending GCI'],
            rows.map((r) => [r.name, r.email, r.deals, r.volume.toFixed(2), r.gci.toFixed(2), r.referral.toFixed(2), r.company.toFixed(2), r.fees.toFixed(2), r.mentor.toFixed(2), r.net.toFixed(2), r.pendN, r.pendGci.toFixed(2)]));
    }
    function export1099() {
        downloadCsv('yrl-1099-' + st.taxYear + '.csv', ['Payee', 'Type', 'Email', 'Payable to', 'Deals', 'Total paid', 'At/above threshold'],
            taxRows(st.taxYear).map((r) => [r.name, r.type, r.email, r.payable, r.deals, r.total.toFixed(2), r.total >= st.threshold ? 'yes' : 'no']));
    }

    /* ════════════════════ CDA hooks (Closings tab) ════════════════════ */
    const cf = (id, f) => $('cf-' + id + '-' + f);
    function lockPayInputs(id, locked) {
        ['pay_to_agent_amount', 'pay_to_yrl_amount'].forEach((f) => {
            const el = cf(id, f); if (!el) return;
            el.readOnly = !!locked;
            el.style.background = locked ? 'var(--surface-2,#f7f8fa)' : '';
            el.title = locked ? 'Auto-calculated from the agent’s plan — adjust in the Commission Breakdown above' : '';
        });
    }
    async function mountBreakdown(c) {
        const box = $('cb-' + c.id); if (!box) return;
        injectCss();
        const email = lc(c.agent_email);
        if (!email) { box.innerHTML = '<div class="cm-warn">No agent email on this closing — the split can’t be calculated. Enter the PAY-TO amounts manually.</div>'; lockPayInputs(c.id, false); return; }
        const prev = st.cda[c.id];
        st.cda[c.id] = { closing: c, overrides: prev ? prev.overrides : {}, ctx: null };
        const out = box.querySelector('.cm-out');
        if (!out) {
            box.innerHTML = `<div class="cm-out"><div class="cm-sub">Calculating from ${esc(agentName(email) || email)}’s plan…</div></div>
                <details class="cm-adj"><summary>Adjust amounts (overrides the plan for this deal only)</summary>
                    <div class="cm-grid2">
                        ${['referral', 'company', 'mentor', 'txn_fee'].map((k) => `<div class="cm-field"><label>${{ referral: 'Referral fee $', company: 'Company split $', mentor: 'Mentor split $', txn_fee: 'Transaction fee $' }[k]}</label>
                            <input type="number" step="0.01" min="0" id="cbo-${c.id}-${k}" value="${esc((st.cda[c.id].overrides || {})[k] ?? '')}" placeholder="auto" oninput="AdminComm.setOverride('${c.id}','${k}',this.value)"></div>`).join('')}
                    </div>
                </details>`;
        }
        lockPayInputs(c.id, true);
        // The editor pre-fills PAY TO with the agent's plain name. If the broker never saved a
        // custom payee, treat that pre-fill as automatic so it becomes the plan's payable-to LLC.
        const nameEl = cf(c.id, 'pay_to_agent_name');
        if (nameEl && !c.pay_to_agent_name && !nameEl.dataset.auto) nameEl.dataset.auto = nameEl.value;
        try {
            const cl = await sb();
            const date = (cf(c.id, 'closing_date') || {}).value || c.closing_date || today();
            const { data, error } = await cl.rpc('commission_context', { p_agent_email: email, p_closing_date: date, p_exclude_closing_id: c.id });
            if (error) throw error;
            st.cda[c.id].ctx = data;
            recalc(c.id);
        } catch (e) {
            const o = box.querySelector('.cm-out');
            if (o) o.innerHTML = '<div class="cm-warn">Couldn’t load the commission plan: ' + esc(e.message || e) + '. Enter the PAY-TO amounts manually.</div>';
            lockPayInputs(c.id, false);
        }
    }
    function setOverride(id, k, v) {
        const s = st.cda[id]; if (!s) return;
        if (v === '' || v == null) delete s.overrides[k]; else s.overrides[k] = Number(v);
        recalc(id);
    }
    function recalc(id) {
        const s = st.cda[id]; if (!s || !s.ctx) return null;
        const v = (f) => (cf(id, f) || {}).value;
        const eff = CC.effectivePlan(s.ctx.settings, s.ctx.plan);
        const r = CC.calc(eff, s.ctx, {
            gross: v('total_commission'), referral_pct: v('referral_pct'), referral_amount: v('referral_amount'),
            referral_payee: v('referral_payee'), earnest_held: v('earnest_amount'),
            agent_name: s.ctx.agent_name, overrides: s.overrides
        });
        s.eff = eff; s.calc = r;

        const out = document.querySelector('#cb-' + id + ' .cm-out');
        if (out) {
            const cap = r.cap;
            const capTxt = cap.cap == null ? 'No cap'
                : (cap.capped_before ? '<b style="color:#15803d">Capped</b> for ' : m$(cap.paid_before) + ' of ' + m$(cap.cap) + ' paid → <b>' + m$(cap.remaining_after) + '</b> left after this deal · ') + esc(CC.capYearLabel(cap.year_start, cap.year_end));
            out.innerHTML = `
                <div class="cm-summary" style="margin-bottom:8px;">
                    <span><b>${esc(s.ctx.agent_name)}</b> · ${eff.split_pct_agent}/${100 - eff.split_pct_agent} ${eff.has_custom_plan ? '' : '<span class="cm-pill def">company default</span>'}</span>
                    <span>· ${capTxt}</span>
                    <button class="cm-btn ghost sm" onclick="AdminComm.editPlanFromCda('${esc(s.ctx.agent_email)}')"><i class="fa-solid fa-pen"></i> Plan</button>
                </div>
                <table class="cm-lines">${r.lines.map((l) => `<tr class="${l.total ? 'tot' : l.subtotal ? 'sub' : l.info ? 'info' : ''}">
                    <td>${esc(l.label)}${l.overridden ? '<span class="cm-ovr">ADJUSTED</span>' : ''}</td>
                    <td class="num">${l.info ? m$(l.feeAmount) : m$(l.amount)}</td></tr>`).join('')}</table>
                ${r.yrl_disburses.length ? '<div class="cm-sub" style="margin-top:8px;">YRL pays out of its check: ' + r.yrl_disburses.map((d) => esc(d.name) + ' ' + m$(d.amount)).join(' · ') + '</div>' : ''}
                ${r.warnings.map((w) => '<div class="cm-warn">' + esc(w) + '</div>').join('')}`;
        }
        // fill the CDA PAY-TO fields from the calc
        const nameEl = cf(id, 'pay_to_agent_name');
        const autoName = eff.payable_to || s.ctx.agent_name || '';
        if (nameEl && (!nameEl.value || nameEl.dataset.auto === nameEl.value)) { nameEl.value = autoName; nameEl.dataset.auto = autoName; }
        const a = cf(id, 'pay_to_agent_amount'); if (a) a.value = r.agent_net.toFixed(2);
        const y = cf(id, 'pay_to_yrl_amount'); if (y) y.value = r.yrl_payout.toFixed(2);
        return r;
    }
    function currentCalc(id) { return recalc(id); }
    function remountOpenCdas() { Object.keys(st.cda).forEach((id) => { if ($('cb-' + id)) mountBreakdown(st.cda[id].closing); }); }
    async function editPlanFromCda(email) {
        if (typeof window.switchAdminTab === 'function') window.switchAdminTab('commissions');
        await open(); openPlan(email);
    }

    async function finalize(id, merged) {
        const r = recalc(id); const s = st.cda[id];
        if (!r || !s || !s.ctx) throw new Error('The commission breakdown isn’t ready — check the agent email and total commission.');
        if (!(Number(merged.total_commission) > 0)) throw new Error('Enter the total commission before finalizing.');
        const rec = {
            agent_email: s.ctx.agent_email, agent_name: s.ctx.agent_name,
            closing_date: merged.closing_date, side: merged.side, property_address: merged.property_address,
            client_name: merged.client_name, sales_price: merged.sales_price,
            gross: r.gross, referral_payee: merged.referral_payee || null, referral_amount: r.referral,
            company_dollar: r.company_dollar, mentor_name: s.eff.mentor_name || null, mentor_fee: r.mentor_fee,
            txn_fee: r.txn_fee, txn_fee_payer: r.txn_fee_payer, agent_net: r.agent_net,
            cap_year_start: s.ctx.cap_year_start, cap_counted: r.cap_counted,
            plan_snapshot: s.eff, calc: r
        };
        const cl = await sb();
        const { data, error } = await cl.rpc('finalize_commission', { p_closing_id: id, p_rec: rec });
        if (error) throw new Error('Recording commission: ' + error.message);
        st.loaded = false;   // reports refresh next time the tab opens
        return data;
    }
    async function voidFor(id) {
        const cl = await sb();
        const { error } = await cl.rpc('void_commission', { p_closing_id: id });
        if (error) throw new Error('Voiding commission: ' + error.message);
        st.loaded = false;
    }
    /* completed CDA view: show the recorded breakdown */
    async function mountFinal(c) {
        const box = $('cbdone-' + c.id); if (!box) return;
        injectCss();
        try {
            const cl = await sb();
            const { data } = await cl.from('commission_records').select('calc,agent_net,company_dollar,cap_counted').eq('closing_request_id', c.id).eq('status', 'final').maybeSingle();
            if (!data || !data.calc) { box.innerHTML = '<div class="cm-sub">No commission breakdown recorded for this closing (finalized before commission tracking, or re-open & complete to record one).</div>'; return; }
            box.innerHTML = '<table class="cm-lines">' + data.calc.lines.map((l) => `<tr class="${l.total ? 'tot' : l.subtotal ? 'sub' : l.info ? 'info' : ''}"><td>${esc(l.label)}${l.overridden ? '<span class="cm-ovr">ADJUSTED</span>' : ''}</td><td class="num">${l.info ? m$(l.feeAmount) : m$(l.amount)}</td></tr>`).join('') + '</table>';
        } catch (e) { box.innerHTML = ''; }
    }

    /* PDF page 2 — commission breakdown / agent statement (jsPDF doc, inches) */
    function pdfBreakdownPage(doc, c, r) {
        if (!r) return;
        const RED = [192, 57, 38], M = 0.65, R = 7.85;
        const fm = (v) => (Number(v) < 0 ? '(' : '') + '$' + Math.abs(Number(v) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + (Number(v) < 0 ? ')' : '');
        doc.addPage();
        let y = 0.75;
        doc.setFont('times', 'bold'); doc.setTextColor(RED[0], RED[1], RED[2]); doc.setFontSize(15);
        doc.text('COMMISSION BREAKDOWN — AGENT STATEMENT', M, y); y += 0.2;
        doc.setDrawColor(RED[0], RED[1], RED[2]); doc.setLineWidth(0.02); doc.line(M, y, R, y); y += 0.32;
        doc.setFont('times', 'normal'); doc.setTextColor(40, 40, 40); doc.setFontSize(10.5);
        const info = [
            ['Property', (c.property_address || '') + (c.property_zip ? ', ' + c.property_zip : '')],
            ['Agent', (c.pay_to_agent_name || c.agent_name || '') + (c.agent_email ? '  (' + c.agent_email + ')' : '')],
            ['Closing date', c.closing_date ? new Date(c.closing_date + 'T12:00:00').toLocaleDateString('en-US') : ''],
            ['Sales price', fm(c.sales_price)]
        ];
        info.forEach(([k, v]) => { doc.setFont('times', 'bold'); doc.text(k + ':', M, y); doc.setFont('times', 'normal'); doc.text(String(v || ''), M + 1.25, y); y += 0.24; });
        y += 0.2;
        r.lines.forEach((l) => {
            doc.setFont('times', (l.total || l.subtotal) ? 'bold' : (l.info ? 'italic' : 'normal'));
            doc.setFontSize(l.total ? 12 : 11);
            doc.setTextColor(l.info ? 110 : 20, l.info ? 110 : 20, l.info ? 110 : 20);
            doc.text(l.label + (l.overridden ? '  (adjusted by broker)' : ''), M, y);
            doc.text(l.info ? fm(l.feeAmount) : fm(l.amount), R, y, { align: 'right' });
            if (l.subtotal || l.total) { doc.setDrawColor(120, 120, 120); doc.setLineWidth(0.006); doc.line(M, y - 0.17, R, y - 0.17); }
            y += 0.3;
        });
        y += 0.2;
        doc.setFont('times', 'bold'); doc.setTextColor(20, 20, 20); doc.setFontSize(11);
        doc.text('Paid at closing by title', M, y); y += 0.26;
        doc.setFont('times', 'normal');
        r.payees.forEach((p) => { doc.text(p.name + (p.note ? '  — ' + p.note : ''), M + 0.2, y); doc.text(fm(p.amount), R, y, { align: 'right' }); y += 0.24; });
        if (r.yrl_disburses.length) {
            y += 0.14; doc.setFont('times', 'bold'); doc.text('Paid by Your Realty Link from its proceeds', M, y); y += 0.26; doc.setFont('times', 'normal');
            r.yrl_disburses.forEach((p) => { doc.text(p.name + (p.key === 'referral' ? ' (referral fee)' : ' (mentor / team split)'), M + 0.2, y); doc.text(fm(p.amount), R, y, { align: 'right' }); y += 0.24; });
        }
        if (r.cap && r.cap.cap != null) {
            y += 0.2; doc.setFont('times', 'italic'); doc.setTextColor(80, 80, 80); doc.setFontSize(10);
            doc.text('Cap year ' + CC.capYearLabel(r.cap.year_start, r.cap.year_end) + ':  ' + fm(r.cap.paid_after) + ' of ' + fm(r.cap.cap) + ' paid toward cap' + (r.cap.remaining_after === 0 ? ' — CAPPED' : ' (' + fm(r.cap.remaining_after) + ' remaining)'), M, y);
        }
    }

    window.AdminComm = {
        open, refresh, openPlan, savePlan, resetPlan, openSettings, saveSettings, closeModal,
        setProd, exportProduction, setPayFilter, savePayment, setTax, export1099,
        mountBreakdown, mountFinal, setOverride, recalc, currentCalc, finalize, voidFor, editPlanFromCda,
        pdfBreakdownPage,
        _st: st   // for smoke tests
    };
})();
