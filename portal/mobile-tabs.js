/* ══════════════════════════════════════════════════════════════════════
   mobile-tabs.js — on phones (≤760px), a row of tab buttons becomes ONE
   dropdown. The buttons stay in the page (hidden) and remain the source of
   truth: picking an option just clicks the matching button, and the dropdown
   re-syncs whenever the buttons change (active tab, re-render, badges).
   Desktop is untouched.

   Auto-attaches to the tab rows listed in ROWS below. For a new page:
     MobileTabs.attach(containerEl, '.my-tab-button')
   ══════════════════════════════════════════════════════════════════════ */
(function () {
    var ROWS = [
        ['.view-tabs', '.view-tab'],                 // Contacts: Contacts / Pipeline / Follow-ups
        ['.view-toggle', '.vt'],                     // Tasks, Calendar, Transactions view switch
        ['#filters > div:first-child', '.chip[data-f]'], // Transactions: Active / Closed / Archived / All
        ['.mv-tabs', '.mv-tab'],                     // My Agent Profile, Moving to YRL
        ['.ce-tabs', '.ce-tab'],                     // CE & Licensing
        ['#ltTabs', '.lt-tab']                       // Licensing Training
    ];
    var ACTIVE = /\b(on|active)\b/;

    function injectCss() {
        if (document.getElementById('mtCss')) return;
        var st = document.createElement('style'); st.id = 'mtCss';
        st.textContent =
            '.mt-sel{display:none;position:relative;align-items:center;flex:1 1 180px;min-width:160px;margin:0 0 12px;}' +
            '.mt-sel select{width:100%;appearance:none;-webkit-appearance:none;background:var(--surface,#fff);border:1.5px solid var(--border,#e2e5ea);border-radius:12px;padding:12px 42px 12px 14px;font-family:Inter,sans-serif;font-size:15px;font-weight:700;color:var(--text,#1a1d22);cursor:pointer;}' +
            '.mt-sel select:focus{outline:none;border-color:var(--red,#c03926);}' +
            '.mt-sel i{position:absolute;right:15px;pointer-events:none;color:var(--red,#c03926);font-size:13px;}' +
            '@media(max-width:760px){.mt-sel{display:flex;}.mt-row{display:none !important;}}';
        document.head.appendChild(st);
    }

    function label(btn) {
        var c = btn.cloneNode(true);
        [].forEach.call(c.querySelectorAll('[class*="badge"]'), function (b) { b.remove(); });
        return (c.textContent || '').replace(/\s+/g, ' ').trim();
    }

    function attach(row, itemSel) {
        if (!row || row.__mt) return;
        row.__mt = true;
        injectCss();
        var wrap = document.createElement('label');
        wrap.className = 'mt-sel';
        wrap.innerHTML = '<select aria-label="Choose a view"></select><i class="fa-solid fa-chevron-down"></i>';
        row.parentNode.insertBefore(wrap, row);
        var sel = wrap.querySelector('select');

        function items() { return [].slice.call(row.querySelectorAll(itemSel)).filter(function (b) { return b.style.display !== 'none'; }); }
        function sync() {
            var list = items();
            // only worth a dropdown with 2+ choices; otherwise leave the row as-is
            var use = list.length >= 2;
            row.classList.toggle('mt-row', use);
            wrap.style.display = use ? '' : 'none';
            if (!use) return;
            var html = '', cur = 0;
            list.forEach(function (b, i) {
                if (ACTIVE.test(b.className)) cur = i;
                html += '<option value="' + i + '">' + label(b).replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</option>';
            });
            if (sel.innerHTML !== html) sel.innerHTML = html;
            sel.value = String(cur);
        }
        sel.addEventListener('change', function () {
            var b = items()[+sel.value];
            if (b) b.click();
            setTimeout(sync, 0);
        });
        new MutationObserver(function () { sync(); }).observe(row, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'style'], characterData: true });
        sync();
    }

    function scan() {
        ROWS.forEach(function (r) {
            [].forEach.call(document.querySelectorAll(r[0]), function (row) { attach(row, r[1]); });
        });
    }
    window.MobileTabs = { attach: function (row, itemSel) { attach(typeof row === 'string' ? document.querySelector(row) : row, itemSel); } };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan); else scan();
})();
