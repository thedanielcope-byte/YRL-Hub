# -*- coding: utf-8 -*-
"""
The Millionaire Agent Path — Phase 3 (Build the Machine) and Phase 4 (Leverage).
Consumed by mrea_content.py → build_mrea_modules.py.

Every touch slot below points at an asset Your Realty Link already owns:
132 city buyer/seller guides under /resources/, 114 blog posts, the monthly
market update, the glossary, the vendor directory, curated community events on
62 city pages, and TourKit video.
"""

MODULES = {}

# ============================================================ 3.1
MODULES["3.1"] = {
  "file": "yrl-mrea-3-1-met-havent-met.html",
  "eyebrow": "Phase 3 · Module 3.1",
  "chip": "Worksheet",
  "title": "Met vs Haven&#x27;t Met",
  "lede": "Before you can run a touch program you have to know who you&#x27;re running it on. This is the sorting exercise — two buckets, one honest count, and a plan for the gap between what you have and what your income requires.",
  "sections": [
    {"n":"01","title":"Two buckets, that&#x27;s all","blocks":[
      {"teach":"<b>Met</b> is anyone who would recognise your name — past clients, sphere, people you&#x27;ve spoken with on the phone, anyone you&#x27;ve actually met. They produce repeat and referral business, which is the cheapest business there is."},
      {"teach":"<b>Haven&#x27;t Met</b> is a chosen audience that doesn&#x27;t know you yet — a geographic farm, a neighbourhood, a demographic list. They produce new business. It costs more per sale, but it scales without consuming your hours."},
      {"callout":"A cold form-fill that never turned into a conversation is <b>Haven&#x27;t Met</b>, no matter how it arrived. The test is simple: would they recognise your name? If not, they haven&#x27;t met you."},
    ]},
    {"n":"02","title":"Count what you actually have","sub":"Open the CRM and count. Estimating here defeats the entire point.","blocks":[
      {"raw":'<p class="teach" style="margin-bottom:4px"><b>Met</b></p>'},
      {"grid":[
        {"field":{"key":"c_past","label":"Past clients","mode":"numeric","ph":"45"}},
        {"field":{"key":"c_sphere","label":"Sphere — friends, family, neighbours","mode":"numeric","ph":"110"}},
      ]},
      {"grid":[
        {"field":{"key":"c_spoken","label":"Leads I&#x27;ve actually spoken with","mode":"numeric","ph":"60"}},
        {"field":{"key":"c_allied","label":"Allied resources","hint":"lenders, title, inspectors, contractors, agents","mode":"numeric","ph":"20"}},
      ]},
      {"raw":'<p class="teach" style="margin:18px 0 4px"><b>Haven&#x27;t Met</b></p>'},
      {"grid":[
        {"field":{"key":"c_farm","label":"Geographic farm addresses","mode":"numeric","ph":"0"}},
        {"field":{"key":"c_lists","label":"Other lists I hold","hint":"demographic, absentee owner, expired, etc.","mode":"numeric","ph":"0"}},
      ]},
      {"grid":[
        {"field":{"key":"c_goal_sides","label":"Closed sides I need per year","hint":"from Module 2.1","mode":"numeric","ph":"24"}},
        {"field":{"key":"c_mix","label":"% of that from the Met side","mode":"numeric","ph":"50"}},
      ]},
    ]},
    {"n":"03","title":"Where you stand","blocks":[
      {"raw":'<div class="mrea-stats">'
             '<div class="mrea-stat" id="stMetNow"></div>'
             '<div class="mrea-stat" id="stHMNow"></div>'
             '<div class="mrea-stat" id="stCapacity"></div>'
             '<div class="mrea-stat hot" id="stGap"></div>'
             '</div>'},
      {"raw":'<div class="mrea-verdict" id="sVerdict"><p class="vt">What this means</p><h3 class="vh">Count your two buckets</h3><p class="vp">The gap between what you have and what you need is the plan.</p></div>'},
      {"raw":'<input type="hidden" data-tiger="met_total" id="met_total"><input type="hidden" data-tiger="hm_total" id="hm_total">'},
    ]},
    {"n":"04","title":"Tag it, then feed it","blocks":[
      {"teach":"A count is useless if it lives on this page. Get the tags into the CRM so the touch programs can actually target them — and so next quarter&#x27;s count takes thirty seconds instead of an afternoon."},
      {"checklist":[
        {"key":"t_met","label":"Every contact tagged <b>met</b> or <b>havent-met</b> in the CRM"},
        {"key":"t_allied","label":"Allied resources tagged separately — they get one-on-one contact, not just mail"},
        {"key":"t_referred","label":"A <b>referred_by</b> field exists and gets filled in"},
        {"key":"t_dates","label":"Birthday and home-purchase-anniversary fields populated"},
        {"key":"t_dupes","label":"Duplicates merged and dead addresses removed"},
      ]},
      {"list":{"key":"met_forgot","title":"People who should be in Met and aren&#x27;t yet","min":6,"ph":"e.g. the buyers from the Greenwood closing last spring, my dentist, the couple from the Avon open house"}},
      {"textarea":{"key":"met_plan","label":"How I&#x27;m closing the gap","hint":"name the mechanism, not the intention","ph":"Two names a day from open houses and closings; build a 2,000-home farm in Southport by November."}},
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
    var met=K.nval('c_past')+K.nval('c_sphere')+K.nval('c_spoken')+K.nval('c_allied');
    var hm=K.nval('c_farm')+K.nval('c_lists');
    var sides=K.nval('c_goal_sides'), mix=K.nval('c_mix')||50;
    var capacity = (met/6) + (hm/50);
    K.$('met_total').value=met; K.$('hm_total').value=hm;
    K.stat('stMetNow', K.cnt(met,0), 'Met contacts', met>0?'worth ~'+K.cnt(met/6,1)+' sides/yr':'');
    K.stat('stHMNow', K.cnt(hm,0), "Haven't Met", hm>0?'worth ~'+K.cnt(hm/50,1)+' sides/yr':'');
    K.stat('stCapacity', K.cnt(capacity,1), 'Sides your database can produce', 'if worked properly');
    if(!(sides>0)){
      K.stat('stGap','—','Gap','enter your goal');
      K.verdict('sVerdict','', met>0?'Now enter your goal':'Count your two buckets',
        ['The gap between what you have and what you need is the plan.']);
      return;
    }
    var gap=sides-capacity;
    K.stat('stGap', gap>0?K.cnt(gap,1):'0', 'Sides short', gap>0?'from database size alone':'you have enough');
    var metNeed=Math.ceil(sides*(mix/100)*6), hmNeed=Math.ceil(sides*(1-mix/100)*50);
    var lines=[], c, head;
    if(gap<=0){
      c='ok'; head='Your database is big enough';
      lines.push('At '+K.cnt(met,0)+' Met and '+K.cnt(hm,0)+" Haven't Met, worked properly, this database supports about <b>"+K.cnt(capacity,1)+' sides</b> against a goal of '+K.cnt(sides,0)+'.');
      lines.push('So if the closings are not appearing, size is not your problem — <b>frequency</b> is. Nothing here produces anything until it is on a touch schedule. Go to <b>Module 3.3</b>.');
    } else {
      c = gap>sides*0.5 ? 'bad' : 'warn';
      head = K.cnt(gap,1)+' sides short on database size alone';
      lines.push('Your database currently supports about <b>'+K.cnt(capacity,1)+' sides</b> a year. You need <b>'+K.cnt(sides,0)+'</b>. No amount of skill closes that gap — there simply are not enough people in it.');
      lines.push('For your '+K.round(mix,0)+'/'+K.round(100-mix,0)+' mix you would need roughly <b>'+K.cnt(metNeed,0)+' Met</b> and <b>'+K.cnt(hmNeed,0)+" Haven't Met</b> contacts.");
      if(hm<100) lines.push("You have almost nothing on the Haven't Met side. That is the fastest gap to close, because it is a list rather than a relationship — pick a farm this month.");
      lines.push('List the people below who should already be in Met and are not. Most agents find between twenty and a hundred sitting in their phone.');
    }
    K.verdict('sVerdict', c, head, lines);
    K.publish({met_now:met, hm_now:hm, db_capacity_sides:K.round(capacity,1)});
  }
  K.bind(['c_past','c_sphere','c_spoken','c_allied','c_farm','c_lists','c_goal_sides','c_mix'], paint);
  MREA.metrics().then(function(m){
    if(!m) return;
    var g=K.$('c_goal_sides');
    if(g && !g.value && m.sides_needed){ g.value=m.sides_needed; }
    var mn=K.$('c_sphere');
    if(mn && !mn.value && m.met_now){ mn.value=m.met_now; }
    paint();
  });
})();
"""
}

# ============================================================ 3.2
MODULES["3.2"] = {
  "file": "yrl-mrea-3-2-eight-by-eight.html",
  "eyebrow": "Phase 3 · Module 3.2",
  "chip": "Builder",
  "title": "The 8&#215;8 Builder",
  "lede": "Eight touches in eight weeks — the minimum it takes to go from &ldquo;who?&rdquo; to &ldquo;my agent.&rdquo; Build yours here from what Your Realty Link already publishes, and stop losing new contacts to a three-email follow-up.",
  "sections": [
    {"n":"01","title":"Why eight, and why eight weeks","blocks":[
      {"teach":"Buyers and sellers hold room for almost no agents at all. Research on how people choose an agent shows most contact only one, and a further chunk contact two. You are first, second, or you are not in the conversation."},
      {"teach":"Eight touches across eight consecutive weeks is the observed minimum to form that bond. Not four. Not three. Anything shorter and the name fades before the need arrives — which in real estate can be a year later."},
      {"callout":"If your current follow-up is a three-email sequence, this module is the single highest-value change on the whole path. Same leads, same spend, more of them remembering you."},
    ]},
    {"n":"02","title":"Build your eight","sub":"Prefilled with YRL assets you already have. Change any of it — but keep eight, and keep weeks 4 and 8 as calls.","blocks":[
      {"raw":'<div class="mrea-months" id="eightRows"></div>'},
      {"raw":'<div class="mrea-counter"><span class="cn" id="eCount">0</span><div class="ct"><b id="eHead">Plan all eight weeks</b>'
             '<span id="eSub">Every touch needs something in it. Weeks 4 and 8 stay phone calls.</span>'
             '<span class="cbar"><i id="eBar"></i></span></div></div>'},
    ]},
    {"n":"03","title":"The two calls","sub":"These are the touches that do the work. Automate the reminder, never the call.","blocks":[
      {"script":{"tag":"Week 4 call","lines":[
        "Hi ___, it&#x27;s ___ with Your Realty Link. Did I catch you at a bad time?",
        "Did you happen to receive the market update I sent over? Have you had a chance to look at it?",
        "The reason I&#x27;m calling — I&#x27;m just checking in to see if you happen to know of anyone who might be buying or selling a home right now."]}},
      {"script":{"tag":"Week 8 call","lines":[
        "Hi ___, it&#x27;s ___ with Your Realty Link. Did I catch you at a bad time?",
        "Did you get the ___ I sent you? Any questions come up from it?",
        "I&#x27;ll keep sending you things I think are genuinely useful. I&#x27;d love to be your Realtor for life — and if you know anyone thinking about buying or selling, please pass my name along or send theirs to me."]}},
      {"callout":"Always send something physical before a call. It gives you an opening that isn&#x27;t &ldquo;just checking in&rdquo; — and &ldquo;did you get the ___ I sent?&rdquo; is a far easier sentence to say."},
    ]},
    {"n":"04","title":"Make it run without you","blocks":[
      {"checklist":[
        {"key":"e_crm","label":"Built as an automated sequence in the CRM"},
        {"key":"e_trigger","label":"Triggered by lead-magnet download, contact form, open-house sign-in, and every closing"},
        {"key":"e_calls","label":"Weeks 4 and 8 create a <b>task</b> for a human — never an automated send"},
        {"key":"e_ask","label":"Every touch carries the referral ask and how to refer"},
        {"key":"e_physical","label":"A physical item ordered for week 7 &mdash; <a href=\"yrl-mrea-marketing.html#giveaways\" style=\"color:#0f766e;font-weight:700\">eight options here</a> (local-numbers magnet recommended)"},
        {"key":"e_graduate","label":"On completion, the contact is tagged <b>met</b> and enrolled in 33 Touch"},
      ]},
      {"textarea":{"key":"e_gap","label":"What I still need before this can run","hint":"be specific — the thing that&#x27;s actually blocking it","ph":"The physical giveaway for week 7, and the CRM automation built."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
  "extra_script": """
(function(){
  var K=MREA, host=K.$('eightRows');
  var W=[
    ['Week 1','Intro letter + Janet bio + current market update + card','Mail — worth the postage'],
    ['Week 2','Their city&#x27;s buyer or seller guide from /resources/','Email'],
    ['Week 3','Their city&#x27;s community events + official calendar links','Email'],
    ['Week 4','PHONE CALL — did you get it, and who do you know?','Call — a human, always'],
    ['Week 5','A checklist: new construction, seller net sheet, buying process','Email'],
    ['Week 6','A glossary explainer or blog post matched to buyer vs seller','Email'],
    ['Week 7','Physical giveaway — local-numbers magnet, school/Indy Indians schedule, chip clip','Mail — see the 8 options in MREA Marketing'],
    ['Week 8','PHONE CALL — Realtor for life + the referral ask','Call — a human, always']
  ];
  W.forEach(function(w,i){
    var n=i+1, row=document.createElement('div');
    row.className='mrea-month';
    row.innerHTML='<div class="mn">'+n+'</div><div class="mf">'+
      '<input class="tiger-input" id="w'+n+'" data-tiger="w'+n+'" placeholder="'+w[1]+'">'+
      '<span class="hint">'+w[2]+'</span></div>';
    host.appendChild(row);
  });
  function paint(){
    var n=0; for(var i=1;i<=8;i++){ if(K.val('w'+i).trim()!=='') n++; }
    var cn=K.$('eCount'), bar=K.$('eBar');
    cn.textContent=n; cn.className='cn'+(n>=8?' done':'');
    bar.style.width=Math.min(100,n/8*100)+'%'; bar.className=(n>=8?'done':'');
    if(n>=8){ K.set('eHead','All eight weeks planned'); K.set('eSub','Now build it in the CRM. A plan on this page touches nobody.'); }
    else { K.set('eHead','Plan all eight weeks'); K.set('eSub',(8-n)+' to go. Empty fields use the suggested touch — type over any of them to make it yours.'); }
    K.publish({eight_by_eight_planned:n});
  }
  var ids=[]; for(var i=1;i<=8;i++) ids.push('w'+i);
  K.bind(ids, paint);
})();
"""
}

# ============================================================ 3.3
MODULES["3.3"] = {
  "file": "yrl-mrea-3-3-33-touch.html",
  "eyebrow": "Phase 3 · Module 3.3",
  "chip": "Planner",
  "title": "The 33 Touch Planner",
  "lede": "Thirty-three contacts a year with the people who already know you. Twelve isn&#x27;t enough to hold the top spot in someone&#x27;s mind; twenty-four might not be. Build your year here — the counter won&#x27;t go green until it adds up.",
  "sections": [
    {"n":"01","title":"What 33 touches buys you","blocks":[
      {"teach":"Worked properly, every <b>12 people</b> in your Met database produce about <b>2 closings a year</b> — one repeat, one referral. That ratio is the engine of a referral-based business, and it only holds at genuine frequency."},
      {"teach":"Frequency beats creativity here, and it isn&#x27;t close. Agents burn months designing the perfect piece when the stronger correlation is simply with how consistently and how often the message arrives."},
      {"callout":"Every touch — all thirty-three — carries a reminder that you work by referral and instructions on how to send you one. That is the mechanism. A touch that doesn&#x27;t ask is a greeting card."},
    ]},
    {"n":"02","title":"The mix","sub":"Adjust the counts if you like. The total has to reach 33.","blocks":[
      {"raw":'<div class="mrea-tablewrap"><table class="mrea-table"><thead><tr>'
             '<th>Touch type</th><th class="num" style="width:110px">How many</th><th>What it looks like at YRL</th>'
             '</tr></thead><tbody id="mixRows"></tbody></table></div>'},
      {"raw":'<div class="mrea-counter"><span class="cn" id="tCount">0</span><div class="ct"><b id="tHead">Build to 33</b>'
             '<span id="tSub">Adjust the counts until they total exactly 33.</span>'
             '<span class="cbar"><i id="tBar"></i></span></div></div>'},
      {"raw":'<input type="hidden" data-tiger="touch_total" id="touch_total">'},
    ]},
    {"n":"03","title":"Your twelve months","sub":"Prefilled with a working year built from what YRL already publishes. Make it yours.","blocks":[
      {"raw":'<div class="mrea-months" id="monthRows"></div>'},
      {"raw":'<p class="mrea-note"><i class="fa-solid fa-circle-info"></i> Schedule all of it in January, in one sitting. A year planned once takes an afternoon; a year planned monthly never actually happens.</p>'},
    ]},
    {"n":"04","title":"What it&#x27;s worth","blocks":[
      {"grid":[
        {"field":{"key":"t_met","label":"People in my Met database","mode":"numeric","ph":"300"}},
        {"field":{"key":"t_cost","label":"Average cost per touch","mode":"decimal","ph":"0.50"}},
      ]},
      {"raw":'<div class="mrea-stats">'
             '<div class="mrea-stat" id="stExpected"></div>'
             '<div class="mrea-stat" id="stTouchCost"></div>'
             '<div class="mrea-stat" id="stPerSale"></div>'
             '</div>'},
      {"raw":'<div class="mrea-verdict" id="tVerdict"><p class="vt">What this means</p><h3 class="vh">Enter your database size</h3><p class="vp">The 12:2 ratio turns a contact count into an expected number of closings.</p></div>'},
    ]},
    {"n":"05","title":"Make it real","blocks":[
      {"checklist":[
        {"key":"t_sched","label":"All 33 scheduled in the CRM in one sitting"},
        {"key":"t_news","label":"The monthly market update wired into the newsletter automation — that&#x27;s 12 of the 18 value touches"},
        {"key":"t_mag","label":"Quarterly Canva magazine template built — that&#x27;s 4 more"},
        {"key":"t_dates","label":"Birthday, spouse birthday and home-anniversary fields populated"},
        {"key":"t_precall","label":"A physical mailing lands before each of the 3 calls"},
        {"key":"t_ask","label":"Referral ask and instructions on every single touch"},
      ]},
      {"textarea":{"key":"t_block","label":"When I do this work each week","hint":"a real slot on a real calendar","ph":"Friday 9–10am — touch prep for the following week, no exceptions."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
  "extra_script": """
(function(){
  var K=MREA;
  var MIX=[
    ['Value touches','18','v','Monthly market update ×12 · quarterly magazine ×4 · summer recap · year in review'],
    ['Thank-you / thinking-of-you cards','8','c','New Year · spring · summer · back-to-school · fall · Thanksgiving · holiday · home anniversary'],
    ['Phone calls','3','p','Q1 year-ahead · mid-year recap · year-end equity &amp; tax timing'],
    ['Birthday cards','2','b','Both spouses, on the date'],
    ["Mother's Day",'1','m',''],
    ["Father's Day",'1','f','']
  ];
  var host=K.$('mixRows');
  MIX.forEach(function(r){
    var tr=document.createElement('tr');
    tr.innerHTML='<td><b>'+r[0]+'</b></td>'+
      '<td class="num"><input class="tiger-input" id="mx_'+r[2]+'" data-tiger="mx_'+r[2]+'" inputmode="numeric" placeholder="'+r[1]+'" value=""></td>'+
      '<td style="font-size:12.5px;color:#5a6270">'+r[3]+'</td>';
    host.appendChild(tr);
  });

  var MONTHS=[
    ['JAN','Market update · Q1 magazine · New Year card · CALL #1'],
    ['FEB','Market update'],
    ['MAR','Market update · spring home-maintenance card'],
    ['APR','Market update · Q2 magazine'],
    ['MAY','Market update · Mother&#x27;s Day card'],
    ['JUN','Market update · summer card · Father&#x27;s Day card · CALL #2'],
    ['JUL','Market update · summer market recap'],
    ['AUG','Market update · back-to-school card'],
    ['SEP','Market update · Q3 magazine'],
    ['OCT','Market update · fall home-prep card'],
    ['NOV','Market update · Thanksgiving card · CALL #3'],
    ['DEC','Market update · Q4 magazine · year in review · holiday card']
  ];
  var mh=K.$('monthRows');
  MONTHS.forEach(function(m,i){
    var n=i+1, row=document.createElement('div');
    row.className='mrea-month';
    row.innerHTML='<div class="mn">'+m[0]+'</div><div class="mf">'+
      '<input class="tiger-input" id="mo'+n+'" data-tiger="mo'+n+'" placeholder="'+m[1]+'"></div>';
    mh.appendChild(row);
  });

  function mixVal(k, dflt){ var v=K.val('mx_'+k); return v.trim()===''?dflt:K.num(v); }
  function paint(){
    var total = mixVal('v',18)+mixVal('c',8)+mixVal('p',3)+mixVal('b',2)+mixVal('m',1)+mixVal('f',1);
    var cn=K.$('tCount'), bar=K.$('tBar');
    cn.textContent=total;
    cn.className='cn'+(total===33?' done':(total>33?' over':''));
    bar.style.width=Math.min(100,total/33*100)+'%';
    bar.className=(total===33?'done':'');
    if(total===33){ K.set('tHead','That&#x27;s 33 — the year is built'); K.set('tSub','Now schedule every one of them in the CRM, in one sitting.'); }
    else if(total>33){ K.set('tHead',total+' touches — more than 33'); K.set('tSub','Over is fine and costs a little more. Under is the failure mode, not over.'); }
    else { K.set('tHead','Only '+total+' touches planned'); K.set('tSub',(33-total)+' short. Twelve a year will not hold the top spot in anyone&#x27;s mind.'); }
    var h=K.$('touch_total'); if(h) h.value=total;

    var met=K.nval('t_met'), cost=K.nval('t_cost')||0.50;
    if(met>0){
      var sales=met/6, annual=met*total*cost, per=sales>0?annual/sales:0;
      K.stat('stExpected', K.cnt(sales,1), 'Closings a year', 'at the 12:2 ratio');
      K.stat('stTouchCost', K.money(annual), 'Annual cost', K.cnt(met,0)+' × '+total+' touches');
      K.stat('stPerSale', K.money(per), 'Cost per closing', '');
      var c = per<=250?'ok':(per<=450?'warn':'bad');
      K.verdict('tVerdict', c, K.cnt(sales,1)+' closings from '+K.cnt(met,0)+' people',
        ['Touching '+K.cnt(met,0)+' people '+total+' times a year runs about <b>'+K.money(annual)+'</b> and should produce roughly <b>'+K.cnt(sales,1)+' closings</b> — about '+K.money(per)+' each.',
         'That is the cheapest business in real estate, and it is the reason the database is worth protecting. Half of it arrives as referrals you never had to advertise for.',
         total!==33?'Your mix currently totals '+total+', not 33. Fix that above before you build it.':'Your mix totals 33. Go schedule it.']);
    } else {
      ['stExpected','stTouchCost','stPerSale'].forEach(function(i){K.stat(i,'—','');});
      K.verdict('tVerdict','','Enter your database size',['The 12:2 ratio turns a contact count into an expected number of closings.']);
    }
    K.publish({touch_total:total, touch_met:met});
  }
  var ids=['mx_v','mx_c','mx_p','mx_b','mx_m','mx_f','t_met','t_cost'];
  for(var i=1;i<=12;i++) ids.push('mo'+i);
  K.bind(ids, paint);
  MREA.metrics().then(function(m){
    var el=K.$('t_met');
    if(el && !el.value && m && (m.met_now||m.met_needed)){ el.value=m.met_now||m.met_needed; paint(); }
  });
})();
"""
}

# ============================================================ 3.4
MODULES["3.4"] = {
  "file": "yrl-mrea-3-4-12-direct.html",
  "eyebrow": "Phase 3 · Module 3.4",
  "chip": "Planner",
  "title": "The 12 Direct Planner",
  "lede": "Twelve mailings a year to people who don&#x27;t know you yet. It costs more per closing than working your sphere and it has one enormous advantage: it scales without using up your hours. Pick the farm, design the year once, let it run.",
  "sections": [
    {"n":"01","title":"The trade you&#x27;re making","blocks":[
      {"teach":"For every <b>50 people</b> you mail 12 times a year, expect about <b>1 closing</b>. Worse than the 12:2 you get from your sphere — but you can run it against five thousand people without adding an hour to your week."},
      {"teach":"That is the whole reason it matters. Sphere marketing is limited by your personal capacity. Farm marketing is limited only by budget. An agent who wants to eventually step back from daily selling needs the second kind."},
      {"callout":"Pick the farm where Your Realty Link is already strong online — the city pages with real maps, curated community events and local blog coverage. Mail plus a deep local page beats mail alone. Don&#x27;t scatter across six towns."},
    ]},
    {"n":"02","title":"Your farm","blocks":[
      {"grid":[
        {"field":{"key":"f_area","label":"The farm","hint":"a named neighbourhood or town, not &ldquo;the south side&rdquo;","ph":"Center Grove / White River Township"}},
        {"field":{"key":"f_size","label":"Addresses in it","mode":"numeric","ph":"1800"}},
      ]},
      {"grid":[
        {"field":{"key":"f_turn","label":"Homes that sell there per year","hint":"roughly — ask Janet to pull it from MIBOR","mode":"numeric","ph":"110"}},
        {"field":{"key":"f_cost","label":"Cost per mailed piece","hint":"print + postage","mode":"decimal","ph":"0.55"}},
      ]},
      {"raw":'<div class="mrea-stats">'
             '<div class="mrea-stat" id="stFarmSales"></div>'
             '<div class="mrea-stat" id="stFarmCost"></div>'
             '<div class="mrea-stat" id="stFarmPer"></div>'
             '<div class="mrea-stat" id="stFarmShare"></div>'
             '</div>'},
      {"raw":'<div class="mrea-verdict" id="fVerdict"><p class="vt">What this means</p><h3 class="vh">Describe your farm</h3><p class="vp">Size and cost decide whether this program is worth running at all.</p></div>'},
    ]},
    {"n":"03","title":"The twelve pieces","sub":"Prefilled with a year built from pages YRL already has live. Every piece should drive somewhere real.","blocks":[
      {"raw":'<div class="mrea-months" id="directRows"></div>'},
      {"raw":'<div class="mrea-counter"><span class="cn" id="dCount">0</span><div class="ct"><b id="dHead">Plan all twelve</b>'
             '<span id="dSub">Design and schedule the whole year at once, then leave it alone.</span>'
             '<span class="cbar"><i id="dBar"></i></span></div></div>'},
    ]},
    {"n":"04","title":"Before you mail a thing","blocks":[
      {"checklist":[
        {"key":"f_pages","label":"Every piece drives to a page that already exists — city guide, market update, vendors, valuation"},
        {"key":"f_track","label":"A trackable destination on each piece so I can source the response"},
        {"key":"f_all","label":"All twelve designed and scheduled in one sitting"},
        {"key":"f_year","label":"Committed to a full twelve months before judging results"},
        {"key":"f_crm","label":"Farm list loaded into the CRM tagged <b>havent-met</b>"},
      ]},
      {"callout":"Give it the full year. Farm marketing that gets cancelled in month four has cost you everything and bought you nothing — the response curve is back-loaded, because you are waiting for people to need you."},
      {"textarea":{"key":"f_commit","label":"My farm commitment","ph":"1,800 homes in Center Grove, 12 pieces, ~$12,000 for the year, judged in December."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
  "extra_script": """
(function(){
  var K=MREA;
  var P=[
    ['JAN','Year in Review — what homes sold for here last year (ranges only)'],
    ['FEB','Just Listed / Just Sold card'],
    ['MAR','&ldquo;3 things that decide your sale price&rdquo; — spring selling season'],
    ['APR','Neighbourhood market snapshot'],
    ['MAY','Just Listed / Just Sold card'],
    ['JUN','&ldquo;Sell now or wait?&rdquo; — drives to the home valuation'],
    ['JUL','Community events calendar for the area — the fridge piece'],
    ['AUG','Just Listed / Just Sold card'],
    ['SEP','Fall market snapshot'],
    ['OCT','Your home&#x27;s equity + tax-timing prep'],
    ['NOV','Trusted local vendor directory card'],
    ['DEC','Holiday card + next-year outlook']
  ];
  var host=K.$('directRows');
  P.forEach(function(p,i){
    var n=i+1, row=document.createElement('div');
    row.className='mrea-month';
    row.innerHTML='<div class="mn">'+p[0]+'</div><div class="mf">'+
      '<input class="tiger-input" id="d'+n+'" data-tiger="d'+n+'" placeholder="'+p[1]+'"></div>';
    host.appendChild(row);
  });
  function paint(){
    var n=0; for(var i=1;i<=12;i++){ if(K.val('d'+i).trim()!=='') n++; }
    var cn=K.$('dCount'), bar=K.$('dBar');
    cn.textContent=n; cn.className='cn'+(n>=12?' done':'');
    bar.style.width=Math.min(100,n/12*100)+'%'; bar.className=(n>=12?'done':'');
    if(n>=12){ K.set('dHead','All twelve planned'); K.set('dSub','Design them, schedule them, then leave the program alone for a year.'); }
    else { K.set('dHead','Plan all twelve'); K.set('dSub',(12-n)+' to go. Empty rows use the suggested piece.'); }

    var size=K.nval('f_size'), cost=K.nval('f_cost')||0.55, turn=K.nval('f_turn');
    if(size>0){
      var sales=size/50, annual=size*12*cost, per=sales>0?annual/sales:0;
      K.stat('stFarmSales', K.cnt(sales,1), 'Closings a year', 'at the 50:1 ratio');
      K.stat('stFarmCost', K.money(annual), 'Annual cost', K.cnt(size,0)+' × 12 pieces');
      K.stat('stFarmPer', K.money(per), 'Cost per closing', '');
      K.stat('stFarmShare', turn>0?K.round(sales/turn*100,1)+'%':'—', 'Share of the farm', turn>0?'of '+K.cnt(turn,0)+' sales/yr':'enter annual turnover');
      var c = per<=600?'ok':(per<=900?'warn':'bad');
      var lines=['A farm of <b>'+K.cnt(size,0)+'</b> mailed twelve times runs about <b>'+K.money(annual)+'</b> a year and should produce roughly <b>'+K.cnt(sales,1)+' closings</b> — about '+K.money(per)+' each.'];
      if(turn>0){
        var share=sales/turn*100;
        if(share>18) lines.push('That would be about '+K.round(share,1)+'% of everything that sells there — an ambitious share for a farm you are just starting. Treat the first year as buying recognition, not closings.');
        else lines.push('That is roughly '+K.round(share,1)+'% of the homes that sell there each year — a realistic target for a consistently worked farm.');
      }
      if(size<1000) lines.push('Under a thousand addresses the ratio gets lumpy — one good year and one empty one. If budget allows, build toward 1,500–2,500 before judging the program.');
      lines.push('Compare this against your sphere: Met business costs a fraction of this per closing. Farm marketing earns its place by scaling without your hours, not by being cheap.');
      K.verdict('fVerdict', c, K.cnt(sales,1)+' closings a year from this farm', lines);
      K.publish({farm_size:size, farm_cost:Math.round(annual), farm_sales:K.round(sales,1)});
    } else {
      ['stFarmSales','stFarmCost','stFarmPer','stFarmShare'].forEach(function(i){K.stat(i,'—','');});
      K.verdict('fVerdict','','Describe your farm',['Size and cost decide whether this program is worth running at all.']);
    }
  }
  var ids=['f_size','f_cost','f_turn'];
  for(var i=1;i<=12;i++) ids.push('d'+i);
  K.bind(ids, paint);
})();
"""
}

# ============================================================ 3.5
MODULES["3.5"] = {
  "file": "yrl-mrea-3-5-lead-source-audit.html",
  "eyebrow": "Phase 3 · Module 3.5",
  "chip": "Audit",
  "title": "Lead Source Audit",
  "lede": "Almost any lead source can work — just not every source, for every agent, in every market. The only way to know which ones work for you is to put cost, leads and closings side by side and let the arithmetic pick the winners.",
  "sections": [
    {"n":"01","title":"You cannot manage what you don&#x27;t source","blocks":[
      {"teach":"Every lead has to be <b>captured</b> (who, and how do we reach them), <b>sourced</b> (where did it come from), <b>assigned</b> (who owns the follow-up) and <b>stored</b> (where do we find it again). Miss the sourcing step and you are spending blind forever."},
      {"teach":"The reward for tracking is that you stop arguing about marketing and start reading it. Ranked cost-per-closing turns a matter of opinion into a matter of record."},
      {"callout":"Give any new source six to twelve months before you judge it. Marketing response is back-loaded — you are waiting for people to need you, and that timing is theirs, not yours."},
    ]},
    {"n":"02","title":"Last twelve months, by source","sub":"Annual cost, leads received, and closings you can actually trace back. Leave rows blank if they don&#x27;t apply.","blocks":[
      {"raw":'<div class="mrea-tablewrap"><table class="mrea-table"><thead><tr>'
             '<th style="min-width:150px">Source</th><th class="num" style="width:110px">Annual cost</th>'
             '<th class="num" style="width:92px">Leads</th><th class="num" style="width:92px">Closings</th>'
             '<th class="num" style="width:104px">Per closing</th>'
             '</tr></thead><tbody id="srcRows"></tbody></table></div>'},
      {"raw":'<div class="mrea-stats">'
             '<div class="mrea-stat" id="stSpend"></div>'
             '<div class="mrea-stat" id="stLeads"></div>'
             '<div class="mrea-stat" id="stClose"></div>'
             '<div class="mrea-stat good" id="stBlended"></div>'
             '</div>'},
      {"raw":'<div class="mrea-verdict" id="srcVerdict"><p class="vt">What this means</p><h3 class="vh">Fill in your sources</h3><p class="vp">Cost per closing ranks them for you.</p></div>'},
    ]},
    {"n":"03","title":"Fix the tracking itself","blocks":[
      {"teach":"If most of your rows read &ldquo;I don&#x27;t know,&rdquo; that is the finding — and it is fixable in a fortnight. Your website already stamps a source on every form submission; what&#x27;s usually missing is assignment and outcome."},
      {"checklist":[
        {"key":"src_source","label":"Every form and call captures where the lead came from"},
        {"key":"src_specific","label":"Source values are specific enough to act on — not one bucket called &ldquo;website&rdquo;"},
        {"key":"src_assign","label":"Every lead is assigned to a person, with a timestamp"},
        {"key":"src_outcome","label":"Every lead gets an outcome: appointment / agreement / closed / dead"},
        {"key":"src_report","label":"A monthly report shows leads → appointments → closings <b>by source</b>"},
        {"key":"src_speed","label":"First-contact speed is measured — it moves conversion more than lead quality does"},
      ]},
    ]},
    {"n":"04","title":"Decide something","blocks":[
      {"teach":"An audit that changes no spending was a nice afternoon. Name the source you are cutting and the one you are feeding."},
      {"grid":[
        {"field":{"key":"src_cut","label":"Source I&#x27;m cutting or pausing","ph":"Paid portal leads"}},
        {"field":{"key":"src_feed","label":"Source I&#x27;m putting that money into","ph":"Farm mailer + sphere touches"}},
      ]},
      {"textarea":{"key":"src_why","label":"What I&#x27;ll watch to know if I was wrong","hint":"Red Light, Green Light — give it a review date","ph":"If listing appointments drop below 3/month by January, I&#x27;ll revisit."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
  "extra_script": """
(function(){
  var K=MREA, host=K.$('srcRows');
  var SRC=['Sphere / past clients','Geographic farm mail','Website &amp; SEO','Open houses',
           'Social media','Paid portal leads','Signs &amp; sign calls','Agent referrals',
           'Community / sponsorship','Other'];
  SRC.forEach(function(s,i){
    var n=i+1, tr=document.createElement('tr');
    tr.innerHTML='<td><input class="tiger-input" id="s'+n+'n" data-tiger="s'+n+'n" placeholder="'+s+'"></td>'+
      '<td class="num"><input class="tiger-input" id="s'+n+'c" data-tiger="s'+n+'c" inputmode="numeric" placeholder="0"></td>'+
      '<td class="num"><input class="tiger-input" id="s'+n+'l" data-tiger="s'+n+'l" inputmode="numeric" placeholder="0"></td>'+
      '<td class="num"><input class="tiger-input" id="s'+n+'x" data-tiger="s'+n+'x" inputmode="decimal" placeholder="0"></td>'+
      '<td class="num out" id="s'+n+'r">—</td>';
    host.appendChild(tr);
  });
  function paint(){
    var tc=0,tl=0,tx=0,best=null,worst=null;
    for(var i=1;i<=SRC.length;i++){
      var c=K.nval('s'+i+'c'), l=K.nval('s'+i+'l'), x=K.nval('s'+i+'x');
      var name=K.val('s'+i+'n').trim()||SRC[i-1].replace(/&amp;/g,'&');
      tc+=c; tl+=l; tx+=x;
      var cell=K.$('s'+i+'r');
      if(x>0){
        var per=c/x;
        cell.textContent=K.money(per);
        cell.style.color = per<=300?'#2e9e5b':(per<=800?'#c2820b':'#c03926');
        if(c>0){
          if(best===null||per<best.per) best={name:name,per:per,x:x};
          if(worst===null||per>worst.per) worst={name:name,per:per,c:c,x:x};
        }
      } else if(c>0){
        cell.textContent='no closings';
        cell.style.color='#c03926';
        if(worst===null||Infinity>worst.per) worst={name:name,per:Infinity,c:c,x:0};
      } else { cell.textContent='—'; cell.style.color='#9ca3af'; }
    }
    K.stat('stSpend', tc>0?K.money(tc):'—','Total spend','last 12 months');
    K.stat('stLeads', tl>0?K.cnt(tl,0):'—','Leads received', tl>0&&tc>0?K.money(tc/tl)+' each':'');
    K.stat('stClose', tx>0?K.cnt(tx,1):'—','Closings traced','');
    K.stat('stBlended', tx>0&&tc>0?K.money(tc/tx):'—','Blended cost per closing','');
    if(!(tc>0)){ K.verdict('srcVerdict','','Fill in your sources',['Cost per closing ranks them for you.']); return; }
    var lines=[], c='', head;
    if(tx<=0){
      c='bad'; head='You cannot trace a single closing to a source';
      lines.push('You spent <b>'+K.money(tc)+'</b> last year and no closing is attributed to any of it. That is not a spending problem — it is a tracking problem, and it is why every marketing decision currently feels like a guess.');
      lines.push('Fix the four steps in section 03 before changing a single line of spend. You cannot cut wisely without data.');
    } else {
      head='Blended cost per closing: '+K.money(tc/tx);
      if(best) lines.push('Your best source is <b>'+best.name+'</b> at '+K.money(best.per)+' per closing. That is where additional money goes first — and it goes in increments, with a review date.');
      if(worst && worst.per>(best?best.per*3:900)){
        c='warn';
        lines.push('Your worst is <b>'+worst.name+'</b> at '+(worst.per===Infinity?'no traced closings at all despite '+K.money(worst.c)+' spent':K.money(worst.per)+' per closing')+'. Put it at a red light: one defined cycle to improve, then cut it.');
      } else { c='ok'; lines.push('Nothing here is wildly out of line, which is rarer than you&#x27;d think. Keep the tracking running and re-audit each quarter.'); }
      if(tl>0) lines.push('Across everything you paid about <b>'+K.money(tc/tl)+' per lead</b> and converted '+K.round(tx/tl*100,1)+'% of them. If that conversion looks low, the fix is Module 2.2 — not more leads.');
    }
    K.verdict('srcVerdict', c, head, lines);
    K.publish({source_spend:Math.round(tc), source_leads:Math.round(tl),
               source_closings:K.round(tx,1), cost_per_closing: tx>0?Math.round(tc/tx):null});
  }
  var ids=[]; for(var i=1;i<=SRC.length;i++){ids.push('s'+i+'c');ids.push('s'+i+'l');ids.push('s'+i+'x');ids.push('s'+i+'n');}
  K.bind(ids, paint);
})();
"""
}

# ============================================================ 3.6
MODULES["3.6"] = {
  "file": "yrl-mrea-3-6-listing-engine.html",
  "eyebrow": "Phase 3 · Module 3.6",
  "chip": "Checklist",
  "title": "Listings as a Lead Engine",
  "lede": "A listing has two jobs. Selling the house is only the first one. The second — producing the next buyer and the next seller — is the one agents quietly skip in a fast market, and it is worth more than the commission on the house itself.",
  "sections": [
    {"n":"01","title":"The second job","blocks":[
      {"teach":"A properly marketed listing should generate about <b>one closed buyer</b> on its own. Sign calls, open house visitors, flyer-box inquiries, mailer responses — all of it is lead generation you have already paid for."},
      {"teach":"This is also why listings beat buyers economically. They take less of your time per dollar, they give you control of your schedule, and they advertise you to everyone who drives past. Buyers, by comparison, generate almost no marketing at all."},
      {"callout":"The failure mode is a hot market. The house sells in four days, everyone celebrates, and nobody captured a single lead from it. Your checklist has to survive your own get-it-sold instincts — that&#x27;s what a checklist is <i>for</i>."},
    ]},
    {"n":"02","title":"The marketing plan — every listing, every time","sub":"Adapted for the tools Your Realty Link actually has. Run all of it whether the market is hot or cold.","blocks":[
      {"checklist":[
        {"key":"lm_01","label":"<b>Staging and pricing strategy</b> agreed with the seller in writing"},
        {"key":"lm_02","label":"<b>For-sale sign, riders and directional signs</b> — with a trackable number or URL"},
        {"key":"lm_03","label":"<b>Flyer box / tube</b> stocked, plus flyers distributed in the neighbourhood"},
        {"key":"lm_04","label":"<b>Flyers in the home</b>, home book, and comment cards"},
        {"key":"lm_05","label":"<b>MIBOR MLS</b> — complete, accurate, every field filled"},
        {"key":"lm_06","label":"<b>Professional photos</b> and a <b>TourKit video</b> — landscape and portrait cuts"},
        {"key":"lm_07","label":"<b>Website listing</b> with virtual tour, placed on the relevant city page"},
        {"key":"lm_08","label":"<b>Open house programme</b> scheduled — not a single Sunday"},
        {"key":"lm_09","label":"<b>Email / social broadcast</b> to the database and the farm"},
        {"key":"lm_10","label":"<b>Just Listed</b> mailer to the surrounding streets"},
        {"key":"lm_11","label":"<b>Google Business Profile post</b> for the listing"},
        {"key":"lm_12","label":"<b>Showings tracked and feedback collected</b>, shared with the seller weekly"},
        {"key":"lm_13","label":"<b>Weekly seller update</b> — same day each week, without being chased"},
        {"key":"lm_14","label":"<b>Just Sold</b> mailer after closing — the listing keeps working after it sells"},
      ]},
    ]},
    {"n":"03","title":"The lead-capture steps most agents skip","sub":"This is the half that turns a listing into an engine rather than a transaction.","blocks":[
      {"checklist":[
        {"key":"lc_1","label":"Sign calls captured into the CRM with the property in the tags"},
        {"key":"lc_2","label":"Open house sign-in posts into the CRM — not a paper sheet in a drawer"},
        {"key":"lc_3","label":"Every captured lead enters the 8&#215;8 programme the same week"},
        {"key":"lc_4","label":"Buyers who don&#x27;t want <i>this</i> house get redirected to other listings"},
        {"key":"lc_5","label":"Post-sale inquiries still get captured and redirected — the calls keep coming"},
        {"key":"lc_6","label":"Neighbours who ask &ldquo;what did it go for?&rdquo; get logged as seller leads"},
      ]},
      {"raw":'<div class="mrea-stats">'
             '<div class="mrea-stat" id="stListings"></div>'
             '<div class="mrea-stat" id="stBuyers"></div>'
             '<div class="mrea-stat good" id="stExtra"></div>'
             '</div>'},
      {"grid":[
        {"field":{"key":"le_listings","label":"Listings I take per year","mode":"numeric","ph":"18"}},
        {"field":{"key":"le_buyers","label":"Buyers I currently close from those listings","mode":"numeric","ph":"4"}},
      ]},
      {"field":{"key":"le_gci","label":"My average GCI per closed side","money":True,"mode":"numeric","ph":"7500"}},
      {"raw":'<div class="mrea-verdict" id="leVerdict"><p class="vt">What this means</p><h3 class="vh">Enter your listing count</h3><p class="vp">One well-marketed listing should produce about one closed buyer.</p></div>'},
    ]},
    {"n":"04","title":"Make it a system, not a memory","blocks":[
      {"checklist":[
        {"key":"ls_attach","label":"This checklist is attached to every listing file and signed off"},
        {"key":"ls_hot","label":"It runs in full even when the house sells in days"},
        {"key":"ls_owner","label":"Someone other than me is accountable for the capture steps"},
        {"key":"ls_review","label":"Reviewed at every closing: how many leads did this listing produce?"},
      ]},
      {"textarea":{"key":"le_gap","label":"The step I know I skip","hint":"everyone has one","ph":"Open house sign-ins — they end up on paper and never make the CRM."}},
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
    var L=K.nval('le_listings'), B=K.nval('le_buyers'), G=K.nval('le_gci');
    if(!(L>0)){
      ['stListings','stBuyers','stExtra'].forEach(function(i){K.stat(i,'—','');});
      K.verdict('leVerdict','','Enter your listing count',['One well-marketed listing should produce about one closed buyer.']);
      return;
    }
    var target=L, missing=Math.max(0,target-B);
    K.stat('stListings', K.cnt(L,0), 'Listings a year', '');
    K.stat('stBuyers', K.cnt(B,0), 'Buyers from them now', K.round(L>0?B/L*100:0,0)+'% of target');
    K.stat('stExtra', missing>0?K.cnt(missing,0):'0', 'Buyers left on the table', G>0&&missing>0?'worth '+K.money(missing*G):'');
    var lines=[], c, head;
    if(missing<=0){
      c='ok'; head='Your listings are pulling their weight';
      lines.push('You are converting '+K.cnt(B,0)+' buyers from '+K.cnt(L,0)+' listings. That is the ratio the model expects, and most agents never get near it.');
      lines.push('The next gain is upstream — more listings, not better harvesting. Check your listings-taken number in <b>Module 2.1</b>.');
    } else {
      c = missing>L*0.5 ? 'bad' : 'warn';
      head = missing===1 ? 'One buyer left on the table' : K.cnt(missing,0)+' buyers left on the table';
      lines.push('Your '+K.cnt(L,0)+' listings should be producing about '+K.cnt(target,0)+' closed buyers. They are producing '+K.cnt(B,0)+'.');
      if(G>0) lines.push('At '+K.money(G)+' per side that gap is worth roughly <b>'+K.money(missing*G)+'</b> a year — from marketing you have already paid for and leads that are already calling you.');
      lines.push('Look at section 03. It is almost never the marketing that&#x27;s missing; it is the capture. Sign calls that go to voicemail, open house sheets that stay on paper, neighbours who ask what it sold for and never get logged.');
    }
    K.verdict('leVerdict', c, head, lines);
    K.publish({listings_yr:L, buyers_from_listings:B, listing_buyer_gap:missing});
  }
  K.bind(['le_listings','le_buyers','le_gci'], paint);
  MREA.metrics().then(function(m){
    if(!m) return;
    var g=K.$('le_gci');
    if(g && !g.value && m.gci_needed && m.sides_needed) g.value=Math.round(m.gci_needed/m.sides_needed);
    var l=K.$('le_listings');
    if(l && !l.value && m.listings_taken_mo) l.value=Math.round(m.listings_taken_mo*12);
    paint();
  });
})();
"""
}

# ============================================================ 3.7
MODULES["3.7"] = {
  "file": "yrl-mrea-3-7-referral-loop.html",
  "eyebrow": "Phase 3 · Module 3.7",
  "chip": "Worksheet",
  "title": "The Referral Reward Loop",
  "lede": "Most agents reward referrals that close. That quietly trains your sphere to screen people before sending them — which is not their job and not what you want. Reward the <i>act</i> of referring, and design the system here.",
  "sections": [
    {"n":"01","title":"Educate, ask, reward","blocks":[
      {"teach":"<b>Educate.</b> Every contact reminds people that you sell real estate, that you&#x27;re good at it, and that you prefer to work by referral. Most of your sphere genuinely does not know that last part."},
      {"teach":"<b>Ask for help.</b> Directly. &ldquo;If you know anyone thinking about buying or selling, please share their name with me or my name with them.&rdquo; Not implied — asked."},
      {"teach":"<b>Reward.</b> Immediately, and for the referral itself. This is the part almost everybody gets wrong."},
      {"callout":"<b>Treat the referral source better than the referral.</b> They took a risk on their own reputation to send you a friend. That deserves more attention than the transaction does."},
    ]},
    {"n":"02","title":"Four touchpoints, not one","sub":"Design what happens at each. Small and immediate beats large and eventual.","blocks":[
      {"grid":[
        {"field":{"key":"rr_1","label":"1 · When the referral call comes in","hint":"same day","ph":"Text thank-you within the hour + handwritten note in the post"}},
        {"field":{"key":"rr_2","label":"2 · When I meet the referral","hint":"close the loop","ph":"Call the source: &lsquo;met them, here&rsquo;s how it went, thank you&rsquo;"}},
      ]},
      {"grid":[
        {"field":{"key":"rr_3","label":"3 · When we go under contract","ph":"Small gift — coffee, local restaurant card"}},
        {"field":{"key":"rr_4","label":"4 · When it closes","ph":"Proper gift + note + a mention in the next newsletter (with permission)"}},
      ]},
      {"callout":"Check what your brokerage and Indiana licensing rules allow before offering anything of value for a referral, particularly to anyone who holds a licence or works in a related industry. Confirm with <b>Janet Giles-Schultz</b> (317-997-7404) before you publish a reward.","confirm":True},
    ]},
    {"n":"03","title":"Your allied resources","sub":"The people who should be sending you business every single year — and receiving it from you.","blocks":[
      {"teach":"This is a small, deliberate group: lenders, title, inspectors, contractors from the vendor directory, agents in other markets, and past clients who have already referred once. They get everything your Met database gets, <b>plus</b> one-to-one contact several times a year. The most influential, as often as monthly."},
      {"list":{"key":"rr_allied","title":"My allied resources","min":8,"ph":"Name — what they do — when I last spoke to them properly"}},
      {"field":{"key":"rr_cadence","label":"How often I&#x27;ll meet each of them one-to-one","hint":"a meal, a coffee, a visit — not an email","ph":"Top 5 quarterly, the rest twice a year"}},
    ]},
    {"n":"04","title":"Wire it up","blocks":[
      {"checklist":[
        {"key":"rr_field","label":"A <b>referred_by</b> field exists in the CRM and gets filled in every time"},
        {"key":"rr_trigger","label":"All four touchpoints fire as CRM tasks — not from memory"},
        {"key":"rr_act","label":"The first reward fires on the <b>referral</b>, not on the closing"},
        {"key":"rr_track","label":"I can report how many referrals each source has sent me"},
        {"key":"rr_ask","label":"The referral ask appears on every touch in 8&#215;8 and 33 Touch"},
        {"key":"rr_thank","label":"Referral sources get a year-end thank-you regardless of whether anything closed"},
      ]},
      {"textarea":{"key":"rr_script","label":"How I ask, in my own words","hint":"write it the way you&#x27;d actually say it out loud","ph":"&lsquo;You know I work mostly by referral — if anyone you know is even starting to think about moving, I&#x27;d love it if you&#x27;d pass my name along.&rsquo;"}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
}

# ============================================================ 4.1
MODULES["4.1"] = {
  "file": "yrl-mrea-4-1-capacity-talent.html",
  "eyebrow": "Phase 4 · Module 4.1",
  "chip": "Scorecard",
  "title": "Capacity vs Cul-de-sac Talent",
  "lede": "Two people can both be genuinely good at the job in front of them. Only one of them will still be useful when the job grows. Score a real candidate here before you hire — the difference decides whether you get your time back or get the work back.",
  "sections": [
    {"n":"01","title":"Every job has two levels","blocks":[
      {"teach":"There is the job as it exists today, and the job as it will exist once the business grows. <b>Capacity talent</b> can do both — they have the desire, ability and judgment to grow past the description you wrote. <b>Cul-de-sac talent</b> does today&#x27;s job well and goes no further."},
      {"teach":"The tell is in what they hand back. Cul-de-sac talent says &ldquo;I did what you asked.&rdquo; Capacity talent says &ldquo;I did what you asked, plus the thing that was obviously going to be needed next.&rdquo; One takes the <i>doing</i> off you. The other takes some of the <i>thinking</i>."},
      {"raw":'<div class="mrea-vs">'
             '<div class="good"><h4>Capacity talent</h4><ul>'
             '<li>Pushes to get answers</li><li>Knows what they want, or is actively working it out</li>'
             '<li>Raises the bar and wants to work with others who do</li>'
             '<li>Pushes you</li><li>Can eventually replace you at some of what you do</li></ul></div>'
             '<div class="bad"><h4>Cul-de-sac talent</h4><ul>'
             '<li>Has to be pushed to want answers</li><li>Doesn&#x27;t know what they want and isn&#x27;t looking</li>'
             '<li>May not know where the bar is set</li><li>Requires you to push them</li>'
             '<li>Hands pieces of the job back</li></ul></div></div>'},
      {"callout":"Neither is a judgment about the person. It is a judgment about fit against a job that is going to change. Plenty of excellent people are the wrong answer for a role that has to grow."},
    ]},
    {"n":"02","title":"Score a real candidate","sub":"Someone you&#x27;re actually considering. 1 = not at all · 10 = completely.","blocks":[
      {"field":{"key":"cap_name","label":"Candidate / team member","ph":"Name"}},
      {"field":{"key":"cap_role","label":"Role I&#x27;m considering them for","ph":"Marketing &amp; administrative manager"}},
      {"raw":'<div class="mrea-scale"><span class="sl-lab">They chase answers without being asked<small>they arrive with the question already half-solved</small></span><input type="range" min="1" max="10" step="1" value="5" id="cp1" data-tiger="cp1"><span class="sl-val">5</span></div>'},
      {"raw":'<div class="mrea-scale"><span class="sl-lab">They know what they want from their own career<small>and can say it out loud</small></span><input type="range" min="1" max="10" step="1" value="5" id="cp2" data-tiger="cp2"><span class="sl-val">5</span></div>'},
      {"raw":'<div class="mrea-scale"><span class="sl-lab">They&#x27;d improve the job, not just perform it<small>would they redesign the process or just run it?</small></span><input type="range" min="1" max="10" step="1" value="5" id="cp3" data-tiger="cp3"><span class="sl-val">5</span></div>'},
      {"raw":'<div class="mrea-scale"><span class="sl-lab">They push me<small>talent creates pressure upward; support absorbs it</small></span><input type="range" min="1" max="10" step="1" value="5" id="cp4" data-tiger="cp4"><span class="sl-val">5</span></div>'},
      {"raw":'<div class="mrea-scale"><span class="sl-lab">Their language is challenge and achievement<small>listen to how they describe past work</small></span><input type="range" min="1" max="10" step="1" value="5" id="cp5" data-tiger="cp5"><span class="sl-val">5</span></div>'},
      {"raw":'<div class="mrea-scale"><span class="sl-lab">I can imagine them doing part of my job in three years<small>the real capacity test</small></span><input type="range" min="1" max="10" step="1" value="5" id="cp6" data-tiger="cp6"><span class="sl-val">5</span></div>'},
      {"raw":'<div class="mrea-verdict" id="capVerdict"><p class="vt">What this means</p><h3 class="vh">Score the six above</h3><p class="vp">Capacity is not the same thing as competence.</p></div>'},
    ]},
    {"n":"03","title":"What a hire actually costs","blocks":[
      {"raw":'<div class="mrea-vs">'
             '<div class="bad"><h4>A bad hire</h4><ul>'
             '<li>3–4 months to interview and hire</li><li>3–4 months to train and realise it isn&#x27;t working</li>'
             '<li>3–4 months of probation before parting ways</li>'
             '<li><b>9–12 months gone, and you start over</b></li></ul></div>'
             '<div class="good"><h4>A great hire</h4><ul>'
             '<li>3–4 months to interview and hire</li><li>3–4 months to train and confirm it&#x27;s working</li>'
             '<li>Then they perform — and you get priorities, mastery, opportunity, time</li>'
             '<li><b>6–8 months, and you come out energised</b></li></ul></div></div>'},
      {"teach":"Which is why &ldquo;how little can I pay and still keep them?&rdquo; is exactly the wrong question. The right one is <b>how much can I afford to pay so I can keep them as long as possible?</b> Talent held accountable to results pays for itself, usually with room to spare."},
      {"callout":"Confirm compensation structure, employment classification and any licensing implications with <b>Janet Giles-Schultz</b> (317-997-7404) before making an offer. Licensed and unlicensed assistants have different rules about what they may do.","confirm":True},
    ]},
    {"n":"04","title":"Decide","blocks":[
      {"textarea":{"key":"cap_decide","label":"My call on this person","hint":"and what convinced you","ph":"Capacity — she reorganised her last office&#x27;s transaction process without being asked."}},
      {"list":{"key":"cap_questions","title":"Questions I&#x27;ll ask to test capacity in the interview","min":4,"ph":"e.g. &lsquo;Tell me about a process you improved that nobody asked you to improve.&rsquo;"}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
  "extra_script": """
(function(){
  var K=MREA, ids=['cp1','cp2','cp3','cp4','cp5','cp6'];
  function paint(){
    var t=0; ids.forEach(function(i){t+=K.nval(i);});
    var avg=t/ids.length;
    var name=K.val('cap_name').trim()||'This person';
    var lines=[], c, head;
    if(avg>=7.5){
      c='ok'; head=name+' looks like capacity talent';
      lines.push('Scoring '+K.round(avg,1)+'/10 across the six markers. This is someone who can grow past the job description you wrote, which means the role can grow without a rehire.');
      lines.push('Pay accordingly and hold them accountable to results. Underpaying capacity talent is how you train it to leave.');
    } else if(avg>=5.5){
      c='warn'; head='Mixed — probably strong support talent';
      lines.push('At '+K.round(avg,1)+'/10 this reads as someone who will do the current job well without growing much past it. That is genuinely valuable for a defined, stable role.');
      lines.push('Just hire them knowing that. Do not build a plan that depends on them absorbing your thinking later — that plan will quietly hand the work back to you.');
    } else {
      c='bad'; head='Not a fit for a job that has to grow';
      lines.push('At '+K.round(avg,1)+'/10 the capacity markers are not there. This is not a verdict on the person — it is a mismatch with a role that will change.');
      lines.push('Remember the cost of a bad hire: nine to twelve months, and you start over. Keep looking. Great talent is worth waiting for and never worth settling on.');
    }
    K.verdict('capVerdict', c, head, lines);
    K.publish({last_candidate_score:K.round(avg,1)});
  }
  K.bind(ids.concat(['cap_name']), paint);
})();
"""
}

# ============================================================ 4.2
MODULES["4.2"] = {
  "file": "yrl-mrea-4-2-three-key-hires.html",
  "eyebrow": "Phase 4 · Module 4.2",
  "chip": "Worksheet",
  "title": "Your Three Key Hires",
  "lede": "You are probably three people away from a business that runs without you. Not thirty — three. Everyone else in a mature real estate team reports to one of them. This module works out which one you need first and what the job actually is.",
  "sections": [
    {"n":"01","title":"Only three people sit within arm&#x27;s reach","blocks":[
      {"teach":"<b>The marketing &amp; administrative manager</b> runs lead generation execution, communication systems, financial systems, and the rest of the back office. <b>The lead buyer specialist</b> secures appointments, signs representation agreements, shows and sells. <b>The lead listing specialist</b> secures appointments, takes listings, runs seller communication and negotiates offers."},
      {"teach":"Everyone else reports to one of those three. Get those three right and the rest of the organisation becomes their job rather than yours."},
      {"callout":"The order matters and almost everybody gets it wrong. <b>Administrative help comes first</b> — not a buyer agent. Salespeople are generally poor at building systems, so hiring sales first means hiring someone unsuited to half of what the role actually requires."},
    ]},
    {"n":"02","title":"Which one do you need first?","sub":"Answer honestly about where your week currently goes.","blocks":[
      {"raw":'<div class="mrea-scale"><span class="sl-lab">Paperwork, scheduling and admin eat my week<small>work that needs no licence and no relationship</small></span><input type="range" min="1" max="10" step="1" value="5" id="h1" data-tiger="h1"><span class="sl-val">5</span></div>'},
      {"raw":'<div class="mrea-scale"><span class="sl-lab">I lose whole afternoons driving buyers around<small>and it&#x27;s costing me listing appointments</small></span><input type="range" min="1" max="10" step="1" value="5" id="h2" data-tiger="h2"><span class="sl-val">5</span></div>'},
      {"raw":'<div class="mrea-scale"><span class="sl-lab">I have more seller listing opportunity than I can personally serve<small>I&#x27;m turning listings away or serving them thinly</small></span><input type="range" min="1" max="10" step="1" value="5" id="h3" data-tiger="h3"><span class="sl-val">5</span></div>'},
      {"raw":'<div class="mrea-scale"><span class="sl-lab">My systems live in my head<small>nobody else could run this tomorrow</small></span><input type="range" min="1" max="10" step="1" value="5" id="h4" data-tiger="h4"><span class="sl-val">5</span></div>'},
      {"raw":'<div class="mrea-verdict" id="hVerdict"><p class="vt">What this means</p><h3 class="vh">Answer the four above</h3><p class="vp">The order of hires is not a preference — it is a sequence.</p></div>'},
    ]},
    {"n":"03","title":"Write the job before you write the ad","blocks":[
      {"teach":"A detailed job description is a tool, not paperwork. It sets the standard on the front end, tells the person how they succeed and how they fail, and gives you something objective to hold them accountable to later. Think of it as a syllabus."},
      {"grid":[
        {"field":{"key":"h_role","label":"The role I&#x27;m hiring","ph":"Marketing &amp; administrative manager"}},
        {"field":{"key":"h_when","label":"When","ph":"Interviews in November, start in January"}},
      ]},
      {"list":{"key":"h_duties","title":"The four or five things this person owns","min":5,"ph":"e.g. runs the 33 Touch calendar end to end"}},
      {"list":{"key":"h_standards","title":"How I&#x27;ll know they&#x27;re succeeding","min":4,"ph":"e.g. every lead assigned within 15 minutes during business hours"}},
      {"textarea":{"key":"h_first90","label":"What their first 90 days produce","ph":"Ops manual started, 33 Touch scheduled for the year, every contact tagged Met / Haven&#x27;t Met."}},
    ]},
    {"n":"04","title":"Hire for five years","blocks":[
      {"teach":"Ask for a <b>five-year commitment</b> from each of these three. They should see the role as potentially their life&#x27;s work, not a stop. No matter how good the candidate, don&#x27;t settle for someone who can&#x27;t convincingly show that."},
      {"teach":"And remember that <b>big goals are recruiting magnets</b>. Talent is attracted to a vision of the future and the challenge of getting there. Modest goals and a thin job description attract people who want a job that won&#x27;t stretch them — and then your business won&#x27;t stretch either."},
      {"checklist":[
        {"key":"h_admin_first","label":"I&#x27;m hiring administrative help before sales help"},
        {"key":"h_desc","label":"Written job description with standards, before the first interview"},
        {"key":"h_capacity","label":"Scored for capacity vs cul-de-sac (Module 4.1)"},
        {"key":"h_five","label":"Asked directly about a five-year horizon"},
        {"key":"h_weekly","label":"A standing weekly one-to-one is on my calendar before they start"},
        {"key":"h_docs","label":"Documenting my systems is written into their job from day one"},
      ]},
      {"callout":"Two standing hours a week is the whole management load: one hour with the person who runs the business, one with all three together. The agenda is the goals. There is no other agenda."},
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
    var admin=(K.nval('h1')+K.nval('h4'))/2, buyer=K.nval('h2'), seller=K.nval('h3');
    var lines=[], head, c='warn';
    if(admin>=6 || (admin>=buyer && admin>=seller)){
      head='Hire administrative help first';
      c='ok';
      lines.push('Your week is going to work that needs neither your licence nor your relationships — and your systems live in your head. Both problems have the same answer.');
      lines.push('This person also builds the systems everything else depends on. Hire a salesperson into this situation and you will have someone excellent at half their job and unsuited to the other half.');
      lines.push('Don&#x27;t underestimate this hire. A great first administrative hire often becomes the person who eventually runs the whole business.');
    } else if(buyer>=seller){
      head='You&#x27;re ready for buyer-side help';
      lines.push('Admin is under control and buyers are consuming the hours that should be going to lead generation and listing appointments.');
      lines.push('Consider a graduated hire — start with a licensed showing assistant who grows into a full buyer specialist. You stay involved in consultations and negotiation while getting your afternoons back.');
      lines.push('Note that buyer representation now requires a written agreement before touring, so whoever you hire must be able to hold that conversation properly. Score them in Module 4.1 first.');
    } else {
      head='You&#x27;re ready for a listing specialist';
      lines.push('You have more seller opportunity than you can personally serve. That is the best problem on this page — the listing side is where the economics are.');
      lines.push('A listing specialist is typically salaried plus bonus rather than split, which is exactly why the listing side carries a far lower cost of sale than the buyer side.');
      lines.push('If administrative help is not fully in place yet, do that first anyway. A listing specialist without support will hand you back the paperwork.');
    }
    K.verdict('hVerdict', c, head, lines);
    K.publish({next_hire:head});
  }
  K.bind(['h1','h2','h3','h4'], paint);
})();
"""
}

# ============================================================ 4.3
MODULES["4.3"] = {
  "file": "yrl-mrea-4-3-seventh-level.html",
  "eyebrow": "Phase 4 · Module 4.3",
  "chip": "Locator",
  "title": "The 7th Level Locator",
  "lede": "Seven levels run from &ldquo;you do everything&rdquo; to &ldquo;a business you own that runs without you holding a job in it.&rdquo; Find where you actually are, and what the single next move is. You cannot skip levels — trying is how people burn out.",
  "sections": [
    {"n":"01","title":"Why this matters more than it sounds","blocks":[
      {"teach":"Real estate offers unlimited earning and no retirement structure. Those two facts are the strongest argument for the career and the strongest argument against it. Nobody is funding your future but you."},
      {"teach":"That leaves two honest options. Build your practice into a business that keeps producing when you stop selling — or master investing well enough to fund the rest of your life another way. Most agents do neither, which is why so many are still prospecting at seventy."},
      {"callout":"&ldquo;Passive&rdquo; is the wrong word for a business you own. Active is working <i>in</i> it; the 7th Level is working <i>on</i> it. Both are work. Absentee ownership reliably ends in decline — anything left alone falls apart."},
    ]},
    {"n":"02","title":"Where are you?","blocks":[
      {"raw":'<div class="field"><label class="field-label" for="lvl">My current level</label>'
             '<select class="tiger-input" id="lvl" data-tiger="lvl">'
             '<option value="">Choose…</option>'
             '<option value="1">1 — Just me. I do everything.</option>'
             '<option value="2">2 — Me plus one administrative person</option>'
             '<option value="3">3 — Me plus multiple administrative people</option>'
             '<option value="4">4 — Admin team plus one buyer specialist</option>'
             '<option value="5">5 — Admin team, multiple buyer specialists, one seller specialist</option>'
             '<option value="6">6 — All of the above plus an administrative manager; I&#x27;m the CEO</option>'
             '<option value="7">7 — Someone else runs it; I own it</option>'
             '</select></div>'},
      {"grid":[
        {"field":{"key":"lvl_years","label":"Years I&#x27;ve been at this level","mode":"decimal","ph":"3"}},
        {"field":{"key":"lvl_hours","label":"Hours a week I work in the business","mode":"numeric","ph":"55"}},
      ]},
      {"raw":'<div class="mrea-verdict" id="lvVerdict"><p class="vt">What this means</p><h3 class="vh">Pick your level</h3><p class="vp">Master the level you are on before reaching for the next one.</p></div>'},
    ]},
    {"n":"03","title":"Your job at the top","sub":"At every level above four, the owner&#x27;s role narrows to one word: accountability. It has three arenas.","blocks":[
      {"teach":"<b>Leadership accountability.</b> Bring five things and keep bringing them — <b>Mission</b> (why we exist), <b>Vision</b> (what it looks like when we get there), <b>Values</b> (what matters to us), <b>Beliefs</b> (the rules we work by), <b>Perspective</b> (where we honestly are right now)."},
      {"teach":"<b>People accountability.</b> Weekly meetings, goal worksheets, tough-love insistence on standards. Talent held accountable overshoots; talent left alone drifts."},
      {"teach":"<b>Capital accountability.</b> Approve budgets, read the monthly P&amp;L, require every variance to be justified. Nobody else can do this for you."},
      {"list":{"key":"lv_mvvbp","title":"My MVVBP in one line each","min":5,"ph":"Mission: … / Vision: … / Values: … / Beliefs: … / Perspective: …"}},
      {"checklist":[
        {"key":"lv_weekly","label":"Two standing hours a week: one with whoever runs the business, one with all three key people"},
        {"key":"lv_goals","label":"The agenda is the goals — company goals and their individual goals, nothing else"},
        {"key":"lv_pl","label":"I review the P&amp;L monthly with my key people"},
        {"key":"lv_accounts","label":"Deposit and operating accounts separated; only I move money between them"},
        {"key":"lv_hire","label":"I stay actively involved in hiring all three key roles"},
      ]},
    ]},
    {"n":"04","title":"Your next move","blocks":[
      {"textarea":{"key":"lv_next","label":"The one move that takes me to the next level","hint":"one move, not a list","ph":"Hire a marketing &amp; administrative manager and give them the ops manual as their first project."}},
      {"grid":[
        {"field":{"key":"lv_by","label":"By when","ph":"March"}},
        {"field":{"key":"lv_block","label":"What&#x27;s currently stopping me","ph":"I haven&#x27;t written the job description"}},
      ]},
      {"callout":"The way to build a great big business is to build a great small business first. Master this level. Then move."},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
  "extra_script": """
(function(){
  var K=MREA;
  var NEXT={
    '1':['Level 1 — everything is you','Every hour of growth has to come out of your own week, which means you have a hard ceiling and you can feel it.','Your next move is your first administrative hire. Not a buyer agent — administrative. They take the work that needs no licence and, crucially, they build the systems you have never had time to write down.'],
    '2':['Level 2 — one administrative person','Good. This is the level where most agents stop, and the ones who stop here stay busy forever.','Your next move: make sure that person is documenting your systems as part of the job, then add a second administrative person as volume demands. Get the back office genuinely solid before you hire any salesperson.'],
    '3':['Level 3 — an administrative team','You have real infrastructure. Paperwork and process should no longer be reaching you at all.','Your next move is buyer-side help — often a licensed showing assistant who grows into a full buyer specialist. That gives you back the afternoons and pushes you toward the listing side, where the economics are.'],
    '4':['Level 4 — admin team plus buyer help','You are now running a small business rather than a practice. Your time should be going to lead generation and listings.','Your next move is a listing specialist, and more buyer specialists as volume supports them. Watch your cost of sale — a listing specialist is normally salary plus bonus, which is exactly why the listing side stays cheaper than the buyer side.'],
    '5':['Level 5 — a full sales team','You have specialists on both sides. The constraint now is you: everything still routes through you.','Your next move is an administrative <b>manager</b> — someone who runs the back office so you are not managing it. That is the hire that turns a team into an organisation.'],
    '6':['Level 6 — you are the CEO','Three key people report to you and everyone else reports to them. This is a genuinely rare place to be.','Your next move is the hardest one: find the person who can run the business so you can own it rather than work in it. Look inside your front and middle office — your successor should already be part of the lead-generation machine, because that is where the power of the company sits.'],
    '7':['Level 7 — you own a business','You have what almost nobody in this industry has: an asset that produces without you holding a job in it, which you can keep or sell.','Your job now is accountability and nothing else — leadership, people, capital. The risk at this level is absentee ownership. Keep the two weekly hours and the monthly P&amp;L review, permanently.']
  };
  function paint(){
    var lv=K.val('lvl'), yrs=K.nval('lvl_years'), hrs=K.nval('lvl_hours');
    if(!lv){ K.verdict('lvVerdict','','Pick your level',['Master the level you are on before reaching for the next one.']); return; }
    var d=NEXT[lv], lines=[d[1],d[2]];
    var c = lv==='7'?'ok':(lv>='4'?'':'warn');
    if(yrs>=4 && lv<'4') lines.push('You have been at this level for '+K.cnt(yrs,0)+' years. That is long enough to say the constraint is not the market — it is that the next hire keeps getting postponed.');
    if(hrs>=55 && lv<'6') lines.push('At '+K.cnt(hrs,0)+' hours a week you are buying growth with your own time, and that currency runs out. Leverage is not a reward for working hard enough; it is the thing that stops the hours going up.');
    K.verdict('lvVerdict', c, d[0], lines);
    K.publish({seventh_level:parseInt(lv,10), hours_week:hrs||null});
  }
  K.bind(['lvl','lvl_years','lvl_hours'], paint);
  var sel=K.$('lvl'); if(sel) sel.addEventListener('change', paint);
})();
"""
}
