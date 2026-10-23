/* ============================================================
   section-order.js  —  reusable section reorder + rename
   ------------------------------------------------------------
   In edit mode adds, to the LEFT of each section header:
     • ▲ / ▼ arrows to reorder whole sections
     • ✎ (when titleSel is given) to rename the section's
       heading + sub-heading
   Order persists to hub_content[key]; header text overrides to
   hub_content[metaKey] (both mirrored to localStorage) via the
   page's loadHubContent / saveHubContent helpers.

   Usage:
     SectionOrder.init({
       key:        'yrl-hub-section-order',
       container:  'main.main',
       section:    'section.section',
       header:     '.sec-header',
       titleSel:   'h2',                 // (optional) enables rename
       subtitleSel:'p',                  // (optional)
       metaKey:    'yrl-hub-section-meta'
     });

   Each section must have a stable id (data-section-id or id).
   Visibility is driven by body.hub-edit-mode / body.admin-edit-mode.
   ============================================================ */
(function () {
  var CSS_ID = 'section-order-css';

  function injectCss() {
    if (document.getElementById(CSS_ID)) return;
    var s = document.createElement('style');
    s.id = CSS_ID;
    s.textContent =
      '.sec-move{display:none;flex-direction:column;gap:3px;margin-right:6px;flex:0 0 auto;align-self:center;}' +
      '.sec-editbtn{display:none;margin-right:8px;width:26px;height:26px;padding:0;border:1px solid rgba(0,0,0,.15);background:#fff;color:#c03926;border-radius:6px;font-size:11px;line-height:1;cursor:pointer;align-items:center;justify-content:center;flex:0 0 auto;align-self:center;}' +
      'body.hub-edit-mode .sec-move,body.admin-edit-mode .sec-move{display:inline-flex;}' +
      'body.hub-edit-mode .sec-editbtn,body.admin-edit-mode .sec-editbtn{display:inline-flex;}' +
      '.sec-move button{width:24px;height:18px;padding:0;border:1px solid rgba(0,0,0,.15);background:#fff;color:#c03926;' +
      'border-radius:5px;font-size:9px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;' +
      'font-family:inherit;transition:background .15s,color .15s,border-color .15s;}' +
      '.sec-move button:hover:not(:disabled){background:#c03926;color:#fff;border-color:#c03926;}' +
      '.sec-editbtn:hover{background:#c03926;color:#fff;border-color:#c03926;}' +
      '.sec-move button:disabled{opacity:.28;cursor:default;}' +
      '.so-overlay{position:fixed;inset:0;background:rgba(15,23,42,.55);display:none;align-items:center;justify-content:center;z-index:9500;padding:20px;}' +
      '.so-overlay.open{display:flex;}' +
      '.so-modal{background:#fff;border-radius:16px;max-width:460px;width:100%;padding:22px;font-family:Inter,system-ui,sans-serif;box-shadow:0 20px 60px rgba(0,0,0,.35);}' +
      '.so-modal h3{font-family:"Bebas Neue",sans-serif;font-size:22px;letter-spacing:1px;margin:0 0 12px;color:#1a1d22;}' +
      '.so-modal label{display:block;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:#5a6270;margin:12px 0 5px;}' +
      '.so-modal input{width:100%;background:#f7f8fa;border:1.5px solid #e2e5ea;border-radius:9px;padding:10px 12px;font-size:14px;font-family:inherit;outline:none;box-sizing:border-box;}' +
      '.so-modal input:focus{border-color:#c03926;}' +
      '.so-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:20px;}' +
      '.so-btn{border:none;border-radius:9px;padding:10px 16px;font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;}' +
      '.so-save{background:#c03926;color:#fff;} .so-cancel{background:#eef0f3;color:#1a1d22;}';
    document.head.appendChild(s);
  }

  /* Each SectionOrder.init() call gets its OWN instance (own _opts/_meta),
     so multiple containers (e.g. one per admin tab panel) can coexist
     without one instance's async loadHubContent() callback clobbering
     another's state. */
  function SectionOrderInstance(opts) {
    this._opts = opts;
    this._meta = {};
  }

  SectionOrderInstance.prototype = {
    _run: function () {
      var self = this;
      var run = function () {
        injectCss();
        self._mountArrows();
        self._restore();
        self._applyMeta();
      };
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
      } else { run(); }
    },

    _container: function () { return document.querySelector(this._opts.container); },
    _sections: function () {
      var c = this._container();
      if (!c) return [];
      return Array.prototype.slice.call(c.querySelectorAll(':scope > ' + this._opts.section));
    },
    _keyOf: function (el) { return el.getAttribute('data-section-id') || el.id || ''; },

    _mountArrows: function () {
      var o = this._opts, self = this;
      this._sections().forEach(function (sec) {
        var hdr = sec.querySelector(o.header);
        if (!hdr || hdr.querySelector('.sec-move')) return;
        var mv = document.createElement('div');
        mv.className = 'sec-move';
        var up = document.createElement('button');
        up.type = 'button'; up.title = 'Move section up'; up.textContent = '▲';
        var dn = document.createElement('button');
        dn.type = 'button'; dn.title = 'Move section down'; dn.textContent = '▼';
        up.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); self.move(sec, -1); });
        dn.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); self.move(sec, 1); });
        mv.appendChild(up); mv.appendChild(dn);
        hdr.insertBefore(mv, hdr.firstChild);
        if (o.metaKey && o.titleSel) {
          var ed = document.createElement('button');
          ed.type = 'button'; ed.className = 'sec-editbtn'; ed.title = 'Edit section heading'; ed.innerHTML = '<i class="fa-solid fa-pen"></i>';
          if (!ed.querySelector('i')) ed.textContent = '✎';
          ed.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); self._openRename(sec); });
          hdr.insertBefore(ed, mv.nextSibling);
        }
      });
      this._updateDisabled();
    },

    _updateDisabled: function () {
      var secs = this._sections();
      secs.forEach(function (sec, i) {
        var mv = sec.querySelector('.sec-move'); if (!mv) return;
        var btns = mv.querySelectorAll('button');
        if (btns[0]) btns[0].disabled = (i === 0);
        if (btns[1]) btns[1].disabled = (i === secs.length - 1);
      });
    },

    move: function (sec, dir) {
      var c = this._container(), secs = this._sections();
      var i = secs.indexOf(sec), j = i + dir;
      if (i < 0 || j < 0 || j >= secs.length) return;
      var other = secs[j];
      if (dir < 0) c.insertBefore(sec, other); else c.insertBefore(other, sec);
      this._updateDisabled();
      this._save();
      try { sec.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
    },

    _apply: function (order) {
      var c = this._container(), secs = this._sections();
      if (!secs.length) return;
      var self = this, ordered = [];
      order.forEach(function (id) {
        var s = secs.filter(function (x) { return self._keyOf(x) === id; })[0];
        if (s && ordered.indexOf(s) === -1) ordered.push(s);
      });
      secs.forEach(function (s) { if (ordered.indexOf(s) === -1) ordered.push(s); });
      var ref = secs[0].previousElementSibling;
      ordered.forEach(function (s) { c.insertBefore(s, ref ? ref.nextSibling : c.firstChild); ref = s; });
      this._updateDisabled();
    },

    _restore: function () {
      var o = this._opts, self = this, local = null;
      try { local = JSON.parse(localStorage.getItem(o.key) || 'null'); } catch (e) {}
      if (local && local.length) this._apply(local);
      if (typeof loadHubContent === 'function') {
        loadHubContent(o.key).then(function (remote) { if (remote && remote.length) self._apply(remote); }).catch(function () {});
      }
    },

    _save: function () {
      var o = this._opts;
      var ids = this._sections().map(this._keyOf.bind(this)).filter(Boolean);
      try { localStorage.setItem(o.key, JSON.stringify(ids)); } catch (e) {}
      if (typeof saveHubContent === 'function') saveHubContent(o.key, ids);
    },

    /* ── section heading overrides ── */
    _pick: function (sec, sel) {
      var h = sec.querySelector(this._opts.header); if (!h || !sel) return null;
      var el = h.querySelector(sel);
      if (!el && h.matches && h.matches(sel)) el = h;   // header itself is the target (e.g. admin .section-label)
      return el;
    },
    _titleEl: function (sec) { return this._pick(sec, this._opts.titleSel); },
    _subEl: function (sec) { return this._pick(sec, this._opts.subtitleSel); },
    /* read visible text, ignoring the reorder/edit controls and any icon */
    _getText: function (el) {
      if (!el) return '';
      var clone = el.cloneNode(true);
      Array.prototype.forEach.call(clone.querySelectorAll('.sec-move,.sec-editbtn,i,svg'), function (n) { n.remove(); });
      return clone.textContent.trim();
    },
    /* set the text while preserving a leading icon + the controls */
    _setText: function (el, text) {
      if (!el) return;
      var hasEl = !!el.querySelector('i,svg');
      Array.prototype.slice.call(el.childNodes).forEach(function (n) { if (n.nodeType === 3) el.removeChild(n); });
      el.appendChild(document.createTextNode(hasEl ? (' ' + text) : text));
    },

    _useMeta: function (meta) {
      if (!meta) return;
      this._meta = meta;
      var self = this;
      this._sections().forEach(function (sec) {
        var m = meta[self._keyOf(sec)]; if (!m) return;
        if (m.title != null) self._setText(self._titleEl(sec), m.title);
        if (m.subtitle != null) self._setText(self._subEl(sec), m.subtitle);
      });
    },

    _applyMeta: function () {
      var o = this._opts, self = this;
      if (!o.metaKey) return;
      var local = null;
      try { local = JSON.parse(localStorage.getItem(o.metaKey) || 'null'); } catch (e) {}
      if (local) this._useMeta(local);
      if (typeof loadHubContent === 'function') {
        loadHubContent(o.metaKey).then(function (remote) { if (remote) self._useMeta(remote); }).catch(function () {});
      }
    },

    _openRename: function (sec) {
      var self = this, o = this._opts;
      SectionOrderInstance._active = this; /* the shared #soModal's Save button resolves this at click time */
      var id = this._keyOf(sec);
      var tEl = this._titleEl(sec), sEl = this._subEl(sec);
      this._ensureModal();
      var ov = document.getElementById('soModal');
      document.getElementById('so-title').value = this._getText(tEl);
      var subRow = document.getElementById('so-sub-row');
      if (o.subtitleSel) { subRow.style.display = ''; document.getElementById('so-subtitle').value = this._getText(sEl); }
      else { subRow.style.display = 'none'; }
      ov.dataset.secId = id;
      ov.classList.add('open');
      setTimeout(function () { document.getElementById('so-title').focus(); }, 60);
    },

    _ensureModal: function () {
      if (document.getElementById('soModal')) return;
      var d = document.createElement('div');
      d.id = 'soModal'; d.className = 'so-overlay';
      d.innerHTML = '<div class="so-modal"><h3>Edit section heading</h3>' +
        '<label>Section title</label><input id="so-title" type="text">' +
        '<div id="so-sub-row"><label>Sub-heading</label><input id="so-subtitle" type="text"></div>' +
        '<div class="so-actions"><button class="so-btn so-cancel" id="so-cancel">Cancel</button><button class="so-btn so-save" id="so-save">Save</button></div></div>';
      document.body.appendChild(d);
      d.addEventListener('click', function (e) { if (e.target === d) d.classList.remove('open'); });
      document.getElementById('so-cancel').addEventListener('click', function () { d.classList.remove('open'); });
      /* Resolved at click time (not modal-creation time) so whichever instance most
         recently opened the (page-wide singleton) modal is the one that saves. */
      document.getElementById('so-save').addEventListener('click', function () { SectionOrderInstance._active._saveRename(); });
    },

    _saveRename: function () {
      var o = this._opts;
      var ov = document.getElementById('soModal');
      var id = ov.dataset.secId;
      var sec = this._sections().filter(function (s) { return this._keyOf(s) === id; }.bind(this))[0];
      if (!sec) { ov.classList.remove('open'); return; }
      var title = document.getElementById('so-title').value.trim();
      var subtitle = o.subtitleSel ? document.getElementById('so-subtitle').value.trim() : null;
      if (title) this._setText(this._titleEl(sec), title);
      if (subtitle != null) this._setText(this._subEl(sec), subtitle);
      this._meta = this._meta || {};
      this._meta[id] = { title: title, subtitle: subtitle };
      try { localStorage.setItem(o.metaKey, JSON.stringify(this._meta)); } catch (e) {}
      if (typeof saveHubContent === 'function') saveHubContent(o.metaKey, this._meta);
      ov.classList.remove('open');
    }
  };

  SectionOrderInstance._active = null; /* which instance's rename dialog is currently open */

  window.SectionOrder = {
    init: function (opts) {
      var inst = new SectionOrderInstance(opts);
      inst._run();
      return inst;
    }
  };
})();
