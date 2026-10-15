/* ============================================================
   hub-brand.js — applies per-client branding on top of the generic
   Nomad hub shell.

   Existing behaviour (unchanged): accent color + logo + document title.
   Added: the full white-label brand profile from
   client_portal_clients.brand — company name, address, phone, email,
   website, socials, tagline, and real-estate specifics (license #,
   MLS/board, office code).

   Runs after portal-auth.js (window.yrlClient / window.yrlMember) and
   reuses _hubClientId() from hub-data.js (so admin-preview ?as= works).

   Exposes window.yrlBrand (the brand object) and fires 'yrl-brand-ready'.
   Opt-in data binding (pages add these as we de-brand — safe no-op until
   they do):
     <span data-brand="company_name"></span>       -> textContent
     <a    data-brand-href="social.facebook"></a>  -> href attribute
   Dotted paths (e.g. "re.office_code") index into the brand object.
   ============================================================ */
(function () {
  /* Lighten (pct>0) or darken (pct<0) a #rrggbb hex. */
  function shade(hex, pct) {
    if (!hex || hex[0] !== '#' || hex.length < 7) return hex;
    const n = parseInt(hex.slice(1, 7), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const t = pct < 0 ? 0 : 255, p = Math.abs(pct) / 100;
    r = Math.round((t - r) * p) + r;
    g = Math.round((t - g) * p) + g;
    b = Math.round((t - b) * p) + b;
    return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function apply(client) {
    if (!client) return;
    const root = document.documentElement.style;
    if (client.accent_color) {
      const a = client.accent_color;
      root.setProperty('--accent', a);
      root.setProperty('--accent-light', shade(a, 15));
      root.setProperty('--accent-dark', shade(a, -18));
      root.setProperty('--accent-bg', shade(a, 90));
    }
    if (client.logo_url) {
      document.querySelectorAll('.hero-logo, .footer-logo').forEach((img) => {
        img.src = client.logo_url;
        img.alt = client.name || '';
        img.style.display = '';
      });
    } else {
      document.querySelectorAll('.hero-logo, .footer-logo').forEach((img) => { img.style.display = 'none'; });
      document.querySelectorAll('.hero-logo-fallback').forEach((el) => { el.style.display = 'block'; });
    }
    if (client.name) {
      document.title = client.name + ' — Hub';
      document.querySelectorAll('.hero-logo-fallback').forEach((el) => { el.textContent = client.name; });
      /* Footer copyright */
      const footerP = document.querySelector('.footer > p');
      if (footerP) {
        const yr = new Date().getFullYear();
        const brand = client.brand || {};
        const site = (brand.website || '').replace(/^https?:\/\/(?:www\.)?/, '');
        footerP.innerHTML = '© ' + yr + ' ' + client.name + '  ·  All Rights Reserved' +
          (site ? '  ·  <a href="' + (brand.website || '#') + '" target="_blank">' + site + '</a>' : '');
      }
    }
    /* Admin Portal link → Nomad portal */
    const adminLink = document.querySelector('.footer-admin-row a[href*="yrlagent"]');
    if (adminLink) adminLink.href = 'https://portal.nomadsystems.co';
    /* Patch the sidebar nav brand (hub-shell.js builds it with hardcoded YRL text before brand loads) */
    const navWord = document.querySelector('.hnav-word');
    if (navWord && client.name) {
      const tn = navWord.firstChild;
      if (tn && tn.nodeType === 3) tn.textContent = client.name;
    }
    const navLogoImg = document.querySelector('.hnav-logo img');
    if (navLogoImg) {
      if (client.logo_url) {
        navLogoImg.src = client.logo_url;
        navLogoImg.alt = client.name || '';
      } else {
        navLogoImg.style.display = 'none';
        if (!navLogoImg.parentNode.querySelector('.hnav-mark')) {
          const mark = document.createElement('div');
          mark.className = 'hnav-mark';
          mark.textContent = (client.name || 'HUB').split(/\s+/).map((w) => w[0]).join('').slice(0, 3).toUpperCase();
          navLogoImg.parentNode.insertBefore(mark, navLogoImg);
        }
      }
    }
  }

  /* Resolve a dotted path like "re.office_code" out of the brand object. */
  function brandVal(brand, path) {
    if (!brand || !path) return undefined;
    return path.split('.').reduce((o, k) => (o == null ? o : o[k]), brand);
  }

  /* Fill opt-in [data-brand] / [data-brand-href] elements. No-op when the
     page has none or a value is missing, so every page stays safe until it
     is explicitly de-branded. */
  function bindBrand(brand) {
    if (!brand) return;
    document.querySelectorAll('[data-brand]').forEach((el) => {
      const v = brandVal(brand, el.getAttribute('data-brand'));
      if (v != null && v !== '') el.textContent = v;
    });
    document.querySelectorAll('[data-brand-href]').forEach((el) => {
      const v = brandVal(brand, el.getAttribute('data-brand-href'));
      if (v) el.setAttribute('href', v);
    });
  }

  async function init() {
    try {
      const cid = (typeof _hubClientId === 'function')
        ? _hubClientId()
        : (window.yrlMember && window.yrlMember.client_id);
      if (!cid || !window.yrlClient) return;
      const { data } = await window.yrlClient
        .from('client_portal_clients')
        .select('name, accent_color, logo_url, brand')
        .eq('id', cid)
        .maybeSingle();
      apply(data);
      const brand = (data && data.brand) || {};
      window.yrlBrand = brand;
      try { bindBrand(brand); } catch (e) {}
      try { document.dispatchEvent(new CustomEvent('yrl-brand-ready', { detail: { brand } })); } catch (e) {}
    } catch (e) {}
  }

  /* Public helper so a page can re-bind after it injects brand-tagged DOM. */
  window.yrlApplyBrand = function () { try { bindBrand(window.yrlBrand); } catch (e) {} };

  if (window.yrlMember) init();
  else document.addEventListener('yrl-auth-ready', init, { once: true });
})();
