/* ══════════════════════════════════════════════════════════════════════
   calendar.js — the hub's unified calendar, mounted on the nomad Dashboard
   (between Important #'s and Your Dashboard).
   Aggregates dates from across the agent's data:
     • Personal events they add here (agent_calendar_events, per-agent RLS)
     • Deal close dates (agent_deals)
     • Transaction key dates (hub_transactions + hub_txn_dates)
     • Contact birthdays + home anniversaries (agent_contacts, recur yearly)
     • Estimated closings (agent_contacts.expected_close)
     • Tasks due (agent_contact_tasks)
   Agents add/edit/delete their own personal events; everything else is read-only.
   Data via window.yrlClient (Supabase, RLS = auth.uid()).
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var el = null, SB = null, ME = null, UID = null, booted = false;
  var view = new Date(); view.setDate(1);
  var selDay = ymd(new Date());
  var fixedByYmd = {}, recurringByMd = {}, personalById = {};
  var WD = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var MON = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var KIND = {
    personal:    { c:'#7c3aed', label:'My events' },
    event:       { c:'#6b7280', label:'Office event' },
    deal:        { c:'#c03926', label:'Deal close' },
    transaction: { c:'#2563eb', label:'Transaction' },
    birthday:    { c:'#db2777', label:'Birthday' },
    anniversary: { c:'#0d9488', label:'Home anniversary' },
    closing:     { c:'#16a34a', label:'Est. closing' },
    task:        { c:'#b45309', label:'Task due' }
  };

  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function pad(n){ return String(n).padStart(2,'0'); }
  function ymd(d){ return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
  function mdOf(s){ return String(s).slice(5,10); }
  function parseYmd(s){ var p=String(s).slice(0,10).split('-'); return new Date(+p[0],+p[1]-1,+p[2]); }
  function today(){ return ymd(new Date()); }
  function fmtTime(t){ if(!t) return ''; var p=String(t).split(':'); var h=+p[0], m=p[1]||'00'; var ap=h>=12?'PM':'AM'; h=h%12||12; return h+':'+m+' '+ap; }
  function fmtLong(s){ var d=parseYmd(s); return WD[d.getDay()]+', '+MON[d.getMonth()].slice(0,3)+' '+d.getDate(); }
  function yearsSince(s){ var d=parseYmd(s); return new Date().getFullYear()-d.getFullYear(); }

  function injectCss(){
    if (document.getElementById('hub-cal-css')) return;
    var st=document.createElement('style'); st.id='hub-cal-css';
    st.textContent=[
      '.hcal{background:var(--surface,#FDFAF6);border:1px solid var(--border-light,#EDE6D6);border-radius:16px;padding:18px 20px;box-shadow:0 1px 3px rgba(44,51,64,.06);margin:22px 0;}',
      '.hcal-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px;}',
      '.hcal-title{display:flex;align-items:center;gap:12px;}',
      '.hcal-title h2{font-family:"Bebas Neue",sans-serif;font-size:24px;letter-spacing:1px;color:var(--text,#2C3340);margin:0;}',
      '.hcal-nav{display:inline-flex;align-items:center;gap:4px;}',
      '.hcal-nav button{width:30px;height:30px;border:1px solid var(--border,#E2D9C8);background:var(--surface,#FDFAF6);border-radius:8px;cursor:pointer;color:var(--text-sec,#5B6472);display:flex;align-items:center;justify-content:center;}',
      '.hcal-nav button:hover{border-color:var(--red,#c03926);color:var(--red,#c03926);}',
      '.hcal-today{font-size:12px;font-weight:700;padding:0 10px;height:30px;border:1px solid var(--border,#E2D9C8);border-radius:8px;background:var(--surface,#FDFAF6);cursor:pointer;color:var(--text-sec,#5B6472);}',
      '.hcal-add{display:inline-flex;align-items:center;gap:7px;background:var(--red,#c03926);color:#fff;border:none;border-radius:9px;padding:9px 14px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;}',
      '.hcal-add:hover{filter:brightness(1.06);}',
      '.hcal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;}',
      '.hcal-wd{font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:var(--text-muted,#9CA3AF);text-align:center;padding:2px 0 4px;}',
      '.hcal-day{min-height:74px;border:1px solid var(--border-light,#EDE6D6);border-radius:9px;background:var(--surface-2,#F0EADF);padding:5px 6px;cursor:pointer;overflow:hidden;position:relative;}',
      '.hcal-day.out{opacity:.4;}',
      '.hcal-day.sel{border-color:var(--red,#c03926);box-shadow:0 0 0 1px var(--red,#c03926) inset;}',
      '.hcal-day .dn{font-size:12px;font-weight:700;color:var(--text-sec,#5B6472);}',
      '.hcal-day.today .dn{background:var(--red,#c03926);color:#fff;border-radius:50%;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;}',
      '.hcal-ev{font-size:10px;font-weight:600;color:#fff;border-radius:4px;padding:1px 5px;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.5;}',
      '.hcal-more{font-size:9.5px;font-weight:700;color:var(--text-muted,#9CA3AF);margin-top:2px;}',
      '.hcal-dot{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:5px;vertical-align:middle;}',
      '.hcal-legend{display:flex;flex-wrap:wrap;gap:10px 14px;margin-top:12px;font-size:11px;color:var(--text-sec,#5B6472);}',
      '.hcal-legend i{display:inline-block;width:9px;height:9px;border-radius:3px;margin-right:5px;vertical-align:middle;}',
      '.hcal-detail{margin-top:14px;border-top:1px solid var(--border-light,#EDE6D6);padding-top:12px;}',
      '.hcal-detail h3{font-size:12.5px;font-weight:800;color:var(--text,#2C3340);margin:0 0 9px;}',
      '.hcal-list{display:flex;flex-direction:column;gap:7px;}',
      '.hcal-row{display:flex;align-items:center;gap:10px;padding:8px 11px;border:1px solid var(--border-light,#EDE6D6);border-radius:9px;background:var(--surface,#FDFAF6);}',
      '.hcal-row .bar{width:4px;align-self:stretch;border-radius:4px;flex-shrink:0;}',
      '.hcal-row .rmain{flex:1;min-width:0;}',
      '.hcal-row .rt{font-size:13px;font-weight:600;color:var(--text,#2C3340);}',
      '.hcal-row .rs{font-size:11px;color:var(--text-muted,#9CA3AF);}',
      '.hcal-row .redit{border:none;background:none;color:var(--text-muted,#9CA3AF);cursor:pointer;font-size:12px;padding:4px;}',
      '.hcal-row .redit:hover{color:var(--red,#c03926);}',
      '.hcal-empty{font-size:12.5px;color:var(--text-muted,#9CA3AF);padding:8px 2px;}',
      /* modal */
      '.hcm-ov{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:6000;display:flex;align-items:center;justify-content:center;padding:18px;}',
      '.hcm{background:var(--surface,#FDFAF6);border-radius:16px;box-shadow:0 20px 60px rgba(15,23,42,.3);width:100%;max-width:420px;max-height:92vh;overflow:auto;}',
      '.hcm-h{display:flex;align-items:center;justify-content:space-between;padding:15px 18px;border-bottom:1px solid var(--border-light,#EDE6D6);}',
      '.hcm-h h3{margin:0;font-family:"Bebas Neue",sans-serif;font-size:21px;letter-spacing:1px;color:var(--text,#2C3340);}',
      '.hcm-x{border:none;background:none;font-size:22px;color:var(--text-muted,#9CA3AF);cursor:pointer;}',
      '.hcm-b{padding:16px 18px;display:flex;flex-direction:column;gap:11px;}',
      '.hcm-b label{display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--text-muted,#9CA3AF);margin-bottom:5px;}',
      '.hcm-b input,.hcm-b textarea{width:100%;box-sizing:border-box;padding:9px 12px;border:1.5px solid var(--border,#E2D9C8);border-radius:9px;font-family:inherit;font-size:14px;color:var(--text,#2C3340);background:var(--surface,#FDFAF6);}',
      '.hcm-b textarea{min-height:52px;resize:vertical;}',
      '.hcm-2{display:grid;grid-template-columns:1fr 1fr;gap:11px;}',
      '.hcm-foot{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:4px 18px 18px;}',
      '.hcm-del{border:none;background:none;color:var(--red,#c03926);font-size:12.5px;font-weight:700;cursor:pointer;}',
      '.hcm-btn{background:var(--red,#c03926);color:#fff;border:none;border-radius:9px;padding:9px 16px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;}',
      '.hcm-btn.ghost{background:var(--surface-2,#F0EADF);color:var(--text,#2C3340);}',
      '@media(max-width:600px){.hcal-day{min-height:56px;}.hcal-ev{display:none;}.hcal-day.has::after{content:"";position:absolute;bottom:5px;left:50%;transform:translateX(-50%);width:6px;height:6px;border-radius:50%;background:var(--red,#c03926);}}'
    ].join('\n');
    (document.head||document.documentElement).appendChild(st);
  }

  function mount(container){
    el = typeof container==='string'?document.querySelector(container):container;
    if (!el) return;
    injectCss();
    el.innerHTML='<div class="hcal"><div class="hcal-empty">Loading your calendar…</div></div>';
    function go(){ SB=window.yrlClient; ME=window.yrlMember; UID=(window.yrlUser&&window.yrlUser.id)||null; load(); }
    if (window.yrlClient) go();
    else document.addEventListener('yrl-auth-ready', function(){ if(!booted){ booted=true; go(); } }, { once:true });
  }

  function push(map, key, ev){ (map[key]=map[key]||[]).push(ev); }

  async function load(){
    if (!SB){ el.innerHTML='<div class="hcal"><div class="hcal-empty">Sign in to see your calendar.</div></div>'; return; }
    fixedByYmd={}; recurringByMd={}; personalById={};
    // Personal events
    // Personal + office events — shared with the sidebar Calendar (hub_events).
    try {
      var meEmail = (ME && ME.email) ? String(ME.email).toLowerCase() : '';
      var wy = new Date().getFullYear(), winStart = new Date(wy-1,0,1), winEnd = new Date(wy+2,11,31);
      var STEP = { monthly:1, quarterly:3, yearly:12, '2year':24, '3year':36 };
      var p=await SB.from('hub_events').select('*'); (p.data||[]).forEach(function(e){
        if (!e.start_date) return;
        var base=parseYmd(e.start_date);
        var mine = !!e.owner_email && meEmail && String(e.owner_email).toLowerCase()===meEmail && (e.visibility==='personal' || !e.visibility);
        if (mine) personalById[e.id]=e;
        var occ=[];
        if (e.recurrence && e.recurrence!=='none'){ var step=STEP[e.recurrence]||12, n=0, dd=new Date(base); while(dd<=winEnd && n<120){ if(dd>=winStart) occ.push(new Date(dd)); n++; dd=new Date(base); dd.setMonth(base.getMonth()+n*step); } }
        else occ.push(base);
        occ.forEach(function(d){ push(fixedByYmd, ymd(d), { title:e.title, kind: mine?'personal':'event', time:e.all_day?null:e.start_time, notes:e.description, id:e.id, personal:mine }); });
      });
    } catch(e){}
    // Deals — close dates
    try { var d=await SB.from('agent_deals').select('client_name,property_address,side,close_date,status'); (d.data||[]).forEach(function(r){
      if(!r.close_date) return;
      var lbl=(r.status==='closed'?'Closed: ':'Closing: ')+(r.client_name||r.property_address||r.side||'deal');
      push(fixedByYmd, String(r.close_date).slice(0,10), { title:lbl, kind:'deal' });
    }); } catch(e){}
    // Contacts — birthdays, anniversaries (recur yearly), estimated closings (fixed)
    // only YOUR contacts — owners/brokers can read every agent's, which would flood their calendar with other agents' birthdays
    try { var cq=SB.from('agent_contacts').select('name,birthday,home_anniversary,expected_close').eq('archived',false);
      if (window.yrlUser && window.yrlUser.id) cq = cq.eq('agent_id', window.yrlUser.id);
      var c=await cq; (c.data||[]).forEach(function(r){
      if(r.birthday)         push(recurringByMd, mdOf(r.birthday),        { title:(r.name||'Contact')+' — birthday', kind:'birthday', src:r.birthday });
      if(r.home_anniversary) push(recurringByMd, mdOf(r.home_anniversary),{ title:(r.name||'Contact')+' — home anniversary', kind:'anniversary', src:r.home_anniversary });
      if(r.expected_close)   push(fixedByYmd, String(r.expected_close).slice(0,10), { title:'Est. close: '+(r.name||'contact'), kind:'closing' });
    }); } catch(e){}
    // Transactions — key dates
    try {
      var t=await SB.from('hub_transactions').select('id,title,client_name,status').neq('status','archived');
      var tmap={}; (t.data||[]).forEach(function(x){ tmap[x.id]=x; });
      var td=await SB.from('hub_txn_dates').select('transaction_id,label,date_value');
      (td.data||[]).forEach(function(r){ if(!r.date_value||!tmap[r.transaction_id]) return;
        var f=tmap[r.transaction_id];
        push(fixedByYmd, String(r.date_value).slice(0,10), { title:(r.label||'Key date')+' — '+(f.title||f.client_name||'file'), kind:'transaction' });
      });
    } catch(e){}
    // Tasks — due
    try { var k=await SB.from('agent_contact_tasks').select('title,due_date,done').eq('done',false); (k.data||[]).forEach(function(r){
      if(!r.due_date) return;
      push(fixedByYmd, String(r.due_date).slice(0,10), { title:r.title||'Task', kind:'task' });
    }); } catch(e){}
    render();
  }

  function eventsFor(dstr){
    var d=parseYmd(dstr);
    var out=(fixedByYmd[dstr]||[]).slice();
    (recurringByMd[mdOf(dstr)]||[]).forEach(function(ev){
      var e=Object.assign({},ev);
      if (ev.src){ var yrs=(new Date()).getFullYear()-parseYmd(ev.src).getFullYear(); }
      out.push(e);
    });
    // order: timed personal first, then by kind
    return out;
  }

  function render(){
    var y=view.getFullYear(), m=view.getMonth();
    var first=new Date(y,m,1), start=new Date(y,m,1-first.getDay());
    var cells='';
    for (var i=0;i<42;i++){
      var d=new Date(start); d.setDate(start.getDate()+i);
      var ds=ymd(d), out=(d.getMonth()!==m);
      var evs=eventsFor(ds);
      var chips=evs.slice(0,3).map(function(ev){ return '<div class="hcal-ev" style="background:'+(KIND[ev.kind]||KIND.personal).c+'" title="'+esc(ev.title)+'">'+esc(ev.title)+'</div>'; }).join('');
      var more=evs.length>3?'<div class="hcal-more">+'+(evs.length-3)+' more</div>':'';
      cells+='<div class="hcal-day'+(out?' out':'')+(ds===today()?' today':'')+(ds===selDay?' sel':'')+(evs.length?' has':'')+'" data-d="'+ds+'"><span class="dn">'+d.getDate()+'</span>'+chips+more+'</div>';
    }
    var legend=Object.keys(KIND).map(function(k){ return '<span><i style="background:'+KIND[k].c+'"></i>'+KIND[k].label+'</span>'; }).join('');
    el.innerHTML=
      '<div class="hcal">'+
        '<div class="hcal-head">'+
          '<div class="hcal-title"><h2>Calendar</h2>'+
            '<div class="hcal-nav"><button id="hcPrev" title="Previous month"><i class="fa-solid fa-chevron-left"></i></button>'+
              '<button class="hcal-today" id="hcToday">Today</button>'+
              '<button id="hcNext" title="Next month"><i class="fa-solid fa-chevron-right"></i></button></div>'+
            '<strong style="font-size:15px;color:var(--text,#2C3340);">'+MON[m]+' '+y+'</strong>'+
          '</div>'+
        '</div>'+
        '<div class="hcal-grid">'+WD.map(function(w){ return '<div class="hcal-wd">'+w+'</div>'; }).join('')+cells+'</div>'+
        '<div class="hcal-legend">'+legend+'</div>'+
        dayDetail()+
      '</div>';
    document.getElementById('hcPrev').onclick=function(){ view.setMonth(view.getMonth()-1); render(); };
    document.getElementById('hcNext').onclick=function(){ view.setMonth(view.getMonth()+1); render(); };
    document.getElementById('hcToday').onclick=function(){ view=new Date(); view.setDate(1); selDay=today(); render(); };
    el.querySelectorAll('.hcal-day[data-d]').forEach(function(c){ c.onclick=function(){ selDay=c.getAttribute('data-d'); render(); }; });
  }

  function dayDetail(){
    var evs=eventsFor(selDay);
    var rows = evs.length ? '<div class="hcal-list">'+evs.map(function(ev){
      var col=(KIND[ev.kind]||KIND.personal).c;
      var sub=(ev.personal?(ev.time?fmtTime(ev.time)+' · ':'')+'My event':(KIND[ev.kind]||{}).label||'')+(ev.notes?' · '+ev.notes:'');
      return '<div class="hcal-row"><span class="bar" style="background:'+col+'"></span>'+
        '<div class="rmain"><div class="rt">'+esc(ev.title)+'</div>'+(sub?'<div class="rs">'+esc(sub)+'</div>':'')+'</div>'+
      '</div>';
    }).join('')+'</div>' : '<div class="hcal-empty">Nothing on this day. Add events in the Calendar tool.</div>';
    return '<div class="hcal-detail"><h3>'+fmtLong(selDay)+'</h3>'+rows+'</div>';
  }

  function openModal(rec){
    var editing=!!rec; rec=rec||{};
    var ov=document.createElement('div'); ov.className='hcm-ov';
    ov.innerHTML='<div class="hcm">'+
      '<div class="hcm-h"><h3>'+(editing?'Edit Event':'Add Event')+'</h3><button class="hcm-x">&times;</button></div>'+
      '<div class="hcm-b">'+
        '<div><label>Title</label><input id="hcTitle" type="text" value="'+esc(rec.title||'')+'" placeholder="e.g. Client closing, MIBOR class, vacation"></div>'+
        '<div class="hcm-2"><div><label>Date</label><input id="hcDate" type="date" value="'+esc(rec.start_date? String(rec.start_date).slice(0,10):selDay)+'"></div>'+
          '<div><label>Time (optional)</label><input id="hcTime" type="time" value="'+esc(rec.start_time?String(rec.start_time).slice(0,5):'')+'"></div></div>'+
        '<div><label>Notes (optional)</label><textarea id="hcNotes" placeholder="Details, location, link…">'+esc(rec.description||'')+'</textarea></div>'+
      '</div>'+
      '<div class="hcm-foot">'+(editing?'<button class="hcm-del" id="hcDel"><i class="fa-solid fa-trash"></i> Delete</button>':'<span></span>')+
        '<div style="display:flex;gap:8px;"><button class="hcm-btn ghost" data-x>Cancel</button><button class="hcm-btn" id="hcSave">Save</button></div></div>'+
    '</div>';
    ov.addEventListener('click',function(e){ if(e.target===ov) ov.remove(); });
    document.body.appendChild(ov);
    ov.querySelector('.hcm-x').onclick=function(){ ov.remove(); };
    ov.querySelector('[data-x]').onclick=function(){ ov.remove(); };
    if (editing) ov.querySelector('#hcDel').onclick=async function(){
      if(!confirm('Delete this event?')) return; this.disabled=true;
      var res=await SB.from('hub_events').delete().eq('id',rec.id);
      if(res.error){ alert('Could not delete: '+res.error.message); this.disabled=false; return; }
      ov.remove(); load();
    };
    ov.querySelector('#hcSave').onclick=async function(){
      var title=ov.querySelector('#hcTitle').value.trim();
      if(!title){ ov.querySelector('#hcTitle').focus(); return; }
      var time=ov.querySelector('#hcTime').value||null;
      var sd=ov.querySelector('#hcDate').value||selDay;
      var row={ title:title, start_date:sd, start_time:time, all_day:!time, description:ov.querySelector('#hcNotes').value||null };
      this.disabled=true; this.textContent='Saving…';
      var res;
      if (editing) res=await SB.from('hub_events').update(row).eq('id',rec.id);
      else { row.visibility='personal'; row.owner_email=(ME&&ME.email)||null; row.category='other'; res=await SB.from('hub_events').insert(row); }
      if(res.error){ alert('Could not save: '+res.error.message); this.disabled=false; this.textContent='Save'; return; }
      selDay=sd; ov.remove(); load();
    };
  }

  window.HubCalendar = { mount: mount };
})();
