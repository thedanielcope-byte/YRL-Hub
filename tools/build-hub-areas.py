#!/usr/bin/env python3
"""
build-hub-areas.py
Scans the public site (indypropertyguide) for built city + neighborhood pages
and rewrites the AREA_OPTIONS block inside the hub agent-directory editor so the
"Service Areas" picker only ever offers real, linkable pages.

Run this whenever new city/neighborhood pages are added.
Targets: YRL-Hub/yrl-agent-directory.html  (canonical, deployed)
         yrl-agent-directory.html          (root mirror)
"""
import os, re, json

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.join(HERE, "indypropertyguide")

SUFFIXES = [
    "-indianapolis-real-estate", "-indiana-real-estate", "-in-real-estate",
    "-real-estate", "-indianapolis", "-indiana",
]

# Proper-noun casing / brand spellings the naive title-caser gets wrong.
OVERRIDES = {
    "mccordsville": "McCordsville",
    "meridian-kessler": "Meridian-Kessler",
    "butler-tarkington": "Butler-Tarkington",
    "bates-hendricks": "Bates-Hendricks",
    "mass-ave": "Mass Ave",
}

def label_from_slug(slug):
    s = slug
    for suf in SUFFIXES:
        if s.endswith(suf):
            s = s[: -len(suf)]
            break
    if s in OVERRIDES:
        return OVERRIDES[s]
    return " ".join(w.capitalize() for w in s.split("-") if w)

def county_label(county_slug):
    return " ".join(w.capitalize() for w in county_slug.split("-"))

def collect():
    groups = {}  # group label -> list of {label,url}

    # Cities: cities/<county>/<city-slug>/
    cities_dir = os.path.join(SITE, "cities")
    for county in sorted(os.listdir(cities_dir)):
        cpath = os.path.join(cities_dir, county)
        if not os.path.isdir(cpath):
            continue
        g = county_label(county)
        for city in sorted(os.listdir(cpath)):
            citypath = os.path.join(cpath, city)
            if not os.path.isdir(citypath):
                continue
            if not os.path.exists(os.path.join(citypath, "index.html")):
                continue
            groups.setdefault(g, []).append(
                {"label": label_from_slug(city), "url": f"/cities/{county}/{city}/"}
            )

    # Neighborhoods: neighborhoods/<slug>/  (skip the hub index)
    nb_dir = os.path.join(SITE, "neighborhoods")
    gN = "Indianapolis Neighborhoods"
    for nb in sorted(os.listdir(nb_dir)):
        nbpath = os.path.join(nb_dir, nb)
        if not os.path.isdir(nbpath):
            continue
        if not os.path.exists(os.path.join(nbpath, "index.html")):
            continue
        # skip redirect stubs (e.g. southport-indianapolis now points to the Southport city page)
        if 'http-equiv="refresh"' in open(os.path.join(nbpath, "index.html"), encoding="utf-8").read(2000):
            continue
        groups.setdefault(gN, []).append(
            {"label": label_from_slug(nb), "url": f"/neighborhoods/{nb}/"}
        )

    # Order: counties alpha, neighborhoods last
    ordered = []
    for g in sorted(k for k in groups if k != gN):
        ordered.append({"group": g, "items": groups[g]})
    if gN in groups:
        ordered.append({"group": gN, "items": groups[gN]})
    return ordered

def render_js(data):
    # Compact but readable JS literal, wrapped in markers for future rewrites.
    lines = ["const AREA_OPTIONS = ["]
    for grp in data:
        lines.append("  { group: " + json.dumps(grp["group"]) + ", items: [")
        for it in grp["items"]:
            lines.append("    [" + json.dumps(it["label"]) + ", " + json.dumps(it["url"]) + "],")
        lines.append("  ] },")
    lines.append("];")
    return "\n".join(lines)

MARK_START = "/*__AREA_OPTIONS_START__*/"
MARK_END = "/*__AREA_OPTIONS_END__*/"

def rewrite(path, block):
    with open(path, encoding="utf-8") as f:
        html = f.read()
    if MARK_START not in html or MARK_END not in html:
        print(f"  ! markers not found in {os.path.basename(path)} — skipped")
        return False
    new = re.sub(
        re.escape(MARK_START) + r".*?" + re.escape(MARK_END),
        MARK_START + "\n" + block + "\n" + MARK_END,
        html, flags=re.DOTALL,
    )
    with open(path, "w", encoding="utf-8") as f:
        f.write(new)
    return True

if __name__ == "__main__":
    data = collect()
    total = sum(len(g["items"]) for g in data)
    block = render_js(data)
    targets = [
        os.path.join(HERE, "YRL-Hub", "portal", "yrl-agent-directory.html"),  # LIVE (yrlagent.com webroot)
        os.path.join(HERE, "YRL-Hub", "portal", "yrl-agent-info.html"),       # LIVE (My Agent Info)
        os.path.join(HERE, "YRL-Hub", "yrl-agent-directory.html"),            # retired root copy
        os.path.join(HERE, "yrl-agent-directory.html"),                       # retired root mirror
    ]
    wrote = 0
    for t in targets:
        if os.path.exists(t) and rewrite(t, block):
            wrote += 1
            print(f"  updated {os.path.relpath(t, HERE)}")
    print(f"AREA_OPTIONS: {total} pages across {len(data)} groups → {wrote} file(s)")
    if "--print" in os.sys.argv:
        print(block)
