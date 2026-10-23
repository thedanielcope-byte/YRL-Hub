/* ══════════════════════════════════════════════════════════════════════
   hub-shell.js — turns the hub landing into a Nomad-OS-style app shell.
   • LEFT panel = the sections (My Tools · Work a Deal · …). Boxless, red pill.
   • Content window = the active section: a tool section shows its tools as
     TOP TABS, each tab embeds that tool in an <iframe ?embed=1>; a special
     "inline" section (brand/share) shows its own content moved into the pane.
   • Important #'s stays pinned above the shell; Office & Key Contacts pinned
     below. Section "?" help + whole-hub "?" via HelpBox.
   Keeps the real .section DOM (hidden / relocated) so nothing is rebuilt.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  // The Nomad app frame (fixed sidebar + Dashboard + agent dashboard + segmented tool tabs)
  // is now the DEFAULT for every agent. ?classic=1 falls back to the old stacked layout.
  var NOMAD = !/[?&]classic(=|&|$)/.test(location.search);
  var EXCLUDE = ['important-numbers', 'calendar-view']; // stay outside the shell (Important #'s pinned on top)
  // Appended to every tool iframe so browsers fetch fresh tool pages after a deploy. Bump on each deploy.
  var HUB_VER = '20261023a';
  /* Sidebar 3rd level — the tabs inside each tool page, keyed by the page in the card's href.
     key  → tabs come from hub_content via the hub_tab_index RPC (tile-grid sections / side-nav categories);
            fmt 'sec' = side-nav anchor "sec-<id>", 'anchor' = category.anchor || id, default = section id.
     tabs → a fixed list [id, label]. Each page registers its own switcher via embed-mode.js. */
  var TAB_REG = {
    'yrl-marketing.html':        { key: 'yrl-marketing-tools' },
    'yrl-social.html':           { key: 'yrl-social' },
    'yrl-buyers.html':           { key: 'yrl-buyer-tools' },
    'yrl-sellers.html':          { key: 'yrl-seller-tools' },
    'yrl-referrals.html':        { key: 'yrl-referrals' },
    'yrl-agent-training.html':   { key: 'yrl-training-programs' },
    'yrl-meetings.html':         { key: 'yrl-meetings' },
    'yrl-brand-assets.html':     { key: 'yrl-brand-assets' },
    'yrl-vendors.html':          { key: 'yrl-vendors-state',    fmt: 'sec' },
    'yrl-company-policies.html': { key: 'yrl-policies-state',   fmt: 'sec' },
    'yrl-contracts.html':        { key: 'yrl-contracts-state',  fmt: 'sec' },
    'yrl-onboarding.html':       { key: 'yrl-onboarding-state', fmt: 'anchor' },
    'yrl-ce-licensing.html':     { tabs: [['tracker', 'CE Tracker'], ['courses', 'Approved CE Course List'], ['licensing', 'Licensing Requirements']] },
    'yrl-my-agent-profile.html': { tabs: [['0', 'My Agent Info'], ['1', 'Create Email Signature']] },
    'yrl-moving-to-yrl.html':    { tabs: [['0', 'Checklist'], ['1', 'Listings & Pendings Tracking']] },
    'yrl-contacts.html':         { tabs: [['list', 'Contacts'], ['pipeline', 'Pipeline'], ['followups', 'Follow-ups']] },
    'yrl-tasks.html':            { tabs: [['list', 'List'], ['board', 'Board']] },
    'yrl-calendar.html':         { tabs: [['month', 'Month'], ['year', 'Year'], ['agenda', 'Agenda']] },
    'yrl-transactions.html':     { tabs: [['active', 'Active'], ['closed', 'Closed'], ['archived', 'Archived'], ['all', 'All']] },
    'yrl-licensing-training.html': { tabs: [['national', 'National Exam Prep'], ['indiana', 'Indiana Exam Prep'], ['newlicensee', 'New Licensee'], ['exam', 'Practice Exam']] }
  };
  var HIDE    = ['calendar-view'];                                          // redundant (calendar is a tab)
  var HELPKEY = {
    'my-tools': 'hub-my-tools', 'work-a-deal': 'hub-work-a-deal',
    'transactions-closings': 'hub-transactions', 'training-compliance': 'hub-training',
    'my-setup': 'hub-setup', 'the-office': 'hub-office',
    'brand-assets': 'hub-brand-assets', 'share-with-clients': 'hub-share-with-clients'
  };

  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function ready(fn){ if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  ready(function(){ setTimeout(boot, 0); });

  function boot(){
    var main = document.querySelector('main.main') || document.querySelector('.main');
    if (!main || document.getElementById('hubShell')) return;

    var allSecs = [].slice.call(main.querySelectorAll('.section[data-section-id]'));
    var shellSecs = allSecs.filter(function(s){ return EXCLUDE.indexOf(s.dataset.sectionId) === -1; });
    if (!shellSecs.length) return;

    injectCss();

    // (Leave #helpTop alone — it renders the whole-hub help as a permanent
    //  expanded box near the top, like the Welcome message.)
    // Hide redundant sections + stray dividers.
    HIDE.forEach(function(id){ var el = main.querySelector('.section[data-section-id="'+id+'"]'); if (el) el.style.display = 'none'; });
    [].forEach.call(main.querySelectorAll(':scope > .divider'), function(d){ d.style.display = 'none'; });

    // Scaffold
    var shell = document.createElement('div');
    shell.id = 'hubShell'; shell.className = 'hub-shell';
    shell.innerHTML =
      '<div class="hs-zone"><h2>Your Tools &amp; Resources</h2>' +
        '<p>Pick a section on the left — it opens right here, inside the hub.</p></div>' +
      '<div class="hs-bodywrap">' +
        '<aside class="hs-side"><div class="hs-side-lbl">Sections</div><div class="hs-nav" id="hsNav"></div></aside>' +
        '<div class="hs-content"><div class="hs-panel">' +
          '<div class="hs-phead" id="hsPhead"></div>' +
          '<div class="hs-ptabs" id="hsPtabs"></div>' +
          '<div class="hs-pbody" id="hsPbody"></div>' +
        '</div></div>' +
      '</div>';

    // Position the shell right ABOVE Office & Key Contacts (so Important #'s stays
    // on top, office-contacts stays at the bottom). section-order.js re-sorts the
    // sections asynchronously and can displace the shell, so we re-assert its spot
    // via a short-lived observer.
    function placeShell(){
      // Sit the shell right after Important #'s (the only remaining pinned-on-top
      // section). Everything else — including Office & Key Contacts — is now a
      // shell section, so nothing floats at the page bottom.
      var imp = main.querySelector('.section[data-section-id="important-numbers"]');
      if (imp){ if (imp.nextElementSibling !== shell) main.insertBefore(shell, imp.nextSibling); return; }
      if (shell.parentNode !== main) main.appendChild(shell);
    }
    placeShell();
    try {
      var _mo = new MutationObserver(function(){ placeShell(); });
      _mo.observe(main, { childList: true });
      setTimeout(function(){ try { _mo.disconnect(); } catch(e){} }, 6000);
    } catch(e){}

    // Models — rebuilt from the live .section DOM so custom sections / moved tools show up.
    function buildModels(){
      var secs = [].slice.call(main.querySelectorAll('.section[data-section-id]')).filter(function(s){
        if (EXCLUDE.indexOf(s.dataset.sectionId) !== -1) return false;
        // A whole broker-only section (e.g. Listing Slideshow) is hidden for agents by
        // _hubApplyRole → keep it out of the nav entirely so it never shows as an empty leaf.
        if (s.classList.contains('broker-only') && getComputedStyle(s).display === 'none') return false;
        return true;
      });
      var ms = secs.map(function(sec){
        var h2 = sec.querySelector('.sec-header h2');
        var iEl = sec.querySelector('.sec-header .sec-icon i');
        var cards = [].slice.call(sec.querySelectorAll('.card-grid a.card')).filter(function(c){
          return getComputedStyle(c).display !== 'none';   // respect broker-only hidden tiles
        });
        var m = {
          id: sec.dataset.sectionId,
          name: h2 ? h2.textContent.trim() : sec.dataset.sectionId,
          sub: (sec.querySelector('.sec-header p') || {}).textContent || '',
          icon: iEl ? iEl.className : 'fa-solid fa-folder',
          sec: sec, isTool: cards.length > 0, cards: cards, inlineNodes: null
        };
        if (!m.isTool) m.inlineNodes = [].slice.call(sec.children).filter(function(ch){ return !ch.classList.contains('sec-header'); });
        return m;
      });
      ms.forEach(function(m){ m.sec.style.display = 'none'; });   // hide originals (kept in DOM)
      return ms;
    }
    var models = buildModels();

    var nav = shell.querySelector('#hsNav');
    var hideFromNav = {};   // section ids to hide from the sidebar (e.g. office-contacts lives on the nomad Dashboard)
    // Office & Key Contacts + Share With Clients live on the nomad Dashboard, not their own
    // section pages. buildModels() hides EVERY section; this re-reveals the Dashboard ones and
    // keeps them off the sidebar. Must run after every buildModels() (incl. __hubRebuildNav),
    // or they vanish from the Dashboard.
    var DASH_SECTIONS = ['office-contacts', 'share-with-clients'];
    function revealDashSections(){
      if (!NOMAD) return;
      for (var mi = 0; mi < models.length; mi++){
        if (DASH_SECTIONS.indexOf(models[mi].id) !== -1){
          hideFromNav[models[mi].id] = true;
          models[mi].sec.style.display = '';
          models[mi].sec.classList.add('nomad-dash-extra');
        }
      }
    }
    var expanded = {};      // NOMAD 2-level: which section ids are expanded in the sidebar
    try { (JSON.parse(localStorage.getItem('yrl-hub-expanded') || '[]') || []).forEach(function(id){ expanded[id] = true; }); } catch(e){}
    function saveExpanded(){ try { localStorage.setItem('yrl-hub-expanded', JSON.stringify(Object.keys(expanded).filter(function(k){ return expanded[k]; }))); } catch(e){} }
    function isMulti(m){ return m.isTool && m.cards.length >= 2; }

    /* ── 3rd level: the tabs inside each tool page ───────────────────── */
    var TABDATA = {};
    try { TABDATA = JSON.parse(sessionStorage.getItem('yrl-hub-tabidx') || '{}') || {}; } catch(e){ TABDATA = {}; }
    var curCat = null;       // tab showing in the open tool (reported by the tool page)
    var curFolded = false;   // the open tool's tab list folded away via its arrow
    var peekKey = null;      // 'sec:tool' of a tool whose tabs are peeked without opening it
    function pageOf(card){ var h = (card && card.getAttribute('href')) || ''; h = h.split('#')[0].split('?')[0]; return h.substring(h.lastIndexOf('/') + 1); }
    function cardTabs(card){
      if (!card || isExternal(card)) return null;
      var reg = TAB_REG[pageOf(card)]; if (!reg) return null;
      var list;
      if (reg.tabs) list = reg.tabs.map(function(t){ return { id: t[0], name: t[1] }; });
      else {
        var raw = TABDATA[reg.key]; if (!raw || !raw.length) return null;
        list = raw.map(function(t){
          var id = reg.fmt === 'sec' ? 'sec-' + t.id : (reg.fmt === 'anchor' ? (t.anchor || t.id) : t.id);
          return { id: String(id), name: t.name || 'Untitled' };
        });
      }
      return list.length >= 2 ? list : null;   // a single tab isn't worth a dropdown
    }
    function loadTabIndex(){
      var sb = window.yrlClient; if (!sb || !sb.rpc || loadTabIndex._busy) return;
      var keys = []; Object.keys(TAB_REG).forEach(function(p){ if (TAB_REG[p].key) keys.push(TAB_REG[p].key); });
      loadTabIndex._busy = true;
      sb.rpc('hub_tab_index', { p_keys: keys }).then(function(r){
        loadTabIndex._busy = false;
        if (r && r.data && typeof r.data === 'object'){
          TABDATA = r.data;
          try { sessionStorage.setItem('yrl-hub-tabidx', JSON.stringify(TABDATA)); } catch(e){}
          renderNav();
        }
      }, function(){ loadTabIndex._busy = false; });
    }
    function catsHtml(i, ci, tabs, isCur){
      return '<div class="hs-navgroup hs-navcats">' + tabs.map(function(t){
        return '<button class="hs-navcat' + (isCur && String(t.id) === String(curCat) ? ' on' : '') + '" data-sec="' + i + '" data-tool="' + ci + '" data-cat="' + esc(t.id) + '">' + esc(t.name) + '</button>';
      }).join('') + '</div>';
    }
    function peekBtn(key, open){
      return '<button class="hs-navpeek' + (open ? ' open' : '') + '" data-peek="' + key + '" title="' + (open ? 'Hide' : 'Show') + ' the pages inside"><i class="fa-solid fa-chevron-right"></i></button>';
    }
    function moveBtns(i){
      return '<button class="hs-navmove" data-i="' + i + '" data-dir="-1" title="Move up"' + (i === 0 ? ' disabled' : '') + '><i class="fa-solid fa-chevron-up"></i></button>' +
             '<button class="hs-navmove" data-i="' + i + '" data-dir="1" title="Move down"' + (i === models.length - 1 ? ' disabled' : '') + '><i class="fa-solid fa-chevron-down"></i></button>';
    }
    function renderNav(){
      // NOMAD → 2-level accordion (view AND edit; edit adds reorder controls).
      if (NOMAD) return renderNavAccordion();
      var html = models.map(function(m, i){
        var hidden = hideFromNav[m.id] ? 'style="display:none" ' : '';
        var inner = '<span class="hs-navic"><i class="' + m.icon + '"></i></span>' + esc(m.name);
        var on = (i === cur) ? ' on' : '';
        if (hubEditOn() && NOMAD){
          return '<div class="hs-navitem hs-navedit' + on + '" ' + hidden + 'data-i="' + i + '">' +
              '<button class="hs-navsel" data-i="' + i + '">' + inner + '</button>' +
              '<span class="hs-navctrl">' + moveBtns(i) + '</span></div>';
        }
        return '<button class="hs-navitem' + on + '" ' + hidden + 'data-i="' + i + '">' + inner + '</button>';
      }).join('');
      if (hubEditOn() && NOMAD){
        html += '<button class="hs-navaddsec" onclick="window.__hubAddSection && window.__hubAddSection()"><i class="fa-solid fa-plus"></i> Add section</button>';
      }
      nav.innerHTML = html;
    }
    function renderNavAccordion(){
      var edit = hubEditOn();
      function toolMoveBtns(i, ci, n){
        return '<span class="hs-navctrl">' +
          '<button class="hs-navtoolmove" data-sec="' + i + '" data-ci="' + ci + '" data-dir="-1" title="Move up"' + (ci === 0 ? ' disabled' : '') + '><i class="fa-solid fa-chevron-up"></i></button>' +
          '<button class="hs-navtoolmove" data-sec="' + i + '" data-ci="' + ci + '" data-dir="1" title="Move down"' + (ci === n - 1 ? ' disabled' : '') + '><i class="fa-solid fa-chevron-down"></i></button></span>';
      }
      nav.innerHTML = models.map(function(m, i){
        if (hideFromNav[m.id]) return '';
        var icon = '<span class="hs-navic"><i class="' + m.icon + '"></i></span>';
        var secCtrl = edit ? '<span class="hs-navctrl">' + moveBtns(i) + '</span>' : '';
        if (isMulti(m)){
          var open = !!expanded[m.id] || edit;   // force sections open in edit so tools show + reorder
          var secOn = (i === cur) ? ' on' : '';
          var head = '<div class="hs-navsecrow' + (edit ? ' hs-navedit' : '') + '">' +
              '<button class="hs-navsec' + (open ? ' open' : '') + secOn + '" data-sec="' + i + '">' + icon +
              '<span class="hs-navname">' + esc(m.name) + '</span><i class="fa-solid fa-chevron-right hs-navchev"></i></button>' +
              secCtrl + '</div>';
          var group = '';
          if (open){
            group = '<div class="hs-navgroup">' + m.cards.map(function(c, ci){
              var nm = ((c.querySelector('h3') || {}).textContent || 'Tool').trim();
              var ic = (c.querySelector('.card-icon i') || {}).className || 'fa-solid fa-square';
              var ext = isExternal(c);
              var href = ext ? (c.getAttribute('href') || '') : '';
              var subOn = (i === cur && ci === curTab) ? ' on' : '';
              var btn = '<button class="hs-navsub' + subOn + '" data-sec="' + i + '" data-tool="' + ci + '"' + (ext ? ' data-ext="1" data-href="' + esc(href) + '"' : '') + '><i class="' + ic + '"></i> ' + esc(nm) + (ext ? ' <i class="fa-solid fa-arrow-up-right-from-square hs-extic"></i>' : '') + '</button>';
              if (edit) return '<div class="hs-navsubrow hs-navedit">' + btn + toolMoveBtns(i, ci, m.cards.length) + '</div>';
              var tabs = cardTabs(c);
              if (!tabs) return btn;
              var key = i + ':' + ci, isCur = (i === cur && ci === curTab);
              var show = (isCur && !curFolded) || peekKey === key;
              return '<div class="hs-navsubwrap">' + btn + peekBtn(key, show) + '</div>' + (show ? catsHtml(i, ci, tabs, isCur) : '');
            }).join('') + '</div>';
          }
          return '<div class="hs-navsecwrap">' + head + group + '</div>';
        }
        var leafOn = (i === cur) ? ' on' : '';   // inline section or single-tool section = a leaf that opens directly
        var leaf = '<button class="hs-navitem hs-navleaf' + leafOn + '" data-sec="' + i + '" data-leaf="1">' + icon + esc(m.name) + '</button>';
        if (edit) return '<div class="hs-navsecrow hs-navedit">' + leaf + secCtrl + '</div>';
        var lcard = (m.isTool && m.cards.length === 1) ? m.cards[0] : null;
        var ltabs = lcard ? cardTabs(lcard) : null;
        if (!ltabs) return leaf;
        var lkey = i + ':0', lCur = (i === cur);
        var lshow = (lCur && !curFolded) || peekKey === lkey;
        return '<div class="hs-navleafwrap">' + leaf + peekBtn(lkey, lshow) + '</div>' + (lshow ? catsHtml(i, 0, ltabs, lCur) : '');
      }).join('');
      if (edit){
        nav.innerHTML += '<button class="hs-navaddsec" onclick="window.__hubAddSection && window.__hubAddSection()"><i class="fa-solid fa-plus"></i> Add section</button>';
      }
    }
    function moveTool(sec, ci, dir){
      var m = models[sec]; if (!m || !m.cards) return;
      var card = m.cards[ci], swap = m.cards[ci + dir];
      if (!card || !swap) return;
      var grid = card.parentElement; if (!grid) return;
      if (dir < 0) grid.insertBefore(card, swap); else grid.insertBefore(swap, card);
      if (window.saveHubCardOrder) { try { window.saveHubCardOrder(); } catch(e){} }
      var selId = models[cur] ? models[cur].id : null;
      models = buildModels(); revealDashSections();
      cur = -1; if (selId){ for (var k = 0; k < models.length; k++){ if (models[k].id === selId){ cur = k; break; } } }
      renderNav();
    }
    function toggleExpand(id){ expanded[id] = !expanded[id]; saveExpanded(); renderNav(); }
    function resortModels(){
      var order = [].slice.call(main.querySelectorAll('.section[data-section-id]'));
      models.sort(function(a, b){ return order.indexOf(a.sec) - order.indexOf(b.sec); });
    }
    function moveSection(i, dir){
      var m = models[i]; if (!m) return;
      var selId = models[cur] ? models[cur].id : null;
      if (window.__hubSectionOrder && m.sec) { try { window.__hubSectionOrder.move(m.sec, dir); } catch(e){} }
      resortModels();
      if (selId){ for (var k = 0; k < models.length; k++){ if (models[k].id === selId){ cur = k; break; } } }
      renderNav();
    }
    renderNav();
    if (NOMAD){ if (window.yrlClient) loadTabIndex(); document.addEventListener('yrl-auth-ready', loadTabIndex); }
    /* Deep link: hub.html?tool=yrl-tasks.html[&tab=board] opens that tool — used by push notifications. */
    if (NOMAD) (function(){
      var q; try { q = new URLSearchParams(location.search); } catch(e){ return; }
      var want = q.get('tool'); if (!want) return;
      var tab = q.get('tab'), done = false;
      function tryOpen(){
        if (done) return;
        for (var i = 0; i < models.length; i++){
          var m = models[i]; if (!m.isTool) continue;
          for (var j = 0; j < m.cards.length; j++){
            if (pageOf(m.cards[j]) === want){
              try { openTool(i, j, tab || null); } catch(e){ return; }   // layout not ready yet — a later retry opens it
              done = true;
              try { history.replaceState(null, '', location.pathname); } catch(e){}
              return;
            }
          }
        }
      }
      setTimeout(tryOpen, 0);   // after boot() finishes building the page shell
      if (!done){ document.addEventListener('yrl-auth-ready', function(){ setTimeout(tryOpen, 400); }); setTimeout(tryOpen, 1500); setTimeout(tryOpen, 3500); }
    })();
    // Let hub.html rebuild the sidebar after it changes hub structure (new section, moved tool).
    window.__hubRebuildNav = function(){
      var selId = models[cur] ? models[cur].id : null;
      models = buildModels();
      revealDashSections();   // buildModels re-hid them; keep the Dashboard sections visible
      cur = -1;
      if (selId){ for (var k = 0; k < models.length; k++){ if (models[k].id === selId){ cur = k; break; } } }
      renderNav();
    };
    nav.addEventListener('click', function(e){
      var mv = e.target.closest('.hs-navmove');
      if (mv){ e.preventDefault(); e.stopPropagation(); moveSection(+mv.dataset.i, +mv.dataset.dir); return; }
      var tm = e.target.closest('.hs-navtoolmove');
      if (tm){ e.preventDefault(); e.stopPropagation(); moveTool(+tm.dataset.sec, +tm.dataset.ci, +tm.dataset.dir); return; }
      var pk = e.target.closest('.hs-navpeek');
      if (pk){
        e.preventDefault(); e.stopPropagation();
        var pkk = pk.dataset.peek, pp = pkk.split(':');
        if (+pp[0] === cur && +pp[1] === curTab){ curFolded = !curFolded; peekKey = null; }   // the open tool: fold / unfold
        else peekKey = (peekKey === pkk) ? null : pkk;                                        // another tool: peek (one at a time)
        renderNav(); return;
      }
      var ct = e.target.closest('.hs-navcat');
      if (ct){ openTab(+ct.dataset.sec, +ct.dataset.tool, ct.dataset.cat); return; }
      var sub = e.target.closest('.hs-navsub'); if (sub){ if (sub.dataset.ext){ window.open(sub.dataset.href, '_blank', 'noopener'); return; } openTool(+sub.dataset.sec, +sub.dataset.tool); return; }
      var leaf = e.target.closest('.hs-navleaf'); if (leaf){ openLeaf(+leaf.dataset.sec); return; }
      var sec = e.target.closest('.hs-navsec'); if (sec){ toggleExpand(models[+sec.dataset.sec].id); return; }
      var b = e.target.closest('.hs-navitem'); if (b && b.dataset.i != null) select(+b.dataset.i, true);
    });

    var phead = shell.querySelector('#hsPhead'), ptabs = shell.querySelector('#hsPtabs'), pbody = shell.querySelector('#hsPbody');
    var cur = -1, curTab = 0;

    function isExternal(card){
      if (card.getAttribute('target') === '_blank') return true;
      var h = card.getAttribute('href') || '';
      return /^https?:\/\//i.test(h) || /^mailto:/i.test(h) || /^tel:/i.test(h);
    }
    function mountHelp(host, key, label){ if (host && window.HelpBox) HelpBox.mount({ container: host, key: key, label: label, mode: 'button' }); }
    function isMobile(){ return window.matchMedia && window.matchMedia('(max-width:860px)').matches; }
    function scrollToContent(){
      if (!isMobile()) return;   // nomad mode does its own window.scrollTo(0,0) on page-swap
      var panel = shell.querySelector('.hs-panel');
      if (panel) setTimeout(function(){ panel.scrollIntoView({ block: 'start', behavior: 'smooth' }); }, 70);
    }

    function select(i, userInit){
      cur = i; curTab = 0;
      [].forEach.call(nav.children, function(b, bi){ b.classList.toggle('on', bi === i); });
      var m = models[i];
      phead.innerHTML = '<h2>' + esc(m.name) + ' <span class="hs-qhost" id="hsSecHelp"></span></h2>' + (m.sub ? '<p>' + esc(m.sub) + '</p>' : '');
      mountHelp(shell.querySelector('#hsSecHelp'), HELPKEY[m.id] || ('hub-' + m.id), m.name);
      if (m.isTool){
        ptabs.style.display = '';
        ptabs.innerHTML = m.cards.map(function(c, ci){
          var nm = ((c.querySelector('h3') || {}).textContent || 'Tool').trim();
          var ic = (c.querySelector('.card-icon i') || {}).className || 'fa-solid fa-square';
          var ext = isExternal(c);
          return '<button class="hs-tab" data-t="' + ci + '"><i class="' + ic + '"></i> ' + esc(nm) + (ext ? ' <i class="fa-solid fa-arrow-up-right-from-square hs-extic"></i>' : '') + '</button>';
        }).join('');
        [].forEach.call(ptabs.children, function(b){ b.onclick = function(){ selTab(+b.dataset.t, true); }; });
        selTab(0, false);
      } else {
        ptabs.style.display = 'none'; ptabs.innerHTML = '';
        pbody.className = 'hs-pbody hs-inline';
        pbody.innerHTML = '';
        m.inlineNodes.forEach(function(n){ pbody.appendChild(n); });   // move live nodes in (handlers intact)
      }
      if (userInit) scrollToContent();
    }
    function loadCard(card, catId){
      pbody.className = 'hs-pbody';
      if (isExternal(card)){
        var href = card.getAttribute('href'), nm = ((card.querySelector('h3') || {}).textContent || 'this tool').trim();
        pbody.innerHTML = '<div class="hs-ext"><div class="hs-ext-ic"><i class="fa-solid fa-arrow-up-right-from-square"></i></div>' +
          '<h3>' + esc(nm) + '</h3><p>This one lives on another site, so it opens in a new tab.</p>' +
          '<a class="hs-ext-btn" href="' + esc(href) + '" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> Open ' + esc(nm) + '</a></div>';
      } else {
        var src = card.getAttribute('href'); src += (src.indexOf('?') > -1 ? '&' : '?') + 'embed=1';
        if (NOMAD) src += '&subtabs=1';   // tools render their category rail as the top tab row
        src += '&hv=' + HUB_VER;          // fresh tool pages after a deploy (browsers cache iframes)
        if (catId) src += '&tab=' + encodeURIComponent(catId);   // open straight onto a tab (embed-mode.js)
        pbody.innerHTML = '<iframe class="hs-frame" title="' + esc((card.querySelector('h3') || {}).textContent || 'Tool') + '" src="' + esc(src) + '" loading="lazy"></iframe>';
        var _fr = pbody.querySelector('.hs-frame');
        if (_fr) _fr.addEventListener('load', function(){ if (hubEditOn()) setTimeout(function(){ try { _fr.contentWindow.postMessage({ __yrlEdit: true, on: true }, '*'); } catch(e){} }, 900); });
      }
    }
    function selTab(ti, userInit){   // classic top-tabs path
      var m = models[cur]; curTab = ti;
      [].forEach.call(ptabs.children, function(b, bi){ b.classList.toggle('on', bi === ti); });
      loadCard(m.cards[ti]);
      if (userInit) scrollToContent();
    }
    function enterSectionPage(){   // NOMAD: leave the Dashboard for a tool/section page
      document.body.classList.add('nomad-section');
      var db = document.querySelector('.hnav-dash'); if (db) db.classList.remove('on');
      window.scrollTo(0, 0);
      if (isMobile() && window.__hnavCloseDrawer) window.__hnavCloseDrawer();
    }
    function frameOnTool(sec, tool){   // is the open frame still on this tool's page? (links inside can navigate it away)
      var fr = pbody.querySelector('.hs-frame'); if (!fr) return false;
      try { var fp = fr.contentWindow.location.pathname; return fp.substring(fp.lastIndexOf('/') + 1) === pageOf(models[sec].cards[tool]); } catch(e){ return false; }
    }
    function openTab(sec, tool, catId){   // NOMAD 3rd level: a tab inside a tool
      var fr = pbody.querySelector('.hs-frame');
      if (sec === cur && tool === curTab && frameOnTool(sec, tool) && document.body.classList.contains('nomad-section')){
        // that tool is already open → switch its tab in place (no reload)
        curCat = String(catId); curFolded = false; peekKey = null;
        try { fr.contentWindow.postMessage({ __yrlTab: true, tab: String(catId) }, '*'); } catch(e){}
        renderNav();
        window.scrollTo(0, 0);
        if (isMobile() && window.__hnavCloseDrawer) window.__hnavCloseDrawer();
        return;
      }
      openTool(sec, tool, catId);
    }
    function openTool(sec, tool, catId){   // NOMAD 2-level: a tool sub-item fills the page; its category tabs become the top tabs
      if (catId == null && sec === cur && tool === curTab && frameOnTool(sec, tool) && document.body.classList.contains('nomad-section')){
        curFolded = false; peekKey = null; enterSectionPage(); renderNav(); return;   // already open — don't reload it
      }
      cur = sec; curTab = tool; curCat = catId != null ? String(catId) : null; curFolded = false; peekKey = null;
      var m = models[sec], card = m.cards[tool];
      var nm = ((card.querySelector('h3') || {}).textContent || m.name).trim();
      var sub = ((card.querySelector('p') || {}).textContent || '').trim();
      phead.innerHTML = '<h2>' + esc(nm) + ' <span class="hs-qhost" id="hsSecHelp"></span></h2>' + (sub ? '<p>' + esc(sub) + '</p>' : '');
      mountHelp(shell.querySelector('#hsSecHelp'), 'hub-' + m.id, nm);
      ptabs.style.display = 'none'; ptabs.innerHTML = '';
      loadCard(card, catId);
      enterSectionPage();
      renderNav();
    }
    function openLeaf(sec){   // NOMAD 2-level: single-tool section or inline section opens directly
      var m = models[sec];
      if (m.isTool){ openTool(sec, 0); return; }
      cur = sec; curTab = 0; curCat = null; peekKey = null;
      phead.innerHTML = '<h2>' + esc(m.name) + ' <span class="hs-qhost" id="hsSecHelp"></span></h2>' + (m.sub ? '<p>' + esc(m.sub) + '</p>' : '');
      mountHelp(shell.querySelector('#hsSecHelp'), HELPKEY[m.id] || ('hub-' + m.id), m.name);
      ptabs.style.display = 'none'; ptabs.innerHTML = '';
      pbody.className = 'hs-pbody hs-inline'; pbody.innerHTML = '';
      m.inlineNodes.forEach(function(n){ pbody.appendChild(n); });
      enterSectionPage();
      renderNav();
    }
    function hubEditOn(){ return document.body.classList.contains('hub-edit-mode'); }
    function broadcastEdit(on){ [].forEach.call(shell.querySelectorAll('iframe.hs-frame'), function(f){ try { f.contentWindow.postMessage({ __yrlEdit: true, on: on }, '*'); } catch(e){} }); }

    // Fit the frame to the tool's real content height (from embed-mode) so the
    // whole PAGE scrolls, not an inner box. Applies on desktop + mobile. Clamped.
    window.addEventListener('message', function(e){
      var d = e.data; if (!d || !d.__yrlEmbedH || !d.height) return;
      // Resize the frame that actually sent this (not just the first one).
      var frames = shell.querySelectorAll('.hs-frame'), fr = null;
      for (var k = 0; k < frames.length; k++){ if (frames[k].contentWindow === e.source){ fr = frames[k]; break; } }
      if (!fr) return;   // only size the tool frame that actually sent this — ignore the Dashboard calendar iframe & any other embeds
      // Ceiling is generous — long MREA/Tiger content pages run ~11k px; only there
      // to stop a pathological runaway. The page scrolls, never an inner box.
      fr.style.height = Math.min(Math.max(d.height + 4, 480), 24000) + 'px';
    });

    // The open tool reports which tab it's showing (embed-mode.js) → highlight it in the sidebar.
    window.addEventListener('message', function(e){
      var d = e.data; if (!d || !d.__yrlTabChanged) return;
      var fr = pbody.querySelector('.hs-frame'); if (!fr || fr.contentWindow !== e.source) return;
      var t = d.tab == null ? null : String(d.tab);
      if (t !== curCat){ curCat = t; renderNav(); }
    });

    // Mirror the hub's master "Edit" mode into the embedded tools.
    var _lastEdit = hubEditOn();
    try {
      new MutationObserver(function(){ var n = hubEditOn(); if (n !== _lastEdit) { _lastEdit = n; broadcastEdit(n); renderNav(); } })
        .observe(document.body, { attributes: true, attributeFilter: ['class'] });
    } catch(e){}

    // ── ?nomad preview: re-home the section nav into a FIXED full-height slate
    //    sidebar (logo top · sections middle · account bottom); the hero,
    //    quick-connect, Important #'s and the workspace scroll in the column to
    //    its right. Gated by the flag — the default hub never runs this.
    function nomadFrame(){
      if (document.getElementById('hnav')) return;
      document.body.classList.add('hub-nomad');
      var logoImg = document.querySelector('.hero-logo');
      var rail = document.createElement('aside');
      rail.id = 'hnav'; rail.className = 'hnav';
      rail.innerHTML =
        '<div class="hnav-logo">' +
          (logoImg ? '<img src="' + esc(logoImg.getAttribute('src') || '') + '" alt="Your Realty Link">' : '<div class="hnav-mark">YRL</div>') +
          '<div class="hnav-word">Your Realty Link<span>Agent Hub</span></div>' +
        '</div>' +
        '<div class="hnav-nav">' +
          '<button class="hs-navitem hnav-dash" type="button"><span class="hs-navic"><i class="fa-solid fa-gauge-high"></i></span>Dashboard</button>' +
          '<div class="hnav-lbl">Sections</div>' +
        '</div>' +
        '<div class="hnav-foot">' +
          '<a class="hnav-acct" href="index.html?portal=1" target="_blank" rel="noopener"><i class="fa-solid fa-user-gear"></i> Admin Hub</a>' +
          '<button class="hnav-out hnav-fid" type="button"><i class="fa-solid fa-face-smile"></i> Face ID</button>' +
          '<button class="hnav-out" type="button"><i class="fa-solid fa-arrow-right-from-bracket"></i> Sign Out</button>' +
        '</div>';
      document.body.appendChild(rail);
      rail.querySelector('.hnav-nav').appendChild(nav);   // MOVE the real section nav in (keeps its click handler + select())
      var dashBtn = rail.querySelector('.hnav-dash');
      rail.querySelector('.hnav-out:not(.hnav-fid)').addEventListener('click', function(){ if (window.yrlSignOut) window.yrlSignOut(); });
      rail.querySelector('.hnav-fid').addEventListener('click', function(){ if (window.yrlFaceIdSettings) window.yrlFaceIdSettings(); });

      // mobile: off-canvas drawer + hamburger
      var burger = document.createElement('button'); burger.className = 'hnav-burger'; burger.type = 'button'; burger.innerHTML = '<i class="fa-solid fa-bars"></i>';
      var backdrop = document.createElement('div'); backdrop.className = 'hnav-backdrop';
      function closeDrawer(){ rail.classList.remove('open'); backdrop.classList.remove('show'); }
      window.__hnavCloseDrawer = closeDrawer;   // openTool/openLeaf close the drawer on mobile
      burger.addEventListener('click', function(){ rail.classList.toggle('open'); backdrop.classList.toggle('show'); });
      backdrop.addEventListener('click', closeDrawer);
      document.body.appendChild(burger); document.body.appendChild(backdrop);

      // ── page-swap: Dashboard (top region) vs a section (its own workspace page) ──
      function showDashboard(){
        document.body.classList.remove('nomad-section');
        dashBtn.classList.add('on');
        cur = -1; renderNav();   // no section active on the Dashboard
        window.scrollTo(0, 0); if (isMobile()) closeDrawer();
      }
      // Office & Key Contacts AND Share With Clients live on the Dashboard (not their own
      // section pages): hide their sidebar items and reveal the real sections so they render
      // on the Dashboard. Share With Clients sits right below Office & Key Contacts.
      revealDashSections();   // Office & Key Contacts + Share With Clients render on the Dashboard, off the sidebar
      renderNav();   // re-render so hideFromNav takes effect
      dashBtn.addEventListener('click', showDashboard);
      nav.addEventListener('click', function(e){
        if (!e.target.closest('.hs-navitem')) return;   // select() already ran (earlier handler) → builds + highlights the tool
        document.body.classList.add('nomad-section');
        dashBtn.classList.remove('on');
        window.scrollTo(0, 0); if (isMobile()) closeDrawer();
      });
      // Agent Dashboard (KPIs + charts) — a Dashboard-only block (nomad-dash-extra),
      // placed right after Important #'s. Rendered by agent-dashboard.js.
      var dash = document.createElement('div');
      dash.id = 'agentDash'; dash.className = 'nomad-dash-extra';
      // Keep the dashboard directly ABOVE Office & Key Contacts (section-order.js
      // re-sorts sections async and would otherwise leave it at the bottom).
      function placeSWC(){
        var swc = main.querySelector('.section[data-section-id="share-with-clients"]');
        var oc  = main.querySelector('.section[data-section-id="office-contacts"]');
        if (swc && oc && oc.nextElementSibling !== swc) main.insertBefore(swc, oc.nextSibling);
      }
      function placeDash(){
        placeSWC();   // keep Share With Clients right below Office & Key Contacts
        var oc = main.querySelector('.section[data-section-id="office-contacts"]');
        if (oc){ if (oc.previousElementSibling !== dash) main.insertBefore(dash, oc); return; }
        var imp = main.querySelector('.section[data-section-id="important-numbers"]');
        if (imp && imp.nextElementSibling !== dash) imp.insertAdjacentElement('afterend', dash);
        else if (!dash.parentNode) main.appendChild(dash);
      }
      placeDash();
      try { var _dmo = new MutationObserver(placeDash); _dmo.observe(main, { childList: true }); setTimeout(function(){ try { _dmo.disconnect(); } catch(e){} }, 6000); } catch(e){}
      if (window.AgentDashboard) { try { window.AgentDashboard.mount(dash); } catch(e){} }
      // Calendar on the Dashboard — a REFLECTION of the full My Tools calendar
      // (same page, same data + add/edit functions). Placed ONCE, right after
      // Important #'s, and deliberately NOT inside placeDash's MutationObserver
      // (adding a moving element to that loop fought section-order.js and hung the
      // page). FIXED height + no height-follow listener (the message listener above
      // ignores non-.hs-frame sources) so there's no resize loop.
      try {
        var cal = document.createElement('div');
        cal.id = 'hubCalendar'; cal.className = 'nomad-dash-extra';
        // Keep it directly UNDER Important #'s. section-order.js's _apply() runs
        // async (after hub_content loads) and re-inserts all SECTIONS at the top,
        // shoving this non-section div to the BOTTOM. So we watch for that and put
        // it back — but ONLY move cal (never sections/dash), so it can't war with
        // the one-shot section-order, plus a hard move-cap so it can never runaway.
        function placeCal(){
          var _imp = main.querySelector('.section[data-section-id="important-numbers"]');
          if (_imp){ if (_imp.nextElementSibling !== cal){ _imp.insertAdjacentElement('afterend', cal); return true; } }
          else if (!cal.parentNode){ main.insertBefore(cal, main.firstChild); return true; }
          return false;
        }
        placeCal();
        try {
          var _calMoves = 0;
          var _cmo = new MutationObserver(function(){ if (placeCal()){ _calMoves++; if (_calMoves > 40){ try { _cmo.disconnect(); } catch(e){} } } });
          _cmo.observe(main, { childList: true });
          setTimeout(function(){ try { _cmo.disconnect(); } catch(e){} placeCal(); }, 8000);
        } catch(e){}
        var calHead = document.createElement('div');
        calHead.style.cssText = 'margin:30px 0 12px;';
        calHead.innerHTML = '<h2 style="font-family:\'Bebas Neue\',sans-serif;font-size:26px;letter-spacing:1.2px;color:var(--text,#2C3340);margin:0;display:flex;align-items:center;gap:9px;"><i class="fa-solid fa-calendar-days" style="font-size:.7em;color:var(--red,#c03926);"></i> Coming Up</h2>' +
          '<p style="font-size:12.5px;color:var(--text-muted,#9CA3AF);margin:3px 0 0;">Your whole schedule — deals, transactions, birthdays, anniversaries, tasks &amp; your own events. Full month/year/agenda views + recurrence live in the Calendar tool.</p>';
        cal.appendChild(calHead);
        // Lightweight in-page widget (calendar.js), NOT an iframe of the full page
        // (the full-page embed was memory-heavy and repeatedly crashed the hub).
        var calBody = document.createElement('div');
        cal.appendChild(calBody);
        if (window.HubCalendar) HubCalendar.mount(calBody);
      } catch(e){}

      showDashboard();   // land on the Dashboard
    }

    if (NOMAD) nomadFrame();   // nomadFrame → showDashboard (2-level accordion, no preloaded tool)
    else select(0);            // classic: land on the first section with top-tabs
  }

  function injectCss(){
    if (document.getElementById('hub-shell-css')) return;
    var st = document.createElement('style'); st.id = 'hub-shell-css';
    st.textContent = [
      /* full-page work area */
      'body .main{max-width:none!important;padding-left:28px!important;padding-right:28px!important;}',
      '@media(max-width:640px){body .main{padding-left:14px!important;padding-right:14px!important;}}',
      '.hub-shell{margin-top:6px;}',
      /* let the tall top bar scroll away so the locked sidebar + tool own the screen */
      '.quick-connect{position:static!important;box-shadow:none!important;border-bottom:1px solid var(--border,#E2D9C8);}',
      /* Important #'s → boxless, centered header (no icon), square monospace tiles (match preview) */
      '.section[data-section-id="important-numbers"]{background:transparent!important;border:none!important;box-shadow:none!important;padding:6px 0 8px!important;margin-bottom:8px!important;}',
      '.section[data-section-id="important-numbers"] .sec-header{flex-direction:column;align-items:center;text-align:center;gap:4px;margin-bottom:16px;}',
      '.section[data-section-id="important-numbers"] .sec-header .sec-icon{display:none;}',
      '.section[data-section-id="important-numbers"] .info-tile{border-radius:4px!important;}',
      '.section[data-section-id="important-numbers"] .info-tile .c-icon{border-radius:4px!important;}',
      '.section[data-section-id="important-numbers"] .info-value{font-family:ui-monospace,SFMono-Regular,Menlo,"Roboto Mono",monospace!important;font-weight:800!important;letter-spacing:.3px;}',
      '.section[data-section-id="important-numbers"] .btn-copy-info{border-radius:4px!important;}',
      '.section[data-section-id="important-numbers"] .btn-add-info{border-radius:4px!important;}',
      '.hs-zone{text-align:center;margin:30px 0 20px;padding-top:26px;border-top:1px solid var(--border,#e2e8f0);}',
      '.hs-zone h2{font-family:"Bebas Neue",sans-serif;font-size:30px;letter-spacing:1.5px;line-height:1;color:var(--text,#0f172a);}',
      '.hs-zone p{font-size:12.5px;color:var(--text-muted,#94a3b8);margin-top:6px;}',
      '.hs-qhost{display:inline-flex;vertical-align:middle;}',
      '.hs-bodywrap{display:grid;grid-template-columns:250px minmax(0,1fr);gap:20px;align-items:start;}',
      '.hs-side{position:sticky;top:14px;background:var(--slate,#2C3340);border-radius:14px;padding:12px 10px;box-shadow:0 1px 3px rgba(44,51,64,.08);}',
      '.hs-side-lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.9px;color:rgba(255,255,255,.42);padding:6px 10px 8px;}',
      '.hs-navitem{display:flex;align-items:center;gap:11px;width:100%;text-align:left;background:none;border:none;padding:11px 12px;border-radius:10px;font-family:inherit;font-size:13.5px;font-weight:600;color:rgba(255,255,255,.66);cursor:pointer;transition:background .12s,color .12s;margin-bottom:2px;}',
      '.hs-navic{width:30px;height:30px;border-radius:9px;background:rgba(255,255,255,.10);display:flex;align-items:center;justify-content:center;font-size:13px;color:rgba(255,255,255,.72);flex-shrink:0;transition:all .12s;}',
      '.hs-navitem:hover{background:rgba(255,255,255,.08);color:#fff;}',
      '.hs-navitem.on{background:var(--red,#c03926);color:#fff;}',
      '.hs-navitem.on .hs-navic{background:rgba(255,255,255,.22);color:#fff;}',
      '.hs-navleaf{white-space:normal;line-height:1.2;}',
      /* 2-level accordion: section header → expands to tool sub-items */
      '.hs-navsecwrap{margin-bottom:1px;}',
      '.hs-navsec{display:flex;align-items:center;gap:11px;width:100%;text-align:left;background:none;border:none;padding:11px 12px;border-radius:10px;font-family:inherit;font-size:13.5px;font-weight:600;color:rgba(255,255,255,.66);cursor:pointer;}',
      '.hs-navsec:hover{background:rgba(255,255,255,.08);color:#fff;}',
      /* active section (you are in it) — clearly colored */
      '.hs-navsec.on{background:rgba(192,57,38,.30);color:#fff;}',
      '.hs-navsec.on .hs-navic{background:var(--red,#c03926);color:#fff;}',
      '.hs-navsec .hs-navname{flex:1;min-width:0;white-space:normal;line-height:1.2;}',
      '.hs-navchev{font-size:11px;opacity:.55;transition:transform .15s;flex-shrink:0;}',
      '.hs-navsec.open .hs-navchev{transform:rotate(90deg);}',
      '.hs-navgroup{margin:1px 0 6px 15px;padding-left:9px;border-left:1px solid rgba(255,255,255,.13);display:flex;flex-direction:column;gap:2px;}',
      '.hs-navsub{display:flex;align-items:center;gap:9px;width:100%;text-align:left;background:none;border:none;padding:9px 11px;border-radius:9px;font-family:inherit;font-size:13px;font-weight:600;color:rgba(255,255,255,.58);cursor:pointer;}',
      '.hs-navsub:hover{background:rgba(255,255,255,.08);color:#fff;}',
      '.hs-navsub.on{background:var(--red,#c03926);color:#fff;}',
      '.hs-navsub > i{font-size:12px;width:16px;text-align:center;flex-shrink:0;}',
      /* 3rd level: the tabs inside a tool page */
      '.hs-navsubwrap,.hs-navleafwrap{display:flex;align-items:center;gap:2px;}',
      '.hs-navsubwrap > .hs-navsub,.hs-navleafwrap > .hs-navleaf{flex:1;min-width:0;}',
      '.hs-navleafwrap > .hs-navleaf{margin-bottom:0;}',
      '.hs-navpeek{flex-shrink:0;width:26px;height:30px;border:none;background:none;color:rgba(255,255,255,.42);cursor:pointer;border-radius:7px;font-size:10px;display:flex;align-items:center;justify-content:center;}',
      '.hs-navpeek:hover{background:rgba(255,255,255,.10);color:#fff;}',
      '.hs-navpeek i{transition:transform .15s;}',
      '.hs-navpeek.open i{transform:rotate(90deg);}',
      '.hs-navcats{margin:1px 0 6px 12px;padding-left:8px;gap:1px;}',
      '.hs-navcat{display:block;width:100%;text-align:left;background:none;border:none;cursor:pointer;font-family:inherit;font-size:12.3px;font-weight:500;line-height:1.3;color:rgba(255,255,255,.55);padding:6px 10px;border-radius:7px;}',
      '.hs-navcat:hover{background:rgba(255,255,255,.08);color:#fff;}',
      '.hs-navcat.on{background:rgba(192,57,38,.38);color:#fff;font-weight:700;}',
      '.hs-panel{background:transparent;border:none;border-radius:0;box-shadow:none;}',
      '.hs-phead{padding:14px 4px 4px;}',
      '.hs-phead h2{font-family:"Bebas Neue",sans-serif;font-size:25px;letter-spacing:1.5px;line-height:1;display:flex;align-items:center;gap:9px;color:var(--text,#0f172a);}',
      '.hs-phead p{font-size:12.5px;color:var(--text-muted,#94a3b8);margin-top:4px;}',
      '.hs-ptabs{display:flex;gap:2px;flex-wrap:wrap;padding:8px 2px 0;border-bottom:1px solid var(--border,#E2D9C8);background:transparent;}',
      '.hs-tab{display:inline-flex;align-items:center;gap:7px;padding:12px 15px;font-family:inherit;font-size:13px;font-weight:600;color:var(--text-sec,#475569);background:none;border:none;border-bottom:2.5px solid transparent;margin-bottom:-1px;cursor:pointer;}',
      '.hs-tab i{font-size:12.5px;opacity:.85;}',
      '.hs-tab:hover{color:var(--text,#0f172a);}',
      '.hs-tab.on{color:var(--red,#c03926);border-bottom-color:var(--red,#c03926);background:transparent;}',
      '.hs-extic{font-size:9px;opacity:.7;}',
      '.hs-pbody{min-width:0;}',
      '.hs-pbody.hs-inline{padding:16px 2px 24px;}',
      '.hs-frame{width:100%;border:0;display:block;height:600px;}',
      '.hs-ext{padding:50px 24px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px;}',
      '.hs-ext-ic{width:60px;height:60px;border-radius:16px;background:var(--surface-2,#f7f8fa);color:var(--text-sec,#475569);display:flex;align-items:center;justify-content:center;font-size:24px;}',
      '.hs-ext h3{font-size:16px;color:var(--text,#0f172a);}',
      '.hs-ext p{font-size:13px;color:var(--text-muted,#94a3b8);max-width:340px;}',
      '.hs-ext-btn{background:var(--red,#c03926);color:#fff;font-weight:700;font-size:13px;padding:9px 18px;border-radius:10px;display:inline-flex;gap:8px;align-items:center;text-decoration:none;}',
      '@media(max-width:860px){',
        /* stop the quick-connect bar from floating/covering content on phones */
        '.quick-connect{position:static!important;box-shadow:none!important;}',
        '.hs-bodywrap{grid-template-columns:1fr;}',
        '.hs-side{position:static;display:flex;gap:6px;overflow-x:auto;padding:8px 0;-webkit-overflow-scrolling:touch;}',
        '.hs-side-lbl{display:none;}',
        '.hs-navitem{white-space:nowrap;flex:0 0 auto;margin-bottom:0;}',
        '.hs-panel{min-height:0;}',
        '.hs-ptabs{flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch;}',
        '.hs-tab{white-space:nowrap;}',
        /* make the embedded tool fill the phone screen so it is easy to scroll */
        '.hs-frame{height:80vh;}',
        '.hs-pbody.hs-inline{padding:14px 14px 20px;}',
      '}',
      /* ══ ?nomad preview — full fixed-sidebar app frame (all gated by body.hub-nomad; inert otherwise) ══ */
      'body.hub-nomad{padding-left:244px;}',                              /* shift ALL body content (hero is a sibling before .main) right of the fixed rail */
      'body.hub-nomad .hs-side{display:none!important;}',                 /* nav was moved out into .hnav */
      'body.hub-nomad .hs-bodywrap{grid-template-columns:1fr!important;}',/* workspace fills the column */
      'body.hub-nomad .hs-zone{display:none;}',                          /* redundant "Your Tools & Resources" band */
      '.hnav-dash{margin-bottom:6px;}',
      /* edit-mode reorder arrows on the slate section sidebar */
      '.hs-navedit{display:flex;align-items:center;gap:2px;margin-bottom:2px;border-radius:10px;}',
      '.hs-navedit.on{background:var(--red,#c03926);}',
      '.hs-navsel{flex:1;min-width:0;display:flex;align-items:center;gap:11px;background:none;border:none;cursor:pointer;font-family:inherit;font-size:13.5px;font-weight:600;color:rgba(255,255,255,.66);padding:11px 6px 11px 12px;text-align:left;}',
      '.hs-navedit.on .hs-navsel{color:#fff;}',
      '.hs-navctrl{display:inline-flex;flex-shrink:0;padding-right:4px;}',
      '.hs-navmove{width:26px;height:28px;border:none;background:none;color:rgba(255,255,255,.5);cursor:pointer;font-size:11px;border-radius:6px;display:flex;align-items:center;justify-content:center;}',
      '.hs-navmove:hover:not(:disabled){background:rgba(255,255,255,.14);color:#fff;}',
      '.hs-navmove:disabled{opacity:.25;cursor:default;}',
      /* accordion edit rows: section header / sub-item + their reorder arrows on one line */
      '.hs-navsecrow{display:flex;align-items:center;gap:2px;}',
      '.hs-navsecrow > .hs-navsec,.hs-navsecrow > .hs-navleaf{flex:1;min-width:0;}',
      '.hs-navsubrow{display:flex;align-items:center;gap:2px;}',
      '.hs-navsubrow > .hs-navsub{flex:1;min-width:0;}',
      '.hs-navtoolmove{width:24px;height:26px;border:none;background:none;color:rgba(255,255,255,.5);cursor:pointer;font-size:10px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}',
      '.hs-navtoolmove:hover:not(:disabled){background:rgba(255,255,255,.14);color:#fff;}',
      '.hs-navtoolmove:disabled{opacity:.25;cursor:default;}',
      '.hs-navaddsec{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;margin-top:8px;background:rgba(255,255,255,.06);border:1.5px dashed rgba(255,255,255,.25);border-radius:10px;padding:10px;font-family:inherit;font-size:12.5px;font-weight:700;color:rgba(255,255,255,.7);cursor:pointer;}',
      '.hs-navaddsec:hover{border-color:rgba(255,255,255,.5);color:#fff;}',
      /* page-swap: Dashboard (default) shows the top region + Important #’s; a section shows only its workspace */
      'body.hub-nomad #hubShell{display:none;}',
      'body.hub-nomad.nomad-section #hubShell{display:block;}',
      'body.hub-nomad.nomad-section .hero,body.hub-nomad.nomad-section .search-bar,body.hub-nomad.nomad-section .quick-connect,body.hub-nomad.nomad-section #hubSocial,body.hub-nomad.nomad-section #helpTop,body.hub-nomad.nomad-section .section[data-section-id="important-numbers"],body.hub-nomad.nomad-section .nomad-dash-extra{display:none!important;}',
      '.hnav{position:fixed;top:0;left:0;width:244px;height:100vh;background:var(--slate,#2C3340);display:flex;flex-direction:column;z-index:315;box-shadow:2px 0 14px rgba(15,23,42,.14);}',
      '.hnav-logo{flex-shrink:0;display:flex;align-items:center;gap:11px;padding:16px 16px 15px;border-bottom:1px solid rgba(255,255,255,.10);}',
      '.hnav-logo img{width:42px;height:42px;object-fit:contain;background:#fff;border-radius:10px;padding:4px;flex-shrink:0;}',
      '.hnav-mark{width:42px;height:42px;border-radius:10px;background:var(--red,#c03926);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;flex-shrink:0;}',
      '.hnav-word{font-family:"Bebas Neue",sans-serif;font-size:17px;letter-spacing:1px;line-height:1.05;color:#fff;display:flex;flex-direction:column;gap:3px;}',
      '.hnav-word span{font-family:"Inter",sans-serif;font-size:9px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,.5);}',
      '.hnav-nav{flex:1;overflow-y:auto;padding:12px 10px;min-height:0;}',
      '.hnav-lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.9px;color:rgba(255,255,255,.42);padding:4px 10px 8px;}',
      '.hnav-foot{flex-shrink:0;border-top:1px solid rgba(255,255,255,.10);padding:10px;display:flex;flex-direction:column;gap:6px;}',
      '.hnav-acct,.hnav-out{display:flex;align-items:center;gap:10px;width:100%;padding:10px 13px;border-radius:9px;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;text-decoration:none;border:none;text-align:left;box-sizing:border-box;}',
      '.hnav-acct{background:#fff;color:var(--slate,#2C3340);}',
      '.hnav-acct:hover{background:#F5F0E8;}',
      '.hnav-out{background:rgba(255,255,255,.08);color:rgba(255,255,255,.75);}',
      '.hnav-out:hover{background:rgba(255,255,255,.15);color:#fff;}',
      '.hnav-burger{display:none;}',
      '.hnav-backdrop{display:none;}',
      '@media(max-width:860px){',
        'body.hub-nomad{padding-left:0;}',
        '.hnav{transform:translateX(-100%);transition:transform .25s ease;width:82%;max-width:300px;}',
        '.hnav.open{transform:translateX(0);}',
        '.hnav-burger{display:flex;position:fixed;top:12px;left:12px;z-index:320;width:44px;height:44px;border-radius:11px;border:none;background:var(--slate,#2C3340);color:#fff;align-items:center;justify-content:center;font-size:17px;box-shadow:0 2px 10px rgba(15,23,42,.28);cursor:pointer;}',
        'body.hub-nomad .hero{padding-top:20px!important;}',            /* clear the floating hamburger */
        '.hnav-backdrop.show{display:block;position:fixed;inset:0;background:rgba(15,23,42,.42);z-index:310;}',
      '}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(st);
  }
})();
