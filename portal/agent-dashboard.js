/* ══════════════════════════════════════════════════════════════════════
   agent-dashboard.js — a real per-agent dashboard for the YRL hub.
   Mounted on the nomad "Dashboard" (hub-shell nomadFrame → #agentDash).
   • KPI tiles: sales closed, gross commission (YTD), active, under-contract.
   • Two circles: buyer/seller split donut + yearly-goal progress ring.
   • Gross commission chart: monthly bars, this year vs last (YoY).
   • Active/pending transactions (hub_transactions) + tasks due/overdue.
   • "+ Log a deal" + "Set goal" (agent_deals / agent_goals, per-agent RLS).
   Data via window.yrlClient (Supabase, RLS = auth.uid()). Chart.js loaded
   on demand from cdnjs, so non-dashboard pages don't pay for it.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var CHART_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js';
  var el = null, SB = null, ME = null, UID = null, booted = false;
  var IS_ADMIN = false, AGENTS = null;
  var YEAR = new Date().getFullYear();
  var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var charts = {};

  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function money(n){ n = +n || 0; return '$' + Math.round(n).toLocaleString(); }
  function moneyK(n){ n = +n || 0; if (Math.abs(n) >= 1000000) return '$' + (n/1000000).toFixed(1) + 'M'; if (Math.abs(n) >= 1000) return '$' + (n/1000).toFixed(1) + 'K'; return '$' + Math.round(n); }
  function today(){ return new Date().toISOString().slice(0,10); }
  function loadChart(cb){ if (window.Chart) return cb(); var s = document.createElement('script'); s.src = CHART_SRC; s.onload = cb; s.onerror = function(){ cb(); }; document.head.appendChild(s); }

  function injectCss(){
    if (document.getElementById('agent-dash-css')) return;
    var st = document.createElement('style'); st.id = 'agent-dash-css';
    st.textContent = [
      /* red banner so the dashboard stands out & breaks up the cream page */
      '.adash{margin:22px 0;padding:22px 24px;border-radius:18px;background:linear-gradient(150deg,#8a2417 0%,#a62d1b 52%,#7a2013 100%);box-shadow:0 6px 26px rgba(122,32,19,.26);}',
      '.adash-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px;}',
      '.adash-head h2{font-family:"Bebas Neue",sans-serif;font-size:26px;letter-spacing:1.2px;line-height:1;color:#fff;margin:0;}',
      '.adash-head p{font-size:12.5px;color:rgba(255,255,255,.82);margin:3px 0 0;}',
      '.adash-actions{display:flex;gap:8px;flex-wrap:wrap;}',
      /* primary stays red but pops on the red banner via a light ring + shadow */
      '.adash-btn{display:inline-flex;align-items:center;gap:7px;background:var(--red,#c03926);color:#fff;border:1.5px solid rgba(255,255,255,.5);border-radius:9px;padding:9px 15px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.22);}',
      '.adash-btn.ghost{background:rgba(255,255,255,.16);color:#fff;border:1px solid rgba(255,255,255,.45);box-shadow:none;}',
      '.adash-btn:hover{filter:brightness(1.06);}',
      '.adash-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:14px;}',
      '.adash-kpi{background:var(--surface,#FDFAF6);border:1px solid var(--border-light,#EDE6D6);border-radius:12px;padding:16px 18px;box-shadow:0 1px 3px rgba(44,51,64,.06);}',
      '.adash-kpi .lbl{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--text-muted,#9CA3AF);}',
      '.adash-kpi .val{font-family:"Bebas Neue",sans-serif;font-size:34px;line-height:1.05;letter-spacing:1px;color:var(--text,#2C3340);margin-top:4px;}',
      '.adash-kpi .sub{font-size:11.5px;color:var(--text-muted,#9CA3AF);margin-top:2px;}',
      '.adash-kpi .sub.up{color:#1A7A42;} .adash-kpi .sub.down{color:var(--red,#c03926);}',
      '.adash-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;}',
      '.adash-card{background:var(--surface,#FDFAF6);border:1px solid var(--border-light,#EDE6D6);border-radius:12px;padding:16px 18px;box-shadow:0 1px 3px rgba(44,51,64,.06);min-width:0;}',
      '.adash-card h3{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:var(--text-muted,#9CA3AF);margin:0 0 12px;}',
      '.adash-circles{display:grid;grid-template-columns:1fr 1fr;gap:14px;}',
      '.adash-donut{position:relative;height:170px;min-width:0;}',
      '.adash-donut canvas{max-height:170px;max-width:100%;}',
      '#agentDash canvas{max-width:100%;}',
      '.adash-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;}',
      '.adash-center .big{font-family:"Bebas Neue",sans-serif;font-size:32px;line-height:1;color:var(--text,#2C3340);}',
      '.adash-center .small{font-size:11px;color:var(--text-muted,#9CA3AF);margin-top:2px;}',
      '.adash-legend{display:flex;gap:14px;justify-content:center;margin-top:8px;font-size:11.5px;color:var(--text-sec,#5B6472);}',
      '.adash-legend i{display:inline-block;width:9px;height:9px;border-radius:3px;margin-right:5px;vertical-align:middle;}',
      '.adash-chartwrap{height:230px;}',
      '.adash-list{display:flex;flex-direction:column;gap:8px;}',
      '.adash-row{display:flex;align-items:center;gap:11px;padding:10px 12px;border:1px solid var(--border-light,#EDE6D6);border-radius:9px;background:var(--surface-2,#F0EADF);}',
      '.adash-row .rmain{flex:1;min-width:0;}',
      '.adash-ava{flex-shrink:0;width:30px;height:30px;border-radius:50%;background:var(--red,#c03926);color:#fff;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;}',
      '.adash-row .rt{font-size:13px;font-weight:600;color:var(--text,#2C3340);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.adash-row .rs{font-size:11.5px;color:var(--text-muted,#9CA3AF);}',
      '.adash-pill{flex-shrink:0;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.4px;padding:3px 9px;border-radius:100px;}',
      '.adash-pill.active{background:rgba(26,122,66,.12);color:#1A7A42;}',
      '.adash-pill.pending{background:rgba(192,57,38,.12);color:var(--red,#c03926);}',
      '.adash-pill.today{background:rgba(217,138,40,.15);color:#B45309;}',
      '.adash-pill.over{background:rgba(192,57,38,.14);color:var(--red,#c03926);}',
      '.adash-empty{font-size:12.5px;color:var(--text-muted,#9CA3AF);padding:14px 4px;}',
      '.adash-sub{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:var(--text-muted,#9CA3AF);margin:14px 0 8px;}',
      '.adash-sub:first-child{margin-top:0;}',
      /* modal */
      '.adm-ov{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:6000;display:flex;align-items:center;justify-content:center;padding:18px;}',
      '.adm{background:var(--surface,#FDFAF6);border-radius:16px;box-shadow:0 20px 60px rgba(15,23,42,.3);width:100%;max-width:440px;max-height:90vh;overflow:auto;}',
      '.adm-h{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border-light,#EDE6D6);}',
      '.adm-h h3{margin:0;font-family:"Bebas Neue",sans-serif;font-size:22px;letter-spacing:1px;color:var(--text,#2C3340);}',
      '.adm-x{border:none;background:none;font-size:22px;color:var(--text-muted,#9CA3AF);cursor:pointer;line-height:1;}',
      '.adm-b{padding:18px 20px;display:flex;flex-direction:column;gap:12px;}',
      '.adm-f label{display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--text-muted,#9CA3AF);margin-bottom:5px;}',
      '.adm-f input,.adm-f select{width:100%;box-sizing:border-box;padding:10px 12px;border:1.5px solid var(--border,#E2D9C8);border-radius:9px;font-family:inherit;font-size:14px;color:var(--text,#2C3340);background:var(--surface,#FDFAF6);}',
      '.adm-f input:focus,.adm-f select:focus{outline:none;border-color:var(--red,#c03926);}',
      '.adm-2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}',
      '.adm-foot{display:flex;justify-content:flex-end;gap:8px;padding:6px 20px 20px;}',
      '@media(max-width:860px){',
        '.adash-kpis{grid-template-columns:1fr 1fr;}',
        '.adash-grid{grid-template-columns:1fr;}',
        '.adash-circles{grid-template-columns:1fr;}',   /* stack the two circles so they never overflow */
      '}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(st);
  }

  function mount(container){
    el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    injectCss();
    el.innerHTML = '<div class="adash"><div class="adash-empty">Loading your dashboard…</div></div>';
    function go(){ SB = window.yrlClient; ME = window.yrlMember; UID = (window.yrlUser && window.yrlUser.id) || (ME && ME.user_id) || null; IS_ADMIN = !!(ME && (ME.role === 'owner' || ME.role === 'nomad_admin')); loadChart(function(){ render(); }); }
    if (window.yrlClient) go();
    else document.addEventListener('yrl-auth-ready', function(){ if (!booted){ booted = true; go(); } }, { once: true });
  }

  async function fetchAll(){
    var out = { deals: [], txns: [], tasks: [], goal: null, team: null };
    try { var d = await SB.from('agent_deals').select('*'); out.deals = d.data || []; } catch(e){}
    try { var t = await SB.from('hub_transactions').select('id,title,client_name,current_stage,status').neq('status','archived'); out.txns = t.data || []; } catch(e){}
    try { var k = await SB.from('agent_contact_tasks').select('title,due_date,done').eq('done', false); out.tasks = k.data || []; } catch(e){}
    try { var g = await SB.from('agent_goals').select('*').eq('year', YEAR).maybeSingle(); out.goal = g.data || null; } catch(e){}
    if (IS_ADMIN){ try { var tm = await SB.rpc('admin_list_deals'); out.team = tm.error ? [] : (tm.data || []); } catch(e){ out.team = []; } }
    return out;
  }

  /* Agent roster for the admin "assign a deal" dropdown (owner/admin only). */
  async function loadAgents(){
    if (AGENTS) return AGENTS;
    try {
      var r = await SB.from('hub_authorized_agents').select('email,name,status').eq('status', 'active');
      AGENTS = (r.data || []).slice().sort(function(a,b){ return String(a.name||a.email).localeCompare(String(b.name||b.email)); });
    } catch(e){ AGENTS = []; }
    return AGENTS;
  }

  function yearOf(dstr){ return dstr ? +String(dstr).slice(0,4) : null; }
  function monthOf(dstr){ return dstr ? (+String(dstr).slice(5,7) - 1) : null; }

  async function render(){
    if (!SB){ el.innerHTML = '<div class="adash"><div class="adash-empty">Sign in to see your dashboard.</div></div>'; return; }
    var data = await fetchAll();
    var closed = data.deals.filter(function(d){ return (d.status || 'closed') === 'closed' && d.close_date; });
    var thisYr = closed.filter(function(d){ return yearOf(d.close_date) === YEAR; });
    var lastYr = closed.filter(function(d){ return yearOf(d.close_date) === YEAR - 1; });
    var grossYTD = thisYr.reduce(function(s,d){ return s + (+d.gross_commission || 0); }, 0);
    var grossLast = lastYr.reduce(function(s,d){ return s + (+d.gross_commission || 0); }, 0);
    var buyers = thisYr.filter(function(d){ return d.side === 'buyer'; }).length;
    var sellers = thisYr.length - buyers;   // seller + listing
    var monThis = MON.map(function(_,i){ return thisYr.filter(function(d){ return monthOf(d.close_date) === i; }).reduce(function(s,d){ return s + (+d.gross_commission||0); }, 0); });
    var monLast = MON.map(function(_,i){ return lastYr.filter(function(d){ return monthOf(d.close_date) === i; }).reduce(function(s,d){ return s + (+d.gross_commission||0); }, 0); });

    var active = data.txns.filter(function(t){ return (t.status || 'active') === 'active'; });
    var isPending = function(t){ return /contract|pending|closing|escrow/i.test(t.current_stage || ''); };
    var pending = active.filter(isPending);
    var activeOnly = active.filter(function(t){ return !isPending(t); });

    var td = today();
    var dueToday = data.tasks.filter(function(t){ return t.due_date === td; });
    var overdue = data.tasks.filter(function(t){ return t.due_date && t.due_date < td; });

    var goal = data.goal || {};
    var gciGoal = +goal.gci_goal || 0;
    var goalPct = gciGoal > 0 ? Math.min(100, Math.round((grossYTD / gciGoal) * 100)) : 0;

    var yoy = grossLast > 0 ? Math.round(((grossYTD - grossLast) / grossLast) * 100) : null;
    var yoyCls = yoy == null ? '' : (yoy >= 0 ? 'up' : 'down');
    var yoyTxt = yoy == null ? 'No prior-year data' : (yoy >= 0 ? '▲ ' : '▼ ') + Math.abs(yoy) + '% vs ' + (YEAR-1);

    el.innerHTML =
      '<div class="adash">' +
        '<div class="adash-head"><div><h2>Your Dashboard</h2><p>' + YEAR + ' performance · ' + esc((ME && ME.name) || 'Agent') + '</p></div>' +
          '<div class="adash-actions">' +
            '<button class="adash-btn" id="adLogDeal"><i class="fa-solid fa-plus"></i> Log a deal</button>' +
            '<button class="adash-btn ghost" id="adSetGoal"><i class="fa-solid fa-bullseye"></i> Set goal</button>' +
          '</div>' +
        '</div>' +
        '<div class="adash-kpis">' +
          kpi('Sales Closed', thisYr.length, thisYr.length === 1 ? '1 deal this year' : thisYr.length + ' deals this year') +
          kpi('Gross Commission', moneyK(grossYTD), yoyTxt, yoyCls) +
          kpi('Active', activeOnly.length, 'in progress') +
          kpi('Under Contract', pending.length, 'pending close') +
        '</div>' +
        '<div class="adash-grid">' +
          '<div class="adash-card"><h3>Sales &amp; Goal</h3><div class="adash-circles">' +
            '<div><div class="adash-donut"><canvas id="adSplit"></canvas><div class="adash-center"><span class="big">' + thisYr.length + '</span><span class="small">sales</span></div></div>' +
              '<div class="adash-legend"><span><i style="background:var(--red,#c03926)"></i>Buyer ' + buyers + '</span><span><i style="background:#2C3340"></i>Seller ' + sellers + '</span></div></div>' +
            '<div><div class="adash-donut"><canvas id="adGoal"></canvas><div class="adash-center"><span class="big">' + (gciGoal > 0 ? goalPct + '%' : '—') + '</span><span class="small">' + (gciGoal > 0 ? 'of ' + moneyK(gciGoal) : 'set a goal') + '</span></div></div>' +
              '<div class="adash-legend"><span>GCI goal progress</span></div></div>' +
          '</div></div>' +
          '<div class="adash-card"><h3>Gross Commission — monthly</h3><div class="adash-chartwrap"><canvas id="adCommission"></canvas></div></div>' +
        '</div>' +
        '<div class="adash-grid">' +
          '<div class="adash-card"><h3>Transactions</h3>' +
            '<div class="adash-sub">Under contract (' + pending.length + ')</div>' + txnList(pending, 'pending') +
            '<div class="adash-sub">Active (' + activeOnly.length + ')</div>' + txnList(activeOnly, 'active') +
          '</div>' +
          '<div class="adash-card"><h3>Tasks</h3>' +
            '<div class="adash-sub">Overdue (' + overdue.length + ')</div>' + taskList(overdue, 'over') +
            '<div class="adash-sub">Due today (' + dueToday.length + ')</div>' + taskList(dueToday, 'today') +
          '</div>' +
        '</div>' +
        (IS_ADMIN ? teamCard(data.team || []) : '') +
      '</div>';

    document.getElementById('adLogDeal').onclick = logDealModal;
    document.getElementById('adSetGoal').onclick = function(){ setGoalModal(goal); };
    drawCharts(buyers, sellers, goalPct, gciGoal, monThis, monLast);
  }

  function kpi(lbl, val, sub, cls){
    return '<div class="adash-kpi"><div class="lbl">' + esc(lbl) + '</div><div class="val">' + esc(val) + '</div><div class="sub ' + (cls||'') + '">' + esc(sub) + '</div></div>';
  }
  function txnList(rows, kind){
    if (!rows.length) return '<div class="adash-empty">Nothing here yet.</div>';
    return '<div class="adash-list">' + rows.slice(0,6).map(function(t){
      return '<div class="adash-row"><div class="rmain"><div class="rt">' + esc(t.title || t.client_name || 'Transaction') + '</div><div class="rs">' + esc(t.current_stage || 'No stage set') + '</div></div>' +
        '<span class="adash-pill ' + kind + '">' + (kind === 'pending' ? 'Pending' : 'Active') + '</span></div>';
    }).join('') + '</div>';
  }
  function taskList(rows, kind){
    if (!rows.length) return '<div class="adash-empty">All clear.</div>';
    return '<div class="adash-list">' + rows.slice(0,6).map(function(t){
      return '<div class="adash-row"><div class="rmain"><div class="rt">' + esc(t.title) + '</div><div class="rs">' + esc(t.due_date || '') + '</div></div>' +
        '<span class="adash-pill ' + kind + '">' + (kind === 'over' ? 'Overdue' : 'Today') + '</span></div>';
    }).join('') + '</div>';
  }

  /* Admin-only: all agents' deals, grouped by agent, with YTD production. */
  function teamCard(team){
    var byAgent = {};
    team.forEach(function(d){
      var key = d.agent_email || d.agent_id || '—';
      if (!byAgent[key]) byAgent[key] = { name: d.agent_name || key, email: d.agent_email || '', deals: [] };
      byAgent[key].deals.push(d);
    });
    var agents = Object.keys(byAgent).map(function(k){ return byAgent[k]; }).sort(function(a,b){
      var ay = ytdGci(a.deals), by = ytdGci(b.deals); return by - ay;
    });
    var totalGci = team.reduce(function(s,d){ return s + (yearOf(d.close_date) === YEAR && (d.status||'closed')==='closed' ? (+d.gross_commission||0) : 0); }, 0);
    var totalClosed = team.filter(function(d){ return yearOf(d.close_date) === YEAR && (d.status||'closed')==='closed'; }).length;

    var body;
    if (!team.length){
      body = '<div class="adash-empty">No deals logged yet. Use “Log a deal” and pick an agent to assign one.</div>';
    } else {
      body = '<div class="adash-list">' + agents.map(function(a){
        var closed = a.deals.filter(function(d){ return yearOf(d.close_date) === YEAR && (d.status||'closed')==='closed'; });
        var pend = a.deals.filter(function(d){ return (d.status||'closed') !== 'closed'; });
        var gci = ytdGci(a.deals);
        var latest = a.deals[0];
        var sub = closed.length + ' closed · ' + moneyK(gci) + ' GCI' + (pend.length ? ' · ' + pend.length + ' pending' : '');
        return '<div class="adash-row">' +
            '<div class="adash-ava">' + esc(initials(a.name)) + '</div>' +
            '<div class="rmain"><div class="rt">' + esc(a.name) + '</div><div class="rs">' + esc(sub) + '</div></div>' +
            (latest ? '<span class="adash-pill ' + ((latest.status||'closed')==='closed'?'active':'pending') + '">' + esc(latest.property_address || latest.client_name || (latest.side||'deal')) + '</span>' : '') +
          '</div>';
      }).join('') + '</div>';
    }
    return '<div class="adash-grid" style="grid-template-columns:1fr;"><div class="adash-card"><h3>Team Deals · ' +
      totalClosed + ' closed · ' + moneyK(totalGci) + ' GCI (' + YEAR + ')</h3>' + body + '</div></div>';
  }
  function ytdGci(deals){ return deals.reduce(function(s,d){ return s + (yearOf(d.close_date) === YEAR && (d.status||'closed')==='closed' ? (+d.gross_commission||0) : 0); }, 0); }
  function initials(n){ n = String(n||'').trim(); if (!n) return '?'; var p = n.split(/\s+/); return ((p[0]||'')[0] || '' ).toUpperCase() + (p.length>1 ? (p[p.length-1][0]||'').toUpperCase() : ''); }

  function drawCharts(buyers, sellers, goalPct, gciGoal, monThis, monLast){
    if (!window.Chart) return;
    Object.keys(charts).forEach(function(k){ try { charts[k].destroy(); } catch(e){} });
    var red = '#c03926', slate = '#2C3340', slateL = '#8891A0', track = '#EDE6D6';
    var split = document.getElementById('adSplit');
    if (split) charts.split = new Chart(split, { type:'doughnut',
      data:{ labels:['Buyer','Seller'], datasets:[{ data:[buyers || 0, sellers || 0], backgroundColor:[red, slate], borderWidth:0 }] },
      options:{ cutout:'70%', plugins:{ legend:{ display:false }, tooltip:{ enabled:true } }, responsive:true, maintainAspectRatio:false } });
    var goalC = document.getElementById('adGoal');
    if (goalC) charts.goal = new Chart(goalC, { type:'doughnut',
      data:{ datasets:[{ data:[goalPct, Math.max(0,100-goalPct)], backgroundColor:[red, track], borderWidth:0 }] },
      options:{ cutout:'75%', rotation:-90, circumference:360, plugins:{ legend:{ display:false }, tooltip:{ enabled:false } }, responsive:true, maintainAspectRatio:false } });
    var com = document.getElementById('adCommission');
    if (com) charts.com = new Chart(com, { type:'bar',
      data:{ labels:MON, datasets:[
        { label:String(YEAR), data:monThis, backgroundColor:red, borderRadius:4 },
        { label:String(YEAR-1), data:monLast, backgroundColor:slateL, borderRadius:4 } ] },
      options:{ responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ position:'bottom', labels:{ boxWidth:10, font:{ size:11 } } }, tooltip:{ callbacks:{ label:function(c){ return c.dataset.label + ': ' + money(c.parsed.y); } } } },
        scales:{ x:{ grid:{ display:false } }, y:{ ticks:{ callback:function(v){ return moneyK(v); } }, grid:{ color:'rgba(44,51,64,.06)' } } } } });
  }

  /* ── modals ── */
  function overlay(html){
    var ov = document.createElement('div'); ov.className = 'adm-ov';
    ov.innerHTML = '<div class="adm">' + html + '</div>';
    ov.addEventListener('click', function(e){ if (e.target === ov) ov.remove(); });
    document.body.appendChild(ov); return ov;
  }
  function logDealModal(){
    var agentRow = IS_ADMIN
      ? '<div><label>Agent</label><select id="adAgent"><option value="">Loading agents…</option></select></div>'
      : '';
    var ov = overlay(
      '<div class="adm-h"><h3>Log a Deal</h3><button class="adm-x">&times;</button></div>' +
      '<div class="adm-b adm-f">' +
        agentRow +
        '<div><label>Side</label><select id="adSide"><option value="seller">Seller / Listing</option><option value="buyer">Buyer</option><option value="listing">Listing</option></select></div>' +
        '<div><label>Client name</label><input id="adClient" type="text" placeholder="Client"></div>' +
        '<div><label>Property address</label><input id="adAddr" type="text" placeholder="123 Main St"></div>' +
        '<div class="adm-2"><div><label>Sale price</label><input id="adPrice" type="number" inputmode="decimal" placeholder="350000"></div>' +
          '<div><label>Gross commission</label><input id="adComm" type="number" inputmode="decimal" placeholder="10500"></div></div>' +
        '<div class="adm-2"><div><label>Close date</label><input id="adDate" type="date" value="' + today() + '"></div>' +
          '<div><label>Status</label><select id="adStatus"><option value="closed">Closed</option><option value="pending">Pending</option><option value="active">Active</option></select></div></div>' +
        '<div style="font-size:11.5px;color:#6b7280;line-height:1.45;margin-top:2px;"><i class="fa-solid fa-circle-info"></i> Closings submitted through <b>Commission Distribution Form</b> are added here automatically once the broker completes the CDA — use this for deals outside the hub. (A deal you log here for the same property is matched up, not counted twice.)</div>' +
      '</div>' +
      '<div class="adm-foot"><button class="adash-btn ghost" data-x>Cancel</button><button class="adash-btn" id="adSave">Save deal</button></div>');
    ov.querySelector('.adm-x').onclick = function(){ ov.remove(); };
    ov.querySelector('[data-x]').onclick = function(){ ov.remove(); };
    if (IS_ADMIN){
      loadAgents().then(function(list){
        var sel = ov.querySelector('#adAgent'); if (!sel) return;
        var opts = ['<option value="">Myself (broker)</option>'];
        list.forEach(function(a){ opts.push('<option value="' + esc(a.email) + '">' + esc(a.name || a.email) + '</option>'); });
        sel.innerHTML = opts.join('');
      });
    }
    ov.querySelector('#adSave').onclick = async function(){
      var side   = ov.querySelector('#adSide').value;
      var client = ov.querySelector('#adClient').value || null;
      var addr   = ov.querySelector('#adAddr').value || null;
      var price  = parseFloat(ov.querySelector('#adPrice').value) || null;
      var comm   = parseFloat(ov.querySelector('#adComm').value) || null;
      var date   = ov.querySelector('#adDate').value || null;
      var status = ov.querySelector('#adStatus').value || 'closed';
      var assignEmail = IS_ADMIN && ov.querySelector('#adAgent') ? ov.querySelector('#adAgent').value : '';
      this.disabled = true; this.textContent = 'Saving…';
      var res;
      if (assignEmail){
        /* Assign to another agent via the admin RPC (deal lands in THEIR dashboard). */
        res = await SB.rpc('log_deal_for_agent', {
          p_agent_email: assignEmail, p_side: side, p_client_name: client, p_property_address: addr,
          p_sale_price: price, p_gross_commission: comm, p_close_date: date, p_status: status });
      } else {
        var rec = { side: side, client_name: client, property_address: addr, sale_price: price,
          gross_commission: comm, close_date: date, status: status };
        if (UID) rec.agent_id = UID;
        res = await SB.from('agent_deals').insert(rec);
      }
      if (res.error){ alert('Could not save: ' + res.error.message); this.disabled = false; this.textContent = 'Save deal'; return; }
      ov.remove(); AGENTS = null; render();
    };
  }
  function setGoalModal(goal){
    goal = goal || {};
    var ov = overlay(
      '<div class="adm-h"><h3>Set ' + YEAR + ' Goal</h3><button class="adm-x">&times;</button></div>' +
      '<div class="adm-b adm-f">' +
        '<div><label>Gross commission goal (GCI)</label><input id="adGciGoal" type="number" inputmode="decimal" placeholder="120000" value="' + (goal.gci_goal || '') + '"></div>' +
        '<div><label>Sales goal (# of deals)</label><input id="adSalesGoal" type="number" inputmode="numeric" placeholder="20" value="' + (goal.sales_goal || '') + '"></div>' +
      '</div>' +
      '<div class="adm-foot"><button class="adash-btn ghost" data-x>Cancel</button><button class="adash-btn" id="adGoalSave">Save goal</button></div>');
    ov.querySelector('.adm-x').onclick = function(){ ov.remove(); };
    ov.querySelector('[data-x]').onclick = function(){ ov.remove(); };
    ov.querySelector('#adGoalSave').onclick = async function(){
      var rec = { year: YEAR, gci_goal: parseFloat(ov.querySelector('#adGciGoal').value) || null, sales_goal: parseInt(ov.querySelector('#adSalesGoal').value, 10) || null };
      if (UID) rec.agent_id = UID;
      this.disabled = true; this.textContent = 'Saving…';
      var res = await SB.from('agent_goals').upsert(rec, { onConflict: 'agent_id,year' });
      if (res.error){ alert('Could not save: ' + res.error.message); this.disabled = false; this.textContent = 'Save goal'; return; }
      ov.remove(); render();
    };
  }

  window.AgentDashboard = { mount: mount };
})();
