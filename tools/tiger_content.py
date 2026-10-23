# -*- coding: utf-8 -*-
"""
Tiger Training module content. Consumed by build_tiger_modules.py.
Original content in Your Realty Link's voice — modeled on the Ignite arc,
never copied from KW's manuals. YRL facts from CLAUDE.md + the List-a-Home deck.
Where a real YRL operational number is needed (splits, fees), the agent enters
it and we flag "confirm with Janet" rather than inventing it.
"""

MODULES = {

# ============================================================ 1.2
"1.2": {
  "file": "yrl-tiger-1-2-the-numbers.html",
  "eyebrow": "Phase 1 · Module 1.2",
  "chip": "Worksheet",
  "title": "The Numbers: How Agents Get Paid",
  "lede": "Before you sell a single house, understand exactly how money moves from a closing table to your bank account — and how much of it is really yours. This is the module that keeps new agents from going broke in a good year.",
  "sections": [
    {"n":"01","title":"Why this matters","blocks":[
      {"teach":"Real estate pays in lump sums, weeks or months apart, with nobody withholding your taxes. Agents who don't understand their numbers spend a $9,000 commission like it's $9,000 — then panic at tax time. Agents who <b>do</b> understand them build a real business."},
      {"callout":"You are a <b>1099 independent contractor</b>, not an employee. No taxes are withheld. What lands in your account is not what you get to keep."},
    ]},
    {"n":"02","title":"How a commission actually flows","blocks":[
      {"teach":"A home sells. The total commission (agreed in the listing) is split between the <b>listing side</b> and the <b>buying side</b>. Your side's commission goes to your brokerage first — then <b>you</b> get your split of it, minus any fees."},
      {"teach":"So one closing runs: <b>Sale price → total commission → your side's share → your split with Your Realty Link → minus fees → minus what you set aside for taxes → your take-home.</b>"},
      {"callout":"Confirm your exact commission split and any monthly or transaction fees with <b>Janet Giles-Schultz</b> (317-997-7404). Every agent's arrangement can differ — use your real numbers below.","confirm":True},
    ]},
    {"n":"03","title":"Your take-home on one deal","sub":"Enter your real numbers. This updates as you type.","blocks":[
      {"grid":[
        {"field":{"key":"avg_price","label":"Typical sale price","hint":"a home you'd list/sell","money":True,"mode":"numeric","ph":"275,000"}},
        {"field":{"key":"comm_pct","label":"Your side's commission %","hint":"e.g. 3","mode":"decimal","ph":"3"}},
      ]},
      {"grid":[
        {"field":{"key":"split_pct","label":"Your split with YRL (%)","hint":"your share — ask Janet","mode":"numeric","ph":"80"}},
        {"field":{"key":"tax_pct","label":"Set aside for taxes (%)","hint":"25–30% is smart","mode":"numeric","ph":"28"}},
      ]},
      {"raw":'<div class="calc"><div class="big" id="calcGross">—<small>Your commission</small></div>'
             '<div class="big" id="calcTake">—<small>Take-home after tax</small></div>'
             '<div class="say" id="calcSay">Enter a sale price and your commission % to see what one closing really pays you.</div></div>'},
      {"raw":'<input type="hidden" data-tiger="take_home" id="take_home">'},
    ]},
    {"n":"04","title":"You're running a business","blocks":[
      {"teach":"Because no one withholds for you, you have to do it yourself. The agents who last treat every commission as three buckets: <b>taxes, business, and pay.</b>"},
      {"checklist":[
        {"key":"n_account","label":"Open a separate bank account just for taxes — move your set-aside % there the day you get paid"},
        {"key":"n_track","label":"Track every business expense (mileage, MLS/MIBOR dues, signs, photos, marketing)"},
        {"key":"n_quarterly","label":"Plan to pay estimated taxes quarterly — talk to a tax pro before your first big check"},
        {"key":"n_reserve","label":"Build a reserve — real estate income is lumpy; aim for a few months of expenses"},
      ]},
    ]},
    {"n":"05","title":"Your money rules","blocks":[
      {"textarea":{"key":"tax_rule","label":"My rule for taxes","hint":"write it as a promise","ph":"The day any commission hits my account, I move 28% straight to my tax account — before I spend a dollar."}},
      {"list":{"key":"expenses","title":"Business expenses I'll track","min":5,"ph":"e.g. MIBOR dues, gas/mileage, listing photos ($150–250), signs, closing gifts"}},
    ]},
    {"n":"06","title":"Your action this week","blocks":[
      {"textarea":{"key":"action","label":"This week I will…","ph":"Open a separate tax account and decide the exact % I'll move from every check."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
  "extra_script": """
(function(){
  var num=function(s){return parseFloat(String(s||'').replace(/[^0-9.]/g,''))||0;};
  var g=document.getElementById('calcGross'),t=document.getElementById('calcTake'),
      say=document.getElementById('calcSay'),hid=document.getElementById('take_home');
  function recalc(){
    var price=num(document.getElementById('avg_price').value),
        comm=num(document.getElementById('comm_pct').value),
        split=num(document.getElementById('split_pct').value),
        tax=num(document.getElementById('tax_pct').value);
    if(price>0&&comm>0){
      var side=price*comm/100, yours=side*(split>0?split/100:1),
          take=yours*(1-(tax>0?tax/100:0));
      g.innerHTML='$'+Math.round(yours).toLocaleString()+'<small>Your commission</small>';
      t.innerHTML='$'+Math.round(take).toLocaleString()+'<small>Take-home after tax</small>';
      hid.value=Math.round(take);
      say.textContent='One closing at $'+price.toLocaleString()+' pays you about $'+Math.round(yours).toLocaleString()+
        ' — and roughly $'+Math.round(take).toLocaleString()+' after setting aside taxes. That gap is why you plan ahead.';
    } else { g.innerHTML='—<small>Your commission</small>';t.innerHTML='—<small>Take-home after tax</small>';hid.value='';
      say.textContent='Enter a sale price and your commission % to see what one closing really pays you.';}
  }
  ['avg_price','comm_pct','split_pct','tax_pct'].forEach(function(id){document.getElementById(id).addEventListener('input',recalc);});
  document.addEventListener('yrl-auth-ready',function(){setTimeout(recalc,300);});
  setTimeout(recalc,1200);
})();
""",
},

# ============================================================ 1.3
"1.3": {
  "file": "yrl-tiger-1-3-business-planning.html",
  "eyebrow": "Phase 1 · Module 1.3",
  "chip": "Worksheet",
  "title": "Business Planning Clinic",
  "lede": "A goal is a wish until you turn it into weekly activity. In this clinic you'll work backward from the money you want to the exact number of conversations you need — then build a one-page plan you can actually run.",
  "sections": [
    {"n":"01","title":"Why plan at all","blocks":[
      {"teach":"Nobody hands a real estate agent a schedule or a quota. That freedom is why most agents drift — and why the ones with a written plan run circles around them. Your plan doesn't need to be fancy. It needs to fit on one page and tell you what to do this week."},
      {"callout":"The whole game reduces to one chain: <b>conversations → appointments → signed agreements → closings.</b> Plan the front of that chain and the back takes care of itself."},
    ]},
    {"n":"02","title":"Work backward from your number","sub":"Enter your goal and your conversion rates — we'll show the activity it takes.","blocks":[
      {"grid":[
        {"field":{"key":"gci_goal","label":"Income goal this year (GCI)","money":True,"mode":"numeric","ph":"90,000"}},
        {"field":{"key":"avg_comm","label":"Avg. commission per deal","money":True,"mode":"numeric","ph":"7,500"}},
      ]},
      {"grid":[
        {"field":{"key":"close_rate","label":"Appointments that close (%)","hint":"start with 50","mode":"numeric","ph":"50"}},
        {"field":{"key":"appt_rate","label":"Conversations → appointment (%)","hint":"start with 10","mode":"numeric","ph":"10"}},
      ]},
      {"raw":'<div class="calc"><div class="big" id="cDeals">—<small>Closings</small></div>'
             '<div class="big" id="cAppts">—<small>Appointments</small></div>'
             '<div class="big" id="cConvos">—<small>Conversations / yr</small></div>'
             '<div class="say" id="cSay">Fill in your goal and rates to see the activity behind it.</div></div>'},
      {"raw":'<input type="hidden" data-tiger="convos_week" id="convos_week">'},
      {"callout":"See that conversations-per-week number? That is your real job. Everything else in Tiger Training just makes each conversation convert better."},
    ]},
    {"n":"03","title":"Where your business will come from","sub":"Name your top lead sources — the wells you'll go back to every week.","blocks":[
      {"list":{"key":"sources","title":"My top lead sources this year","min":4,"ph":"e.g. Sphere/past clients, open houses, geographic farm, FSBO/expired, online"}},
      {"field":{"key":"mkt_budget","label":"Monthly marketing budget I'll commit","money":True,"mode":"numeric","ph":"200"}},
    ]},
    {"n":"04","title":"Your quarterly milestones","sub":"Break the year into four checkpoints so you can course-correct.","blocks":[
      {"list":{"key":"quarters","title":"By the end of each quarter I will…","min":4,"ph":"e.g. Q1 — 25 SOI calls/week, 2 closings"}},
    ]},
    {"n":"05","title":"Your one-line plan","blocks":[
      {"textarea":{"key":"one_line","label":"My plan in one sentence","hint":"say the number and the habit","ph":"I'll have ___ real estate conversations a week from my sphere and open houses to close ___ deals this year."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
  "extra_script": """
(function(){
  var num=function(s){return parseFloat(String(s||'').replace(/[^0-9.]/g,''))||0;};
  var d=document.getElementById('cDeals'),a=document.getElementById('cAppts'),
      c=document.getElementById('cConvos'),say=document.getElementById('cSay'),hid=document.getElementById('convos_week');
  function recalc(){
    var gci=num(document.getElementById('gci_goal').value),
        avg=num(document.getElementById('avg_comm').value),
        cr=num(document.getElementById('close_rate').value),
        ar=num(document.getElementById('appt_rate').value);
    if(gci>0&&avg>0&&cr>0&&ar>0){
      var deals=Math.ceil(gci/avg), appts=Math.ceil(deals/(cr/100)), convos=Math.ceil(appts/(ar/100)),
          perWk=Math.ceil(convos/50);
      d.innerHTML=deals+'<small>Closings</small>';
      a.innerHTML=appts+'<small>Appointments</small>';
      c.innerHTML=convos+'<small>Conversations / yr</small>';
      hid.value=perWk;
      say.textContent='To earn $'+gci.toLocaleString()+' you need about '+deals+' closings, '+appts+
        ' appointments, and '+convos+' real conversations this year — roughly '+perWk+' a week.';
    } else { d.innerHTML='—<small>Closings</small>';a.innerHTML='—<small>Appointments</small>';
      c.innerHTML='—<small>Conversations / yr</small>';hid.value='';
      say.textContent='Fill in your goal and rates to see the activity behind it.';}
  }
  ['gci_goal','avg_comm','close_rate','appt_rate'].forEach(function(id){document.getElementById(id).addEventListener('input',recalc);});
  document.addEventListener('yrl-auth-ready',function(){setTimeout(recalc,300);});
  setTimeout(recalc,1200);
})();
""",
},

# ============================================================ 1.4
"1.4": {
  "file": "yrl-tiger-1-4-time-blocking.html",
  "eyebrow": "Phase 1 · Module 1.4",
  "chip": "Worksheet",
  "title": "Daily Schedule & Time-Blocking",
  "lede": "Your calendar decides your income. In this module you'll design an ideal week that protects the money-making hours — before email, errands, and everyone else's emergencies fill them for you.",
  "sections": [
    {"n":"01","title":"Why your calendar is your paycheck","blocks":[
      {"teach":"Lead generation is the one activity that pays you, and it's the easiest one to skip because nobody's making you do it. Time-blocking fixes that: you decide in advance when you prospect, and you defend that block like a listing appointment — because it's worth more."},
      {"callout":"Rule of the house: <b>lead generation happens first</b>, while you're fresh, before you touch your inbox. Everything reactive can wait until after."},
    ]},
    {"n":"02","title":"Your lead-generation block","sub":"The single most important block on your calendar. Pin it down.","blocks":[
      {"grid":[
        {"field":{"key":"lg_time","label":"My daily lead-gen block","hint":"start–end","ph":"8:30–10:30 AM"}},
        {"field":{"key":"lg_where","label":"Where I'll do it","hint":"no distractions","ph":"Office desk, phone + database"}},
      ]},
      {"textarea":{"key":"lg_protect","label":"How I'll protect this block","ph":"Phone on Do-Not-Disturb, no email until it's done, coffee poured before I start."}},
    ]},
    {"n":"03","title":"Design your ideal week","sub":"Rough it in. You'll refine it as your business grows.","blocks":[
      {"grid":[
        {"field":{"key":"appt_days","label":"Days I'll take appointments","ph":"Tue/Thu afternoons, Sat AM"}},
        {"field":{"key":"admin_block","label":"Weekly admin/paperwork block","ph":"Fri 1–3 PM"}},
      ]},
      {"grid":[
        {"field":{"key":"track_time","label":"When I update my Tiger Tracker","ph":"Friday 3 PM"}},
        {"field":{"key":"day_off","label":"My real day off","hint":"protect it too","ph":"Sunday"}},
      ]},
    ]},
    {"n":"04","title":"My daily non-negotiables","sub":"Check the habits you commit to doing every working day.","blocks":[
      {"checklist":[
        {"key":"nn_lg","label":"Lead-generate during my block — before anything reactive"},
        {"key":"nn_convos","label":"Talk to real people about real estate every working day"},
        {"key":"nn_followup","label":"Follow up with every active lead and client"},
        {"key":"nn_plan","label":"Plan tomorrow before I leave today"},
      ]},
    ]},
    {"n":"05","title":"My daily lead-gen actions","sub":"The specific things you'll do inside the block. List the ones that fit your plan.","blocks":[
      {"list":{"key":"lg_actions","title":"Inside my lead-gen block I will…","min":4,"ph":"e.g. Call 10 people in my database, follow up with weekend open-house sign-ins, check in with 2 past clients"}},
    ]},
    {"n":"06","title":"Your action this week","blocks":[
      {"textarea":{"key":"action","label":"This week I will…","ph":"Block my lead-gen hours in my calendar for all five working days and defend them."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
},

# ============================================================ 2.1
"2.1": {
  "file": "yrl-tiger-2-1-database-sphere.html",
  "eyebrow": "Phase 2 · Module 2.1",
  "chip": "Worksheet",
  "title": "Your Database & Sphere of Influence",
  "lede": "Your first — and cheapest — source of business is the people who already know, like, and trust you. This module turns your contacts into an organized database you work on purpose, not by accident.",
  "sections": [
    {"n":"01","title":"Why the sphere comes first","blocks":[
      {"teach":"New agents burn money chasing strangers while a goldmine sits in their phone. The people who already know you will give you your first deals and your first referrals — <b>if</b> they know you're in real estate and hear from you regularly."},
      {"callout":"A database isn't a list you make once. It's a relationship you work. The goal: everyone in it knows you sell real estate, and no one forgets it."},
    ]},
    {"n":"02","title":"Build your list","sub":"Add everyone who'd take your call — family, friends, past coworkers, neighbors, your dentist, your kid's coach. Aim for 50+.","blocks":[
      {"list":{"key":"database","title":"My database","min":10,"ph":"Name — how you know them — best way to reach them"}},
      {"callout":"Pull from your phone contacts, Facebook friends, holiday card list, and email. Most agents are shocked they can list 100+ people once they start."},
    ]},
    {"n":"03","title":"The 'I'm in real estate now' call","sub":"The one conversation that starts your business. Read it, then make it yours below.","blocks":[
      {"script":{"tag":"Sphere announcement script","lines":[
        "<span class='spk'>You:</span> Hey [Name], it's [Your Name] — do you have a quick minute? <em>(wait)</em>",
        "I wanted you to hear it from me: I've joined Your Realty Link and I'm helping people buy and sell homes here in Central Indiana.",
        "I'm not calling to sell you anything — I just want the people I care about to know what I do. If you or anyone you know is ever thinking about a move, I'd love to be your go-to.",
        "<span class='spk'>You:</span> Out of curiosity — do you know anyone right now who's talked about buying or selling? <em>(listen)</em>",
      ]}},
      {"textarea":{"key":"my_soi_script","label":"My version, in my own words","ph":"Rewrite the script so it sounds like you."}},
    ]},
    {"n":"04","title":"Stay in touch — the monthly touch plan","blocks":[
      {"teach":"Out of sight, out of mind. A simple, consistent touch plan keeps you top-of-mind so <b>you</b> get the call when someone's ready. Mix value and personal — not just 'list with me.'"},
      {"checklist":[
        {"key":"t_call","label":"Call or text a portion of my database every week"},
        {"key":"t_social","label":"Post something useful or personal on social regularly"},
        {"key":"t_email","label":"Send a monthly market update or helpful email"},
        {"key":"t_events","label":"Remember birthdays, home-purchase anniversaries, and big life events"},
      ]},
    ]},
    {"n":"05","title":"My plan","blocks":[
      {"grid":[
        {"field":{"key":"touch_count","label":"People I'll reach out to each week","mode":"numeric","ph":"10"}},
        {"field":{"key":"touch_day","label":"My weekly 'sphere day/time'","ph":"Mon & Wed mornings"}},
      ]},
      {"textarea":{"key":"action","label":"This week I will…","ph":"Add 50 people to my database and call 10 of them with the announcement."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
},

# ============================================================ 2.2
"2.2": {
  "file": "yrl-tiger-2-2-open-houses.html",
  "eyebrow": "Phase 2 · Module 2.2",
  "chip": "Worksheet",
  "title": "Open Houses That Generate Leads",
  "lede": "An open house isn't about selling that house — it's the best free lead source a new agent has. Done right, one Saturday can fill your pipeline with buyers and future sellers.",
  "sections": [
    {"n":"01","title":"Why open houses work","blocks":[
      {"teach":"Open houses put you face-to-face with motivated buyers who aren't yet working with an agent — and with neighbors who are curious what their home is worth. Your job isn't to sell the house; it's to <b>start relationships and capture contacts.</b>"},
      {"callout":"Ask another Your Realty Link agent if you can host their listing's open house. You get the leads; they get the exposure. It's the fastest way to start with no listings of your own."},
    ]},
    {"n":"02","title":"Before the open house","blocks":[
      {"checklist":[
        {"key":"o_permission","label":"Get the listing agent's OK and confirm date/time"},
        {"key":"o_signs","label":"Put out plenty of directional signs (and post it on the BLC/social — homes must be online first)"},
        {"key":"o_comps","label":"Know the home, the neighborhood, and 3–4 nearby comps cold"},
        {"key":"o_signin","label":"Set up a sign-in (paper or digital) — capturing contacts is the whole point"},
        {"key":"o_materials","label":"Bring your card, financing info, and a few other listings to show"},
      ]},
    ]},
    {"n":"03","title":"The sign-in ask","sub":"Most visitors will sign in if you ask with confidence. Make it normal.","blocks":[
      {"script":{"tag":"Sign-in + qualifying script","lines":[
        "<span class='spk'>You:</span> Welcome in! Go ahead and sign in for me — the sellers like to know who visited, and I'll send you the info sheet and any price updates.",
        "Are you working with an agent yet, or just starting to look? <em>(listen)</em>",
        "How long have you been looking? And is there a timeline you're hoping to move by?",
        "<span class='spk'>You:</span> If this one isn't the one, I've got a few others that might fit — want me to send them over?",
      ]}},
      {"textarea":{"key":"my_openhouse_script","label":"My greeting, in my own words","ph":"Make it warm and natural to you."}},
    ]},
    {"n":"04","title":"The follow-up that actually converts","blocks":[
      {"teach":"The money is in the follow-up. Most agents collect sign-ins and never call. <b>You</b> will reach out within 24 hours — that alone puts you ahead of the field."},
      {"checklist":[
        {"key":"o_24hr","label":"Text or call every visitor within 24 hours"},
        {"key":"o_adddb","label":"Add every visitor to my database and touch plan"},
        {"key":"o_sendhomes","label":"Send matching listings to anyone still looking"},
      ]},
    ]},
    {"n":"05","title":"My plan","blocks":[
      {"field":{"key":"oh_when","label":"My next open house (date & listing)","ph":"Sat 6/14 — 123 Main St"}},
      {"textarea":{"key":"action","label":"This week I will…","ph":"Ask an agent to host their listing and set up my sign-in sheet."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
},

# ============================================================ 2.3
"2.3": {
  "file": "yrl-tiger-2-3-prospecting.html",
  "eyebrow": "Phase 2 · Module 2.3",
  "chip": "Worksheet",
  "title": "Daily Prospecting & Your Pipeline",
  "lede": "Prospecting is simply talking to people about real estate — every single working day. This module gives you a repeatable daily routine and a simple pipeline so no lead ever slips through the cracks.",
  "sections": [
    {"n":"01","title":"Prospecting, demystified","blocks":[
      {"teach":"Prospecting has a scary reputation, but it's just conversations: your sphere, open-house visitors, past clients, new people you meet. The winners aren't the smoothest talkers — they're the ones who do it <b>consistently</b> during a protected block."},
      {"callout":"Pair this with your lead-gen block from Module 1.4. Same time, every day, before the world gets loud."},
    ]},
    {"n":"02","title":"Your daily prospecting menu","sub":"Pick the mix you'll actually do. Consistency beats intensity.","blocks":[
      {"checklist":[
        {"key":"p_sphere","label":"Call/text a set number of people in my database"},
        {"key":"p_followup","label":"Follow up with every new and active lead"},
        {"key":"p_openhouse","label":"Follow up with recent open-house sign-ins"},
        {"key":"p_pastclients","label":"Check in with a past client or two"},
        {"key":"p_newmeet","label":"Meet and add at least one new person to my database"},
      ]},
      {"field":{"key":"daily_convos","label":"My daily conversation target","hint":"a number you'll hit","mode":"numeric","ph":"10"}},
    ]},
    {"n":"03","title":"A simple pipeline","sub":"Every lead is in one of these stages. Know who's where and what's next.","blocks":[
      {"teach":"<b>New → Nurturing → Active (appointment set) → Under contract → Closed.</b> Your only job each day is to move people to the next stage. A lead with no next step is a lead you'll lose."},
      {"list":{"key":"hot_leads","title":"My hottest leads right now — and their next step","min":5,"ph":"Name — stage — the next action & when"}},
    ]},
    {"n":"04","title":"Handle the 'no' without flinching","blocks":[
      {"script":{"tag":"Objection: 'We're not ready yet'","lines":[
        "<span class='spk'>You:</span> Totally understand — most people aren't ready the day they start thinking about it.",
        "Would it be helpful if I just kept you posted on what's happening with prices in your area, no pressure? That way when you are ready, you're informed.",
        "<em>(If yes → add to database + monthly touch plan.)</em>",
      ]}},
      {"textarea":{"key":"my_objection","label":"How I'll respond, in my own words","ph":"Write a response that feels natural and low-pressure."}},
    ]},
    {"n":"05","title":"My plan","blocks":[
      {"textarea":{"key":"action","label":"This week I will…","ph":"Prospect for one hour every working day and hit my conversation target."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
},

# ============================================================ 2.4
"2.4": {
  "file": "yrl-tiger-2-4-fsbo-expired.html",
  "eyebrow": "Phase 2 · Module 2.4",
  "chip": "Worksheet",
  "title": "FSBO & Expired Listings",
  "lede": "For-Sale-By-Owner and expired listings are motivated sellers who've already told the world they want to sell. Most agents are too nervous to call them — which is exactly why they're such a rich source of listings.",
  "sections": [
    {"n":"01","title":"Why FSBOs and expireds","blocks":[
      {"teach":"A FSBO wants to sell but is trying to avoid paying an agent. An expired listing wanted to sell but didn't — and is often frustrated. Both are motivated. Your job is to show up with genuine help, not a hard pitch."},
      {"callout":"Lead with empathy and value. These sellers get hammered by agents — be the one who's actually useful and different."},
    ]},
    {"n":"02","title":"The FSBO approach","sub":"You're not attacking their choice — you're offering help.","blocks":[
      {"script":{"tag":"FSBO first-contact script","lines":[
        "<span class='spk'>You:</span> Hi, I saw your home for sale by owner — it looks great. I'm [Name] with Your Realty Link.",
        "I'm not calling to pressure you to list. Selling on your own is a lot of work, so I wanted to offer a hand — a free market analysis so you know you're priced right, and I'm happy to bring you any buyers I'm working with.",
        "Out of curiosity, if you found the right buyer through an agent, would you be open to working with one? <em>(listen)</em>",
      ]}},
      {"textarea":{"key":"my_fsbo","label":"My FSBO opener, in my own words","ph":"Make it helpful and low-pressure."}},
    ]},
    {"n":"03","title":"The expired approach","sub":"They're frustrated. Acknowledge it, then show a better plan.","blocks":[
      {"script":{"tag":"Expired first-contact script","lines":[
        "<span class='spk'>You:</span> Hi [Name], I noticed your home didn't sell and just came off the market — I imagine that's frustrating after all that effort.",
        "I've studied why homes in your area sit, and I do things differently. Would you be open to a quick conversation about what it would take to actually get it sold this time?",
        "<em>(If open → set the appointment; bring a real pricing + marketing plan.)</em>",
      ]}},
      {"textarea":{"key":"my_expired","label":"My expired opener, in my own words","ph":"Lead with empathy, then confidence."}},
    ]},
    {"n":"04","title":"Do it consistently","blocks":[
      {"checklist":[
        {"key":"f_daily","label":"Check for new FSBOs and expireds on a set schedule"},
        {"key":"f_empathy","label":"Lead with help and empathy, never a hard sell"},
        {"key":"f_followup","label":"Follow up more than once — persistence (not pestering) wins these"},
        {"key":"f_plan","label":"Show up to appointments with a real pricing & marketing plan"},
      ]},
    ]},
    {"n":"05","title":"My plan","blocks":[
      {"list":{"key":"fsbo_targets","title":"FSBO/expired homes I'll reach out to this week","min":4,"ph":"Address — FSBO or expired — date I'll contact"}},
      {"textarea":{"key":"action","label":"This week I will…","ph":"Contact 5 FSBOs/expireds with a helpful opener and offer a free CMA."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
},

# ============================================================ 2.5
"2.5": {
  "file": "yrl-tiger-2-5-online-social-leads.html",
  "eyebrow": "Phase 2 · Module 2.5",
  "chip": "Worksheet",
  "title": "Online & Social Media Leads",
  "lede": "Your online presence works while you sleep. This module helps you show up consistently on social media and turn followers, likes, and messages into real conversations and clients.",
  "sections": [
    {"n":"01","title":"Why show up online","blocks":[
      {"teach":"When someone in your circle thinks 'real estate,' you want your face to appear. Consistent, genuine posting keeps you top-of-mind and quietly proves you're active and knowledgeable — long before anyone reaches out."},
      {"callout":"You don't need to go viral. You need to be visible and human to the few hundred people who already know you."},
    ]},
    {"n":"02","title":"What to post","sub":"Mix these so you're helpful, local, and human — not a walking billboard.","blocks":[
      {"checklist":[
        {"key":"s_listings","label":"New listings, open houses, and just-solds"},
        {"key":"s_local","label":"Local content — neighborhoods, events, restaurants, market updates"},
        {"key":"s_tips","label":"Helpful tips for buyers and sellers"},
        {"key":"s_personal","label":"Personal & behind-the-scenes — people hire people"},
        {"key":"s_testimonials","label":"Client wins and testimonials (with permission)"},
      ]},
      {"callout":"Tie into Your Realty Link's channels — post your open houses to the YRL Agent Talk page, and use the YouTube channel (YourRealtyLinkIndy) content where it helps."},
    ]},
    {"n":"03","title":"Turn engagement into conversations","blocks":[
      {"teach":"Likes don't close deals — conversations do. When someone engages, take it to a message. Be a helpful human, not a salesperson."},
      {"script":{"tag":"DM follow-up script","lines":[
        "<span class='spk'>You:</span> Hey [Name], thanks for the like/comment! Are you all set where you are, or is a move somewhere on the horizon?",
        "<em>(If curious → answer helpfully, offer a market value or a few listings, and add them to your database.)</em>",
      ]}},
      {"textarea":{"key":"my_dm","label":"My DM opener, in my own words","ph":"Friendly, curious, no pressure."}},
    ]},
    {"n":"04","title":"Stay consistent","blocks":[
      {"grid":[
        {"field":{"key":"post_freq","label":"How often I'll post","ph":"3–4x per week"}},
        {"field":{"key":"post_platform","label":"My main platform(s)","ph":"Facebook + Instagram"}},
      ]},
      {"list":{"key":"content_ideas","title":"My next 5 post ideas","min":5,"ph":"e.g. 'Why Greenwood is booming', open-house recap, 3 tips for first-time buyers"}},
    ]},
    {"n":"05","title":"My plan","blocks":[
      {"textarea":{"key":"action","label":"This week I will…","ph":"Post 3 times and start a real conversation with everyone who engages."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
},

# ============================================================ 2.6
"2.6": {
  "file": "yrl-tiger-2-6-referrals-past-clients.html",
  "eyebrow": "Phase 2 · Module 2.6",
  "chip": "Worksheet",
  "title": "Referrals & Past-Client Follow-Up",
  "lede": "A happy past client is worth more than any ad. This module builds the follow-up habits that turn every closing into repeat business and a steady stream of referrals.",
  "sections": [
    {"n":"01","title":"Why referrals are the endgame","blocks":[
      {"teach":"Referred clients are easier to work with, close more often, and cost nothing to acquire. The catch: referrals don't happen by luck — they happen because you stayed in touch and made it easy to send you people."},
      {"callout":"Most agents lose touch the day after closing. Staying in your clients' lives is the single highest-ROI habit in real estate."},
    ]},
    {"n":"02","title":"Stay in their lives after closing","blocks":[
      {"checklist":[
        {"key":"r_gift","label":"Give a thoughtful closing gift and a genuine thank-you"},
        {"key":"r_anniversary","label":"Reach out on their home-purchase anniversary"},
        {"key":"r_value","label":"Send occasional useful info — market value, home tips, local news"},
        {"key":"r_personal","label":"Remember birthdays and big life events"},
        {"key":"r_review","label":"Ask for a Google/Facebook review while they're thrilled"},
      ]},
    ]},
    {"n":"03","title":"Ask for the referral (the right way)","sub":"Make it specific and easy. 'Anyone?' gets nothing; a clear ask gets names.","blocks":[
      {"script":{"tag":"Referral ask script","lines":[
        "<span class='spk'>You:</span> [Name], it was such a pleasure helping you. I build my business on referrals from people like you rather than spending on ads.",
        "Who's the next person you know who might be thinking about a move — a coworker, neighbor, family member? I'd take great care of them.",
        "<em>(Get the name, ask for a warm intro, and follow up.)</em>",
      ]}},
      {"textarea":{"key":"my_referral","label":"My referral ask, in my own words","ph":"Confident, specific, and gracious."}},
    ]},
    {"n":"04","title":"Reconnect with past clients","sub":"Start now — even clients from a past life or job. List who you'll call back.","blocks":[
      {"list":{"key":"reconnect","title":"Past clients & contacts I'll reconnect with","min":5,"ph":"Name — last contact — how I'll reach out"}},
    ]},
    {"n":"05","title":"My plan","blocks":[
      {"textarea":{"key":"action","label":"This week I will…","ph":"Reconnect with 5 past clients and ask 2 of them for a referral."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
},

# ============================================================ 3.1
"3.1": {
  "file": "yrl-tiger-3-1-buyer-consultation-bra.html",
  "eyebrow": "Phase 3 · Module 3.1",
  "chip": "Worksheet",
  "title": "Buyer Consultation & Buyer Rep Agreement",
  "lede": "A great buyer relationship starts with a real conversation and a signed agreement — not a car ride to a house. This module covers the buyer consultation and the Buyer Representation Agreement that's now required before you tour homes.",
  "sections": [
    {"n":"01","title":"Why consult before you show","blocks":[
      {"teach":"Driving a stranger to houses is the amateur move. A buyer consultation lets you understand their needs, confirm they're financially ready, agree on how you'll work together, and get committed — so you're not wasting weekends on someone who buys with another agent."},
      {"callout":"The consultation is where you turn a lead into a client. Do it first, every time."},
    ]},
    {"n":"02","title":"The Buyer Representation Agreement — required","blocks":[
      {"teach":"As of the NAR settlement rules (in effect since August 2024), you must have a <b>signed written buyer agreement in place before touring homes</b> with a buyer. It spells out the services you provide and how you're compensated."},
      {"teach":"Be clear and honest: buyer representation is a valuable professional service — it is <b>not automatically free</b>. Your compensation is negotiable, and it may be paid by the seller/listing side, by the buyer, or a combination, depending on the deal."},
      {"callout":"Use Your Realty Link's current Buyer Representation Agreement and compensation language, and confirm the details and any required addenda with <b>Janet Giles-Schultz</b> before you sit down with a buyer. Don't wing the paperwork.","confirm":True},
    ]},
    {"n":"03","title":"Run the consultation","sub":"Capture what matters so you show the right homes and set real expectations.","blocks":[
      {"grid":[
        {"field":{"key":"b_timeline","label":"Their timeline to buy","ph":"30–60 days"}},
        {"field":{"key":"b_price","label":"Comfortable price range","ph":"$250k–$300k"}},
      ]},
      {"grid":[
        {"field":{"key":"b_area","label":"Preferred areas","ph":"Greenwood, Franklin"}},
        {"field":{"key":"b_motivation","label":"Why they're moving","ph":"Growing family, closer to work"}},
      ]},
      {"list":{"key":"b_musthaves","title":"Their must-haves vs. nice-to-haves","min":4,"ph":"e.g. 3 bed / 2 bath (must), garage (must), updated kitchen (nice)"}},
    ]},
    {"n":"04","title":"Finance first","sub":"No pre-approval, no showings. Protect everyone's time.","blocks":[
      {"checklist":[
        {"key":"b_preapproval","label":"Buyer is pre-approved (or connected to a lender) before we tour"},
        {"key":"b_downpayment","label":"We've discussed down payment, closing costs, and monthly budget"},
        {"key":"b_programs","label":"We've explored loan types & any down-payment assistance they qualify for"},
      ]},
    ]},
    {"n":"05","title":"The compensation conversation","sub":"Be transparent and confident. Practice it below.","blocks":[
      {"script":{"tag":"How you get paid — buyer script","lines":[
        "<span class='spk'>You:</span> Let's talk about how I get paid so there are no surprises. My representation is a professional service with real value — negotiating, protecting your interests, and getting you to the closing table.",
        "In many sales the seller's side offers compensation to the buyer's agent, which can cover my fee. When it doesn't fully, we'll have already agreed on how that's handled — it's all spelled out in our agreement, up front.",
        "<em>(Walk through the YRL Buyer Representation Agreement together and answer questions honestly.)</em>",
      ]}},
      {"textarea":{"key":"my_comp_talk","label":"My compensation conversation, in my own words","ph":"Confident, transparent, no jargon. Never promise it's 'free.'"}},
    ]},
    {"n":"06","title":"Your action this week","blocks":[
      {"textarea":{"key":"action","label":"This week I will…","ph":"Review the YRL Buyer Representation Agreement with Janet and practice the comp conversation out loud."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
},

# ============================================================ 3.2
"3.2": {
  "file": "yrl-tiger-3-2-finding-showing-homes.html",
  "eyebrow": "Phase 3 · Module 3.2",
  "chip": "Worksheet",
  "title": "Finding & Showing Homes",
  "lede": "Once a buyer is committed and pre-approved, your job is to find the right homes fast and run showings that move them toward a decision — not endless tours that go nowhere.",
  "sections": [
    {"n":"01","title":"Set the search up right","blocks":[
      {"teach":"Turn the consultation into a focused search. Set up saved MLS searches so new listings hit their inbox the moment they list, and curate what you send — quality over quantity keeps buyers trusting your eye."},
      {"callout":"Confirm your MLS/MIBOR search and showing-scheduling tools (e.g., BrokerBay/ShowingTime) with the office so you're set up before your first tour.","confirm":True},
    ]},
    {"n":"02","title":"Curate what you send","blocks":[
      {"checklist":[
        {"key":"s_savedsearch","label":"Set up a saved search matching their must-haves"},
        {"key":"s_preview","label":"Preview or vet listings before sending — don't just forward everything"},
        {"key":"s_educate","label":"Point out value and red flags so they learn to decide"},
      ]},
    ]},
    {"n":"03","title":"Run an efficient showing day","sub":"Group homes, plan a route, and keep it moving.","blocks":[
      {"checklist":[
        {"key":"s_route","label":"Group 3–5 homes and plan the route in advance"},
        {"key":"s_confirm","label":"Confirm each showing and access ahead of time"},
        {"key":"s_notes","label":"Take notes/photos at each home so they don't blur together"},
        {"key":"s_debrief","label":"Debrief after each home — what worked, what didn't"},
      ]},
    ]},
    {"n":"04","title":"Read the buyer & narrow down","blocks":[
      {"script":{"tag":"Narrowing script","lines":[
        "<span class='spk'>You:</span> On a scale of 1–10, where does this one land for you? What would make it a 10? <em>(listen)</em>",
        "If this came on at the right price, is it a home you'd want to write an offer on today — or keep looking?",
        "<em>(Their answers tell you how close you are and what to search for next.)</em>",
      ]}},
      {"textarea":{"key":"my_narrow","label":"My go-to showing questions","ph":"How you'll read the buyer and guide them."}},
    ]},
    {"n":"05","title":"When they find 'the one'","blocks":[
      {"teach":"Hesitation loses homes in a good market. When the box is checked, move decisively to an offer — that's Module 3.3. Your calm confidence gives them permission to act."},
      {"textarea":{"key":"action","label":"This week I will…","ph":"Set up saved searches for my active buyers and plan an efficient showing day."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
},

# ============================================================ 3.3
"3.3": {
  "file": "yrl-tiger-3-3-writing-offers.html",
  "eyebrow": "Phase 3 · Module 3.3",
  "chip": "Worksheet",
  "title": "Writing Offers",
  "lede": "A strong offer is more than a price — it's a package of terms designed to get accepted while protecting your buyer. This module walks through building an offer that wins without overpaying.",
  "sections": [
    {"n":"01","title":"Price it with comps, not emotion","blocks":[
      {"teach":"Your buyer needs to know what the home is really worth. Pull recent comparable sales, factor in condition and market heat, and recommend a number backed by data — then let the buyer decide."},
      {"callout":"In a hot segment, the right offer may be at or above list with strong terms. In a slow one, there's room to negotiate. Know which you're in before you write."},
    ]},
    {"n":"02","title":"Terms beyond price","sub":"These often matter as much as the number. Know your buyer's flexibility on each.","blocks":[
      {"list":{"key":"o_terms","title":"Terms I'll set with my buyer","min":5,"ph":"e.g. earnest money, financing type, inspection, closing date, possession, contingencies"}},
    ]},
    {"n":"03","title":"The purchase agreement","blocks":[
      {"teach":"In Indiana you'll write the offer on the standard Purchase Agreement plus the appropriate addenda. Fill it out completely and accurately — sloppy paperwork kills deals and trust."},
      {"callout":"Use the current Indiana/IAR Purchase Agreement and required addenda (including any buyer-broker compensation addendum). Confirm the exact forms and process with Janet, and prepare documents in Dotloop.","confirm":True},
    ]},
    {"n":"04","title":"Present & submit with a strategy","blocks":[
      {"checklist":[
        {"key":"o_preapproval","label":"Attach the pre-approval / proof of funds"},
        {"key":"o_clean","label":"Double-check every field, date, and signature before sending"},
        {"key":"o_call","label":"Call the listing agent to present the offer and your buyer's story"},
        {"key":"o_deadline","label":"Set a reasonable response deadline"},
      ]},
    ]},
    {"n":"05","title":"My plan","blocks":[
      {"textarea":{"key":"action","label":"This week I will…","ph":"Practice building a full offer package on the current IAR forms in Dotloop."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
},

# ============================================================ 3.4
"3.4": {
  "file": "yrl-tiger-3-4-negotiating.html",
  "eyebrow": "Phase 3 · Module 3.4",
  "chip": "Worksheet",
  "title": "Negotiating Win-Win Agreements",
  "lede": "Good negotiation isn't about winning — it's about getting your client a great outcome while keeping the deal together. This module covers counteroffers, inspections, appraisal gaps, and keeping cool heads.",
  "sections": [
    {"n":"01","title":"The negotiator's mindset","blocks":[
      {"teach":"Both sides want the deal to close. Your job is to advocate hard for your client and keep the other side willing to say yes. Stay calm, stay factual, and never let emotion — theirs or yours — blow up a good deal."},
      {"callout":"The best negotiators listen more than they talk. Understand what the other side actually needs, and you'll find the trade that works."},
    ]},
    {"n":"02","title":"Counteroffers","blocks":[
      {"script":{"tag":"Presenting a counter to your buyer","lines":[
        "<span class='spk'>You:</span> They came back at [X]. Here's what the comps support and here's what matters most to you. I'd suggest we counter at [Y] and hold firm on [key term].",
        "This keeps us in a strong position without losing the house. How do you feel about that?",
      ]}},
      {"textarea":{"key":"my_counter","label":"How I'll frame counters for clients","ph":"Data + their priorities + a clear recommendation."}},
    ]},
    {"n":"03","title":"Inspection & repair negotiation","blocks":[
      {"teach":"After inspection, focus on what matters — safety, systems, and big-ticket items — not every cosmetic nit. Ask for repairs, a credit, or a price reduction, and know your buyer's walk-away line before you respond."},
      {"checklist":[
        {"key":"n_prioritize","label":"Prioritize health/safety & major systems over cosmetics"},
        {"key":"n_options","label":"Know the options: repairs, credit, price cut, or accept"},
        {"key":"n_walkline","label":"Confirm the buyer's walk-away line in advance"},
      ]},
    ]},
    {"n":"04","title":"Appraisal gaps & curveballs","blocks":[
      {"teach":"If a home appraises below the offer, you have levers: renegotiate price, the buyer covers the gap, or you challenge the appraisal with better comps. Know these before they happen so you're the calm expert in the room."},
      {"list":{"key":"n_curveballs","title":"Curveballs I'll prepare for","min":3,"ph":"e.g. low appraisal, financing hiccup, competing offer, inspection surprise"}},
    ]},
    {"n":"05","title":"My plan","blocks":[
      {"textarea":{"key":"action","label":"This week I will…","ph":"Role-play a counteroffer and an inspection negotiation with another agent."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
},

# ============================================================ 3.5
"3.5": {
  "file": "yrl-tiger-3-5-buyer-contract-to-close.html",
  "eyebrow": "Phase 3 · Module 3.5",
  "chip": "Worksheet",
  "title": "Buyer Contract-to-Close",
  "lede": "Getting the offer accepted is halftime. From accepted contract to keys in hand, dozens of dates and details have to line up. This module gives you the timeline and the checklist to close on time.",
  "sections": [
    {"n":"01","title":"You're the quarterback","blocks":[
      {"teach":"Between contract and closing, you coordinate the lender, title company, inspector, appraiser, and the other agent. Miss a date and the deal wobbles. Stay on top of the timeline and communicate constantly — this is where you earn the trust that creates referrals."},
    ]},
    {"n":"02","title":"Key dates & contingencies","sub":"Every contract lives or dies by these deadlines. Track them.","blocks":[
      {"list":{"key":"c_dates","title":"Critical dates on my current deal(s)","min":4,"ph":"e.g. inspection by ___, financing by ___, appraisal by ___, closing ___"}},
      {"callout":"Missing a contingency deadline can cost your buyer their earnest money or their protections. Calendar every date the day the contract is accepted."},
    ]},
    {"n":"03","title":"Coordinate the team","blocks":[
      {"checklist":[
        {"key":"c_lender","label":"Stay in close contact with the lender on loan progress"},
        {"key":"c_title","label":"Confirm title work and the title company have what they need"},
        {"key":"c_inspection","label":"Schedule inspection and handle the response on time"},
        {"key":"c_appraisal","label":"Track the appraisal and address any gap early"},
        {"key":"c_updates","label":"Give the buyer a status update at least weekly"},
      ]},
    ]},
    {"n":"04","title":"Keep a clean file","blocks":[
      {"teach":"Every document goes into Dotloop as it's signed. A clean, complete file protects your buyer, keeps you compliant, and gets you paid faster."},
      {"callout":"Follow Your Realty Link's Dotloop and file process (broker sign-off, all docs uploaded, file completed after closing). Confirm the exact steps with Janet — see the office SOPs.","confirm":True},
    ]},
    {"n":"05","title":"Final walkthrough & closing","blocks":[
      {"checklist":[
        {"key":"c_walkthrough","label":"Do the final walkthrough right before closing — confirm condition & repairs"},
        {"key":"c_funds","label":"Buyer knows their final cash-to-close and how to bring it"},
        {"key":"c_celebrate","label":"Celebrate, get the review, and start the past-client follow-up (Module 2.6)"},
      ]},
      {"textarea":{"key":"action","label":"This week I will…","ph":"Build a contract-to-close checklist and calendar template I use on every deal."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
},

# ============================================================ 4.1
"4.1": {
  "file": "yrl-tiger-4-1-finding-seller-leads.html",
  "eyebrow": "Phase 4 · Module 4.1",
  "chip": "Worksheet",
  "title": "Finding Seller Leads",
  "lede": "Listings are the engine of a real estate business — they market you, bring buyer leads, and pay well. This module shows you where seller leads come from and how to plant seeds so people call you when they're ready to sell.",
  "sections": [
    {"n":"01","title":"Why listings matter most","blocks":[
      {"teach":"A listing works for you 24/7: the sign, the online exposure, and the buyer calls all point back to you. Agents who control listings control their business. Your job is to become the name people think of when they consider selling."},
    ]},
    {"n":"02","title":"Where seller leads come from","sub":"Name the wells you'll work. FSBOs and expireds have their own module (2.4).","blocks":[
      {"list":{"key":"seller_sources","title":"My seller-lead sources","min":5,"ph":"e.g. sphere, past clients, FSBO/expired, geographic farm, life events, 'home value' leads"}},
    ]},
    {"n":"03","title":"The 'what's your home worth' hook","sub":"A free, no-pressure home value is the easiest way to start a seller conversation.","blocks":[
      {"script":{"tag":"Home-value opener","lines":[
        "<span class='spk'>You:</span> With how the market's moved, a lot of people are surprised what their home is worth right now. Want me to put together a free, no-obligation value for yours?",
        "<em>(Deliver a real comparative market analysis, then stay in touch on their timeline.)</em>",
      ]}},
      {"textarea":{"key":"my_value_hook","label":"My home-value opener, in my own words","ph":"Friendly and no-pressure."}},
    ]},
    {"n":"04","title":"Plant seeds consistently","blocks":[
      {"checklist":[
        {"key":"sl_ask","label":"Ask my sphere who they know that's thinking of selling"},
        {"key":"sl_value","label":"Offer free home valuations regularly"},
        {"key":"sl_farm","label":"Work a geographic farm or neighborhood I want listings in"},
        {"key":"sl_lifeevents","label":"Watch for life events (new baby, empty nest, job move, divorce, estate)"},
      ]},
      {"textarea":{"key":"action","label":"This week I will…","ph":"Offer 5 free home valuations to people in my sphere."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
},

# ============================================================ 4.2
"4.2": {
  "file": "yrl-tiger-4-2-prelisting-packet.html",
  "eyebrow": "Phase 4 · Module 4.2",
  "chip": "Worksheet",
  "title": "Your Prelisting Packet",
  "lede": "The best listing agents win the listing before they ever walk in the door. Sending a prelisting packet ahead of the appointment positions Your Realty Link, builds trust, and makes the meeting a formality.",
  "sections": [
    {"n":"01","title":"Why send it before you meet","blocks":[
      {"teach":"When a seller reviews who you are and how you sell homes before your appointment, you show up as the expert they've already chosen. It also lets you spend the meeting listening and pricing, not selling from scratch."},
      {"callout":"Read the YRL Pre-Listing Presentation over and over until you know it cold — you should be able to speak to every point without the packet in front of you."},
    ]},
    {"n":"02","title":"What to send ahead","blocks":[
      {"checklist":[
        {"key":"pl_presentation","label":"The YRL Pre-Listing Presentation (why list with Your Realty Link)"},
        {"key":"pl_website","label":"A link to yourrealtylink.com — point out the Sellers section"},
        {"key":"pl_whopays","label":"The 'Who Pays What at Closing' info, including buyer-broker commission"},
        {"key":"pl_addendum","label":"The addendum about the seller paying buyer-agent compensation — note you'll discuss it in person"},
      ]},
      {"callout":"Find the current Pre-Listing Presentation and forms in the YRL agent shared docs (SharePoint — YRL Agents). Confirm the latest versions and the buyer-broker-compensation talking points with Janet before you send.","confirm":True},
    ]},
    {"n":"03","title":"Do your homework before the meeting","sub":"Walk in prepared — it's how you earn instant credibility.","blocks":[
      {"checklist":[
        {"key":"pl_comps","label":"Pull comps (active, pending, sold) for a preliminary CMA"},
        {"key":"pl_tax","label":"Check tax records / Realist for owners, legal description, and last year's taxes"},
        {"key":"pl_oldblc","label":"Look up any old BLC listing on the property in ConnectBLC"},
        {"key":"pl_emails","label":"Ask for each owner's email early so listing docs can be prepped in Dotloop"},
      ]},
      {"textarea":{"key":"action","label":"This week I will…","ph":"Assemble my prelisting packet and practice presenting it out loud."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
},

# ============================================================ 4.3
"4.3": {
  "file": "yrl-tiger-4-3-pricing-cma.html",
  "eyebrow": "Phase 4 · Module 4.3",
  "chip": "Worksheet",
  "title": "Pricing Right & Presenting the CMA",
  "lede": "Price is the single biggest factor in whether a home sells. This module shows you how to build a credible CMA and present a price with data — so the seller trusts your number over a website's guess.",
  "sections": [
    {"n":"01","title":"Why pricing is everything","blocks":[
      {"teach":"Overpriced homes sit, go stale, and sell for less than if they'd been priced right from day one. Your job is to protect the seller from their own optimism with data — and to price for how buyers actually shop."},
      {"callout":"The first two weeks on market get the most attention. Price right out of the gate and you capture that surge instead of chasing the market down."},
    ]},
    {"n":"02","title":"Build the CMA","sub":"Comparable sales tell the real story. Use what you can pull from the BLC and public records.","blocks":[
      {"checklist":[
        {"key":"cma_sold","label":"Recent sold comps (the strongest evidence of value)"},
        {"key":"cma_active","label":"Active listings (your competition right now)"},
        {"key":"cma_pending","label":"Pending sales (where the market is heading)"},
        {"key":"cma_adjust","label":"Adjust for condition, updates, lot, and location"},
      ]},
      {"callout":"The CMA tool in ConnectBLC is limited — pull what you can and fill gaps from comps and tax records. Confirm the current process with Janet.","confirm":True},
    ]},
    {"n":"03","title":"Present the price with confidence","sub":"Lead with data, then handle the inevitable pushback.","blocks":[
      {"script":{"tag":"'But Zillow says it's worth more' script","lines":[
        "<span class='spk'>You:</span> I hear you — those online estimates are a starting point, but they can't walk your home or account for the recent sales right around you the way I can.",
        "Here's what actually sold nearby and what's competing with you today. Based on the real numbers, here's where I'd price it to sell — and why.",
      ]}},
      {"textarea":{"key":"my_price_talk","label":"How I'll present price & handle pushback","ph":"Data first, empathy second, confidence throughout."}},
    ]},
    {"n":"04","title":"My plan","blocks":[
      {"textarea":{"key":"action","label":"This week I will…","ph":"Build a full CMA on a practice property and rehearse presenting the price."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
},

# ============================================================ 4.4
"4.4": {
  "file": "yrl-tiger-4-4-list-a-home.html",
  "eyebrow": "Phase 4 · Module 4.4",
  "chip": "Workflow",
  "title": "List a Home for Sale",
  "lede": "This is the full, step-by-step Your Realty Link workflow for taking a listing — from the research you do before the appointment to getting the home live on the BLC. It follows our real systems: ConnectBLC, Realist, Dotloop, and BrokerBay.",
  "sections": [
    {"n":"01","title":"Before you meet — research the property","blocks":[
      {"teach":"Walk in knowing more about the home than the seller expects. In <b>ConnectBLC</b>, search the address for any old listing — you can reuse the old BLC number later to speed up creating the new listing, and pull comps for a partial CMA."},
      {"checklist":[
        {"key":"l_oldblc","label":"Look up any OLD listing/BLC number in ConnectBLC (print & save to the file)"},
        {"key":"l_tax","label":"Pull Realist / tax records for owners, correct legal, and last year's taxes"},
        {"key":"l_verify","label":"Verify who is on title / who will need to sign"},
      ]},
      {"callout":"These are Your Realty Link's current steps. Systems and forms change — confirm anything you're unsure about with Janet Giles-Schultz (317-997-7404).","confirm":True},
    ]},
    {"n":"02","title":"Prepare your listing documents in Dotloop","sub":"Dotloop is our property & document management system. Set the file up before you meet.","blocks":[
      {"teach":"Create a <b>new Dotloop file titled by the street address</b>. Get each signer's email early (every seller who must sign needs their own email). Pull your first set of listing documents from the templates and fill them in."},
      {"checklist":[
        {"key":"d_ers","label":"Listing Contract — Exclusive Right to Sell"},
        {"key":"d_lbp","label":"Lead-Based Paint form (if the home was built before 1978)"},
        {"key":"d_disclosure","label":"Seller's Residential Sales Disclosure"},
        {"key":"d_netsheet","label":"Seller's Net Sheet"},
        {"key":"d_emails","label":"Collected each signer's email for digital signing"},
      ]},
      {"callout":"Open a new Dotloop file for every property by street address. Dotloop has no delete — archive, don't delete. Confirm the current template set and net-sheet form with Janet.","confirm":True},
    ]},
    {"n":"03","title":"What to bring to the appointment","blocks":[
      {"checklist":[
        {"key":"b_contract","label":"The completed listing contract to sign (or your laptop with Dotloop)"},
        {"key":"b_comps","label":"Comps and tax-record info to discuss"},
        {"key":"b_forms","label":"Sales Disclosure & Lead-Based Paint form (if pre-1978)"},
        {"key":"b_netsheet","label":"Net sheet, utility sheet, and a copy of the prelisting packet"},
        {"key":"b_lockbox","label":"Lockbox (note the code on the listing contract), sign & rider, tape measure"},
      ]},
    ]},
    {"n":"04","title":"Who signs the listing contract","blocks":[
      {"teach":"Anyone on the tax records / deed as an owner (or a legal power-of-attorney designee) must sign. Special cases: in a <b>divorce</b>, both parties sign; on a <b>death of an owner</b>, you'll need a death certificate for the title company and the executor signs — order preliminary title work early and find out if the sale needs court approval."},
      {"callout":"Your <b>principal broker signs and accepts every listing</b>. Add the broker to the Dotloop file with edit and signing rights.","confirm":True},
    ]},
    {"n":"05","title":"Photos","blocks":[
      {"teach":"Great pictures sell houses. Take at least one exterior and one interior on your phone at the appointment so you can post to social immediately. For the real listing, use a professional if you can — YRL has photographers (roughly $150–250 per listing)."},
      {"checklist":[
        {"key":"p_two","label":"At least TWO photos are required to activate the listing on the BLC (or risk a fine)"},
        {"key":"p_never","label":"NEVER reuse photos from an old listing without the prior agent's permission (BLC violation)"},
      ]},
    ]},
    {"n":"06","title":"Post the home on the BLC","blocks":[
      {"teach":"Reuse the old BLC number and the tax records to speed up entering the new listing — you'll need very little other info. The listing must be online within <b>2 days of any advertising</b> (sign, social post, etc.)."},
      {"checklist":[
        {"key":"blc_agent","label":"Put Janet Giles (MIBOR 1322) as listing agent and yourself as co-agent while you're getting set up"},
        {"key":"blc_showing","label":"Select the showing service (BrokerBay is included in tech fees; ShowingTime is optional/paid)"},
        {"key":"blc_two","label":"Two photos minimum to activate — a two-photo listing screams 'needs work'"},
        {"key":"blc_social","label":"Post the exterior photo to the YRL Agent Talk page before it hits the BLC"},
      ]},
      {"callout":"BrokerBay is MIBOR's approved showing vendor and is included in tech fees. Confirm the current listing-agent/co-agent setup and any fees with Janet before you enter a listing on your own.","confirm":True},
    ]},
    {"n":"07","title":"Your action this week","blocks":[
      {"textarea":{"key":"action","label":"This week I will…","ph":"Practice the full listing workflow in Dotloop on a test file, start to finish."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
},

# ============================================================ 4.5
"4.5": {
  "file": "yrl-tiger-4-5-listing-appointment.html",
  "eyebrow": "Phase 4 · Module 4.5",
  "chip": "Worksheet",
  "title": "The Listing Appointment",
  "lede": "The listing appointment is where trust turns into a signature. This module helps you run a confident appointment that walks the seller from 'nice to meet you' to 'where do I sign?'",
  "sections": [
    {"n":"01","title":"The appointment is a presentation","blocks":[
      {"teach":"You're not just chatting — you're presenting a plan to sell their biggest asset. Because you sent the prelisting packet, they already trust Your Realty Link. Now walk the home, present your price and marketing plan, and ask for the business."},
    ]},
    {"n":"02","title":"Walk the home & build rapport","blocks":[
      {"checklist":[
        {"key":"a_tour","label":"Tour the home — note updates, features, and issues that affect price"},
        {"key":"a_listen","label":"Ask why they're selling and their timeline — really listen"},
        {"key":"a_measure","label":"Measure rooms if you don't have an old listing to pull from"},
      ]},
    ]},
    {"n":"03","title":"Present price & plan, then ask","sub":"Don't hint — ask for the signature directly.","blocks":[
      {"script":{"tag":"The close","lines":[
        "<span class='spk'>You:</span> Based on everything we've covered — the comps, your timeline, and our marketing plan — I recommend we list at [price].",
        "I'd love to get to work for you. Let's get the paperwork started so we can have this live and in front of buyers this week. Sound good?",
        "<em>(Then walk them through signing in Dotloop or on paper.)</em>",
      ]}},
      {"textarea":{"key":"my_close","label":"My listing close, in my own words","ph":"Confident and direct — ask for the business."}},
    ]},
    {"n":"04","title":"Handle 'we want to think about it'","blocks":[
      {"script":{"tag":"Objection script","lines":[
        "<span class='spk'>You:</span> Absolutely — this is a big decision. What specifically would you like to think over? Is it the price, the plan, or something else?",
        "<em>(Address the real concern. Often it's one question away from a yes.)</em>",
      ]}},
      {"textarea":{"key":"action","label":"This week I will…","ph":"Rehearse my listing presentation and close with another agent."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
},

# ============================================================ 4.6
"4.6": {
  "file": "yrl-tiger-4-6-marketing-servicing.html",
  "eyebrow": "Phase 4 · Module 4.6",
  "chip": "Worksheet",
  "title": "Marketing & Servicing Your Listings",
  "lede": "Getting the listing is the start. Marketing it well and keeping the seller informed is how you sell it fast, for top dollar, and earn the reviews and referrals that grow your business.",
  "sections": [
    {"n":"01","title":"Market the home","blocks":[
      {"teach":"Great photos, wide exposure, and momentum in the first two weeks do the heavy lifting. Get it in front of as many buyers and agents as possible, fast."},
      {"checklist":[
        {"key":"m_photos","label":"Professional photos (great pictures sell homes)"},
        {"key":"m_blc","label":"Full, accurate BLC entry with complete remarks"},
        {"key":"m_social","label":"Post to social and the YRL Agent Talk page"},
        {"key":"m_openhouse","label":"Schedule an open house (see Module 2.2)"},
      ]},
    ]},
    {"n":"02","title":"Service the seller","sub":"Communication is what sellers remember. Never leave them wondering.","blocks":[
      {"checklist":[
        {"key":"m_weekly","label":"Give the seller a status update at least weekly"},
        {"key":"m_feedback","label":"Share showing feedback promptly"},
        {"key":"m_activity","label":"Report on views, showings, and market activity"},
      ]},
    ]},
    {"n":"03","title":"When it's not selling","blocks":[
      {"teach":"If showings are light or feedback points to price, have the honest conversation early. A well-timed price adjustment beats a home going stale. Bring data, not apologies."},
      {"textarea":{"key":"action","label":"This week I will…","ph":"Build my listing marketing checklist and a weekly seller-update template."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
},

# ============================================================ 4.7
"4.7": {
  "file": "yrl-tiger-4-7-seller-contract-to-close.html",
  "eyebrow": "Phase 4 · Module 4.7",
  "chip": "Worksheet",
  "title": "Seller Contract-to-Close",
  "lede": "An accepted offer on your listing is the beginning of the most important stretch. This module helps you manage offers, negotiate for your seller, and shepherd the file to a clean, on-time closing.",
  "sections": [
    {"n":"01","title":"Present every offer","blocks":[
      {"teach":"Present each offer to your seller fairly and clearly — price, terms, financing strength, and contingencies. Your seller decides; your job is to advise, then negotiate hard on their behalf (negotiation skills are in Module 3.4)."},
    ]},
    {"n":"02","title":"Manage the timeline","sub":"The same dates that matter on the buyer side matter here — track them.","blocks":[
      {"list":{"key":"s_dates","title":"Key dates on my listing under contract","min":4,"ph":"e.g. inspection response by ___, appraisal ___, buyer financing ___, closing ___"}},
      {"checklist":[
        {"key":"s_inspection","label":"Handle the inspection response with the seller on time"},
        {"key":"s_appraisal","label":"Track the appraisal and prepare comps in case it comes in low"},
        {"key":"s_financing","label":"Stay in touch with the buyer's agent on loan progress"},
      ]},
    ]},
    {"n":"03","title":"Clean file & closing","blocks":[
      {"teach":"Every signed document goes into Dotloop, the broker signs off, and the file gets completed after closing. A clean file keeps you compliant and gets you paid without delay."},
      {"callout":"Follow the YRL Dotloop and file-completion process, with broker acceptance and all closing docs uploaded. Confirm the current steps with Janet — see the office SOPs.","confirm":True},
      {"checklist":[
        {"key":"s_review","label":"After closing: ask for a Google/Facebook review and start past-client follow-up"},
      ]},
      {"textarea":{"key":"action","label":"This week I will…","ph":"Create a seller contract-to-close checklist mirroring my buyer-side one."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
},

# ============================================================ 5.1
"5.1": {
  "file": "yrl-tiger-5-1-dotloop-compliance.html",
  "eyebrow": "Phase 5 · Module 5.1",
  "chip": "Workflow",
  "title": "Dotloop File Compliance",
  "lede": "A clean, complete transaction file protects your client, keeps you compliant with MIBOR and the state, and gets you paid faster. This module covers Your Realty Link's Dotloop and file standards.",
  "sections": [
    {"n":"01","title":"Why the file matters","blocks":[
      {"teach":"Real estate runs on documentation. A sloppy file exposes you and your client to liability and delays your commission. The habit to build: every document goes into Dotloop the moment it's signed."},
      {"callout":"These are Your Realty Link's current standards. Confirm the exact process, forms, and timing with Janet Giles-Schultz — see the office SOPs.","confirm":True},
    ]},
    {"n":"02","title":"The file rules","blocks":[
      {"checklist":[
        {"key":"f_perfile","label":"One Dotloop file per property, titled by street address"},
        {"key":"f_archive","label":"Never delete — archive. (Dotloop has no delete.)"},
        {"key":"f_pdf","label":"Add every document as a PDF as soon as it's signed"},
        {"key":"f_broker","label":"Add the broker as admin with edit & signing rights; broker signs/accepts"},
        {"key":"f_paper","label":"Keep a paper copy (yellow folder) available at the office while active"},
      ]},
    ]},
    {"n":"03","title":"Get paid — complete the file","blocks":[
      {"teach":"Management wants a complete file with all closing documents in Dotloop before an agent is paid. Turn the file in promptly and completely after closing so nothing holds up your commission."},
      {"checklist":[
        {"key":"f_closingdocs","label":"All closing documents uploaded after closing"},
        {"key":"f_complete","label":"File marked complete / turned in per office process"},
      ]},
      {"textarea":{"key":"action","label":"This week I will…","ph":"Walk through the YRL Dotloop file checklist with Janet and set up a template file."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
},

# ============================================================ 5.2
"5.2": {
  "file": "yrl-tiger-5-2-reviews-referrals.html",
  "eyebrow": "Phase 5 · Module 5.2",
  "chip": "Worksheet",
  "title": "Getting Reviews & Referrals",
  "lede": "Reviews and referrals are the compounding interest of a real estate career. This module builds the habit of asking — at the right moment, in the right way — so your reputation does the selling for you.",
  "sections": [
    {"n":"01","title":"Why reviews matter","blocks":[
      {"teach":"Before someone hires you, they check what others say. A steady stream of genuine 5-star reviews on Google and Facebook makes every future lead easier to win. The best time to ask is right after closing, when your client is thrilled."},
    ]},
    {"n":"02","title":"Ask for the review","blocks":[
      {"script":{"tag":"Review ask","lines":[
        "<span class='spk'>You:</span> I'm so happy for you! One quick favor — reviews are how people find me. Would you mind leaving a few words about your experience on Google? I'll text you the link right now so it's easy.",
        "<em>(Send the direct review link immediately, while you're together.)</em>",
      ]}},
      {"checklist":[
        {"key":"rev_timing","label":"Ask at the peak moment — at or right after closing"},
        {"key":"rev_link","label":"Send the direct Google/Facebook review link to make it one tap"},
        {"key":"rev_thank","label":"Thank them and respond to the review when it posts"},
      ]},
    ]},
    {"n":"03","title":"Turn happy clients into referrals","blocks":[
      {"teach":"A review is public proof; a referral is a warm lead. Pair them: ask for the review, then ask who they know that's thinking about a move (the referral scripts live in Module 2.6)."},
      {"textarea":{"key":"action","label":"This week I will…","ph":"Set up my direct review links and ask my last 3 happy clients for a review."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
},

# ============================================================ 5.3
"5.3": {
  "file": "yrl-tiger-5-3-client-experience.html",
  "eyebrow": "Phase 5 · Module 5.3",
  "chip": "Worksheet",
  "title": "Client Experience & Follow-Up",
  "lede": "The experience you deliver decides whether a client sends you three referrals or none. This module sets your communication standards and a follow-up system that keeps clients for life.",
  "sections": [
    {"n":"01","title":"Set the standard","blocks":[
      {"teach":"Clients rarely remember every detail of a transaction — but they remember how you made them feel. Fast communication, honesty, and proactive updates turn a one-time deal into a lifelong relationship."},
    ]},
    {"n":"02","title":"Your communication standards","blocks":[
      {"checklist":[
        {"key":"ce_respond","label":"Respond to clients quickly — set an expectation and beat it"},
        {"key":"ce_proactive","label":"Update them before they have to ask"},
        {"key":"ce_honest","label":"Be honest about problems — bad news early beats surprises late"},
        {"key":"ce_setexpectations","label":"Set clear expectations at the start of every transaction"},
      ]},
    ]},
    {"n":"03","title":"Follow-up that keeps clients for life","blocks":[
      {"teach":"The relationship doesn't end at closing — that's when the most valuable part begins. A simple, consistent follow-up plan (tied to your database, Module 2.1) keeps you top-of-mind for their next move and every referral."},
      {"list":{"key":"ce_touches","title":"My post-closing touch plan","min":4,"ph":"e.g. closing gift, 30-day check-in, home-anniversary note, quarterly value email"}},
      {"textarea":{"key":"action","label":"This week I will…","ph":"Write my communication standards and set up a post-closing follow-up plan."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
},

# ============================================================ 0.1
"0.1": {
  "file": "yrl-tiger-0-1-license-mibor.html",
  "eyebrow": "Phase 0 · Module 0.1",
  "chip": "Checklist",
  "title": "Getting Licensed & Joining MIBOR",
  "lede": "Before you can list or sell, you need your Indiana real estate license and MIBOR membership. This module is your checklist for getting fully credentialed and ready to work at Your Realty Link.",
  "sections": [
    {"n":"01","title":"Your license","blocks":[
      {"teach":"You'll complete Indiana's required pre-licensing education, pass the state exam, and activate your license under Your Realty Link. Keep your license number handy — you'll need it to be set up in our systems."},
      {"callout":"Confirm the current pre-licensing provider, exam steps, and how to activate your license under Your Realty Link with Janet Giles-Schultz (317-997-7404). Steps and providers change — verify before you rely on them.","confirm":True},
    ]},
    {"n":"02","title":"Track your progress","blocks":[
      {"checklist":[
        {"key":"lic_edu","label":"Completed required pre-licensing education"},
        {"key":"lic_exam","label":"Passed the Indiana state exam"},
        {"key":"lic_activate","label":"Activated my license under Your Realty Link"},
        {"key":"lic_mibor","label":"Joined MIBOR (our MLS/REALTOR association)"},
      ]},
      {"grid":[
        {"field":{"key":"lic_number","label":"My license number","ph":"once issued"}},
        {"field":{"key":"lic_mibor_id","label":"My MIBOR member ID","ph":"once joined"}},
      ]},
    ]},
    {"n":"03","title":"Why MIBOR matters","blocks":[
      {"teach":"MIBOR is our local REALTOR association and MLS. Membership gives you access to the BLC (our MLS), the forms and lockbox systems, and the professional standards you'll work under. You must be a MIBOR member to be the listing agent on a property."},
      {"textarea":{"key":"action","label":"My next step this week…","ph":"e.g. Schedule my exam / submit my MIBOR application."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
},

# ============================================================ 0.2
"0.2": {
  "file": "yrl-tiger-0-2-dotloop-setup.html",
  "eyebrow": "Phase 0 · Module 0.2",
  "chip": "Checklist",
  "title": "Setting Up Dotloop",
  "lede": "Dotloop is Your Realty Link's document and transaction management system. This module gets you set up so you can prepare and sign listing and purchase documents online.",
  "sections": [
    {"n":"01","title":"What Dotloop is","blocks":[
      {"teach":"Dotloop is where every transaction lives — you prepare documents, get clients to sign electronically, and store the complete file. Your Realty Link pays for your Dotloop, but you need a few things in place first."},
    ]},
    {"n":"02","title":"Get set up","blocks":[
      {"checklist":[
        {"key":"dl_license","label":"Have my state license number (required to log in)"},
        {"key":"dl_mibor","label":"Be an actual MIBOR member so YRL admin can create my Dotloop page"},
        {"key":"dl_admin","label":"Ask YRL admin to set up my Dotloop account"},
        {"key":"dl_learn","label":"Explore the templates and practice preparing a document"},
      ]},
      {"callout":"YRL pays for your Dotloop, but you must have your license number and MIBOR membership before admin can set you up. While you wait, another agent can share their login so you can start learning — confirm with Janet.","confirm":True},
    ]},
    {"n":"03","title":"Learn the basics","blocks":[
      {"teach":"Once you're in, get comfortable creating a file (titled by property address), pulling documents from templates, and sending them for signature. You'll use this on every listing and every offer — the workflow modules (4.4, 3.3) walk through the documents themselves."},
      {"textarea":{"key":"action","label":"My next step this week…","ph":"e.g. Ask admin to set up my account, or shadow an agent's Dotloop file."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
},

# ============================================================ 0.3
"0.3": {
  "file": "yrl-tiger-0-3-tech-tools.html",
  "eyebrow": "Phase 0 · Module 0.3",
  "chip": "Checklist",
  "title": "YRL Tech & Tools Tour",
  "lede": "Your Realty Link gives you a set of tools to run your business. This module is a tour of the systems you'll use every day and a checklist to make sure you have access to each one.",
  "sections": [
    {"n":"01","title":"Your toolkit","blocks":[
      {"teach":"You don't need to master everything at once — just know what each tool is for and make sure you have access. You'll go deeper on each in the modules where you use it."},
      {"callout":"Confirm the current tools, logins, and any tech fees with Janet — this list reflects our core systems but can change.","confirm":True},
    ]},
    {"n":"02","title":"Get access to each","blocks":[
      {"checklist":[
        {"key":"tech_blc","label":"ConnectBLC / MIBOR — our MLS for listings, comps, and public records"},
        {"key":"tech_dotloop","label":"Dotloop — documents & transaction management"},
        {"key":"tech_brokerbay","label":"BrokerBay — showing scheduling (included in tech fees)"},
        {"key":"tech_sharepoint","label":"SharePoint (YRL Agents) — shared docs, prelisting presentation, forms"},
        {"key":"tech_website","label":"yourrealtylink.com — our website (Sellers & Buyers sections)"},
        {"key":"tech_youtube","label":"YouTube — the 'YourRealtyLinkIndy' channel for agent resources"},
        {"key":"tech_fbgroup","label":"YRL Agent Talk (Facebook) — post new listings & office updates"},
      ]},
    ]},
    {"n":"03","title":"My logins & notes","blocks":[
      {"textarea":{"key":"tech_notes","label":"Where I still need access or help","ph":"List anything you can't get into yet so you can follow up."}},
      {"textarea":{"key":"action","label":"My next step this week…","ph":"e.g. Request access to SharePoint and BrokerBay."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
},

# ============================================================ 0.4
"0.4": {
  "file": "yrl-tiger-0-4-brand-profile.html",
  "eyebrow": "Phase 0 · Module 0.4",
  "chip": "Worksheet",
  "title": "Your Brand & Agent Profile",
  "lede": "People hire people. This module gets your professional identity in place — headshot, bio, contact info, and signature — so you look established from day one under the Your Realty Link brand.",
  "sections": [
    {"n":"01","title":"Look the part from day one","blocks":[
      {"teach":"You don't need years of experience to look professional. A good headshot, a warm bio, and consistent contact info tell people you're the real deal and easy to reach."},
    ]},
    {"n":"02","title":"Build your profile","blocks":[
      {"checklist":[
        {"key":"br_headshot","label":"Professional headshot taken"},
        {"key":"br_bio","label":"Short bio written (who you are, who you help, why you)"},
        {"key":"br_cards","label":"Business cards ordered"},
        {"key":"br_signature","label":"Email signature set up with name, YRL, phone, and links"},
        {"key":"br_profiles","label":"Profile added to yourrealtylink.com and my social accounts"},
      ]},
    ]},
    {"n":"03","title":"Your bio","sub":"Write a first draft here. Keep it warm and specific.","blocks":[
      {"textarea":{"key":"br_bio_draft","label":"My bio","hint":"2–4 sentences","ph":"I'm a Central Indiana REALTOR with Your Realty Link helping buyers and sellers across the Indy metro. I grew up in… and I love helping people…"}},
      {"grid":[
        {"field":{"key":"br_phone","label":"My business phone","ph":"317-…"}},
        {"field":{"key":"br_email","label":"My business email","ph":"you@…"}},
      ]},
      {"textarea":{"key":"action","label":"My next step this week…","ph":"e.g. Book my headshot and finish my bio."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
},

# ============================================================ 0.5
"0.5": {
  "file": "yrl-tiger-0-5-office-sops.html",
  "eyebrow": "Phase 0 · Module 0.5",
  "chip": "Checklist",
  "title": "Office SOPs & How We Work",
  "lede": "Every office has its own way of doing things. This module covers how Your Realty Link operates day to day so you know the expectations, the people, and where to get help.",
  "sections": [
    {"n":"01","title":"How we work","blocks":[
      {"teach":"Knowing the office's standard procedures early keeps you from guessing — and from mistakes that cost time or money. When in doubt, ask; nobody expects you to know everything on day one."},
      {"callout":"This is a starting framework. Your Realty Link's specific SOPs — commission structure, fees, meeting schedule, and who handles what — should be confirmed with Janet Giles-Schultz. Fill in your notes below.","confirm":True},
    ]},
    {"n":"02","title":"Know the essentials","blocks":[
      {"checklist":[
        {"key":"sop_broker","label":"I know our principal broker is Janet Giles-Schultz (317-997-7404)"},
        {"key":"sop_office","label":"I know the office location and hours (2302 E Southport Rd, Indianapolis)"},
        {"key":"sop_meetings","label":"I know when office/training meetings happen"},
        {"key":"sop_help","label":"I know who to ask for admin, tech, and transaction help"},
        {"key":"sop_commission","label":"I've confirmed my commission structure and any fees with Janet"},
      ]},
    ]},
    {"n":"03","title":"My notes","blocks":[
      {"textarea":{"key":"sop_notes","label":"Key things to remember about how we operate","ph":"Jot down commission split, fees, meeting times, key contacts, and anything else Janet covers."}},
      {"textarea":{"key":"action","label":"My next step this week…","ph":"e.g. Sit down with Janet to confirm commission structure and office procedures."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
},

# ============================================================ 6.1
"6.1": {
  "file": "yrl-tiger-6-1-video-social.html",
  "eyebrow": "Phase 6 · Module 6.1",
  "chip": "Worksheet",
  "title": "Video & Social Presence",
  "lede": "Video is the fastest way to build trust at scale — people feel like they know you before you meet. This module helps you start showing up on video and social without overthinking it.",
  "sections": [
    {"n":"01","title":"Why video wins","blocks":[
      {"teach":"A short video does what a photo can't: it lets people hear your voice, see your personality, and trust you before the first call. You don't need a studio — a phone and consistency beat polish every time."},
      {"callout":"Your Realty Link has a listing-video tool and a YouTube channel (YourRealtyLinkIndy). Use them to turn every listing into shareable content."},
    ]},
    {"n":"02","title":"Easy videos to start with","blocks":[
      {"checklist":[
        {"key":"v_listing","label":"Listing tours & 'just listed' walkthroughs"},
        {"key":"v_neighborhood","label":"Neighborhood & community spotlights"},
        {"key":"v_tips","label":"Quick buyer/seller tips"},
        {"key":"v_market","label":"Short market updates"},
        {"key":"v_personal","label":"A simple 'get to know me' intro"},
      ]},
    ]},
    {"n":"03","title":"My plan","blocks":[
      {"grid":[
        {"field":{"key":"v_freq","label":"How often I'll post video","ph":"1x per week"}},
        {"field":{"key":"v_platform","label":"Where I'll post","ph":"Facebook, Instagram, YouTube"}},
      ]},
      {"list":{"key":"v_ideas","title":"My first 5 video ideas","min":5,"ph":"e.g. Tour of my new listing, 'Living in Greenwood', 3 first-time-buyer tips"}},
      {"textarea":{"key":"action","label":"This week I will…","ph":"Record and post one simple video."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
},

# ============================================================ 6.2
"6.2": {
  "file": "yrl-tiger-6-2-geographic-farming.html",
  "eyebrow": "Phase 6 · Module 6.2",
  "chip": "Worksheet",
  "title": "Geographic Farming",
  "lede": "A 'farm' is a neighborhood you commit to owning. This module helps you pick a farm and work it consistently until you're the agent everyone there thinks of first.",
  "sections": [
    {"n":"01","title":"What farming is","blocks":[
      {"teach":"Geographic farming means becoming the known real estate expert for a specific neighborhood through consistent, repeated contact — mailers, door-knocking, market updates, and community presence. It's a long game that pays off big when you stick with it."},
      {"callout":"Pick a farm you can afford to touch repeatedly. Consistency over a year beats one big splash."},
    ]},
    {"n":"02","title":"Pick & size your farm","blocks":[
      {"grid":[
        {"field":{"key":"farm_area","label":"My target neighborhood","ph":"Neighborhood / subdivision"}},
        {"field":{"key":"farm_homes","label":"Approx. number of homes","mode":"numeric","ph":"300"}},
      ]},
      {"field":{"key":"farm_turnover","label":"Why this farm (turnover, price point, my ties)","ph":"e.g. healthy turnover, near where I live, price point fits my goals"}},
    ]},
    {"n":"03","title":"Work it consistently","blocks":[
      {"checklist":[
        {"key":"farm_mail","label":"Send value regularly (market updates, just-solds, tips)"},
        {"key":"farm_door","label":"Door-knock or call to meet residents in person"},
        {"key":"farm_local","label":"Show up in the community — events, sponsorships, social groups"},
        {"key":"farm_track","label":"Track who I've met and follow up"},
      ]},
      {"textarea":{"key":"action","label":"This week I will…","ph":"Choose my farm and plan my first 3 months of touches."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
},

# ============================================================ 6.3
"6.3": {
  "file": "yrl-tiger-6-3-investors.html",
  "eyebrow": "Phase 6 · Module 6.3",
  "chip": "Worksheet",
  "title": "Working with Investors",
  "lede": "Investor clients buy again and again — one good investor relationship can mean deals for years. This module covers how investors think and how to be the agent they rely on.",
  "sections": [
    {"n":"01","title":"How investors think","blocks":[
      {"teach":"Investors don't buy on emotion — they buy on numbers. Cash flow, cap rate, repair costs, and return on investment drive their decisions. Speak their language and bring them real deals, and they'll keep coming back."},
    ]},
    {"n":"02","title":"Know the fundamentals","blocks":[
      {"checklist":[
        {"key":"inv_cashflow","label":"I understand cash flow (rent minus expenses)"},
        {"key":"inv_caprate","label":"I understand cap rate and basic return math"},
        {"key":"inv_repairs","label":"I can estimate repair costs and after-repair value"},
        {"key":"inv_rental","label":"I know rental demand and typical rents in my areas"},
      ]},
      {"callout":"You don't need to be an appraiser — but you do need to run numbers credibly. Partner with lenders, contractors, and property managers you trust."},
    ]},
    {"n":"03","title":"Find & serve investors","blocks":[
      {"teach":"Investors are in your sphere, at REIA meetings, and among landlords in your farm. Bring them deals that pencil out — including off-market opportunities — and become their go-to."},
      {"textarea":{"key":"action","label":"This week I will…","ph":"Learn to run a basic rental analysis and identify 2 potential investor clients."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
},

# ============================================================ 6.4
"6.4": {
  "file": "yrl-tiger-6-4-new-construction.html",
  "eyebrow": "Phase 6 · Module 6.4",
  "chip": "Worksheet",
  "title": "New Construction",
  "lede": "Central Indiana is full of new construction, and buyers often walk into model homes without an agent. This module helps you represent buyers in new builds and protect their interests.",
  "sections": [
    {"n":"01","title":"Why buyers need you in new construction","blocks":[
      {"teach":"The friendly person in the model home works for the builder, not the buyer. Buyers who bring their own agent get an advocate on price, upgrades, timelines, and the builder's contract — which is written to protect the builder."},
      {"callout":"Register as the buyer's agent on the very first visit — many builders require your presence at first contact for you to be paid. The builder typically pays the buyer-agent compensation, but confirm it in writing on each deal; don't assume.","confirm":True},
    ]},
    {"n":"02","title":"Represent the buyer well","blocks":[
      {"checklist":[
        {"key":"nc_register","label":"Register with the builder on the buyer's first visit"},
        {"key":"nc_contract","label":"Read the builder's contract carefully — it favors the builder"},
        {"key":"nc_negotiate","label":"Negotiate upgrades, incentives, and lot premiums (see Module 3.4)"},
        {"key":"nc_inspect","label":"Recommend independent inspections, even on new builds"},
        {"key":"nc_timeline","label":"Manage build timelines and financing lock windows"},
      ]},
    ]},
    {"n":"03","title":"My plan","blocks":[
      {"list":{"key":"nc_builders","title":"New-construction communities in my area to learn","min":3,"ph":"Community — builder — price range"}},
      {"textarea":{"key":"action","label":"This week I will…","ph":"Visit 2 new-construction communities and learn their agent-registration process."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
},

# ============================================================ 6.5
"6.5": {
  "file": "yrl-tiger-6-5-luxury-moveup.html",
  "eyebrow": "Phase 6 · Module 6.5",
  "chip": "Worksheet",
  "title": "Luxury & Move-Up Buyers",
  "lede": "As you grow, higher price points mean bigger commissions and a different kind of client. This module covers serving luxury and move-up buyers and sellers at the level they expect.",
  "sections": [
    {"n":"01","title":"A different level of service","blocks":[
      {"teach":"Higher-end clients expect discretion, polish, and expertise. The fundamentals are the same, but the presentation, marketing, and communication have to match the price point. Earn one great luxury client and the referrals travel in those circles."},
    ]},
    {"n":"02","title":"Raise your game","blocks":[
      {"checklist":[
        {"key":"lux_marketing","label":"Elevate marketing — professional photography, video, and staging"},
        {"key":"lux_discretion","label":"Handle privacy and discretion carefully"},
        {"key":"lux_network","label":"Build a network of high-end lenders, stagers, and vendors"},
        {"key":"lux_knowledge","label":"Know the luxury neighborhoods and what commands a premium"},
      ]},
      {"callout":"Move-up buyers (selling one home to buy a bigger one) often need both sides handled at once — coordinate the sale and purchase timelines carefully."},
    ]},
    {"n":"03","title":"My plan","blocks":[
      {"textarea":{"key":"action","label":"This week I will…","ph":"Preview 2 luxury listings and study what sets the marketing apart."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
},

# ============================================================ 6.6
"6.6": {
  "file": "yrl-tiger-6-6-building-a-team.html",
  "eyebrow": "Phase 6 · Module 6.6",
  "chip": "Worksheet",
  "title": "Building Toward a Team",
  "lede": "There are only so many hours in your week. Eventually, growing means leverage — assistants, buyer's agents, and systems. This module helps you think about scaling beyond just you.",
  "sections": [
    {"n":"01","title":"When to think about leverage","blocks":[
      {"teach":"When you have more business than you can serve well alone, you have a choice: cap your income or add leverage. Leverage starts with systems and an assistant, then grows into agents who work under you."},
      {"callout":"Don't hire to fix a lead problem — hire when you have consistent business you can't handle. Systems first, people second."},
    ]},
    {"n":"02","title":"The order of leverage","blocks":[
      {"checklist":[
        {"key":"tm_systems","label":"Document my systems so anyone could follow them"},
        {"key":"tm_admin","label":"Add administrative leverage first (transaction/admin help)"},
        {"key":"tm_buyeragent","label":"Add a buyer's agent when I have more buyer leads than time"},
        {"key":"tm_track","label":"Know my numbers so I can afford each hire"},
      ]},
    ]},
    {"n":"03","title":"My growth vision","blocks":[
      {"textarea":{"key":"tm_vision","label":"Where I want my business in 3 years","ph":"Solo and efficient? A small team? Describe it."}},
      {"textarea":{"key":"action","label":"This week I will…","ph":"Document one system I repeat so it's ready to hand off later."}},
      {"grid":[
        {"field":{"key":"sign","label":"Signed","ph":"Your name"}},
        {"field":{"key":"signdate","label":"Date","ph":"MM/DD/YYYY"}},
      ]},
    ]},
  ],
},

}
