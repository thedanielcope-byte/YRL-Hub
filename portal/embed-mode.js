/* ============================================================
   embed-mode.js — lets a YRL tool page render inside the hub shell.
   Activates ONLY on an explicit ?embed flag (the hub shell adds ?embed=1
   to each tool iframe). We deliberately do NOT auto-detect framing, because
   yrlagent.com masks yrl.nomadsystems.co and a framing check would wrongly
   strip chrome from normally-viewed pages.

   IMPORTANT: we do NOT hide the page's header — action buttons (e.g. "New
   Task") live inside it. We only remove the two things that are redundant
   inside the hub: the "Back to Hub" link and the "Sign Out" button.
   ============================================================ */
(function () {
  var embed = /[?&]embed(=|&|$)/.test(location.search);
  if (!embed) return;
  var subtabs = /[?&]subtabs(=|&|$)/.test(location.search);   // hub nomad frame → declutter: help box to the bottom

  /* ── Tab protocol (hub sidebar 3rd level) ─────────────────────────
     A page with inner tabs calls window.__yrlRegisterTabs(fn) with its own
     "switch to tab <id>" function. The hub asks for a tab either via ?tab=<id>
     on the iframe URL or a {__yrlTab, tab} message; whichever comes first is
     held until the page registers. When the user changes tab inside the page,
     the page calls window.__yrlTabChanged(id) so the sidebar highlight follows. */
  var _tabFn = null, _pendingTab = null;
  try { var _qt = new URLSearchParams(location.search).get('tab'); if (_qt) _pendingTab = _qt; } catch (e) {}
  window.__yrlRegisterTabs = function (fn) {
    _tabFn = fn;
    if (_pendingTab != null) { var t = _pendingTab; _pendingTab = null; try { fn(t); } catch (e) {} }
  };
  window.__yrlTabChanged = function (id) {
    try { if (parent !== window && id != null) parent.postMessage({ __yrlTabChanged: true, tab: String(id) }, '*'); } catch (e) {}
  };
  window.addEventListener('message', function (e) {
    var d = e.data; if (!d || !d.__yrlTab || d.tab == null) return;
    if (_tabFn) { try { _tabFn(String(d.tab)); } catch (err) {} } else _pendingTab = String(d.tab);
  });

  var de = document.documentElement;
  de.classList.add('embed');

  // In the nomad frame the tool's top help box (#helpTop) is big and in the way —
  // relocate it to the BOTTOM of its container so the category tabs sit right under
  // the hub's section tabs.
  function moveHelpDown() {
    if (!subtabs) return;
    var h = document.getElementById('helpTop');
    if (h && h.parentNode && h.parentNode.lastElementChild !== h) h.parentNode.appendChild(h);
  }

  function injectCss() {
    if (document.getElementById('yrl-embed-css')) return;
    var st = document.createElement('style');
    st.id = 'yrl-embed-css';
    st.textContent =
      '.embed body{margin:0!important;}' +
      /* never let a tool page scroll sideways inside the frame */
      '.embed html,.embed body{overflow-x:hidden!important;}' +
      /* don't let the tool force full viewport height inside the frame (leaves blank
         space + breaks fitting the frame to real content). */
      '.embed html,.embed body{height:auto!important;min-height:0!important;}' +
      /* flatten the tool's own header: drop the red gradient bar + its title/logo
         (redundant with the hub shell's section header + tab), but KEEP the action
         buttons that live in the header (e.g. "New Task"). */
      '.embed .page-header,.embed header.page-header,.embed .sub-header,.embed header.sub-header{' +
        'background:transparent!important;background-image:none!important;border:none!important;box-shadow:none!important;padding:12px 20px 0!important;}' +
      '.embed .header-left,.embed .sub-header-left,.embed .header-title,.embed .sub-header-text,.embed .header-sub{display:none!important;}' +
      /* single edit control = the hub's "Edit Site" button. Hide each tool's own
         Edit toggle from first paint (JS still .click()s it to drive edit mode). */
      '.embed .tg-editbtn,.embed .rl-editbtn{display:none!important;}' +
      /* .back-btn (breadcrumbs + header action buttons) are styled white-on-red for the
         standalone header; embedded, the header flattens to cream so white reads invisible.
         Make every visible back-btn legible (hub-back ones are hidden separately). */
      '.embed .back-btn{color:var(--text,#1a1d22)!important;background:var(--surface-2,#f0eadf)!important;border-color:var(--border,#e2d9c8)!important;}';
    (document.head || document.documentElement).appendChild(st);
  }
  injectCss();

  // Sign Out / Log Out can't be targeted by text in CSS — hide in JS.
  function hideSignOut() {
    var els = document.querySelectorAll('button, a');
    for (var i = 0; i < els.length; i++) {
      var t = (els[i].textContent || '').trim().toLowerCase();
      if (t === 'sign out' || t === 'log out' || t === 'logout') els[i].style.display = 'none';
    }
  }

  /* ── Keep onward navigation embedded ───────────────────────────
     A tool page can link to a deeper page (e.g. Marketing → "MREA Marketing")
     or back to its parent (a sub-page's "← Marketing"). Left alone, those load
     the target with FULL chrome + full-viewport height inside the frame — the
     green hero + inner scrollbar Dan saw. So for every same-origin *.html link:
       • a "back to Hub" link is redundant here → hide it;
       • any other tool/sub-page link → carry ?embed=1 forward so it stays
         embedded (chrome stripped, height reported). In-frame breadcrumb
         "back to <parent tool>" links stay VISIBLE (useful inside the frame). */
  function normHref(a) {
    var href = a.getAttribute('href') || '';
    if (!href || href.charAt(0) === '#') return null;
    if ((a.getAttribute('target') || '') === '_blank') return null;
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return null;
    if (/^https?:/i.test(href)) {                     // absolute → only same-origin
      try { var u = new URL(href); if (u.origin !== location.origin) return null; href = u.pathname + u.search + u.hash; }
      catch (e) { return null; }
    }
    var path = href.split('#')[0].split('?')[0];
    if (!/\.html$/i.test(path)) return null;           // only page navigations
    return href;
  }
  function isHubBack(href) { return /(^|\/)(hub|index)\.html(\?|#|$)/i.test(href); }
  function rewriteLinks() {
    var as = document.querySelectorAll('a[href]');
    for (var i = 0; i < as.length; i++) {
      var a = as[i], href = normHref(a);
      if (!href) continue;
      if (isHubBack(href)) { if (a.style.display !== 'none') a.style.display = 'none'; continue; }
      if (!/[?&]embed(=|&|$)/.test(href)) {
        a.setAttribute('href', href + (href.indexOf('?') >= 0 ? '&' : '?') + 'embed=1');
      }
    }
  }

  /* ── Master edit mode ──────────────────────────────────────────
     Each tool page has its own "Edit Mode / Edit tools" toggle. When embedded
     we HIDE those (the hub's single bottom "Edit" button is the master), and
     the hub tells us to enter/exit edit via postMessage — we click the page's
     own toggle to do it. sessionStorage is shared with the hub, so no re-PIN. */
  var EDIT_SEL = '.tg-editbtn,.rl-editbtn,[onclick*="oggleTrainEdit"],[onclick*="oggleEditMode"],[onclick*="oggleEdit("]';
  function editToggles() {
    var list = [].slice.call(document.querySelectorAll(EDIT_SEL));
    var btns = document.querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      if (b.classList.contains('hb-editbtn')) continue;          // not the help-box editor
      var t = (b.textContent || '').trim().toLowerCase();
      if ((t === 'edit mode' || t === 'edit tools') && list.indexOf(b) < 0) list.push(b);
    }
    return list;
  }
  function hideEditToggles() { editToggles().forEach(function (b) { if (b.style.display !== 'none') b.style.display = 'none'; }); }
  var _hideTimer, _htTimer, _rwTimer;
  function scheduleHide() { clearTimeout(_hideTimer); _hideTimer = setTimeout(hideEditToggles, 150); }
  function scheduleHeight() { clearTimeout(_htTimer); _htTimer = setTimeout(postHeight, 220); }
  function scheduleRewrite() { clearTimeout(_rwTimer); _rwTimer = setTimeout(rewriteLinks, 120); }
  function onMutate() { scheduleHide(); scheduleHeight(); scheduleRewrite(); }
  var _editOn = false;
  // a toggle that's currently in edit mode ('on'/'active' class, or reads "Done editing")
  function toggleIsOn(b) { return b.classList.contains('on') || b.classList.contains('active') || /\bdone\b/i.test(b.textContent || ''); }
  function setEdit(on) {
    var list = editToggles();
    if (!list.length) return;
    // The hub already verified the edit PIN before commanding edit-on, so mark
    // this frame unlocked too (prevents a stray PIN prompt inside the iframe).
    if (on) { try { sessionStorage.setItem('yrl_edit_unlocked', '1'); } catch (e) {} }
    if (list.length === 1) {
      if (on && !_editOn) { list[0].click(); _editOn = true; }
      else if (!on && _editOn) { list[0].click(); _editOn = false; }
      return;
    }
    // Several editors on one page (e.g. Trainings: a tile-grid + the video library) —
    // flip each one that isn't already in the wanted state. Re-query after each click
    // because toggles re-render their own button.
    for (var n = 0; n < 8; n++) {
      var b = editToggles().filter(function (x) { return toggleIsOn(x) !== on; })[0];
      if (!b) break;
      b.click();
    }
    _editOn = on;
  }
  window.addEventListener('message', function (e) {
    var d = e.data; if (d && d.__yrlEdit) setEdit(!!d.on);
  });

  // Report our real content height to the hub a few times (NOT continuously —
  // a live loop would fight a fixed frame). The hub uses this to fit the frame.
  var _lastH = 0;
  function postHeight() {
    try {
      var h = Math.max(document.body ? document.body.scrollHeight : 0, document.documentElement.scrollHeight);
      if (h && Math.abs(h - _lastH) > 6) { _lastH = h; parent.postMessage({ __yrlEmbedH: true, height: h }, '*'); }
    } catch (e) {}
  }

  function boot() {
    injectCss(); hideSignOut(); hideEditToggles(); rewriteLinks(); moveHelpDown();
    setTimeout(function () { hideSignOut(); hideEditToggles(); rewriteLinks(); moveHelpDown(); }, 700);
    setTimeout(function () { hideEditToggles(); rewriteLinks(); moveHelpDown(); }, 2000);
    // tools re-render (enter edit, filter, etc.) → keep edit buttons hidden AND
    // re-report height so the frame keeps fitting (no inner scrollbar).
    try { new MutationObserver(onMutate).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
    [300, 900, 1800, 3200].forEach(function (ms) { setTimeout(postHeight, ms); });
  }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);
  document.addEventListener('yrl-auth-ready', function () { setTimeout(postHeight, 600); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  document.addEventListener('yrl-auth-ready', function () { hideSignOut(); hideEditToggles(); rewriteLinks(); moveHelpDown(); setTimeout(function () { hideEditToggles(); rewriteLinks(); moveHelpDown(); }, 500); });
})();
