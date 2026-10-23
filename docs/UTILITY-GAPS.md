# Utility Data — Gap List

**62 of 62 cities researched.** 36 are fully confirmed. The 26 below have at least one field I could **not** confirm from an official/authoritative source. Nothing here is fabricated — where I have a strong regional guess I've marked it **(likely, unconfirmed)** so Janet can confirm or correct from local knowledge.

Everything confirmed is already in `data/city-utilities.json` and will publish. For the fields below, the site will show a neutral "confirm the provider for your exact address" line until we fill them.

---

## The hard gaps (no provider found)

### ⚡ Electric — 4 towns
These towns run **municipal water but not municipal electric**, so the electric company is an outside utility I couldn't pin to an official page:
- **Fortville** (Hancock) — likely NineStar Connect or Duke *(unconfirmed)*
- **Alexandria** (Madison) — likely Duke Energy Indiana *(unconfirmed)*
- **Elwood** (Madison) — likely Duke Energy Indiana *(unconfirmed)*
- **Monrovia** (Morgan) — likely Duke Energy Indiana or SCI REMC, by address *(unconfirmed)*

### 🔥 Natural Gas — 11 towns
Gas across the whole non-Marion metro is **CenterPoint Energy** territory. For these small towns I couldn't confirm whether a gas main actually reaches them, or the town may be **propane-only** — so I left it blank rather than guess:
- **Westport** (Decatur), **Atlanta** (Hamilton), **New Palestine** (Hancock), **Clayton** (Hendricks), **Edinburgh** (Johnson), **Trafalgar** (Johnson), **Lapel** (Madison), **Rockville** (Parke), **Cloverdale** (Putnam), **Fairland** (Shelby), **Morristown** (Shelby)
- All **likely CenterPoint Energy** where a main exists, otherwise propane *(unconfirmed per-town)*

### 🗑️ Trash — 7 towns
Usually private subscription in small towns (Best Way, Ray's, or Republic) — couldn't confirm which per town:
- **Edinburgh** (Johnson), **Martinsville** (Morgan), **Monrovia** (Morgan), **Rockville** (Parke), **Cloverdale** (Putnam), **Fairland** (Shelby), **Waldron** (Shelby)

### 🚰 Water / Sewer — 2 towns
- **Fairland** (Shelby) — town site's security cert is broken, couldn't load
- **Waldron** (Shelby) — rural; likely private wells + septic *(unconfirmed)*

---

## Low-confidence / split-territory (provider IS listed, but verify by address)

These publish fine, but the note on the page will tell buyers to confirm — because the provider genuinely splits mid-town:

- **Geist** — the messiest one. Electric, water, sewer, AND trash all split three ways across the Fishers / Lawrence / McCordsville sides of the reservoir. The page will spell out the split.
- **Fishers** — water is split: Citizens Water in some areas, Indiana American Water in others (sewer + trash are the City).
- **Noblesville** — water is Indiana American; sewer + trash are the City.
- **Carmel** — mostly City of Carmel Utilities, but some annexed addresses are on Citizens Water.
- **Westfield** — Waste Management took over trash billing (MyWM) April 1; no town-specific start-service page confirmed.
- **Sheridan** — providers known, just missing the direct phone numbers.
- **Bean Blossom** (Brown) — rural; electric varies by address, gas may be propane, sewer likely septic.
- **Mooresville** — water strongly indicated as Indiana American but not name-confirmed; trash is private subscription, hauler unconfirmed.

---

## What I need from Janet (fastest path)

For any town above, a one-line answer fills it instantly, e.g.:
- "Alexandria/Elwood electric = **Duke**"
- "Edinburgh trash = **Best Way**"
- "Fairland is on well & septic, gas is **propane**"

Send whatever she knows and I'll drop it straight into the data. Everything else publishes now.
