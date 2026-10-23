/* ============================================================
   yrl-copy-lib.js — copy-to-clipboard for the YRL copy libraries.
   Any .cb block gets a working copy button. Merge fields are kept
   as plain text so they paste cleanly into Gmail / Outlook / a CRM.
   ============================================================ */
(function () {
  'use strict';

  function plainText(el) {
    // Clone so we can strip stage directions the agent shouldn't paste.
    var c = el.cloneNode(true);
    c.querySelectorAll('em').forEach(function (e) { e.remove(); });
    var t = c.innerText || c.textContent || '';
    return t.replace(/\n{3,}/g, '\n\n').replace(/[ \t]+\n/g, '\n').trim();
  }

  function flash(btn, msg) {
    var original = btn.getAttribute('data-label') || btn.textContent;
    btn.classList.add('done');
    btn.innerHTML = '<i class="fa-solid fa-check"></i> ' + msg;
    setTimeout(function () {
      btn.classList.remove('done');
      btn.innerHTML = '<i class="fa-regular fa-copy"></i> ' + original;
    }, 1800);
  }

  function copy(text, btn) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(function () { flash(btn, 'Copied'); })
        .catch(function () { fallback(text, btn); });
    } else { fallback(text, btn); }
  }

  function fallback(text, btn) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    ta.remove();
    flash(btn, ok ? 'Copied' : 'Select & copy');
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.cb').forEach(function (block) {
      var btn = block.querySelector('.cb-copy');
      var body = block.querySelector('.cb-text');
      var subj = block.querySelector('.subj');
      if (!btn || !body) return;
      btn.setAttribute('data-label', btn.textContent.trim() || 'Copy');
      btn.innerHTML = '<i class="fa-regular fa-copy"></i> ' + btn.getAttribute('data-label');
      btn.addEventListener('click', function () {
        var text = plainText(body);
        if (subj) {
          var s = (subj.innerText || '').replace(/^\s*Subject:\s*/i, '').trim();
          if (s) text = 'Subject: ' + s + '\n\n' + text;
        }
        copy(text, btn);
      });
    });

    // "Copy all" for multi-part series
    document.querySelectorAll('[data-copy-all]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var scope = document.querySelector(btn.getAttribute('data-copy-all'));
        if (!scope) return;
        var out = [];
        scope.querySelectorAll('.cb').forEach(function (b) {
          var lbl = b.querySelector('.lbl');
          var subj = b.querySelector('.subj');
          var body = b.querySelector('.cb-text');
          if (!body) return;
          var chunk = '';
          if (lbl) chunk += '=== ' + lbl.innerText.trim() + ' ===\n';
          if (subj) chunk += subj.innerText.trim() + '\n\n';
          chunk += plainText(body);
          out.push(chunk);
        });
        btn.setAttribute('data-label', btn.getAttribute('data-label') || btn.textContent.trim());
        copy(out.join('\n\n\n'), btn);
      });
    });
  });
})();
