# YRL Backend Build-Out — Remaining To-Do List
*Reconciled from the 3-Month Master Timeline (your annotated PDF) against the current state of the files. Last updated: Oct 14, 2026.*

**Legend of your edits:** ~~strikethrough~~ = done or dropped · 🟡 = still open · "GHL" = now the **Nomad Systems CRM** · newsletter lists = "all the same" (one list) · meetings = 100% virtual · video tool = **TourKit**.

---

## ✅ Already done (no action needed)
- Hub built & migrated to the Nomad multi-tenant portal (`portal.nomadsystems.co` / `yrl.nomadsystems.co`)
- SEO site lead capture — 131 pages wired to the capture-lead endpoint
- Lead-magnet "giveaways" — ~130 per-city buyer/seller guides + checklists under `/resources/`
- TourKit video tool — built (photo→video, landscape + portrait)
- Social Media Package (Wk11) — templates, hashtags, "listing goes live" checklist, Canva folder
- Review & Systematize (Wk12)
- Meeting system — recurring, virtual, Google Doc agenda
- Dotloop integration — dropped

---

## 🔲 REMAINING TASKS

### MONTH 1 — Foundation (CRM is the keystone)
- [ ] **CRM foundation (Nomad)** — confirm contacts imported & tagged (Active Agent / Past Client / Orphan / Lead)
- [ ] **CRM pipelines** — Buyer Journey + Listing Journey built
- [ ] **CRM email/SMS domain** connected
- [ ] **New Client intake form** — confirm built (replaces paper folder)
- [x] ~~**Commission / disbursement form**~~ — DONE (Sep 2026): Closing Request → CDA flow in the hub + commission tracking (split + cap, Oct 1 cap year, broker ledger, agent My Commissions, 1099 export). Paper PDF in `Disbursement Form/` is retired.
- [ ] 🟡 **Agent mandatory + reimbursement sheet** — build digital version
- [ ] 🟡 **Finish Hub forms/docs section** — the last ~50%

### MONTH 2 — Communication
- [ ] **Newsletter in CRM** — one branded template, monthly automation, first send (single list — no segmenting)
- [ ] **Past-client / orphan system** — quarterly Canva "magazine" template + monthly-email cadence + CRM tagging
- [ ] **Annual marketing templates** — Canva mailing template + 3-touch follow-up email sequence + Canva team library + 1-page SOP
- [ ] **Inventory all giveaways / lead magnets** ("list all giveaways" note)

### MONTH 3 — Content & Media
- [ ] **SEO content push (ongoing)** — next hyper-local page batch _(in progress: +3 /best/ pages Sep 19; 139 glossary explainer pages earlier)_
- [ ] **SEO content push (ongoing)** — 4 blog posts/week cadence _(auto: monthly market update + blog GitHub Actions running)_
- [x] ~~**SEO content push — internal-linking review pass**~~ — DONE (Sep 2026): glossary "Real Estate Terms to Know" sections on 72 service/hub pages + AIO Quick-Answer cross-links + compare cross-links; site-wide broken-internal-link crawl = **0 broken, 0 dead sitemap URLs**.
- [x] ~~**SEO content push — Google Search Console indexing check**~~ — DONE / ongoing (Sep 2026): indexed pages **85 → 694 → 830** (Sep 26), impressions **~25×**, AI-Overview citations **~2 → ~276/day**. GA4 installed; sitemap resubmitted (1,141 URLs); Request-Indexing batches scheduled via Reminders. See the SEO push log below.
- [x] ~~**SEO audit + quick wins**~~ — DONE (Oct 14, 2026): full audit ([report](https://claude.ai/artifact/7pdjNp3pGo5eQf7bqgBQzv)) + 5 quick wins shipped — see the Oct log below.
- [x] ~~**SEO audit — quick wins + most strategic items**~~ — DONE (Oct 14, 2026): forecast retitled for 2027 · Tami's Southport area fixed · pros/cons on 8 suburbs · Greenwood vs Franklin vs Zionsville page · Indiana-law sections + probate landing page · Perry / Center Grove / Franklin Twp / Decatur Twp area guides · Chicago move guide · county property-tax comparison + 2027 homestead + senior credit updates. See the Oct log below.
- [ ] 🟡 **SEO audit — still open:** fix the old office address on **ActiveRain** ("8915 S Keystone, Suite C" — needs Janet's login) · Janet skim of the new Indiana-law + probate copy (statute-checked, but she should OK it) · video embeds on city pages (settle the YouTube channel name first — clashes with Jason Compton's "Living In Indianapolis") · live listings on city pages via the Displet city filter (ask Displet if Pro covers it) · ~~Cincinnati + Louisville move guides~~ (done Oct 14) · ~~hub service-area picker~~ (done Oct 14 — 4 area guides + 11 missing towns now selectable).
- [ ] **TourKit how-to** — one-page agent SOP + walkthrough video

### NEW (your handwritten additions)
- [ ] **November headshots** — schedule agent photos + Hub 1-on-1s
- [ ] **In-person annual party** — plan & schedule
- [x] ~~**Review-request flow**~~ — DONE (Sep 27, 2026): `/review/` page (one tap to the Google review dialog + Facebook), print QR codes, text/email templates → `Review-Request-Playbook.md`.
- [ ] 🟡 **Past-client review batch** — send the review ask to the **236 past clients with email** in the CRM (in waves). Needs your go-ahead.
- [x] ~~**Closing checklist page**~~ — DONE (Aug 25, 2026). Built interactive `/services/buyer-closing-checklist/` + `/services/seller-closing-checklist/` (checkable steps w/ saved progress, print button, wire-fraud alert, FAQ schema), linked in Buyers/Sellers nav dropdowns. Modeled on the CFPB checklist. **Downloadable PDF lead magnets also built** (`/resources/buyer-closing-checklist/` + `/resources/seller-closing-checklist/` → capture-lead → branded PDF).

---

## 📈 Sept 2026 — SEO + AI-Overview push (shipped)
GSC exports (Sep 19) show real momentum: **indexed pages 85 → 694**, impressions **~75 → ~1,330/day (~17×)**, **AI-Overview citations ~2 → ~190/day**. What shipped this cycle:
- **Analytics:** GA4 (`G-SNV86NLT23`) installed site-wide (~1,280 pages); `inject_gtag.py` added to the 3 auto-publish GitHub Actions so regenerated pages keep the tag.
- **Indexing:** sitemap resubmitted in GSC (1,141 URLs); manual Request-Indexing batches scheduled in Reminders (Round 1 P2, Round 2, and new-pages batch due Mon Sep 21). Site is clean — 0 broken internal links, 0 dead sitemap URLs; the 56 GSC "404s" are legacy external URLs.
- **HTTPS fix:** `www.` had a mismatched cert → fixed DNS (www CNAME → thedanielcope-byte.github.io) + GitHub Pages re-provision; apex + www both valid now.
- **Compare CTR:** all 42 `/compare/` pages retitled to "X vs. Y: Which Suburb Is Better?" + question-framed metas + dynamic reviewed date + restored Twitter cards.
- **AI-Overview / answer-engine (GEO):** Quick Answer + Speakable schema retrofitted onto **16** informational pages (`inject_ai_answer.py` + `ai-answers.json`); **3 new `/best/` pages** in the winning format (`build_best.py` + `best-pages.json`): retirees/55+, most-affordable, young-professionals.
- **Press newsroom:** `/press/` hub + first wire-format release (senior real estate resource); `build_press.py`; monthly-reminder cadence.
- **Glossary internal links:** "Real Estate Terms to Know" sections on 72 pages (`inject_key_terms.py`).

**Biggest remaining lever is OFF-PAGE + time:** reviews + local/editorial backlinks → authority → indexing the ~468 pages still "discovered, not indexed." See `GBP-Optimization-Playbook.md` and `YRL-Backlink-Plan.md`.

---

## 📈 Sept 20–27 2026 — SEO follow-through, lead protection, reviews (shipped)
**GSC week 2 (Sep 26 vs Sep 19):** indexed **694 → 830**; "discovered, not indexed" **468 → 333**; impressions **~1,330 → ~1,874/day**; AI-Overview impressions **~190 → ~276/day**, pages cited in AI Overviews **276 → 471**. New `/best/` pages ranked page 1 within a week; the press release is getting impressions. The 404 (70) and noindex (48) upticks are benign — legacy external URLs, and thank-you pages + redirect stubs that are *supposed* to be noindexed.
- **Clicks still lag** (~0.5–1% CTR): most pages sit around position ~13. Biggest single opportunity: "greenwood, franklin or zionsville — better town" = 720 impressions at pos 7.4, 0 clicks.
- **Compare pages:** +2 FAQs on all 34 generated pages; fixed an internal-link gap — top performers `zionsville-vs-whitestown` / `zionsville-vs-fishers` went **3 → 36 inbound links** each.
- **Glossary:** term pages already have Quick Answer + Speakable + FAQ — nothing to add; they need authority, not format.
- **MIBOR compliance:** "Licensed in Indiana" added to the site-wide footer (firm name + state of licensure on every page).
- **Junk bot leads stopped:** Cloudflare **Turnstile** on all lead + valuation forms, verified server-side in the `capture-lead` function (YRL only — other businesses untouched), plus a honeypot backstop. 9 bot leads marked spam. Lead source renamed **indypropertyguide → yourrealtylink.com** (new leads + 17 existing records).
- **Reviews:** review-request flow built — see above and `Review-Request-Playbook.md`.

**Open from this stretch:** past-client review batch (236 emails — your go-ahead); agents with their **own** websites need a "Licensed in Indiana" line too (MIBOR bulletin); Turnstile could be added to Tides/Nomad forms the same way (optional).

---

## 🔍 Sept 28 – Oct 14 2026 — leads, search fix, SEO audit (shipped)
- **Booking prequal questions (Sep 28):** the 3 Cal.com consults (general / buyer / seller) now ask intent (buy, sell, invest, relocate, agent, lender…), timeframe, area or address, agent status — plus pre-approval / price range (buyer) and address / listing status (seller). Answers land on the CRM contact automatically via `cal-webhook`. New Supabase helper `cal-admin` edits the questions (key stays server-side).
- **General email = `indy@yourrealtylink.com` (Sep 28):** replaced `info@` site-wide (878 spots), added to the footer on every page, and website lead notifications now go there. `janet@` kept only for Janet personally (her profile, press contact, recruiting pages).
- **Search fix (Oct 2):** the homepage + agent-page search boxes ignored what was typed. They now pass it to `/search/`, which filters the MLS feed by **address, city, ZIP or MLS #** (`inject_search_query.py`). Verified on a phone: "7 Crestview greenwood" → 1 result. "Our Office Listings" confirmed = 10 listings, all Your Realty Link.
- **SEO audit (Oct 14):** site is technically clean (0 broken links / orphans / duplicate titles); the gap is clicks — city pages 1,541 impressions → 3 clicks at ~pos 12. Quick wins shipped:
  - City + county titles → "Greenwood, IN Homes for Sale & Real Estate | Your Realty Link" (`geo_titles.py`)
  - `/best/` rankings linked from city pages, each other, and the homepage — newest ones went 1 → 13–19 internal links (`inject_best_links.py`)
  - Duplicate Southport pages merged into the city page
  - 124 thin per-city guide download pages hidden from Google (still live for lead capture); sitemap 1,147 → 1,022
  - Glossary share tags; homepage schema now lists Instagram, YouTube, Google Business Profile
- **Check early Nov:** fresh GSC export to see whether the new city titles lifted clicks (2–4 weeks to show).
- **Audit follow-through (Oct 14):** 7 new pages — area guides for **Perry Township, Center Grove, Franklin Township, Decatur Township**; **/services/probate-real-estate-agent/**; **Greenwood vs Franklin vs Zionsville**; **Moving from Chicago to Indianapolis**. Indiana-law sections on the divorce / inherited / estate pages (and fixed two wrong legal claims); pros & cons on 8 suburb pages; county property-tax table + 2027 homestead changes + the new $150 over-65 credit on the tax posts; forecast post now "2027".
- **Data fixes:** Franklin price range corrected to $200s–$400s everywhere (old $180s–$340s was too low); "safe" removed from the Fishers description; Franklin Township school district name corrected; "Your Realty Link's our agents" typo fixed on 69 city pages.
- **Hub bug fixed:** a CSI test record made the site's agent-roster lookup return the wrong business since Oct 2 (no agent data was lost — YRL's directory hadn't changed). The YRL lookups in Supabase are now pinned to the YRL account.

---

## 🏠 Sept 2026 — Agent Hub build-out (shipped, live on yrlagent.com)
- **Deal flow, prospect → paid:** contact → Under Contract prompt opens the transaction file → Closing Request → CDA; post-close home anniversary + follow-up tasks. Past Client / file close / CDA email stay manual by design.
- **Commissions:** split + annual cap per agent (cap year starts Oct 1), broker production report, paid/received tracking, 1099 export; agents see their own deals in My Commissions.
- **Sidebar 3rd level:** every tool lists the tabs inside it (Marketing categories, Contacts/Pipeline/Follow-ups, etc.) — click to jump straight there.
- **New sections:** CE & Licensing (tracker, IREC-approved courses, requirements) · Social Media tab under Marketing · **Licensing Training** (National + Indiana exam prep, New Licensee, practice exams — 202 quiz questions, broker-editable, Indiana facts fact-checked against IC 25-34.1 / 876 IAC).
- **Help Center:** entries for Commissions, Social Media, Licensing Training, Install the Hub App & Notifications, plus the Transaction Workflow SOP.
- **Mobile:** full 108-page phone sweep (all fit the screen); category tiles and tab rows are dropdowns on phones across the site.
- **Home-screen app:** YRL-branded install (icon, full screen) with an install prompt — no App Store needed.
- **Push notifications:** 9 AM daily summary, 5 PM heads-up for tomorrow's key dates, broker-assigned tasks, announcements. Tested on Dan's iPhone ✅.
- **CRM upgrades:** owners get a "Whose contacts" filter (My contacts / All agents / each of the 22 roster agents, with counts); new **Relationship** field (Friend, Family, Sphere of influence, Past client, Realtor, Lender, Contractor, etc.) with a list filter + CSV import/export; birthdays are Month + Day with an optional year; calendar birthdays/anniversaries show only your own contacts (deal closings still show everyone's).
- **Dan's CSI contacts imported:** 53 past clients + 7 sphere (with birthdays, home anniversaries, and follow-ups staggered Sep 28 – Oct 25) + 93 orphan addresses for farming — all tagged `csi-import` (from `Dropbox/YRL/CSI/CSI Contacts.xlsx`).
- **Security cleanup:** removed open (no-login) database access and 7 leftover records (backup in `Nomad Systems/_backups/`); agents can only edit their own course progress; UK residency tracker moved behind the hub PIN; old hub page redirects to the new one.

### Hub follow-ups
- [ ] Have agents install the app + tap **Turn on** for notifications (Help → Install the Hub App & Notifications)
- [ ] Tap-test key flows on a phone: add contact, add task, submit Closing Request, open a transaction
- [ ] Skim Licensing Training wrong answers in edit mode for anything that reads as also-correct
- [ ] Confirm 5 PM is the right time for the key-date heads-up
- [ ] Work the CSI follow-ups as they come due (Sep 28 – Oct 25); fill in owner names on the 93 orphan addresses over time
- [ ] Get other agents adding contacts (only Janet and Dan have any so far) — the owner filter shows who's using the CRM
- [ ] Later: onboarding progress / submissions + moving checklist are shared records any agent can edit — redesign to per-agent storage

---

## Notes on where each item lives
- **In this YRL repo (buildable here):** Hub forms/docs finish · commission/disbursement · reimbursement · intake forms · SEO content push · TourKit SOP · giveaway inventory
- **In the Nomad Systems project (separate folder):** CRM contacts/tags/pipelines/domain · newsletter automation
- **Design / manual (Canva + scheduling):** quarterly magazine · mailing templates · follow-up sequences · headshots · annual party
