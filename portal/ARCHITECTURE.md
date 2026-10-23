# ⚠️ READ FIRST — Portal / Hub Architecture (source of truth)

This folder (`YRL/YRL-Hub/portal/`) is the **multi-tenant Nomad Systems portal +
brokerage hub**. It is deployed by **`deploy-portal.sh`** (in the Nomad Systems
project root) to Cloudways → served at `portal.nomadsystems.co`,
`yrl.nomadsystems.co`, `*.nomadsystems.co`, and the custom domains below.

**Two Claude sessions work on this. To avoid clobbering each other, follow the
ownership + conventions below. Before editing, make sure you are working on THESE
files (this folder) — not an old copy.**

---

## Which hostname serves which page (verified 2026-09-04)
Routing lives in `index.html` (`CUSTOM_HUB_DOMAINS` ~line 513, `hubSlug()`,
`showDash()` ~line 799). The `portal.` prefix is what decides it:

| Hostname | Lands on | Who uses it |
|---|---|---|
| `yrlagent.com`, `www.yrlagent.com`, `yrl.nomadsystems.co` | **`hub.html`** (agent hub) | the 17 YRL agents (+ owners auto-redirected) |
| `portal.yrlagent.com` | **`index.html`** (client portal, `template_key='real_estate'`) | YRL's own clients — owners land here too, no auto-redirect |
| `portal.tidesbookkeeping.com` | `index.html` (`template_key='bookkeeping'`) | Tides clients |
| `portal.nomadsystems.co` | `index.html` (generic) | Dan's platform control (nomad_admin) |

Owners reach the agent hub + Hub Admin from the client portal via the **Open My
Hub** / **Hub Admin** cards (`isBrokerOwner`, gated to `owner`/`nomad_admin` +
`HUB_SLUGS`). **These cards must be included in BOTH branches of the `cardGrid`
ternary** (~line 912) — the `.bk` sidebar branch originally omitted them, which
left brokerage owners with no way into the hub at all (fixed 2026-09-04).

## Access control — ONE gate, TWO admin surfaces (read before touching either)
`client_portal_members` is the single login gate. `portal-auth.js` resolves the
caller's row with `.eq('status','active')`; no active row = `index.html?denied=1`
on EVERY page (hub.html, admin.html, all yrl-* tools). There is no separate
"hub login" vs "portal login".

Who manages whom:
- **Agents** → `admin.html` → **Staff & Access** (writes `hub_authorized_agents`).
  The `on_hub_agent_change` trigger syncs that into `client_portal_members`:
  INSERT/restore → creates or reactivates the member row with `role='agent'`;
  status flip to non-active → sets the member row `disabled`; DELETE → same.
  It only ever touches `role='agent'` rows, so an owner can't be disabled by it.
- **Portal users (owner / client)** → `index.html` → **Team** tab (writes
  `client_portal_members` directly, inserts `role='client'`).
- **Anything cross-tenant / role changes** → `nomad-admin.html` → Members.

⚠️ **The two tables use DIFFERENT status vocabularies** — `hub_authorized_agents.status`
is `('active','revoked')`, `client_portal_members.status` is `('active','disabled')`.
Fixed 2026-09-11: the trigger wrote `'revoked'` into `client_portal_members`, which
violates its check constraint, so **every revoke aborted and the agent silently kept
full access** — and there was no DELETE branch at all, so "Permanently remove" removed
the access row but left the login live. Keep the vocabularies straight if you edit it.

Agents cannot use the portal: `index.html` (`showDash`) redirects `role='agent'` →
`hub.html` and `txn_client` → `my-transaction.html` before the dashboard renders. The
Team tab therefore lists only `owner` + `client` and shows a count of hub agents with a
pointer to Hub Admin — it used to list agents with a remove button that deleted their
member row, i.e. a one-click hub lockout that left Hub Admin still showing them active.

## Dashboard cards — "Open My Hub" / "Hub Admin"
These two were hardcoded in `index.html`, so they never appeared in
`nomad-admin.html` → Cards and couldn't be renamed. As of 2026-09-12 they also exist
as real `client_portal_cards` rows for YRL (`href` = `hub.html` / `admin.html`,
`new_tab=false`), so title/description/icon/order are editable like any other card.
`renderClientDash()` dedupes by href: **if a row exists it wins and the hardcoded copy
is skipped**; the hardcoded pair only renders for a brokerage that has no rows yet
(that fallback is still gated by `isBrokerOwner`).

Per-card visibility is the **`client_portal_cards.min_role`** column (added 2026-09-12):
`client` < `owner` < `nomad_admin`, default `'client'` = every portal member, which is how
all legacy rows behave. A card renders when the viewer's rank >= the card's rank. The two
hub cards were backfilled to `'owner'`. Set it per card in `nomad-admin.html` → Cards →
Edit → **Visible to**; non-default values show as a pill in the card list.
⚠️ This is a UI filter only — RLS still returns every card row for the client, so treat it
as decluttering, not a security boundary. The real gate is that `admin.html` / `hub.html`
check the role themselves and bounce anyone who isn't owner/nomad_admin.

## The migration (what changed from the old hub)
The old YRL agent hub (single-tenant, on yrlagent.com) was migrated INTO this
portal as a multi-tenant product:
- Auth is **`portal-auth.js`** (Supabase email OTP + `client_portal_members`
  roles), NOT the old `yrl-auth.js` / PIN.
- Data is **`hub-data.js`** (tenant-scoped by `client_id`), NOT the old
  `yrl-hub.js`.
- The hub landing is **`hub.html`** (NOT `yrl-agent-hub.html` — that name is
  retired; a redirect stub points it to hub.html).
- The old `yrl-login.html` / `yrl-pin.html` login pages are **retired** — do not
  recreate or deploy them.
- Tenancy + roles + RLS are LIVE in Supabase (`wdvolamasztetwpitbwg`). Roles:
  `nomad_admin` (Nomad), `owner` (broker, edits), `agent` (read-only), `client`.

## File ownership — DO NOT CROSS
**PLATFORM (infra/auth/shell) — do NOT edit or deploy these unless you own the platform layer:**
- `index.html` — the portal app (login + role routing + dashboard). **Never**
  replace it with a redirect. This being a 176-byte redirect stub = the #1 bug.
- `portal-auth.js`, `hub-data.js`, `hub-theme.css`, `hub-brand.js`
- `nomad-admin.html` — Nomad master admin console

**HUB CONTENT (safe to edit) — but MUST use the new conventions:**
- `hub.html` — the agent hub landing (edit for hub content/features)
- `admin.html` — the broker admin (see the tab layout below)
- `yrl-*.html` — the tool/resource sub-pages

## `admin.html` — TABBED as of 2026-09-04
Was one long scroll of 18 `.admin-section` divs; now those sections are grouped
into **8 top tabs** (pattern copied from `nomad-admin.html`'s `switchTab`):

| Tab id | Label | Sections |
|---|---|---|
| `staff` | Staff & Access | Access, Profiles |
| `onboarding` | Onboarding & Transfers | Onboarding, Moving, Submissions |
| `crm` | CRM & Listings | Contacts, Listings |
| `requests` | Requests Queue | Mktg, Voh, BizCards |
| `closings` | Closings | Closing |
| `office` | Office & SOPs | Calendar, Announcements, Sops |
| `tools` | Internal Tools | Leads, Platform, Website, Tracking |
| `brand` | Brand & Assets | BrandKit, BrandAssets (new) |

- Each tab is `<section id="tab-<id>" class="admin-tab-panel">`; `switchAdminTab(name)`
  toggles `.hidden`. Section markup/ids inside are unchanged.
- **Every `.admin-section` must stay a DIRECT child of its tab panel** —
  `section-order.js` queries `:scope > .admin-section`.
- Adding a section = drop it in the right panel; adding a tab = add the button,
  the panel, AND the tab id to the `SectionOrder.init` loop.
- `loadAll()` still loads every section's data on page load regardless of the
  active tab (unchanged behavior — hidden panels are CSS-hidden, not lazy).

## `section-order.js` — MULTI-INSTANCE as of 2026-09-04
It used to be a singleton (`SectionOrder._opts`), so a second `.init()` call
corrupted the first (its async `loadHubContent` callbacks resolved against the
last-initialized container). Now `SectionOrder.init(opts)` returns an independent
`SectionOrderInstance`, so admin.html can run **one instance per tab panel**:
- keys are per-tab: `yrl-admin-section-order:<tabId>` / `yrl-admin-section-meta:<tabId>`
  (the old single `yrl-admin-section-order` / `-meta` blobs are orphaned — any
  pre-2026-09-04 custom order/renames reset once, by design).
- The rename modal `#soModal` is still ONE page-wide node; its Save button
  resolves `SectionOrderInstance._active` **at click time**, set by `_openRename()`.
  Don't revert that to a closed-over `self` — renames would hit the wrong tab.
- `hub.html` and other single-container callers are unaffected (same call shape).

## Brand & Assets tab (new 2026-09-04)
Owner/admin capture of a brokerage's brand kit, for reference when building out
that brokerage's theme by hand. **No Supabase schema was added** — it's all
`hub_content` + the existing `uploadHubFile()`:
- `hub_content['yrl-admin-brand-kit']` = `{logos:{main,stacked,mark}, colors:[{name,hex,primary}] (max 6), tagline}`
- `hub_content['yrl-admin-brand-assets']` = `[{id,type,label,fileName,url,uploadedAt}]`
- Files upload via `uploadHubFile(file,'brand')` → public `hub-files` bucket,
  namespaced `{client_id}/brand/`.
- Logos + colors + tagline save ONLY on the "Save brand" button; asset uploads
  auto-save. "Remove" drops the list entry but does **not** delete the stored file
  (`hub-data.js` has no delete primitive — don't add silent storage deletes).
- This is **reference only** — it does NOT drive live theming. Live branding is
  still the single `client_portal_clients.accent_color` + `logo_url` applied by
  `hub-brand.js`, edited in `nomad-admin.html`. Wiring the kit into live theming
  is a future task.

## Back links — `back-link.js` (2026-09-17)
Sub-pages hardcode `<a class="back-btn" href="hub.html">`, so reaching one from the
portal (portal.yrlagent.com → Hub Admin → Homepage Cities) and pressing back dumped you
on the agent hub instead of where you came from. `back-link.js` rewrites **only** back
links whose href is `hub.html`, pointing them at whichever of `index.html` /
`admin.html` / `hub.html` actually referred you, and relabels them Portal / Admin / Hub.
- Included on the 31 `yrl-*.html` sub-pages (NOT admin.html / index.html / hub.html /
  nomad-admin.html — those have their own nav).
- Falls back to `hub.html` with no same-origin referrer, so the agent path is unchanged
  and a cold load still works. The resolved target is memoized in `sessionStorage`
  (`yrlBackTo:<page>`) so a refresh keeps the trail.
- A new sub-page gets this by adding `<script src="back-link.js?v=..."></script>` before
  `</body>`; don't hand-roll per-page back logic.

## Conventions for ALL hub-content pages
- Include **`portal-auth.js`** (not yrl-auth.js) and **`hub-data.js`** (not yrl-hub.js).
- Add the Nomad theme: `<link rel="stylesheet" href="hub-theme.css"><script src="hub-brand.js" defer></script>` before `</head>`.
- Edit-mode / admin access = **role-based** (owner/nomad_admin). No 4-digit PINs
  (`BROKER_PIN` / `ADMIN_PIN` are retired).
- Internal "back to hub" links → **`hub.html`** (not yrl-agent-hub.html).
- **Bump the `?v=` on any edited `.js`/`.css` include** — assets are cached by
  extension at the edge (e.g. `section-order.js?v=20260828tabs`).

## Deploy rules
- Deploy with **`deploy-portal.sh`** only (rsync `--checksum`, so only genuinely
  changed files move; run `--dry` first to see what will ship).
- **Do NOT do a full-folder deploy from a stale/separate copy** — that's what
  wiped `index.html`. Pull/refresh this folder first, or deploy only the specific
  content files you changed.
- Never deploy `yrl-login.html`, `yrl-pin.html`, or an `index.html` redirect.
- This folder is on **iCloud Drive** and a second Claude session may be editing
  it. Before a big change, confirm the remote copy isn't already ahead of you
  (`ssh … md5sum` vs local, or `deploy-portal.sh --dry`).

## Server notes
- Cloudways app webroot = `public_html/portal` (this folder IS the docroot).
- Legacy files in `public_html/` (outside docroot) are NOT served — don't rely on
  them; `public_html/_old-hub-retired/` holds old backups.

## Screenshots for SOPs / docs
These pages need a real Supabase login, so to capture them cleanly: copy the
folder to a scratch dir, strip `portal-auth.js`/`hub-brand.js`, inject a stub that
fakes `window.yrlMember`/`yrlClient` + dispatches `yrl-auth-ready` + paints the
client's accent (`#c70231` for YRL), serve over `python3 -m http.server`, then
capture with `Google Chrome --headless --screenshot --force-device-scale-factor=2`.
Working example: `YRL/YRL-SOP-Publish-a-Blog-Post.html` (+ `sop-screenshots/`).
