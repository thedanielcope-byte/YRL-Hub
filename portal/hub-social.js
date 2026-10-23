/* ══════════════════════════════════════════════════════════════════════
   hub-social.js  —  Announcements banner + Office Chat + Agent Talk feed
   Loaded on hub.html. Uses window.yrlClient / window.yrlMember (portal-auth).
   Tables: hub_announcements, hub_messages, hub_agent_talk.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
    var SB, ME, ROLE, CID, UID, NAME, EMAIL, ME_EMAIL, _booted = false;

    function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
    function fmtT(ts){ try{ var d=new Date(ts), n=new Date(); var t=d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}); return d.toDateString()===n.toDateString()?t:(d.toLocaleDateString('en-US',{month:'short',day:'numeric'})+' · '+t); }catch(e){ return ''; } }

    document.addEventListener('yrl-auth-ready', boot);
    if (window.yrlMember && window.yrlClient) boot();

    async function boot(){
        if (_booted) return; _booted = true;
        SB = window.yrlClient; ME = window.yrlMember; ROLE = ME.role; CID = ME.client_id;
        if (ROLE === 'txn_client') return;
        injectCss();
        try {
            var s = await SB.auth.getSession();
            UID   = s.data.session && s.data.session.user.id;
            EMAIL = (s.data.session && s.data.session.user.email) || '';
            var meta = (s.data.session && s.data.session.user.user_metadata) || {};
            NAME  = meta.full_name || meta.name || (ME.name) || (EMAIL ? EMAIL.split('@')[0] : 'Agent');
        } catch (e) {}
        ME_EMAIL = (EMAIL || '').toLowerCase();
        loadAnnouncement();
        await loadRoster();
        initDM();   // 1-on-1 direct messages for everyone
    }

    /* ── Announcement banner ─────────────────────────────────────── */
    async function loadAnnouncement(){
        try {
            /* Show EVERY active announcement (newest first), not just one — so a
               brand-new one always appears alongside any existing ones. Each is
               dismissed independently (a set of ids in localStorage). */
            var r = await SB.from('hub_announcements').select('*').eq('active', true).order('created_at', { ascending:false });
            var rows = (r.data || []); if (!rows.length) return;
            var host = document.getElementById('hubSocial'); if (!host) return;
            var dismissed = [];
            try {
                var raw = localStorage.getItem('yrlAnnDismissed');
                var parsed = raw ? JSON.parse(raw) : [];
                dismissed = Array.isArray(parsed) ? parsed : (raw ? [raw] : []);   /* migrate old single-id value */
            } catch(e){ try{ var v = localStorage.getItem('yrlAnnDismissed'); dismissed = v ? [v] : []; }catch(_){ dismissed = []; } }
            rows.filter(function(a){ return dismissed.indexOf(a.id) === -1; }).forEach(function(a){
                var el = document.createElement('div'); el.className = 'hs-ann';
                el.innerHTML =
                    '<div class="hs-ann-ic"><i class="fa-solid fa-bullhorn"></i></div>'
                  + '<div class="hs-ann-body"><div class="hs-ann-title">'+esc(a.title||'Office Announcement')+'</div>'
                  + '<div class="hs-ann-text">'+esc(a.body)+'</div>'
                  + (a.link?'<a href="'+esc(a.link)+'" target="_blank" rel="noopener" class="hs-ann-link">Learn more <i class="fa-solid fa-arrow-right"></i></a>':'')
                  + '</div><button class="hs-ann-x" title="Dismiss">&times;</button>';
                el.querySelector('.hs-ann-x').onclick = function(){
                    if (dismissed.indexOf(a.id) === -1) dismissed.push(a.id);
                    try{ localStorage.setItem('yrlAnnDismissed', JSON.stringify(dismissed)); }catch(e){}
                    el.remove();
                };
                host.appendChild(el);
            });
        } catch (e) { /* silent */ }
    }

    /* ── Direct messages (1-on-1 with anyone in the office) ──────── */
    var ROSTER = [], CONVOS = [], dmOpen = false, dmView = 'list', dmWith = null, dmTimer = null, dmPanel, dmBtn;

    function lastName(n){ var p=(n||'').trim().split(/\s+/); return (p[p.length-1]||'').toLowerCase(); }
    function initials(s){ return (s||'?').split(/\s+/).map(function(w){return w[0];}).filter(Boolean).slice(0,2).join('').toUpperCase(); }
    function nameFor(email){
        var p = ROSTER.find(function(x){ return x.email === email; }); if (p) return p.name;
        var c = CONVOS.find(function(x){ return x.email === email; }); if (c && c.name) return c.name;
        return email;
    }
    async function loadRoster(){
        try {
            var r = await SB.from('hub_content').select('content_value').eq('content_key','yrl-agent-directory').limit(1);
            var arr = (r.data && r.data[0] && r.data[0].content_value) || [];
            ROSTER = (Array.isArray(arr)?arr:[])
                .filter(function(a){ return a.email && a.email.trim() && a.email.trim().toLowerCase() !== ME_EMAIL; })
                .map(function(a){ return { name:a.name||a.email, email:a.email.trim().toLowerCase(), title:a.title||'' }; });
            ROSTER.sort(function(a,b){ return lastName(a.name).localeCompare(lastName(b.name)); });
        } catch (e) { ROSTER = []; }
    }

    function initDM(){
        dmBtn = document.createElement('button'); dmBtn.className = 'hs-chat-btn';
        dmBtn.innerHTML = '<i class="fa-solid fa-comment-dots"></i><span class="hs-chat-badge" style="display:none">0</span>';
        dmPanel = document.createElement('div'); dmPanel.className = 'hs-chat-panel';
        dmPanel.innerHTML =
            '<div class="hs-chat-head"><button class="hs-dm-back" style="display:none;" aria-label="Back"><i class="fa-solid fa-arrow-left"></i></button>'
          + '<div class="hs-dm-htext"><b id="hsDmTitle">Messages</b><div id="hsDmSub" style="font-size:11px;opacity:.85;">Chat 1-on-1 with the office</div></div>'
          + '<button class="hs-chat-close" aria-label="Close">&times;</button></div>'
          + '<div class="hs-chat-msgs" id="hsDmBody"><div class="hs-chat-empty">Loading…</div></div>'
          + '<form class="hs-chat-form" id="hsDmForm" style="display:none;"><input id="hsDmInput" placeholder="Type a message…" autocomplete="off" maxlength="2000"><button type="submit" aria-label="Send"><i class="fa-solid fa-paper-plane"></i></button></form>';
        document.body.appendChild(dmBtn); document.body.appendChild(dmPanel);
        dmBtn.onclick = function(){ dmOpen = !dmOpen; dmPanel.classList.toggle('open', dmOpen); if (dmOpen){ showList(); if (!dmTimer) dmTimer = setInterval(tick, 12000); } };
        dmPanel.querySelector('.hs-chat-close').onclick = function(){ dmOpen = false; dmPanel.classList.remove('open'); };
        dmPanel.querySelector('.hs-dm-back').onclick = function(){ showList(); };
        dmPanel.querySelector('#hsDmForm').onsubmit = async function(e){
            e.preventDefault();
            var inp = document.getElementById('hsDmInput'); var body = inp.value.trim(); if (!body || !dmWith) return;
            inp.value = ''; inp.disabled = true;
            try { await sendDM(dmWith, body); await loadDM(); renderThread(true); } catch(err){ alert('Could not send: '+err.message); }
            inp.disabled = false; inp.focus();
        };
        loadDM();
        setInterval(function(){ if (!dmOpen) loadDM(); }, 30000);
    }
    function tick(){ if (!dmOpen) return; loadDM().then(function(){ if (dmView==='thread') renderThread(false); else if (dmView==='list') renderList(); }); }

    async function loadDM(){
        try {
            var r = await SB.from('hub_dm').select('*')
                .or('sender_email.eq.'+ME_EMAIL+',recipient_email.eq.'+ME_EMAIL)
                .order('created_at', { ascending:true });
            var msgs = r.data || [], by = {};
            msgs.forEach(function(m){
                var se = (m.sender_email||'').toLowerCase(), re = (m.recipient_email||'').toLowerCase();
                var other = se === ME_EMAIL ? re : se;
                var nm    = se === ME_EMAIL ? m.recipient_name : m.sender_name;
                var c = by[other] || (by[other] = { email:other, name:nm, items:[], unread:0 });
                if (nm) c.name = nm;
                c.items.push(m);
                if (re === ME_EMAIL && !m.read) c.unread++;
            });
            CONVOS = Object.keys(by).map(function(k){ return by[k]; })
                .sort(function(a,b){ return new Date(b.items[b.items.length-1].created_at) - new Date(a.items[a.items.length-1].created_at); });
            var total = CONVOS.reduce(function(s,c){ return s + c.unread; }, 0);
            var badge = document.querySelector('.hs-chat-badge');
            if (badge){ badge.style.display = total?'':'none'; badge.textContent = total; }
        } catch (e) { /* silent */ }
    }

    function setHead(title, sub, back){
        document.getElementById('hsDmTitle').textContent = title;
        var s = document.getElementById('hsDmSub'); s.textContent = sub || ''; s.style.display = sub ? '' : 'none';
        dmPanel.querySelector('.hs-dm-back').style.display = back ? '' : 'none';
    }
    function showList(){ dmView = 'list'; dmWith = null; renderList(); }
    function renderList(){
        setHead('Messages', 'Chat 1-on-1 with the office', false);
        var box = document.getElementById('hsDmBody'); if (!box) return;
        document.getElementById('hsDmForm').style.display = 'none';
        var top = '<button class="hs-dm-new" id="hsDmNew"><i class="fa-solid fa-pen-to-square"></i> New message</button>';
        var list = CONVOS.length ? CONVOS.map(function(c){
            var last = c.items[c.items.length-1], mine = (last.sender_email||'').toLowerCase()===ME_EMAIL;
            return '<div class="hs-dm-row" data-email="'+esc(c.email)+'">'
                 + '<div class="hs-dm-av">'+esc(initials(c.name||c.email))+'</div>'
                 + '<div class="hs-dm-meta"><div class="hs-dm-name">'+esc(c.name||c.email)+(c.unread?' <span class="hs-dm-badge">'+c.unread+'</span>':'')+'</div>'
                 + '<div class="hs-dm-last">'+(mine?'You: ':'')+esc(last.body)+'</div></div>'
                 + '<div class="hs-dm-time">'+fmtT(last.created_at)+'</div></div>';
        }).join('') : '<div class="hs-chat-empty">No conversations yet. Tap “New message” to start one.</div>';
        box.innerHTML = top + list;
        document.getElementById('hsDmNew').onclick = showNew;
        Array.prototype.forEach.call(box.querySelectorAll('.hs-dm-row'), function(row){ row.onclick = function(){ openThread(row.getAttribute('data-email')); }; });
    }
    function showNew(){
        dmView = 'new'; dmWith = null;
        setHead('New message', 'Pick someone to chat with', true);
        document.getElementById('hsDmForm').style.display = 'none';
        var box = document.getElementById('hsDmBody');
        box.innerHTML = '<input class="hs-dm-search" id="hsDmSearch" placeholder="Search the office…" autocomplete="off"><div id="hsDmRoster"></div>';
        var render = function(){
            var q = (document.getElementById('hsDmSearch').value||'').toLowerCase().trim();
            var items = ROSTER.filter(function(p){ return !q || p.name.toLowerCase().indexOf(q)>-1 || p.email.indexOf(q)>-1 || (p.title||'').toLowerCase().indexOf(q)>-1; });
            document.getElementById('hsDmRoster').innerHTML = items.length ? items.map(function(p){
                return '<div class="hs-dm-row" data-email="'+esc(p.email)+'"><div class="hs-dm-av">'+esc(initials(p.name))+'</div><div class="hs-dm-meta"><div class="hs-dm-name">'+esc(p.name)+'</div><div class="hs-dm-last">'+esc(p.title||p.email)+'</div></div></div>';
            }).join('') : '<div class="hs-chat-empty">No one matches. People appear here from the Agent Directory.</div>';
            Array.prototype.forEach.call(document.querySelectorAll('#hsDmRoster .hs-dm-row'), function(row){ row.onclick = function(){ openThread(row.getAttribute('data-email')); }; });
        };
        document.getElementById('hsDmSearch').oninput = render; render();
        document.getElementById('hsDmSearch').focus();
    }
    async function openThread(email){
        dmView = 'thread'; dmWith = email;
        renderThread(true);
        try { await SB.from('hub_dm').update({ read:true }).eq('recipient_email', ME_EMAIL).eq('sender_email', email).eq('read', false); } catch (e) {}
        loadDM();
    }
    function renderThread(scroll){
        var c = CONVOS.find(function(x){ return x.email === dmWith; });
        setHead(nameFor(dmWith), '', true);
        var box = document.getElementById('hsDmBody'), items = c ? c.items : [];
        box.innerHTML = items.length ? items.map(function(m){
            var mine = (m.sender_email||'').toLowerCase()===ME_EMAIL;
            return '<div class="hs-msg '+(mine?'me':'them')+'"><div class="hs-bubble">'+esc(m.body)+'</div><div class="hs-msg-time">'+fmtT(m.created_at)+'</div></div>';
        }).join('') : '<div class="hs-chat-empty">Start the conversation with '+esc(nameFor(dmWith))+'.</div>';
        document.getElementById('hsDmForm').style.display = '';
        if (scroll) box.scrollTop = box.scrollHeight;
        setTimeout(function(){ var i=document.getElementById('hsDmInput'); if (i) i.focus(); }, 40);
    }
    async function sendDM(email, body){
        var r = await SB.from('hub_dm').insert({ client_id:CID, sender_email:ME_EMAIL, sender_name:NAME, recipient_email:email, recipient_name:nameFor(email), body:body });
        if (r.error) throw r.error;
    }

    /* ── Styles ──────────────────────────────────────────────────── */
    function injectCss(){
        var css = `
        #hubSocial{max-width:1200px;margin:0 auto;padding:0 24px;}
        .hs-ann{display:flex;gap:14px;align-items:flex-start;background:linear-gradient(135deg,#fff7ed,#fff);border:1px solid #fed7aa;border-left:5px solid #c03926;border-radius:12px;padding:14px 16px;margin:16px 0 26px;box-shadow:0 2px 10px rgba(0,0,0,.05);}
        .hs-ann-ic{width:38px;height:38px;border-radius:50%;background:rgba(192,57,38,.1);color:#c03926;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px;}
        .hs-ann-body{flex:1;min-width:0;}
        .hs-ann-title{font-weight:800;font-size:14px;color:#1a1d22;margin-bottom:2px;}
        .hs-ann-text{font-size:13.5px;color:#4b5563;line-height:1.5;white-space:pre-wrap;}
        .hs-ann-link{display:inline-block;margin-top:6px;font-size:12.5px;font-weight:700;color:#c03926;}
        .hs-ann-x{background:none;border:none;font-size:22px;line-height:1;color:#9ca3af;cursor:pointer;flex-shrink:0;}
        .hs-ann-x:hover{color:#c03926;}

        .hs-chat-btn{position:fixed;bottom:22px;right:22px;z-index:900;width:58px;height:58px;border-radius:50%;border:none;background:#c03926;color:#fff;font-size:22px;cursor:pointer;box-shadow:0 8px 24px rgba(192,57,38,.4);display:flex;align-items:center;justify-content:center;transition:transform .15s;}
        .hs-chat-btn:hover{transform:translateY(-2px);}
        .hs-chat-badge{position:absolute;top:-3px;right:-3px;min-width:20px;height:20px;padding:0 5px;border-radius:20px;background:#111;color:#fff;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;border:2px solid #fff;}
        .hs-chat-panel{position:fixed;bottom:90px;right:22px;z-index:901;width:340px;max-width:calc(100vw - 32px);height:460px;max-height:calc(100vh - 130px);background:#fff;border:1px solid #e2e5ea;border-radius:16px;box-shadow:0 20px 50px rgba(0,0,0,.28);display:none;flex-direction:column;overflow:hidden;}
        .hs-chat-panel.open{display:flex;}
        .hs-chat-head{background:linear-gradient(135deg,#a82f1e,#c03926);color:#fff;padding:12px 14px;display:flex;align-items:center;gap:8px;}
        .hs-dm-htext{flex:1;min-width:0;}
        .hs-dm-htext b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block;}
        .hs-dm-back{background:none;border:none;color:#fff;font-size:16px;cursor:pointer;opacity:.9;padding:2px 4px;flex-shrink:0;}
        .hs-chat-close{background:none;border:none;color:#fff;font-size:24px;line-height:1;cursor:pointer;opacity:.9;flex-shrink:0;}
        .hs-chat-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px;background:#f7f8fa;}
        .hs-chat-empty{color:#9ca3af;font-size:12.5px;text-align:center;margin:auto;padding:20px;line-height:1.5;}
        .hs-msg{display:flex;flex-direction:column;max-width:82%;}
        .hs-msg.me{align-self:flex-end;align-items:flex-end;}
        .hs-msg.them{align-self:flex-start;align-items:flex-start;}
        .hs-bubble{padding:9px 13px;border-radius:14px;font-size:13.5px;line-height:1.45;word-break:break-word;white-space:pre-wrap;}
        .hs-msg.me .hs-bubble{background:#c03926;color:#fff;border-bottom-right-radius:4px;}
        .hs-msg.them .hs-bubble{background:#fff;color:#1a1d22;border:1px solid #e2e5ea;border-bottom-left-radius:4px;}
        .hs-msg-time{font-size:10px;color:#9ca3af;margin-top:3px;}
        .hs-chat-form{display:flex;gap:8px;padding:10px;border-top:1px solid #e2e5ea;background:#fff;}
        .hs-chat-form input{flex:1;border:1.5px solid #e2e5ea;border-radius:100px;padding:9px 14px;font-size:13.5px;font-family:'Inter',sans-serif;outline:none;}
        .hs-chat-form input:focus{border-color:#c03926;}
        .hs-chat-form button{width:40px;height:40px;border-radius:50%;border:none;background:#c03926;color:#fff;cursor:pointer;flex-shrink:0;}
        .hs-dm-new{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;background:rgba(192,57,38,.08);color:#c03926;border:1.5px solid rgba(192,57,38,.3);border-radius:10px;padding:9px;font-size:13px;font-weight:700;font-family:'Inter',sans-serif;cursor:pointer;margin-bottom:4px;}
        .hs-dm-new:hover{background:rgba(192,57,38,.14);}
        .hs-dm-search{width:100%;border:1.5px solid #e2e5ea;border-radius:100px;padding:8px 14px;font-size:13px;font-family:'Inter',sans-serif;outline:none;margin-bottom:8px;}
        .hs-dm-search:focus{border-color:#c03926;}
        .hs-dm-row{display:flex;align-items:center;gap:11px;padding:9px 8px;border-radius:10px;cursor:pointer;}
        .hs-dm-row:hover{background:#eef0f3;}
        .hs-dm-av{width:38px;height:38px;border-radius:50%;background:#c03926;color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;flex-shrink:0;}
        .hs-dm-meta{flex:1;min-width:0;}
        .hs-dm-name{font-weight:700;font-size:13px;color:#1a1d22;display:flex;align-items:center;gap:6px;}
        .hs-dm-last{font-size:12px;color:#9ca3af;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .hs-dm-time{font-size:10.5px;color:#9ca3af;flex-shrink:0;}
        .hs-dm-badge{background:#c03926;color:#fff;border-radius:20px;font-size:10px;font-weight:800;padding:1px 7px;}
        @media(max-width:520px){ #hubSocial{padding:0 16px;} }
        `;
        var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    }
})();
