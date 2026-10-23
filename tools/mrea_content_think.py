# -*- coding: utf-8 -*-
"""
The Millionaire Agent Path — Phase 1 (Think It) and Phase 2 (Know Your Numbers).
Consumed by mrea_content.py → build_mrea_modules.py.

Written in Your Realty Link's voice. The frameworks are credited to
"The Millionaire Real Estate Agent" (Keller / Jenks / Papasan); the teaching
text, examples, and every worksheet are original and Indiana-specific.

House rules honoured throughout:
  • No invented market stats — ranges and agent-entered numbers only.
  • Commission is negotiable and modeled per transaction (post-settlement).
  • Buyer agency is never described as free; a written BRA is required.
"""

MODULES = {}

# ============================================================ 1.1
MODULES["1.1"] = {
  "file": "yrl-mrea-1-1-three-ls.html",
  "eyebrow": "Phase 1 · Module 1.1",
  "chip": "Diagnostic",
  "title": "The Three L&#x27;s Diagnostic",
  "lede": "Every real estate business runs on three things: Leads, Listings, and Leverage. Almost every stuck business is stuck on exactly one of them. This module finds out which one is yours — so you stop spreading effort evenly across problems you don&#x27;t have.",
  "sections": [
    {"n":"01","title":"The whole business on one page","blocks":[
      {"teach":"After interviewing the highest-producing agents in the country, the authors of <i>The Millionaire Real Estate Agent</i> tried to group what separated them. They started with eight factors. They got it down to five. In the end it came down to <b>three</b>."},
      {"teach":"<b>Leads.</b> You have two jobs — real estate, and generating clients. You can be the best-informed agent in Marion County and it earns you nothing without people to serve. Until you have more leads than your goals require, nothing else is the problem."},
      {"teach":"<b>Listings.</b> Seller listings are the high-leverage, maximum-earning side of this business. They take less time per dollar than buyers, they give you control of your schedule, and — the part most agents miss — <b>a listing is a marketing platform.</b> A properly marketed listing should produce about one closed buyer on its own."},
      {"teach":"<b>Leverage.</b> Who does it (people), how they do it (systems), what they do it with (tools). When you have gone as far as your own hours can take you, leverage is the only remaining move."},
      {"callout":"The 80/20 rule is doing the work here. Leads, Listings, and Leverage are the 20% of your activity that produces 80% of your result. Everything else is real, but it is not the lever."},
    ]},
    {"n":"02","title":"Rate yourself honestly","sub":"1 = not true of me at all · 10 = completely true. Nobody sees this but you. Guessing high here only wastes your own time.","blocks":[
      {"raw":'<p class="teach" style="margin-bottom:4px"><b>Leads</b></p>'},
      {"raw":'<div class="mrea-scale"><span class="sl-lab">I know exactly how many leads I generated last month<small>a tracked number, not a feeling</small></span><input type="range" min="1" max="10" step="1" value="5" id="l1" data-tiger="l1"><span class="sl-val">5</span></div>'},
      {"raw":'<div class="mrea-scale"><span class="sl-lab">Lead generation happens on a schedule whether I feel like it or not<small>time-blocked and defended</small></span><input type="range" min="1" max="10" step="1" value="5" id="l2" data-tiger="l2"><span class="sl-val">5</span></div>'},
      {"raw":'<div class="mrea-scale"><span class="sl-lab">I have more leads right now than I need to hit my goal<small>if no, this is your bottleneck regardless of the rest</small></span><input type="range" min="1" max="10" step="1" value="5" id="l3" data-tiger="l3"><span class="sl-val">5</span></div>'},
      {"raw":'<p class="teach" style="margin:18px 0 4px"><b>Listings</b></p>'},
      {"raw":'<div class="mrea-scale"><span class="sl-lab">I know the minimum number of listings I must take each month<small>and I know it today, not at year end</small></span><input type="range" min="1" max="10" step="1" value="5" id="s1" data-tiger="s1"><span class="sl-val">5</span></div>'},
      {"raw":'<div class="mrea-scale"><span class="sl-lab">Most of my income comes from the listing side<small>rather than chasing buyers around Central Indiana</small></span><input type="range" min="1" max="10" step="1" value="5" id="s2" data-tiger="s2"><span class="sl-val">5</span></div>'},
      {"raw":'<div class="mrea-scale"><span class="sl-lab">Every listing I take generates new leads for me<small>signs, opens, mailers, calls — captured and followed up</small></span><input type="range" min="1" max="10" step="1" value="5" id="s3" data-tiger="s3"><span class="sl-val">5</span></div>'},
      {"raw":'<p class="teach" style="margin:18px 0 4px"><b>Leverage</b></p>'},
      {"raw":'<div class="mrea-scale"><span class="sl-lab">Work that doesn&#x27;t require my license is done by someone else<small>or by a system, or a tool</small></span><input type="range" min="1" max="10" step="1" value="5" id="v1" data-tiger="v1"><span class="sl-val">5</span></div>'},
      {"raw":'<div class="mrea-scale"><span class="sl-lab">My process is written down somewhere other than my head<small>could someone else run it tomorrow?</small></span><input type="range" min="1" max="10" step="1" value="5" id="v2" data-tiger="v2"><span class="sl-val">5</span></div>'},
      {"raw":'<div class="mrea-scale"><span class="sl-lab">My business would keep moving if I took two weeks off<small>be honest</small></span><input type="range" min="1" max="10" step="1" value="5" id="v3" data-tiger="v3"><span class="sl-val">5</span></div>'},
    ]},
    {"n":"03","title":"Your bottleneck","sub":"Updates as you move the sliders.","blocks":[
      {"raw":'<div class="mrea-bars">'
             '<div class="mrea-bar"><span class="bl">Leads</span><span class="bt"><i id="barL"></i></span><span class="bv" id="valL">—</span></div>'
             '<div class="mrea-bar"><span class="bl">Listings</span><span class="bt"><i id="barS"></i></span><span class="bv" id="valS">—</span></div>'
             '<div class="mrea-bar"><span class="bl">Leverage</span><span class="bt"><i id="barV"></i></span><span class="bv" id="valV">—</span></div>'
             '</div>'},
      {"raw":'<div class="mrea-verdict" id="lVerdict"><p class="vt">What this means</p><h3 class="vh">Move the sliders above</h3><p class="vp">Your weakest L is where your next month of effort belongs.</p></div>'},
      {"raw":'<input type="hidden" data-tiger="bottleneck" id="bottleneck">'},
    ]},
    {"n":"04","title":"The one thing","blocks":[
      {"teach":"The temptation now is to fix all three. Don&#x27;t. The order is fixed for a reason — leads before listings, listings before leverage. You cannot leverage a business that has no leads to work, and hiring into a lead problem just means paying someone to be idle."},
      {"textarea":{"key":"one_thing","label":"For the next 30 days, the L I am working on is…","hint":"name it, and say what you&#x27;ll actually do","ph":"Leads. I&#x27;m blocking 8–10am Monday through Thursday for lead generation and not scheduling over it."}},
      {"textarea":{"key":"one_thing_measure","label":"I&#x27;ll know it worked because…","hint":"a number, not a feeling","ph":"My tracked lead count goes from ~12/month to 30/month by the end of October."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
  "extra_script": """
(function(){
  var K=MREA;
  function avg(ids){var t=0;ids.forEach(function(i){t+=K.nval(i);});return t/ids.length;}
  function paint(){
    var L=avg(['l1','l2','l3']), S=avg(['s1','s2','s3']), V=avg(['v1','v2','v3']);
    var rows=[['Leads',L,'barL','valL'],['Listings',S,'barS','valS'],['Leverage',V,'barV','valV']];
    var low=rows.slice().sort(function(a,b){return a[1]-b[1];})[0];
    rows.forEach(function(r){
      var bar=K.$(r[2]); if(bar){bar.style.width=(r[1]*10)+'%';bar.className=(r[0]===low[0]?'weak':'');}
      K.set(r[3], K.round(r[1],1).toFixed(1));
    });
    var hid=K.$('bottleneck'); if(hid) hid.value=low[0];
    var copy={
      'Leads':['Your bottleneck is Leads.',
        'Everything downstream is starved. Until you have more leads than your goal requires, listings and leverage are not your problem — they are distractions dressed up as progress.',
        'Go to <b>Module 2.4 Database Sizing</b> to find out how big your database has to be, then <b>Module 3.3 The 33 Touch Planner</b> to build the program that works it.'],
      'Listings':['Your bottleneck is Listings.',
        'You are likely working buyers hard for a fraction of the return, and leaving the free buyer leads a marketed listing produces on the table.',
        'Go to <b>Module 3.6 Listings as a Lead Engine</b>. Then set your monthly listings-taken minimum in <b>Module 2.1 Your Economic Model</b>.'],
      'Leverage':['Your bottleneck is Leverage.',
        'You have demand and you have listings — you have run out of you. That is the good problem, and the answer is not longer hours.',
        'Go to <b>Module 4.1 Capacity vs Cul-de-sac Talent</b> and <b>Module 4.2 Your Three Key Hires</b>. Note the order: administrative help comes first, not a buyer agent.']
    }[low[0]];
    var cls = low[1] >= 7 ? 'ok' : (low[1] >= 4 ? 'warn' : 'bad');
    K.verdict('lVerdict', cls, copy[0], [copy[1], copy[2]]);
    K.publish({three_l_leads:K.round(L,1), three_l_listings:K.round(S,1), three_l_leverage:K.round(V,1), three_l_bottleneck:low[0]});
  }
  K.bind(['l1','l2','l3','s1','s2','s3','v1','v2','v3'], paint);
})();
"""
}

# ============================================================ 1.2
MODULES["1.2"] = {
  "file": "yrl-mrea-1-2-myths.html",
  "eyebrow": "Phase 1 · Module 1.2",
  "chip": "Self-check",
  "title": "The Six MythUnderstandings",
  "lede": "Six beliefs stop more agents than any market ever has. They feel like realism. They are actually fear wearing a business suit. Read each one, admit which ones you hold, and decide what you&#x27;re going to do about it.",
  "sections": [
    {"n":"01","title":"Where fear actually comes from","blocks":[
      {"teach":"Most of what limits an agent isn&#x27;t skill or market — it&#x27;s a belief that was never tested. A belief built on something true produces good decisions. A belief built on a myth produces a career-sized limitation that feels like common sense."},
      {"teach":"Below are the six that show up most often. Tick the ones you&#x27;ve caught yourself believing. Honest ticking is the whole exercise — nobody but you sees this page."},
    ]},
    {"n":"02","title":"The six","blocks":[
      {"raw":'<div class="mrea-myth"><div class="mh"><span class="tag">Myth</span><p>&ldquo;I can&#x27;t do it.&rdquo;</p></div>'
             '<div class="mt"><span class="tag">Truth</span><p>Until you try, you have no data. You do not know your own ceiling — nobody does. Deciding in advance that a number is beyond you is a decision made with no information at all. Ask yourself whether you&#x27;d teach a child to think that way about themselves.</p></div>'
             '<div class="mbelieve"><div class="check"><input type="checkbox" id="m1" data-tiger-check="m1"><label for="m1">I&#x27;ve believed this one</label></div></div></div>'},
      {"raw":'<div class="mrea-myth"><div class="mh"><span class="tag">Myth</span><p>&ldquo;It can&#x27;t be done in my market.&rdquo;</p></div>'
             '<div class="mt"><span class="tag">Truth</span><p>It can — you may need a different approach. What that sentence usually means is &ldquo;I haven&#x27;t found the way to make it work here yet.&rdquo; Central Indiana is not exempt from arithmetic. And the first agent in a market to stop believing this has an advantage over everyone who still does.</p></div>'
             '<div class="mbelieve"><div class="check"><input type="checkbox" id="m2" data-tiger-check="m2"><label for="m2">I&#x27;ve believed this one</label></div></div></div>'},
      {"raw":'<div class="mrea-myth"><div class="mh"><span class="tag">Myth</span><p>&ldquo;It would take too much time and effort — I&#x27;d lose my freedom.&rdquo;</p></div>'
             '<div class="mt"><span class="tag">Truth</span><p>Hours are not the deciding factor. You can work fifty hours and earn fifty thousand, or work fifty hours and earn far more — the difference is what fills the hours and how much of it is leveraged. The highest producers interviewed for this book generally had <i>more</i> freedom, not less, because leverage bought their time back.</p></div>'
             '<div class="mbelieve"><div class="check"><input type="checkbox" id="m3" data-tiger-check="m3"><label for="m3">I&#x27;ve believed this one</label></div></div></div>'},
      {"raw":'<div class="mrea-myth"><div class="mh"><span class="tag">Myth</span><p>&ldquo;It&#x27;s too risky. I&#x27;ll lose money.&rdquo;</p></div>'
             '<div class="mt"><span class="tag">Truth</span><p>Risk is proportional to how loosely you hold spending accountable. Add a cost, then require it to produce a matching result <i>before</i> you add the next one. Spending stops being a gamble the moment it has to report back. That discipline has a name — Red Light, Green Light — and it&#x27;s Module 2.5.</p></div>'
             '<div class="mbelieve"><div class="check"><input type="checkbox" id="m4" data-tiger-check="m4"><label for="m4">I&#x27;ve believed this one</label></div></div></div>'},
      {"raw":'<div class="mrea-myth"><div class="mh"><span class="tag">Myth</span><p>&ldquo;My clients will only work with me — only I can deliver quality service.&rdquo;</p></div>'
             '<div class="mt"><span class="tag">Truth</span><p>Clients are loyal to the <b>standard</b> you represent, not to your calendar. And any standard you can write down, someone else can meet. A trained team of specialists usually delivers a <i>more</i> consistent experience than one person doing every job at every hour. Nobody wants a surgeon who also processes their insurance paperwork.</p></div>'
             '<div class="mbelieve"><div class="check"><input type="checkbox" id="m5" data-tiger-check="m5"><label for="m5">I&#x27;ve believed this one</label></div></div></div>'},
      {"raw":'<div class="mrea-myth"><div class="mh"><span class="tag">Myth</span><p>&ldquo;Setting a goal I don&#x27;t fully hit is a negative thing.&rdquo;</p></div>'
             '<div class="mt"><span class="tag">Truth</span><p>Setting a goal and never going after it is the negative thing. Small goals are reached and then you coast; big goals drag you past the small ones on the way. Aim high — at night you always underestimate the distance to the target.</p></div>'
             '<div class="mbelieve"><div class="check"><input type="checkbox" id="m6" data-tiger-check="m6"><label for="m6">I&#x27;ve believed this one</label></div></div></div>'},
      {"raw":'<div class="mrea-verdict" id="mVerdict"><p class="vt">What this means</p><h3 class="vh">Tick the ones that are true</h3><p class="vp">There is no good score here — only an honest one.</p></div>'},
    ]},
    {"n":"03","title":"The one that&#x27;s costing you most","blocks":[
      {"field":{"key":"worst_myth","label":"The myth that has cost me the most","hint":"write the myth in your own words","ph":"That my past clients only want me personally — so I&#x27;ve never built a team."}},
      {"textarea":{"key":"myth_cost","label":"What has believing it actually cost me?","hint":"be specific — deals, hours, years","ph":"Two years of turning down listings because I couldn&#x27;t cover showings, and every weekend booked solid."}},
      {"textarea":{"key":"myth_test","label":"How will I test whether it&#x27;s even true?","hint":"the smallest real experiment you can run this month","ph":"Hand three showings to a licensed showing assistant and ask those clients directly how the experience was."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
  "extra_script": """
(function(){
  var K=MREA, ids=['m1','m2','m3','m4','m5','m6'];
  function paint(){
    var n=0; ids.forEach(function(i){var el=K.$(i); if(el&&el.checked)n++;});
    var copy;
    if(n===0) copy=['Nothing ticked yet','Either you have genuinely worked past all six — which is rare and worth confirming with Janet — or the honest answer hasn&#x27;t surfaced yet. Read them once more slowly.'];
    else if(n<=2) copy=['You&#x27;re carrying '+n+' of the six','That is a normal, workable number. Name the expensive one below and design a small test for it. A belief survives because it is never checked.'];
    else if(n<=4) copy=['You&#x27;re carrying '+n+' of the six','This is the most common result, and it explains more plateaus than any market shift does. Pick the single most expensive one — do not try to dismantle four beliefs at once.'];
    else copy=['You&#x27;re carrying '+n+' of the six','Being this honest is genuinely uncommon, and it is the whole reason this module exists. Start with myth four or five — they are the two that most often keep an agent solo and capped.'];
    K.verdict('mVerdict', n<=2?'ok':(n<=4?'warn':'bad'), copy[0], [copy[1]]);
    K.publish({myths_held:n});
  }
  K.bind(ids, paint);
})();
"""
}

# ============================================================ 1.3
MODULES["1.3"] = {
  "file": "yrl-mrea-1-3-eighty-twenty.html",
  "eyebrow": "Phase 1 · Module 1.3",
  "chip": "Audit",
  "title": "The 80/20 Audit",
  "lede": "Roughly 20% of what you do produces roughly 80% of what you earn. Most agents have never checked which 20%. Reconstruct last week honestly, tag every activity, and find out how much of your week actually pays you.",
  "sections": [
    {"n":"01","title":"Activity is not productivity","blocks":[
      {"teach":"You can be genuinely busy and genuinely unproductive at the same time — the two feel identical from the inside. The only way to tell them apart is to write the week down and grade it."},
      {"teach":"In this business the 20% is short and boring: <b>generating leads, going on listing appointments, marketing listings, and building leverage.</b> Nearly everything else — however necessary — is the 80%."},
      {"callout":"The 80% is not worthless. Contracts have to be written and files have to close. The question is only whether <i>you</i> should be the one doing it, and whether it happens before or after your 20%."},
    ]},
    {"n":"02","title":"Reconstruct last week","sub":"List your real activities and hours. Mark each one 20% (directly produces business) or 80% (everything else). Ten rows is usually enough.","blocks":[
      {"raw":'<div class="mrea-tablewrap"><table class="mrea-table"><thead><tr>'
             '<th>Activity</th><th class="num" style="width:88px">Hours</th><th style="width:132px">Type</th>'
             '</tr></thead><tbody id="auditRows"></tbody></table></div>'},
      {"raw":''.join(
          '<template class="audit-seed" data-n="%d"></template>' % i for i in range(1,11))},
      {"raw":'<p class="mrea-note"><i class="fa-solid fa-circle-info"></i> Rule of thumb: if it directly created a lead, an appointment, a listing, or leverage — it&#x27;s 20%. If it happened <i>because</i> you already had business, it&#x27;s 80%.</p>'},
    ]},
    {"n":"03","title":"Your real ratio","blocks":[
      {"raw":'<div class="mrea-stats">'
             '<div class="mrea-stat" id="stHours"></div>'
             '<div class="mrea-stat" id="st20"></div>'
             '<div class="mrea-stat" id="st80"></div>'
             '</div>'},
      {"raw":'<div class="mrea-verdict" id="aVerdict"><p class="vt">What this means</p><h3 class="vh">Fill in last week</h3><p class="vp">Hours and tags above will grade the week for you.</p></div>'},
      {"raw":'<input type="hidden" data-tiger="pct20" id="pct20">'},
    ]},
    {"n":"04","title":"Cut, delegate, protect","blocks":[
      {"teach":"Three moves, in order. <b>Cut</b> what shouldn&#x27;t happen at all. <b>Delegate</b> what should happen but not by you. <b>Protect</b> the 20% by putting it on the calendar before anything else can claim the time."},
      {"list":{"key":"cut","title":"80% work I will stop doing entirely","min":3,"ph":"e.g. rebuilding the same CMA layout from scratch every time"}},
      {"list":{"key":"delegate","title":"80% work someone else should do","min":3,"ph":"e.g. scheduling showings, ordering photos, listing data entry"}},
      {"textarea":{"key":"protect","label":"The 20% block I am putting on my calendar this week","hint":"day, time, and what happens in it","ph":"Mon–Thu 8:00–10:00am — lead generation only. No showings booked before 10."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
  "extra_script": """
(function(){
  var K=MREA, N=10, host=K.$('auditRows');
  var seed=[['Lead generation calls / follow-up','','20'],['Listing appointments','','20'],
            ['Marketing my listings','','20'],['Showings','','80'],['Contract & paperwork','','80'],
            ['Email / phone admin','','80'],['','',''],['','',''],['','',''],['','','']];
  for(var i=1;i<=N;i++){
    var s=seed[i-1], tr=document.createElement('tr');
    tr.innerHTML='<td><input class="tiger-input" id="a'+i+'n" data-tiger="a'+i+'n" placeholder="'+(s[0]||'Activity')+'"></td>'+
      '<td class="num" style="width:88px"><input class="tiger-input" id="a'+i+'h" data-tiger="a'+i+'h" inputmode="decimal" placeholder="0"></td>'+
      '<td style="width:132px"><select class="tiger-input" id="a'+i+'t" data-tiger="a'+i+'t">'+
      '<option value="">—</option><option value="20">20% (pays)</option><option value="80">80% (support)</option></select></td>';
    host.appendChild(tr);
  }
  function paint(){
    var tot=0,t20=0;
    for(var i=1;i<=N;i++){
      var h=K.nval('a'+i+'h'), t=K.val('a'+i+'t');
      if(h>0){tot+=h; if(t==='20')t20+=h;}
    }
    var pct = tot>0 ? Math.round(t20/tot*100) : 0;
    K.stat('stHours', K.cnt(tot,1), 'Hours logged', tot>55?'a long week':'');
    K.stat('st20', K.cnt(t20,1), 'Hours on the 20%', pct+'% of your week');
    K.stat('st80', K.cnt(tot-t20,1), 'Hours on the 80%', (100-pct)+'% of your week');
    var h=K.$('pct20'); if(h) h.value=pct;
    if(tot<=0){ K.verdict('aVerdict','', 'Fill in last week', ['Add hours and tag each row to grade the week.']); return; }
    var c,copy;
    if(pct>=40){c='ok';copy=[''+pct+'% of your week paid you','That is a strong ratio and rarer than you&#x27;d think. Protect it — the usual failure mode from here is letting servicing quietly eat the block back. Put the 20% on the calendar before anything else claims the time.'];}
    else if(pct>=25){c='warn';copy=[''+pct+'% of your week paid you','Workable, but there is real money in the gap. Look at your 80% rows: the ones that repeat every week are the ones worth writing into a system or handing to admin help first.'];}
    else if(pct>=12){c='warn';copy=['Only '+pct+'% of your week paid you','This is the most common result and it is exactly what a plateau looks like from the inside. You are not lazy — you are busy on the wrong things. Start by moving one hour a day from the 80% into lead generation.'];}
    else {c='bad';copy=['Just '+pct+'% of your week paid you','Almost your entire week is going to work that only exists because you already had business. That is a treadmill: when the current pipeline closes, nothing replaces it. Cut or delegate two rows below, this week, and defend one daily block.'];}
    K.verdict('aVerdict', c, copy[0], [copy[1]]);
    K.publish({week_hours:K.round(tot,1), week_pct20:pct});
  }
  var ids=[]; for(var j=1;j<=N;j++){ids.push('a'+j+'h');ids.push('a'+j+'t');}
  K.bind(ids, paint);
})();
"""
}

# ============================================================ 2.1
MODULES["2.1"] = {
  "file": "yrl-mrea-2-1-economic-model.html",
  "eyebrow": "Phase 2 · Module 2.1",
  "chip": "Calculator",
  "title": "Your Economic Model",
  "lede": "The single most useful page in this whole path. Start with the income you want to keep and work backward to the number of appointments you need this week. No guessing, no vibes — just arithmetic you can act on Monday morning.",
  "sections": [
    {"n":"01","title":"Work backward, not forward","blocks":[
      {"teach":"Most agents run the model forward: work hard, see what happens, hope it&#x27;s enough. The model runs better in reverse. Net income you want → gross commission you must produce → closed sides → listings and buyers → appointments → leads. Each step is division."},
      {"teach":"Once you&#x27;ve done it, you stop asking &ldquo;am I doing enough?&rdquo; and start asking &ldquo;did I hit twenty-six appointments this month?&rdquo; — a question that has an answer."},
      {"callout":"Enter <b>your</b> numbers, not benchmarks. Pull your average sale price and your average commission per side from your own last twelve months of closings, or ask Janet Giles-Schultz (317-997-7404) to run them with you.","confirm":True},
    ]},
    {"n":"02","title":"Your inputs","sub":"Every field updates the math below as you type.","blocks":[
      {"grid":[
        {"field":{"key":"net_goal","label":"Net income I want to keep","hint":"after expenses, before personal tax","money":True,"mode":"numeric","ph":"150,000"}},
        {"field":{"key":"avg_price","label":"My average sale price","hint":"your last 12 months","money":True,"mode":"numeric","ph":"285,000"}},
      ]},
      {"grid":[
        {"field":{"key":"comm_pct","label":"Average commission % per side","hint":"negotiated per transaction","mode":"decimal","ph":"2.75"}},
        {"field":{"key":"split_pct","label":"My split after brokerage (%)","hint":"your share — confirm with Janet","mode":"numeric","ph":"80"}},
      ]},
      {"grid":[
        {"field":{"key":"cos_pct","label":"Cost of sales (% of my GCI)","hint":"paid to buyer/listing specialists — 0 if solo","mode":"decimal","ph":"0"}},
        {"field":{"key":"opex_pct","label":"Operating expenses (% of my GCI)","hint":"marketing, tech, dues, auto — 25–30% is typical","mode":"decimal","ph":"28"}},
      ]},
      {"callout":"Commission is negotiable on every transaction and is not set by any brokerage or association. These fields are your own historical averages for planning only — never a rate card."},
    ]},
    {"n":"03","title":"What you have to produce","blocks":[
      {"raw":'<div class="mrea-stats">'
             '<div class="mrea-stat" id="stGCI"></div>'
             '<div class="mrea-stat" id="stSides"></div>'
             '<div class="mrea-stat" id="stVolume"></div>'
             '<div class="mrea-stat" id="stPerSide"></div>'
             '</div>'},
      {"raw":'<p class="mrea-note"><i class="fa-solid fa-circle-info"></i> &ldquo;Sides&rdquo; means closed transactions where you represented someone — one house you both listed and sold is two sides.</p>'},
    ]},
    {"n":"04","title":"Split into listings and buyers","sub":"A properly marketed listing should produce roughly one closed buyer on its own. That&#x27;s why the model leans on the listing side.","blocks":[
      {"raw":'<div class="mrea-stats">'
             '<div class="mrea-stat" id="stListSold"></div>'
             '<div class="mrea-stat" id="stBuySold"></div>'
             '<div class="mrea-stat" id="stListMo"></div>'
             '</div>'},
      {"grid":[
        {"field":{"key":"listing_share","label":"% of my sides from the listing side","hint":"50 is the balanced target","mode":"numeric","ph":"50"}},
        {"field":{"key":"conv_appt_list","label":"My appointment → listing taken rate (%)","hint":"prequalified appointments; 80 is a strong benchmark","mode":"numeric","ph":"70"}},
      ]},
      {"grid":[
        {"field":{"key":"conv_list_sold","label":"My listing taken → sold rate (%)","hint":"65 is a common benchmark","mode":"numeric","ph":"65"}},
        {"field":{"key":"conv_buyer","label":"My buyer appointment → signed BRA (%)","hint":"a written agreement is required before touring","mode":"numeric","ph":"65"}},
      ]},
    ]},
    {"n":"05","title":"Your appointment number","sub":"This is the number that actually goes on your calendar.","blocks":[
      {"raw":'<div class="mrea-stats">'
             '<div class="mrea-stat" id="stSellerAppt"></div>'
             '<div class="mrea-stat" id="stBuyerAppt"></div>'
             '<div class="mrea-stat hot" id="stWeekly"></div>'
             '</div>'},
      {"raw":'<div class="mrea-verdict" id="eVerdict"><p class="vt">What this means</p><h3 class="vh">Enter your numbers above</h3><p class="vp">The whole chain runs from your net income goal down to appointments per week.</p></div>'},
      {"raw":'<input type="hidden" data-tiger="gci_needed" id="gci_needed"><input type="hidden" data-tiger="sides_needed" id="sides_needed"><input type="hidden" data-tiger="appts_week" id="appts_week">'},
    ]},
    {"n":"06","title":"Put it where you&#x27;ll see it","blocks":[
      {"teach":"A number you have to look up is a number you will ignore. Millionaire agents post theirs — on a whiteboard, in the CRM dashboard, on the wall behind the monitor."},
      {"checklist":[
        {"key":"e_post","label":"Write my monthly appointment number somewhere I see it every day"},
        {"key":"e_share","label":"Share my listings-taken goal with the team so it&#x27;s public"},
        {"key":"e_track","label":"Track appointments held weekly, not monthly — monthly is too late to correct"},
        {"key":"e_review","label":"Re-run this model every quarter, and any time the market shifts"},
      ]},
      {"textarea":{"key":"model_commit","label":"My number, in one sentence","hint":"say it the way you&#x27;d say it out loud","ph":"I need 4 listing appointments and 4 buyer appointments a week to keep $150,000."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
  "extra_script": """
(function(){
  var K=MREA;
  function paint(){
    var net=K.nval('net_goal'), price=K.nval('avg_price'), comm=K.nval('comm_pct'),
        split=K.nval('split_pct'), cos=K.nval('cos_pct'), opex=K.nval('opex_pct');
    var keepRate = (100-cos-opex)/100;
    if(!(net>0&&price>0&&comm>0)||keepRate<=0){
      ['stGCI','stSides','stVolume','stPerSide','stListSold','stBuySold','stListMo','stSellerAppt','stBuyerAppt','stWeekly']
        .forEach(function(i){K.stat(i,'—','');});
      K.verdict('eVerdict','','Enter your numbers above',
        [keepRate<=0&&net>0?'Your cost of sales plus operating expenses is 100% or more of your gross — nothing is left to keep. Lower one of them before the model can run.':'The whole chain runs from your net income goal down to appointments per week.']);
      return;
    }
    var gci = net/keepRate;
    var perSideCompany = price*(comm/100);
    var perSideMe = perSideCompany*(split>0?split/100:1);
    var sides = gci/perSideMe;
    var volume = sides*price;

    K.stat('stGCI', K.money(gci), 'Gross commission needed', 'to keep '+K.money(net));
    K.stat('stSides', K.cnt(Math.ceil(sides),0), 'Closed sides a year', K.cnt(sides/12,1)+' per month');
    K.stat('stVolume', K.money(volume), 'Sales volume', 'at '+K.money(price)+' average');
    K.stat('stPerSide', K.money(perSideMe), 'You keep per side', 'after your split');

    var share=K.nval('listing_share'); if(!(share>0)) share=50;
    var listSold = sides*(share/100), buySold = sides - listSold;
    var cAL=K.nval('conv_appt_list')||80, cLS=K.nval('conv_list_sold')||65, cB=K.nval('conv_buyer')||65;
    var listTaken = cLS>0 ? listSold/(cLS/100) : 0;
    var sellerAppts = cAL>0 ? listTaken/(cAL/100) : 0;
    var buyerAgree = buySold/0.8;
    var buyerAppts = cB>0 ? buyerAgree/(cB/100) : 0;

    K.stat('stListSold', K.cnt(Math.ceil(listSold),0), 'Listings sold / yr', K.cnt(listSold/12,1)+' per month');
    K.stat('stBuySold', K.cnt(Math.ceil(buySold),0), 'Buyers closed / yr', K.cnt(buySold/12,1)+' per month');
    K.stat('stListMo', K.cnt(listTaken/12,1), 'Listings to TAKE / month', 'your minimum');
    K.stat('stSellerAppt', K.cnt(sellerAppts/12,1), 'Seller appts / month', '');
    K.stat('stBuyerAppt', K.cnt(buyerAppts/12,1), 'Buyer appts / month', '');
    var wk=(sellerAppts+buyerAppts)/52;
    K.stat('stWeekly', K.cnt(wk,1), 'Appointments / week', 'the number that matters');

    K.$('gci_needed').value=Math.round(gci);
    K.$('sides_needed').value=Math.round(sides);
    K.$('appts_week').value=K.round(wk,1);

    var c = wk<=6?'ok':(wk<=12?'warn':'bad');
    var lines=[
      'To keep <b>'+K.money(net)+'</b> you need <b>'+K.money(gci)+'</b> in gross commission — about <b>'+K.cnt(Math.ceil(sides),0)+' closed sides</b> and <b>'+K.money(volume)+'</b> in volume.',
      'That comes down to <b>'+K.cnt(listTaken/12,1)+' listings taken every month</b> and roughly <b>'+K.cnt(wk,1)+' appointments a week</b>. That is the whole job.'
    ];
    if(wk>12) lines.push('That weekly number is high enough that you will not personally hold all of them for long. Raising your conversion rates (Module 2.2) or adding leverage (Phase 4) will do more than adding hours.');
    else if(cAL<70||cB<60) lines.push('Your conversion rates are doing a lot of damage here. Every point you add to them removes appointments from this number — work Module 2.2 before you work harder.');
    K.verdict('eVerdict', c, K.cnt(wk,1)+' appointments a week', lines);

    K.publish({net_goal:Math.round(net), gci_needed:Math.round(gci), avg_price:Math.round(price),
      comm_pct:comm, sides_needed:Math.round(sides), listings_taken_mo:K.round(listTaken/12,1),
      seller_appts_mo:K.round(sellerAppts/12,1), buyer_appts_mo:K.round(buyerAppts/12,1),
      appts_week:K.round(wk,1)});
  }
  K.bind(['net_goal','avg_price','comm_pct','split_pct','cos_pct','opex_pct',
          'listing_share','conv_appt_list','conv_list_sold','conv_buyer'], paint);
})();
"""
}

# ============================================================ 2.2
MODULES["2.2"] = {
  "file": "yrl-mrea-2-2-conversion-rates.html",
  "eyebrow": "Phase 2 · Module 2.2",
  "chip": "Calculator",
  "title": "Your Conversion Rates",
  "lede": "Conversion is the variable in the whole equation. Two agents with identical lead counts can earn wildly different incomes, and the entire difference is what happens in the appointment. Find your real rates, then find which one to fix first.",
  "sections": [
    {"n":"01","title":"Why this is the highest-leverage number you own","blocks":[
      {"teach":"Look at what conversion actually does. If you convert appointments to listings at 50% and you get to 70%, you need <b>fewer appointments</b> for the same income — or you earn considerably more from the same effort. No extra lead spend, no extra hours."},
      {"teach":"And conversion is a skill, not luck. It comes from presentations you&#x27;ve rehearsed, scripts you know cold, and a value proposition you can state without hedging. Agents who avoid script practice are choosing to buy more leads instead — which costs money forever."},
      {"callout":"Benchmarks worth knowing: on the seller side, roughly <b>80%</b> of prequalified appointments should produce a listing agreement, and about <b>65%</b> of those listings should sell. On the buyer side the ratio flips — about <b>65%</b> of appointments produce a signed representation agreement, and roughly <b>80%</b> of those close."},
    ]},
    {"n":"02","title":"Your last 90 days","sub":"Real counts, not estimates. If you don&#x27;t know them, that itself is the finding — start counting this week.","blocks":[
      {"raw":'<p class="teach" style="margin-bottom:4px"><b>Seller side</b></p>'},
      {"grid":[
        {"field":{"key":"s_appt","label":"Seller appointments held","mode":"numeric","ph":"12"}},
        {"field":{"key":"s_taken","label":"Listings taken","mode":"numeric","ph":"7"}},
      ]},
      {"field":{"key":"s_sold","label":"Those listings that sold (or are pending)","mode":"numeric","ph":"5"}},
      {"raw":'<p class="teach" style="margin:18px 0 4px"><b>Buyer side</b></p>'},
      {"grid":[
        {"field":{"key":"b_appt","label":"Buyer consultations held","mode":"numeric","ph":"14"}},
        {"field":{"key":"b_agree","label":"Signed buyer representation agreements","mode":"numeric","ph":"8"}},
      ]},
      {"field":{"key":"b_closed","label":"Those buyers who closed (or are pending)","mode":"numeric","ph":"6"}},
      {"raw":'<p class="teach" style="margin:18px 0 4px"><b>Front of the funnel</b></p>'},
      {"grid":[
        {"field":{"key":"leads_90","label":"Leads received","hint":"every inquiry, all sources","mode":"numeric","ph":"90"}},
        {"field":{"key":"appt_set","label":"Appointments set from them","mode":"numeric","ph":"26"}},
      ]},
    ]},
    {"n":"03","title":"Your rates against the benchmark","blocks":[
      {"raw":'<div class="mrea-tablewrap"><table class="mrea-table"><thead><tr>'
             '<th>Conversion</th><th class="num">Yours</th><th class="num">Benchmark</th><th class="num">Gap</th>'
             '</tr></thead><tbody id="convRows"></tbody></table></div>'},
      {"raw":'<div class="mrea-verdict" id="cVerdict"><p class="vt">What this means</p><h3 class="vh">Enter your 90-day counts</h3><p class="vp">Every rate is computed against a benchmark so you can see which one to work on.</p></div>'},
      {"raw":'<input type="hidden" data-tiger="weakest_conv" id="weakest_conv">'},
    ]},
    {"n":"04","title":"Fix one, not four","blocks":[
      {"teach":"Take the biggest gap and work only that one for a month. Conversion improves through repetition of a specific dialogue, and you cannot rehearse four things at once."},
      {"textarea":{"key":"conv_fix","label":"The conversion I&#x27;m fixing first","hint":"which one, and what you&#x27;ll do about it","ph":"Appointment → listing taken. I&#x27;m rehearsing the pricing conversation out loud twice a week until I stop softening it."}},
      {"checklist":[
        {"key":"c_script","label":"Rehearse the relevant script out loud — not read, rehearsed — until it&#x27;s automatic"},
        {"key":"c_prequal","label":"Prequalify before booking; benchmarks assume prequalified appointments"},
        {"key":"c_debrief","label":"Debrief every lost appointment the same day, in writing, while it&#x27;s fresh"},
        {"key":"c_count","label":"Count appointments held and outcomes weekly from now on"},
      ]},
      {"list":{"key":"objections","title":"Objections I keep losing on","min":3,"ph":"e.g. &quot;another agent said they could get more for it&quot;"}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
  "extra_script": """
(function(){
  var K=MREA, host=K.$('convRows');
  var DEFS=[
    ['Lead → appointment set','leads_90','appt_set',25,'lead_to_appt'],
    ['Seller appt → listing taken','s_appt','s_taken',80,'appt_to_listing'],
    ['Listing taken → sold','s_taken','s_sold',65,'listing_to_sold'],
    ['Buyer appt → signed BRA','b_appt','b_agree',65,'appt_to_bra'],
    ['Buyer BRA → closed','b_agree','b_closed',80,'bra_to_closed']
  ];
  function paint(){
    var rows='', worst=null, any=false;
    DEFS.forEach(function(d){
      var den=K.nval(d[1]), nu=K.nval(d[2]);
      var has = den>0;
      var rate = has ? (nu/den*100) : 0;
      if(has){ any=true; var gap=rate-d[3];
        if(worst===null||gap<worst.gap) worst={name:d[0],gap:gap,rate:rate,bench:d[3],key:d[4]}; }
      var gapTxt = has ? ((rate-d[3])>=0?'+':'') + K.round(rate-d[3],0) + ' pts' : '—';
      var col = has ? (rate>=d[3]?'#2e9e5b':(rate>=d[3]-15?'#c2820b':'#c03926')) : '#9ca3af';
      rows += '<tr><td>'+d[0]+'</td><td class="num out">'+(has?K.round(rate,0)+'%':'—')+
              '</td><td class="num">'+d[3]+'%</td><td class="num" style="color:'+col+';font-weight:800">'+gapTxt+'</td></tr>';
    });
    host.innerHTML=rows;
    if(!any){ K.verdict('cVerdict','','Enter your 90-day counts',['Every rate is computed against a benchmark so you can see which one to work on.']); return; }
    var h=K.$('weakest_conv'); if(h) h.value=worst.name;
    var c = worst.gap>=0?'ok':(worst.gap>=-15?'warn':'bad');
    var lines=[];
    if(worst.gap>=0){
      lines.push('Every rate you entered is at or above benchmark — the weakest is <b>'+worst.name+'</b> and it is still holding up.');
      lines.push('When conversion is healthy and income still isn&#x27;t where you want it, the problem is upstream: you need more leads, not better closing. Go to <b>Module 2.4 Database Sizing</b>.');
    } else {
      lines.push('Your weakest link is <b>'+worst.name+'</b> at '+K.round(worst.rate,0)+'% against a benchmark of '+worst.bench+'% — a gap of '+K.round(Math.abs(worst.gap),0)+' points.');
      if(worst.key==='lead_to_appt') lines.push('Leads are arriving and not becoming appointments. That is usually speed and script, not lead quality — how fast does the first contact actually happen, and do you ask for the appointment directly?');
      else if(worst.key==='appt_to_listing') lines.push('You are getting in front of sellers and not leaving with the listing. This is the single most expensive gap on the page, because every one of those appointments already cost you lead-generation money.');
      else if(worst.key==='listing_to_sold') lines.push('You are taking listings that don&#x27;t sell. That is almost always a pricing conversation you didn&#x27;t win at the table — an overpriced listing costs you twice, in marketing spend and in reputation.');
      else if(worst.key==='appt_to_bra') lines.push('Buyers are meeting you and not signing. A written buyer representation agreement is required before touring, so this conversation cannot be avoided — it has to be rehearsed until it is comfortable and plainly explained.');
      else lines.push('Buyers sign with you and then don&#x27;t close. Look at prequalification and lender coordination before you look at anything else.');
      lines.push('Fix this one alone for thirty days. Closing the gap here is worth more than any amount of additional lead spend.');
    }
    K.verdict('cVerdict', c, worst.gap>=0?'All rates at or above benchmark':'Start with '+worst.name, lines);
    var pub={}; DEFS.forEach(function(d){var den=K.nval(d[1]); if(den>0) pub['conv_'+d[4]]=K.round(K.nval(d[2])/den*100,0);});
    pub.weakest_conv=worst.name; K.publish(pub);
  }
  K.bind(['s_appt','s_taken','s_sold','b_appt','b_agree','b_closed','leads_90','appt_set'], paint);
})();
"""
}

# ============================================================ 2.3
MODULES["2.3"] = {
  "file": "yrl-mrea-2-3-budget-model.html",
  "eyebrow": "Phase 2 · Module 2.3",
  "chip": "Calculator",
  "title": "The Budget Model",
  "lede": "Where the money goes between earning it and keeping it. Enter your gross commission and this builds the model budget, then compares it to what you actually spend — and tells you whether you are underfunding the one line that generates everything else.",
  "sections": [
    {"n":"01","title":"Lead with revenue","blocks":[
      {"teach":"One discipline underpins the whole model: <b>make the money before you spend it.</b> Real estate is unusually kind here — the cost of acquiring one listing is low relative to what it returns, so the business can fund its own growth if you let it."},
      {"teach":"Second: stop thinking of expenses as costs and start thinking of them as investments that owe you a return. A dollar in should bring back several. If a dollar returns a dollar, keep the dollar and save yourself the work."},
      {"callout":"Percentages hold remarkably steady as a business grows, even though the dollar amounts change completely. That&#x27;s why this is a model and not a one-time budget."},
    ]},
    {"n":"02","title":"Your model budget","sub":"Enter your annual gross commission income. The model column fills automatically; enter what you actually spend beside it.","blocks":[
      {"field":{"key":"budget_gci","label":"My annual gross commission income (GCI)","hint":"pulled from Module 2.1 if you&#x27;ve done it","money":True,"mode":"numeric","ph":"180,000"}},
      {"raw":'<div class="mrea-tablewrap"><table class="mrea-table"><thead><tr>'
             '<th>Category</th><th class="num" style="width:96px">Model %</th><th class="num" style="width:110px">Model $</th>'
             '<th class="num" style="width:130px">My actual $</th><th class="num" style="width:96px">Variance</th>'
             '</tr></thead><tbody id="budgetRows"></tbody></table></div>'},
      {"raw":'<p class="mrea-note"><i class="fa-solid fa-circle-info"></i> There is no miscellaneous line. Every dollar belongs to a category — that is what makes the model comparable year over year and against other agents.</p>'},
    ]},
    {"n":"03","title":"The Big Two","sub":"Salaries and lead generation are roughly three quarters of operating expenses. Get these two right and the rest rarely goes wrong.","blocks":[
      {"raw":'<div class="mrea-stats">'
             '<div class="mrea-stat" id="stLeadGen"></div>'
             '<div class="mrea-stat" id="stSalaries"></div>'
             '<div class="mrea-stat" id="stTotal"></div>'
             '<div class="mrea-stat good" id="stLeft"></div>'
             '</div>'},
      {"raw":'<div class="mrea-verdict" id="bVerdict"><p class="vt">What this means</p><h3 class="vh">Enter your GCI to build the model</h3><p class="vp">Then add your real spending beside it.</p></div>'},
      {"raw":'<input type="hidden" data-tiger="leadgen_pct" id="leadgen_pct">'},
    ]},
    {"n":"04","title":"Rules that keep you honest","blocks":[
      {"teach":"Systems exist to make the right thing easy and the wrong thing awkward. These four make overspending require a deliberate act rather than a quiet drift."},
      {"checklist":[
        {"key":"b_accounts","label":"Keep the deposit account separate from the operating account"},
        {"key":"b_fund","label":"Move only the month&#x27;s budgeted amount into operating — nothing more"},
        {"key":"b_variance","label":"Require a written justification before any transfer that exceeds budget"},
        {"key":"b_pl","label":"Review the P&amp;L monthly; identify variances early, not at year end"},
        {"key":"b_new","label":"Require an economic case for every new expense — what it returns, and by when"},
      ]},
      {"textarea":{"key":"budget_cut","label":"One expense I can&#x27;t justify right now","hint":"try living without it for 60 days","ph":"A paid lead source I&#x27;ve never traced to a closing — pausing it and tracking what actually changes."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
  "extra_script": """
(function(){
  var K=MREA, host=K.$('budgetRows');
  var CATS=[['Salaries / admin support',12.0,'sal'],['Lead generation',9.2,'lg'],['Occupancy',2.0,'occ'],
            ['Technology',1.5,'tech'],['Phone',1.0,'ph'],['Supplies',1.0,'sup'],
            ['Education / dues',1.0,'edu'],['Equipment',1.0,'eq'],['Auto / insurance',0.5,'auto']];
  CATS.forEach(function(c){
    var tr=document.createElement('tr');
    tr.innerHTML='<td>'+c[0]+'</td><td class="num">'+c[1].toFixed(1)+'%</td>'+
      '<td class="num out" id="m_'+c[2]+'">—</td>'+
      '<td class="num"><input class="tiger-input" id="a_'+c[2]+'" data-tiger="a_'+c[2]+'" inputmode="numeric" placeholder="0"></td>'+
      '<td class="num" id="v_'+c[2]+'">—</td>';
    host.appendChild(tr);
  });
  function paint(){
    var gci=K.nval('budget_gci');
    var totalModel=0,totalActual=0,lg=0,sal=0;
    CATS.forEach(function(c){
      var m=gci*c[1]/100, a=K.nval('a_'+c[2]);
      totalModel+=m; totalActual+=a;
      if(c[2]==='lg') lg=a; if(c[2]==='sal') sal=a;
      K.set('m_'+c[2], gci>0?K.money(m):'—');
      var vEl=K.$('v_'+c[2]);
      if(vEl){
        if(gci>0&&a>0){ var d=a-m;
          vEl.textContent=(d>=0?'+':'')+K.money(d);
          vEl.style.color = d>m*0.15 ? '#c03926' : (d<-m*0.15 ? '#c2820b' : '#2e9e5b');
          vEl.style.fontWeight='800';
        } else { vEl.textContent='—'; vEl.style.color='#9ca3af'; }
      }
    });
    var lgPct = gci>0 ? lg/gci*100 : 0;
    K.stat('stLeadGen', gci>0&&lg>0?K.round(lgPct,1)+'%':'—','Lead gen % of GCI','model is 9–10%');
    K.stat('stSalaries', gci>0&&sal>0?K.round(sal/gci*100,1)+'%':'—','Salaries % of GCI','model is 12%');
    K.stat('stTotal', gci>0&&totalActual>0?K.money(totalActual):'—','Total operating spend', gci>0?'model: '+K.money(totalModel):'');
    K.stat('stLeft', gci>0?K.money(gci-totalActual):'—','Left before cost of sales','');
    var h=K.$('leadgen_pct'); if(h) h.value=K.round(lgPct,1);
    if(!(gci>0)){ K.verdict('bVerdict','','Enter your GCI to build the model',['Then add your real spending beside it.']); return; }
    var lines=[], c='ok', head;
    if(totalActual<=0){
      head='Model built — now add your actuals';
      lines.push('The model column shows what each category should be at <b>'+K.money(gci)+'</b> of gross commission. Pull your last twelve months and fill in the actual column.');
      c='';
    } else if(lg>0 && lgPct<7){
      head='You are underfunding lead generation';
      c='bad';
      lines.push('Lead generation is <b>'+K.round(lgPct,1)+'%</b> of your gross against a model of about 10%. This is the most common and most expensive budget mistake in the business.');
      lines.push('Lead generation is the line that produces every other line. Cutting it feels responsible and quietly shrinks next year. If money is tight, cut somewhere else first.');
    } else if(totalActual>totalModel*1.2){
      head='Spending is running ahead of the model';
      c='warn';
      lines.push('You are spending <b>'+K.money(totalActual)+'</b> against a model of <b>'+K.money(totalModel)+'</b>. Look at the red variances above.');
      lines.push('Apply Red Light, Green Light (Module 2.5): every category over model has to show the incremental result it bought before it earns the next dollar.');
    } else {
      head='Your budget is tracking the model';
      lines.push('Total operating spend of <b>'+K.money(totalActual)+'</b> against a model of <b>'+K.money(totalModel)+'</b>, with lead generation at <b>'+K.round(lgPct,1)+'%</b>.');
      lines.push('Keep the monthly review going. Budgets drift quietly, and the drift is always easier to correct in month two than in month ten.');
    }
    K.verdict('bVerdict', c, head, lines);
    K.publish({budget_gci:Math.round(gci), leadgen_budget:Math.round(lg), leadgen_pct:K.round(lgPct,1)});
  }
  var ids=['budget_gci']; CATS.forEach(function(c){ids.push('a_'+c[2]);});
  K.bind(ids, paint);
  MREA.metrics().then(function(m){
    var el=K.$('budget_gci');
    if(el && !el.value && m && m.gci_needed){ el.value=m.gci_needed; paint(); }
  });
})();
"""
}

# ============================================================ 2.4
MODULES["2.4"] = {
  "file": "yrl-mrea-2-4-database-sizing.html",
  "eyebrow": "Phase 2 · Module 2.4",
  "chip": "Calculator",
  "title": "Database Sizing",
  "lede": "Your database is your business. This module turns that from a slogan into a number: exactly how many people you need to know, how many you need to reach, what it costs, and how many names a day you have to add to get there.",
  "sections": [
    {"n":"01","title":"Two audiences, two ratios","blocks":[
      {"teach":"Everyone you could do business with falls into one of two groups. <b>Met</b> — people who know you, because you&#x27;ve spoken or met in person. <b>Haven&#x27;t Met</b> — a farm, a neighbourhood, a demographic list; people you&#x27;ve chosen to market to who don&#x27;t know you yet."},
      {"teach":"Each behaves predictably when worked properly. For every <b>12 people in your Met database</b> that you touch 33 times a year, expect about <b>2 closings</b> — one repeat, one referral. For every <b>50 people in your Haven&#x27;t Met database</b> that you mail 12 times a year, expect about <b>1 closing</b>."},
      {"callout":"Met business costs less money per sale but more of your personal time. Haven&#x27;t Met costs more money but scales without your hours — which is why any agent who wants to eventually step back needs both."},
    ]},
    {"n":"02","title":"Your goal and your mix","blocks":[
      {"grid":[
        {"field":{"key":"db_sides","label":"Closed sides I need per year","hint":"pulled from Module 2.1 if you&#x27;ve done it","mode":"numeric","ph":"24"}},
        {"field":{"key":"db_mix","label":"% of that coming from Met","hint":"50 is a healthy balance","mode":"numeric","ph":"50"}},
      ]},
      {"grid":[
        {"field":{"key":"db_met_now","label":"People in my Met database today","hint":"an honest count","mode":"numeric","ph":"180"}},
        {"field":{"key":"db_hm_now","label":"People in my Haven&#x27;t Met database today","hint":"farm and list names","mode":"numeric","ph":"0"}},
      ]},
      {"field":{"key":"db_touch_cost","label":"Average cost per touch","hint":"mail, print and postage average out around $0.50","mode":"decimal","ph":"0.50"}},
    ]},
    {"n":"03","title":"What you actually need","blocks":[
      {"raw":'<div class="mrea-stats">'
             '<div class="mrea-stat" id="stMet"></div>'
             '<div class="mrea-stat" id="stHM"></div>'
             '<div class="mrea-stat" id="stCost"></div>'
             '<div class="mrea-stat hot" id="stDaily"></div>'
             '</div>'},
      {"raw":'<div class="mrea-verdict" id="dVerdict"><p class="vt">What this means</p><h3 class="vh">Enter your goal above</h3><p class="vp">This sizes the database your income actually requires.</p></div>'},
      {"raw":'<input type="hidden" data-tiger="met_needed" id="met_needed"><input type="hidden" data-tiger="hm_needed" id="hm_needed"><input type="hidden" data-tiger="daily_adds" id="daily_adds">'},
    ]},
    {"n":"04","title":"Feed it every day","blocks":[
      {"teach":"There are about 240 working days in a year. Adding one name a day is 240 names — it sounds trivial and it compounds into a business. Adding three a day fills most agents&#x27; entire requirement inside of three years, from a standing start."},
      {"teach":"The four laws are short: <b>build a database, feed it every day, communicate with it systematically, and service every lead that comes your way.</b>"},
      {"field":{"key":"db_daily_commit","label":"Names I commit to adding every working day","hint":"be realistic — a number you&#x27;ll actually hit","mode":"numeric","ph":"2"}},
      {"list":{"key":"db_sources","title":"Where tomorrow&#x27;s names will come from","min":5,"ph":"e.g. open house sign-ins, past clients I&#x27;ve lost touch with, my kids&#x27; sports parents, closing table contacts"}},
      {"checklist":[
        {"key":"d_tag","label":"Tag every contact in the CRM as Met or Haven&#x27;t Met"},
        {"key":"d_allied","label":"Tag the allied resources — people who should send me business every year"},
        {"key":"d_dates","label":"Fill in birthdays and home-purchase anniversaries — they&#x27;re three of the 33 touches"},
        {"key":"d_daily","label":"Add my daily name target to my calendar, not my memory"},
      ]},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
  "extra_script": """
(function(){
  var K=MREA;
  function paint(){
    var sides=K.nval('db_sides'), mix=K.nval('db_mix'), touch=K.nval('db_touch_cost')||0.50;
    var metNow=K.nval('db_met_now'), hmNow=K.nval('db_hm_now');
    if(!(sides>0)){
      ['stMet','stHM','stCost','stDaily'].forEach(function(i){K.stat(i,'—','');});
      K.verdict('dVerdict','','Enter your goal above',['This sizes the database your income actually requires.']);
      return;
    }
    if(!(mix>0)) mix=50;
    var metSales=sides*(mix/100), hmSales=sides-metSales;
    var metNeed=Math.ceil(metSales*6);         // 12:2
    var hmNeed=Math.ceil(hmSales*50);          // 50:1
    var metCost=metNeed*33*touch;              // 33 touches a year
    var hmCost=hmNeed*12*touch;                // 12 touches a year
    var gapMet=Math.max(0,metNeed-metNow), gapHM=Math.max(0,hmNeed-hmNow);
    var daily=(gapMet)/240;

    K.stat('stMet', K.cnt(metNeed,0), 'Met contacts needed', metNow>0?'you have '+K.cnt(metNow,0):'');
    K.stat('stHM', K.cnt(hmNeed,0), "Haven't Met needed", hmNow>0?'you have '+K.cnt(hmNow,0):'');
    K.stat('stCost', K.money(metCost+hmCost), 'Annual touch cost', 'at '+K.money(touch,2)+' per touch');
    K.stat('stDaily', daily>0?K.cnt(Math.max(1,Math.ceil(daily*10)/10),1):'0', 'Names to add per day', gapMet>0?'to close the Met gap in a year':'you&#x27;re there');

    K.$('met_needed').value=metNeed; K.$('hm_needed').value=hmNeed;
    K.$('daily_adds').value=K.round(daily,1);

    var lines=[], c, head;
    if(gapMet<=0&&gapHM<=0){
      c='ok'; head='Your database is already big enough';
      lines.push('At '+K.cnt(metNow,0)+' Met and '+K.cnt(hmNow,0)+" Haven't Met, you have the raw material for "+K.cnt(sides,0)+' sides.');
      lines.push('So if you are not hitting that number, the problem is not size — it is that the database is not being <i>worked</i>. Go straight to <b>Module 3.3 The 33 Touch Planner</b>.');
    } else {
      c = daily<=3?'warn':'bad';
      head = gapMet>0 ? K.cnt(gapMet,0)+' Met contacts short' : K.cnt(gapHM,0)+" Haven't Met contacts short";
      lines.push('To close '+K.cnt(sides,0)+' sides you need about <b>'+K.cnt(metNeed,0)+' Met</b> and <b>'+K.cnt(hmNeed,0)+" Haven't Met</b> contacts. Right now you are "+(gapMet>0?K.cnt(gapMet,0)+' short on the Met side':'')+(gapMet>0&&gapHM>0?' and ':'')+(gapHM>0?K.cnt(gapHM,0)+" short on Haven't Met":'')+'.');
      if(gapMet>0) lines.push('Closing the Met gap inside a year means adding about <b>'+K.cnt(Math.max(1,Math.ceil(daily*10)/10),1)+' names every working day</b>. That is one conversation at an open house, one person at a closing table, one name you already have in your phone and never entered.');
      if(gapHM>0) lines.push("The Haven't Met gap is faster to close — it is a list, not a relationship. Pick your farm and build to "+K.cnt(hmNeed,0)+' names, then run 12 Direct against it (Module 3.4).');
      lines.push('Budget check: working both programs at these sizes runs about <b>'+K.money(metCost+hmCost)+'</b> a year in touches.');
    }
    K.verdict('dVerdict', c, head, lines);
    K.publish({db_sides:sides, met_needed:metNeed, hm_needed:hmNeed,
      met_now:metNow, hm_now:hmNow, daily_adds:K.round(Math.max(0,daily),1),
      touch_budget:Math.round(metCost+hmCost)});
  }
  K.bind(['db_sides','db_mix','db_met_now','db_hm_now','db_touch_cost'], paint);
  MREA.metrics().then(function(m){
    var el=K.$('db_sides');
    if(el && !el.value && m && m.sides_needed){ el.value=m.sides_needed; paint(); }
  });
})();
"""
}

# ============================================================ 2.5
MODULES["2.5"] = {
  "file": "yrl-mrea-2-5-red-light.html",
  "eyebrow": "Phase 2 · Module 2.5",
  "chip": "Worksheet",
  "title": "Red Light, Green Light",
  "lede": "Spending money in this business isn&#x27;t risky. Spending money that never has to report back is. This is the discipline that turns every expense into an experiment with a verdict — and it is the reason careful agents can outspend cautious ones.",
  "sections": [
    {"n":"01","title":"The rule","blocks":[
      {"teach":"Add an expense. Then require that expense to produce a matching increase in results <b>before</b> you add the next one. Red light. You sit at that light until the result shows up. When it does, the light turns green and you may spend again."},
      {"teach":"That is the entire method, and it does something subtle: it converts risk into information. You are never guessing whether marketing works — you are running a sequence of small, cheap, answerable tests."},
      {"callout":"The failure mode is &ldquo;cost creep&rdquo; — expenses that rise steadily with no matching rise in results. It is rarely one bad decision. It is twelve small ones nobody ever went back and checked."},
    ]},
    {"n":"02","title":"Put one expense at the light","sub":"Pick something you are spending on now, or about to start.","blocks":[
      {"grid":[
        {"field":{"key":"rl_name","label":"The expense","ph":"Monthly farm mailer to 1,000 homes in Center Grove"}},
        {"field":{"key":"rl_cost","label":"Cost per month","money":True,"mode":"numeric","ph":"550"}},
      ]},
      {"grid":[
        {"field":{"key":"rl_result","label":"The result it must produce","hint":"a countable thing, not &ldquo;brand awareness&rdquo;","ph":"Listing appointments from that farm"}},
        {"field":{"key":"rl_target","label":"How many, per month","mode":"decimal","ph":"2"}},
      ]},
      {"grid":[
        {"field":{"key":"rl_by","label":"Judged by when","hint":"give it a fair run — 6 to 12 months for marketing","ph":"After 6 monthly mailings"}},
        {"field":{"key":"rl_value","label":"What one of those results is worth to me","hint":"your average GCI per side","money":True,"mode":"numeric","ph":"7500"}},
      ]},
    ]},
    {"n":"03","title":"The verdict","sub":"Come back and fill this in when the review date arrives.","blocks":[
      {"grid":[
        {"field":{"key":"rl_actual","label":"Results it actually produced (per month)","mode":"decimal","ph":"1.5"}},
        {"field":{"key":"rl_convert","label":"% of those that became closings","hint":"be strict","mode":"decimal","ph":"35"}},
      ]},
      {"raw":'<div class="mrea-stats">'
             '<div class="mrea-stat" id="stCPR"></div>'
             '<div class="mrea-stat" id="stReturn"></div>'
             '<div class="mrea-stat" id="stROI"></div>'
             '</div>'},
      {"raw":'<div class="mrea-verdict" id="rVerdict"><p class="vt">What this means</p><h3 class="vh">Fill in the expense above</h3><p class="vp">Then return at the review date and enter what it actually produced.</p></div>'},
    ]},
    {"n":"04","title":"Audit everything else","blocks":[
      {"teach":"Now do the uncomfortable part. List every recurring business expense you have. Beside each one, you should be able to say what it returns. Anything you can&#x27;t answer for goes to the red light next."},
      {"list":{"key":"rl_audit","title":"Every recurring expense I have","min":8,"ph":"e.g. CRM $99/mo · lead portal $400/mo · signs & riders · listing photography · farm mailer"}},
      {"checklist":[
        {"key":"r_one","label":"Change one thing at a time — simultaneous changes produce unreadable results"},
        {"key":"r_fair","label":"Give marketing a fair run before judging it — six to twelve months, not six weeks"},
        {"key":"r_fixed","label":"Keep fixed costs low so a slow quarter never forces me to cut lead generation"},
        {"key":"r_case","label":"Require a written economic case before any new recurring expense"},
      ]},
      {"textarea":{"key":"rl_kill","label":"The expense I&#x27;m putting at a red light this month","ph":"The paid lead portal — six months, and I cannot trace a single closing to it."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
  "extra_script": """
(function(){
  var K=MREA;
  function paint(){
    var cost=K.nval('rl_cost'), target=K.nval('rl_target'), value=K.nval('rl_value'),
        actual=K.nval('rl_actual'), conv=K.nval('rl_convert');
    if(!(cost>0)){
      ['stCPR','stReturn','stROI'].forEach(function(i){K.stat(i,'—','');});
      K.verdict('rVerdict','','Fill in the expense above',['Then return at the review date and enter what it actually produced.']);
      return;
    }
    if(!(actual>0)){
      K.stat('stCPR', target>0?K.money(cost/target):'—','Budgeted cost per result','what you&#x27;re paying for one');
      K.stat('stReturn','—','Monthly return','');
      K.stat('stROI','—','Return per dollar','');
      K.verdict('rVerdict','', 'Red light — awaiting the result',
        ['You are paying <b>'+K.money(cost)+'</b> a month expecting <b>'+K.cnt(target,1)+'</b> results'+(target>0?' — about '+K.money(cost/target)+' each':'')+'.',
         'Do not add another expense in this category until this one reports back. Come back on the review date and fill in section 03.']);
      return;
    }
    var cpr=cost/actual;
    var closings = actual*((conv>0?conv:100)/100);
    var ret = closings*value;
    var roi = cost>0 ? ret/cost : 0;
    K.stat('stCPR', K.money(cpr), 'Actual cost per result', target>0?'budgeted '+K.money(cost/target):'');
    K.stat('stReturn', K.money(ret), 'Monthly return', K.cnt(closings,1)+' closings/mo');
    K.stat('stROI', roi>0?K.round(roi,1)+'×':'—', 'Return per dollar', 'spent');
    var lines=[], c, head;
    if(roi>=3){
      c='ok'; head='Green light — spend more here';
      lines.push('Every dollar is returning about <b>'+K.round(roi,1)+'</b>. That is a real result, not a rounding error.');
      lines.push('Increase this expense by a defined increment and put it straight back at a red light. That is how you scale spending without ever gambling.');
    } else if(roi>=1.5){
      c='warn'; head='Amber — it works, but not brilliantly';
      lines.push('A return of <b>'+K.round(roi,1)+'×</b> is genuinely positive but leaves little room for error, and it will not survive a soft quarter.');
      lines.push('Before adding money, try improving it: better list, better offer, better follow-up speed. Same spend, better conversion, is the cheapest gain available.');
    } else if(roi>=1){
      c='warn'; head='Barely breaking even';
      lines.push('At <b>'+K.round(roi,1)+'×</b> you are trading a dollar for roughly a dollar, plus your time. If a dollar returns a dollar, keep the dollar.');
      lines.push('Give it one more defined cycle with a single change, then decide. No third cycle.');
    } else {
      c='bad'; head='Red light — stop this one';
      lines.push('This is returning <b>'+K.round(roi,1)+'×</b>. It is costing <b>'+K.money(cost)+'</b> a month to lose money slowly.');
      lines.push('Stop it, redirect the money to whatever is already working, and check in ninety days whether anything actually got worse. Usually nothing does — which is the finding.');
    }
    K.verdict('rVerdict', c, head, lines);
  }
  K.bind(['rl_cost','rl_target','rl_value','rl_actual','rl_convert'], paint);
  MREA.metrics().then(function(m){
    var el=K.$('rl_value');
    if(el && !el.value && m && m.gci_needed && m.sides_needed){
      el.value=Math.round(m.gci_needed/m.sides_needed); paint();
    }
  });
})();
"""
}
