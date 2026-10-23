/* ══════════════════════════════════════════════════════════════════════
   referral-tracker.js — per-agent referral tracker for the YRL hub.
   Mounted on yrl-referrals.html (#referralTracker).
   • Log referrals sent OR received: client, other party, status, fee.
   • Summary tiles (received / sent / closed / fees paid) + a filterable list.
   • Admins (owner/nomad_admin) can assign a referral to any agent and see a
     "Team Referrals" roster of everyone's referrals.
   Data via window.yrlClient (Supabase). agent_referrals RLS = auth.uid();
   admin assign/list go through log_referral_for_agent / admin_list_referrals.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var el = null, SB = null, ME = null, UID = null, booted = false;
  var IS_ADMIN = false, AGENTS = null, FILTER = 'all';
  var ROWS = [], TEAM = null;

  var DIRS = { sent: 'Sent out', received: 'Received' };
  var STATUSES = ['open','accepted','closed','paid','dead'];
  var STATUS_LBL = { open:'Open', accepted:'Accepted', closed:'Closed', paid:'Paid', dead:'Dead' };

  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function money(n){ n = +n || 0; return '$' + Math.round(n).toLocaleString(); }
  function today(){ return new Date().toISOString().slice(0,10); }
  function initials(n){ n = String(n||'').trim(); if (!n) return '?'; var p = n.split(/\s+/); return ((p[0]||'')[0]||'').toUpperCase() + (p.length>1 ? (p[p.length-1][0]||'').toUpperCase() : ''); }

  function injectCss(){
    if (document.getElementById('reftrack-css')) return;
    var st = document.createElement('style'); st.id = 'reftrack-css';
    st.textContent = [
      '.rft{margin:0 0 22px;}',
      '.rft-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px;}',
      '.rft-head h2{font-family:"Bebas Neue",sans-serif;font-size:24px;letter-spacing:1px;color:var(--text,#2C3340);margin:0;}',
      '.rft-head p{font-size:12.5px;color:var(--text-muted,#9CA3AF);margin:2px 0 0;}',
      '.rft-btn{display:inline-flex;align-items:center;gap:7px;background:var(--red,#c03926);color:#fff;border:none;border-radius:9px;padding:9px 15px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(192,57,38,.18);}',
      '.rft-btn.ghost{background:var(--surface-2,#F0EADF);color:var(--text,#2C3340);box-shadow:none;}',
      '.rft-btn:hover{filter:brightness(1.05);}',
      '.rft-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:14px;}',
      '.rft-kpi{background:var(--surface,#FDFAF6);border:1px solid var(--border-light,#EDE6D6);border-radius:12px;padding:14px 16px;box-shadow:0 1px 3px rgba(44,51,64,.06);}',
      '.rft-kpi .lbl{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--text-muted,#9CA3AF);}',
      '.rft-kpi .val{font-family:"Bebas Neue",sans-serif;font-size:30px;line-height:1.05;letter-spacing:1px;color:var(--text,#2C3340);margin-top:3px;}',
      '.rft-tabs{display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap;}',
      '.rft-tab{border:1px solid var(--border,#E2D9C8);background:var(--surface,#FDFAF6);color:var(--text-sec,#5B6472);border-radius:100px;padding:6px 14px;font-size:12.5px;font-weight:700;cursor:pointer;}',
      '.rft-tab.on{background:var(--red,#c03926);border-color:var(--red,#c03926);color:#fff;}',
      '.rft-list{display:flex;flex-direction:column;gap:8px;}',
      '.rft-row{display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid var(--border-light,#EDE6D6);border-radius:10px;background:var(--surface,#FDFAF6);cursor:pointer;}',
      '.rft-row.ro{cursor:default;}',
      '.rft-row:hover:not(.ro){border-color:var(--red,#c03926);}',
      '.rft-dir{flex-shrink:0;width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:14px;}',
      '.rft-dir.received{background:rgba(26,122,66,.12);color:#1A7A42;}',
      '.rft-dir.sent{background:rgba(37,99,235,.12);color:#2563EB;}',
      '.rft-main{flex:1;min-width:0;}',
      '.rft-t{font-size:14px;font-weight:600;color:var(--text,#2C3340);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.rft-s{font-size:12px;color:var(--text-muted,#9CA3AF);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.rft-fee{flex-shrink:0;font-size:13.5px;font-weight:700;color:var(--text,#2C3340);text-align:right;}',
      '.rft-pill{flex-shrink:0;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.4px;padding:3px 9px;border-radius:100px;}',
      '.rft-pill.open{background:rgba(217,138,40,.15);color:#B45309;}',
      '.rft-pill.accepted{background:rgba(37,99,235,.12);color:#2563EB;}',
      '.rft-pill.closed{background:rgba(26,122,66,.12);color:#1A7A42;}',
      '.rft-pill.paid{background:rgba(22,163,74,.16);color:#15803D;}',
      '.rft-pill.dead{background:rgba(107,114,128,.14);color:#6B7280;}',
      '.rft-empty{font-size:13px;color:var(--text-muted,#9CA3AF);padding:16px 4px;}',
      '.rft-ava{flex-shrink:0;width:30px;height:30px;border-radius:50%;background:var(--slate,#2C3340);color:#fff;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;}',
      '.rft-team{margin-top:22px;padding-top:18px;border-top:1px solid var(--border-light,#EDE6D6);}',
      '.rft-team h3{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:var(--text-muted,#9CA3AF);margin:0 0 12px;}',
      /* modal */
      '.rfm-ov{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:6000;display:flex;align-items:center;justify-content:center;padding:18px;}',
      '.rfm{background:var(--surface,#FDFAF6);border-radius:16px;box-shadow:0 20px 60px rgba(15,23,42,.3);width:100%;max-width:480px;max-height:92vh;overflow:auto;}',
      '.rfm-h{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border-light,#EDE6D6);}',
      '.rfm-h h3{margin:0;font-family:"Bebas Neue",sans-serif;font-size:22px;letter-spacing:1px;color:var(--text,#2C3340);}',
      '.rfm-x{border:none;background:none;font-size:22px;color:var(--text-muted,#9CA3AF);cursor:pointer;line-height:1;}',
      '.rfm-b{padding:18px 20px;display:flex;flex-direction:column;gap:12px;}',
      '.rfm-b label{display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--text-muted,#9CA3AF);margin-bottom:5px;}',
      '.rfm-b input,.rfm-b select,.rfm-b textarea{width:100%;box-sizing:border-box;padding:10px 12px;border:1.5px solid var(--border,#E2D9C8);border-radius:9px;font-family:inherit;font-size:14px;color:var(--text,#2C3340);background:var(--surface,#FDFAF6);}',
      '.rfm-b textarea{min-height:60px;resize:vertical;}',
      '.rfm-b input:focus,.rfm-b select:focus,.rfm-b textarea:focus{outline:none;border-color:var(--red,#c03926);}',
      '.rfm-2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}',
      '.rfm-foot{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 20px 20px;}',
      '.rfm-del{border:none;background:none;color:var(--red,#c03926);font-size:12.5px;font-weight:700;cursor:pointer;}',
      '@media(max-width:760px){.rft-kpis{grid-template-columns:1fr 1fr;}}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(st);
  }

  function mount(container){
    el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    injectCss();
    el.innerHTML = '<div class="rft"><div class="rft-empty">Loading referrals…</div></div>';
    function go(){ SB = window.yrlClient; ME = window.yrlMember; UID = (window.yrlUser && window.yrlUser.id) || null; IS_ADMIN = !!(ME && (ME.role === 'owner' || ME.role === 'nomad_admin')); render(); }
    if (window.yrlClient) go();
    else document.addEventListener('yrl-auth-ready', function(){ if (!booted){ booted = true; go(); } }, { once: true });
  }

  async function loadAgents(){
    if (AGENTS) return AGENTS;
    try {
      var r = await SB.from('hub_authorized_agents').select('email,name,status').eq('status','active');
      AGENTS = (r.data || []).slice().sort(function(a,b){ return String(a.name||a.email).localeCompare(String(b.name||b.email)); });
    } catch(e){ AGENTS = []; }
    return AGENTS;
  }

  async function fetchAll(){
    try { var r = await SB.from('agent_referrals').select('*').order('created_at', { ascending: false }); ROWS = r.data || []; } catch(e){ ROWS = []; }
    if (IS_ADMIN){ try { var tm = await SB.rpc('admin_list_referrals'); TEAM = tm.error ? [] : (tm.data || []); } catch(e){ TEAM = []; } }
  }

  async function render(){
    if (!SB){ el.innerHTML = '<div class="rft"><div class="rft-empty">Sign in to track referrals.</div></div>'; return; }
    await fetchAll();

    var received = ROWS.filter(function(r){ return r.direction === 'received'; });
    var sent = ROWS.filter(function(r){ return r.direction === 'sent'; });
    var closed = ROWS.filter(function(r){ return r.status === 'closed' || r.status === 'paid'; });
    var feesPaid = ROWS.reduce(function(s,r){ return s + (r.status === 'paid' ? (+r.referral_fee || 0) : 0); }, 0);

    var shown = ROWS.filter(function(r){ return FILTER === 'all' || r.direction === FILTER; });

    el.innerHTML =
      '<div class="rft">' +
        '<div class="rft-head"><div><h2>Referral Tracker</h2><p>Track referrals you send &amp; receive, their status, and fees.</p></div>' +
          '<button class="rft-btn" id="rfAdd"><i class="fa-solid fa-plus"></i> Log a referral</button>' +
        '</div>' +
        '<div class="rft-kpis">' +
          kpi('Received', received.length) +
          kpi('Sent Out', sent.length) +
          kpi('Closed', closed.length) +
          kpi('Fees Paid', money(feesPaid)) +
        '</div>' +
        '<div class="rft-tabs">' +
          tab('all','All ('+ROWS.length+')') + tab('received','Received ('+received.length+')') + tab('sent','Sent ('+sent.length+')') +
        '</div>' +
        rowList(shown) +
        (IS_ADMIN ? teamBlock() : '') +
      '</div>';

    document.getElementById('rfAdd').onclick = function(){ openModal(null); };
    el.querySelectorAll('.rft-tab').forEach(function(b){ b.onclick = function(){ FILTER = b.getAttribute('data-f'); render(); }; });
    el.querySelectorAll('.rft-row[data-id]').forEach(function(rw){ rw.onclick = function(){ var id = rw.getAttribute('data-id'); var rec = ROWS.find(function(x){ return x.id === id; }); if (rec) openModal(rec); }; });
  }

  function kpi(lbl, val){ return '<div class="rft-kpi"><div class="lbl">' + esc(lbl) + '</div><div class="val">' + esc(val) + '</div></div>'; }
  function tab(f, lbl){ return '<button class="rft-tab' + (FILTER===f?' on':'') + '" data-f="' + f + '">' + esc(lbl) + '</button>'; }

  function rowHtml(r, ro){
    var dir = r.direction === 'sent' ? 'sent' : 'received';
    var icon = dir === 'sent' ? 'fa-arrow-up-right-from-square' : 'fa-arrow-down-to-bracket';
    var who = r.party_name ? (dir === 'sent' ? 'To ' + r.party_name : 'From ' + r.party_name) : '';
    var sub = [who, r.client_name ? 'Client: ' + r.client_name : '', r.close_date || ''].filter(Boolean).join(' · ');
    var fee = r.referral_fee ? money(r.referral_fee) : (r.referral_fee_pct ? (+r.referral_fee_pct) + '%' : '');
    return '<div class="rft-row' + (ro ? ' ro' : '') + '"' + (ro ? '' : ' data-id="' + esc(r.id) + '"') + '>' +
        '<div class="rft-dir ' + dir + '"><i class="fa-solid ' + icon + '"></i></div>' +
        '<div class="rft-main"><div class="rft-t">' + esc(r.client_name || r.party_name || (dir==='sent'?'Referral sent':'Referral received')) + '</div>' +
          '<div class="rft-s">' + esc(sub || (dir==='sent'?'Sent out':'Received')) + '</div></div>' +
        (fee ? '<div class="rft-fee">' + esc(fee) + '</div>' : '') +
        '<span class="rft-pill ' + esc(r.status||'open') + '">' + esc(STATUS_LBL[r.status] || r.status || 'Open') + '</span>' +
      '</div>';
  }
  function rowList(rows){
    if (!rows.length) return '<div class="rft-empty">No referrals logged yet. Click “Log a referral” to add one.</div>';
    return '<div class="rft-list">' + rows.map(function(r){ return rowHtml(r, false); }).join('') + '</div>';
  }

  function teamBlock(){
    var team = TEAM || [];
    var byAgent = {};
    team.forEach(function(r){
      var k = r.agent_email || r.agent_id || '—';
      if (!byAgent[k]) byAgent[k] = { name: r.agent_name || k, rows: [] };
      byAgent[k].rows.push(r);
    });
    var agents = Object.keys(byAgent).map(function(k){ return byAgent[k]; }).sort(function(a,b){ return b.rows.length - a.rows.length; });
    var body;
    if (!team.length){ body = '<div class="rft-empty">No team referrals yet. Use “Log a referral” and pick an agent to assign one.</div>'; }
    else {
      body = '<div class="rft-list">' + agents.map(function(a){
        var closed = a.rows.filter(function(r){ return r.status==='closed'||r.status==='paid'; }).length;
        var fees = a.rows.reduce(function(s,r){ return s + (r.status==='paid' ? (+r.referral_fee||0) : 0); }, 0);
        var last = a.rows[0];
        var sub = a.rows.length + ' total · ' + closed + ' closed' + (fees ? ' · ' + money(fees) + ' paid' : '');
        return '<div class="rft-row ro"><div class="rft-ava">' + esc(initials(a.name)) + '</div>' +
            '<div class="rft-main"><div class="rft-t">' + esc(a.name) + '</div><div class="rft-s">' + esc(sub) + '</div></div>' +
            (last ? '<span class="rft-pill ' + esc(last.status||'open') + '">' + esc(STATUS_LBL[last.status]||last.status||'Open') + '</span>' : '') +
          '</div>';
      }).join('') + '</div>';
    }
    return '<div class="rft-team"><h3>Team Referrals</h3>' + body + '</div>';
  }

  /* ── modal ── */
  function openModal(rec){
    var editing = !!rec;
    rec = rec || {};
    var ov = document.createElement('div'); ov.className = 'rfm-ov';
    var agentRow = IS_ADMIN && !editing
      ? '<div><label>Agent</label><select id="rfAgent"><option value="">Loading agents…</option></select></div>'
      : '';
    var statusOpts = STATUSES.map(function(s){ return '<option value="' + s + '"' + ((rec.status||'open')===s?' selected':'') + '>' + STATUS_LBL[s] + '</option>'; }).join('');
    var dirOpts = ['received','sent'].map(function(d){ return '<option value="' + d + '"' + ((rec.direction||'received')===d?' selected':'') + '>' + DIRS[d] + '</option>'; }).join('');
    ov.innerHTML = '<div class="rfm">' +
      '<div class="rfm-h"><h3>' + (editing ? 'Edit Referral' : 'Log a Referral') + '</h3><button class="rfm-x">&times;</button></div>' +
      '<div class="rfm-b">' +
        agentRow +
        '<div class="rfm-2"><div><label>Direction</label><select id="rfDir">' + dirOpts + '</select></div>' +
          '<div><label>Status</label><select id="rfStatus">' + statusOpts + '</select></div></div>' +
        '<div><label>Client name</label><input id="rfClient" type="text" value="' + esc(rec.client_name||'') + '" placeholder="Client being referred"></div>' +
        '<div><label>Other party (agent / brokerage / company)</label><input id="rfParty" type="text" value="' + esc(rec.party_name||'') + '" placeholder="Who you referred to / from"></div>' +
        '<div><label>Their phone or email</label><input id="rfContact" type="text" value="' + esc(rec.party_contact||'') + '" placeholder="Optional"></div>' +
        '<div><label>Property address</label><input id="rfAddr" type="text" value="' + esc(rec.property_address||'') + '" placeholder="Optional"></div>' +
        '<div class="rfm-2"><div><label>Referral fee %</label><input id="rfPct" type="number" inputmode="decimal" value="' + (rec.referral_fee_pct||'') + '" placeholder="25"></div>' +
          '<div><label>Referral fee $</label><input id="rfFee" type="number" inputmode="decimal" value="' + (rec.referral_fee||'') + '" placeholder="2500"></div></div>' +
        '<div class="rfm-2"><div><label>Sale price</label><input id="rfPrice" type="number" inputmode="decimal" value="' + (rec.sale_price||'') + '" placeholder="Optional"></div>' +
          '<div><label>Close date</label><input id="rfDate" type="date" value="' + esc(rec.close_date||'') + '"></div></div>' +
        '<div><label>Notes</label><textarea id="rfNotes" placeholder="Optional">' + esc(rec.notes||'') + '</textarea></div>' +
      '</div>' +
      '<div class="rfm-foot">' +
        (editing ? '<button class="rfm-del" id="rfDel"><i class="fa-solid fa-trash"></i> Delete</button>' : '<span></span>') +
        '<div style="display:flex;gap:8px;"><button class="rft-btn ghost" data-x>Cancel</button><button class="rft-btn" id="rfSave">Save</button></div>' +
      '</div>' +
      '</div>';
    ov.addEventListener('click', function(e){ if (e.target === ov) ov.remove(); });
    document.body.appendChild(ov);
    ov.querySelector('.rfm-x').onclick = function(){ ov.remove(); };
    ov.querySelector('[data-x]').onclick = function(){ ov.remove(); };

    if (IS_ADMIN && !editing){
      loadAgents().then(function(list){
        var sel = ov.querySelector('#rfAgent'); if (!sel) return;
        var opts = ['<option value="">Myself (broker)</option>'];
        list.forEach(function(a){ opts.push('<option value="' + esc(a.email) + '">' + esc(a.name||a.email) + '</option>'); });
        sel.innerHTML = opts.join('');
      });
    }

    if (editing){
      ov.querySelector('#rfDel').onclick = async function(){
        if (!confirm('Delete this referral?')) return;
        this.disabled = true;
        var res = await SB.from('agent_referrals').delete().eq('id', rec.id);
        if (res.error){ alert('Could not delete: ' + res.error.message); this.disabled = false; return; }
        ov.remove(); render();
      };
    }

    ov.querySelector('#rfSave').onclick = async function(){
      var fields = {
        direction: ov.querySelector('#rfDir').value,
        client_name: ov.querySelector('#rfClient').value || null,
        property_address: ov.querySelector('#rfAddr').value || null,
        party_name: ov.querySelector('#rfParty').value || null,
        party_contact: ov.querySelector('#rfContact').value || null,
        status: ov.querySelector('#rfStatus').value || 'open',
        referral_fee_pct: parseFloat(ov.querySelector('#rfPct').value) || null,
        referral_fee: parseFloat(ov.querySelector('#rfFee').value) || null,
        sale_price: parseFloat(ov.querySelector('#rfPrice').value) || null,
        close_date: ov.querySelector('#rfDate').value || null,
        notes: ov.querySelector('#rfNotes').value || null
      };
      this.disabled = true; this.textContent = 'Saving…';
      var res;
      if (editing){
        res = await SB.from('agent_referrals').update(fields).eq('id', rec.id);
      } else {
        var assignEmail = IS_ADMIN && ov.querySelector('#rfAgent') ? ov.querySelector('#rfAgent').value : '';
        if (assignEmail){
          res = await SB.rpc('log_referral_for_agent', {
            p_agent_email: assignEmail, p_direction: fields.direction, p_client_name: fields.client_name,
            p_property_address: fields.property_address, p_party_name: fields.party_name, p_party_contact: fields.party_contact,
            p_status: fields.status, p_referral_fee_pct: fields.referral_fee_pct, p_referral_fee: fields.referral_fee,
            p_sale_price: fields.sale_price, p_close_date: fields.close_date, p_notes: fields.notes });
        } else {
          if (UID) fields.agent_id = UID;
          res = await SB.from('agent_referrals').insert(fields);
        }
      }
      if (res.error){ alert('Could not save: ' + res.error.message); this.disabled = false; this.textContent = 'Save'; return; }
      ov.remove(); AGENTS = null; render();
    };
  }

  window.ReferralTracker = { mount: mount };
})();
