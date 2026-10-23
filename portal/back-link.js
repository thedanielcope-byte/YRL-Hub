/* ============================================================
   back-link.js — make "← Hub" go back where you actually came from.

   Sub-pages hardcode href="hub.html", so opening one from the portal
   (portal.yrlagent.com -> Hub Admin -> Homepage Cities) and hitting back
   dumped you on the agent hub instead of the page you came from.

   This rewrites ONLY back links that point at hub.html, to whichever of
   index.html / admin.html / hub.html actually referred you. Anything else
   (or a cold load with no referrer) keeps the hub.html default, so the
   agent path is unchanged.
   ============================================================ */
(function () {
  var SELECTOR = 'a.back-btn, a.sub-header-back, a.back-link, a.back-btn-inline';
  var LABELS   = { 'index.html': 'Portal', 'admin.html': 'Admin', 'hub.html': 'Hub' };

  function fileOf(path) {
    return (String(path || '').split('/').pop() || '').split('?')[0].split('#')[0].toLowerCase();
  }

  var here = fileOf(location.pathname);
  var memo = 'yrlBackTo:' + here;

  /* Where did we come from? Referrer first, then whatever we stored for this
     page earlier in the session (so a refresh doesn't lose the trail). */
  function cameFrom() {
    try {
      if (document.referrer) {
        var u = new URL(document.referrer);
        if (u.origin === location.origin) {
          var f = fileOf(u.pathname);
          if (LABELS[f] && f !== here) {
            try { sessionStorage.setItem(memo, f + (f === 'index.html' ? '?portal=1' : '')); } catch (e) {}
            return f + (f === 'index.html' ? '?portal=1' : '');
          }
        }
      }
      var saved = sessionStorage.getItem(memo);
      if (saved) return saved;
    } catch (e) {}
    return null;
  }

  function apply() {
    var target = cameFrom();
    if (!target) return;                       /* no context — leave the default */
    var label = LABELS[fileOf(target)];
    if (!label) return;

    Array.prototype.forEach.call(document.querySelectorAll(SELECTOR), function (a) {
      if (fileOf(a.getAttribute('href')) !== 'hub.html') return;  /* only the hub back link */
      a.setAttribute('href', target);
      /* keep the icon, swap just the text */
      Array.prototype.slice.call(a.childNodes).forEach(function (n) {
        if (n.nodeType === 3 && n.textContent.trim()) n.textContent = ' ' + label;
      });
      a.setAttribute('title', 'Back to ' + label);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else { apply(); }
})();
