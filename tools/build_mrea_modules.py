#!/usr/bin/env python3
"""
build_mrea_modules.py — generate The Millionaire Agent Path (MREA) module pages.

Sibling of build_tiger_modules.py. Content lives in mrea_content.py (a MODULES
dict). Each module renders to portal/yrl-mrea-<slug>.html using the SAME shared
shell as Tiger Training (tiger-shell.css / tiger-module.css / yrl-tiger.js) but
with its own sidebar (mrea-nav.js) and its own storage namespace:

    <body data-tiger-ns="mrea" data-tiger-program="Millionaire Agent Path">

so MREA progress lives under mrea:v1:* and never collides with tiger:v1:*.

Usage:  python3 build_mrea_modules.py            # build all
        python3 build_mrea_modules.py 2.1 3.3    # build specific module ids
"""
import html, sys, os
from mrea_content import MODULES

PORTAL = os.path.join(os.path.dirname(os.path.abspath(__file__)), "YRL-Hub", "portal")

def esc(s): return html.escape(str(s), quote=True)

# ---------- block renderers (identical vocabulary to build_tiger_modules.py) ----------
def r_teach(b):    return f'<p class="teach">{b["teach"]}</p>'
def r_callout(b):
    cls = "callout confirm" if b.get("confirm") else "callout"
    return f'<div class="{cls}">{b["callout"]}</div>'
def r_field(b):
    f = b["field"]
    money = f.get("money")
    hint = f' <span class="field-hint">{esc(f["hint"])}</span>' if f.get("hint") else ""
    inp = (f'<div class="input-money"><input class="tiger-input" id="{f["key"]}" '
           f'data-tiger="{f["key"]}" inputmode="{f.get("mode","text")}" placeholder="{esc(f.get("ph",""))}"></div>'
           if money else
           f'<input class="tiger-input" id="{f["key"]}" data-tiger="{f["key"]}" '
           f'inputmode="{f.get("mode","text")}" placeholder="{esc(f.get("ph",""))}">')
    return (f'<div class="field"><label class="field-label" for="{f["key"]}">'
            f'{esc(f["label"])}{hint}</label>{inp}</div>')
def r_textarea(b):
    f = b["textarea"]
    hint = f' <span class="field-hint">{esc(f["hint"])}</span>' if f.get("hint") else ""
    return (f'<div class="field"><label class="field-label" for="{f["key"]}">{esc(f["label"])}{hint}</label>'
            f'<textarea id="{f["key"]}" data-tiger="{f["key"]}" placeholder="{esc(f.get("ph",""))}"></textarea></div>')
def r_grid(b):
    inner = "".join(render_block(x) for x in b["grid"])
    cols = "grid3" if len(b["grid"]) == 3 else "grid2"
    return f'<div class="{cols}">{inner}</div>'
def r_checklist(b):
    return "".join(
        f'<div class="check"><input type="checkbox" id="{i["key"]}" data-tiger-check="{i["key"]}">'
        f'<label for="{i["key"]}">{i["label"]}</label></div>' for i in b["checklist"])
def r_list(b):
    f = b["list"]
    return (f'<div class="tiger-list" data-list="{f["key"]}" data-list-title="{esc(f.get("title",f["key"]))}" '
            f'data-min="{f.get("min",4)}" data-placeholder="{esc(f.get("ph","Type here…"))}"></div>')
def r_script(b):
    f = b["script"]
    lines = "".join(f'<p>{ln}</p>' for ln in f["lines"])
    return f'<div class="script"><p class="script-tag">{esc(f.get("tag","Script"))}</p>{lines}</div>'
def r_raw(b):      return b["raw"]

RENDER = {"teach":r_teach,"callout":r_callout,"field":r_field,"textarea":r_textarea,
          "grid":r_grid,"checklist":r_checklist,"list":r_list,"script":r_script,"raw":r_raw}

def render_block(b):
    for k in RENDER:
        if k in b: return RENDER[k](b)
    raise ValueError(f"unknown block: {b}")

def render_section(s):
    body = "".join(render_block(b) for b in s["blocks"])
    sub = f'<p class="sub">{esc(s["sub"])}</p>' if s.get("sub") else ""
    return (f'<section class="card"><h2><span class="n">{s["n"]}</span>{s["title"]}</h2>{sub}{body}</section>')

PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex">
<title>MREA {id} · {title_plain} — Your Realty Link</title>
<script src="portal-auth.js"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<link rel="stylesheet" href="tiger-shell.css">
<link rel="stylesheet" href="tiger-module.css">
<link rel="stylesheet" href="mrea-module.css">
</head>
<body class="tiger-shell mrea-shell" data-tiger-module="{id}" data-tiger-title="{title_attr}" data-tiger-ns="mrea" data-tiger-program="Millionaire Agent Path">

<button class="tiger-menu-btn" id="tigerMenuBtn" aria-label="Modules"><i class="fa-solid fa-bars"></i></button>
<aside class="tiger-side" id="tigerSide"></aside>
<div class="tiger-backdrop" id="tigerBackdrop"></div>

<main class="tiger-main">

<div class="reader-topbar">
  <div class="prog">
    <div class="track"><i id="tigerProgressBar"></i></div>
    <div class="prog-lbl" id="tigerProgressLabel">0% complete</div>
  </div>
  <div class="spacer"></div>
  <button class="btn btn-ghost" data-tiger-action="pdf"><i class="fa-solid fa-file-pdf"></i> <span>PDF</span></button>
  <button class="btn btn-primary" data-tiger-action="save"><i class="fa-solid fa-floppy-disk"></i> <span>Save</span></button>
</div>

<header class="reader-head">
  <p class="reader-eyebrow">{eyebrow} <span class="chip">{chip}</span></p>
  <h1 class="reader-title">{title}</h1>
  <p class="reader-lede">{lede}</p>
  <p class="reader-who">Worksheet for <b data-tiger-name>Agent</b> · <span data-tiger-date></span> · saves automatically as you type</p>
</header>

<div class="print-only" style="text-align:center;margin:0 0 6px">
  <strong>YOUR REALTY LINK · THE MILLIONAIRE AGENT PATH</strong> — Module {id}: {title_plain}
</div>

<div class="reader-body">
{sections}
</div>

<div class="actions"><div class="actions-in">
  <span class="note"><i class="fa-solid fa-cloud"></i> Your answers save automatically to your account — pick up on any device.</span>
  <button class="btn btn-ghost" data-tiger-action="txt"><i class="fa-solid fa-list"></i> Download list</button>
  <button class="btn btn-ghost" data-tiger-action="pdf"><i class="fa-solid fa-file-pdf"></i> Download PDF</button>
  <button class="btn btn-ghost" data-tiger-action="reset"><i class="fa-solid fa-eraser"></i> Clear</button>
  <button class="btn btn-primary" data-tiger-action="complete"><i class="fa-solid fa-check"></i> Mark complete</button>
</div></div>

</main>

<script src="hub-data.js"></script>
<script src="mrea-nav.js"></script>
<script src="yrl-tiger.js"></script>
<script src="mrea-kit.js"></script>
{extra_script}
</body>
</html>
"""

def build(mid):
    m = MODULES[mid]
    title_plain = html.unescape(m["title"]).replace("&amp;", "&")
    sections = "\n".join(render_section(s) for s in m["sections"])
    extra = f'<script>\n{m["extra_script"]}\n</script>' if m.get("extra_script") else ""
    page = PAGE.format(
        id=mid, title=m["title"], title_attr=m["title"], title_plain=esc(title_plain),
        eyebrow=esc(m["eyebrow"]), chip=esc(m.get("chip", "Worksheet")),
        lede=m["lede"], sections=sections, extra_script=extra)
    out = os.path.join(PORTAL, m["file"])
    with open(out, "w", encoding="utf-8") as f:
        f.write(page)
    return m["file"]

if __name__ == "__main__":
    ids = sys.argv[1:] or list(MODULES.keys())
    for mid in ids:
        print("built", build(mid))
