/* ══════════════════════════════════════════════════════════════════════
   commission-calc.js — the ONE commission formula for YRL.
   Used by: admin.html (CDA builder + reports), yrl-commissions.html (agent
   statements/estimates), yrl-closing-request.html (live estimate).
   Pure functions, no DOM, no network. All money math runs in integer cents.

   Order of operations (every deal):
     1. Gross commission (agent's side, paid to YRL)
     2. − Outgoing referral fee (off the top)            → Adjusted gross
     3. − Company split (agent split %), limited by the annual CAP.
          A deal that crosses the cap is split precisely: only the slice
          needed to finish the cap pays the pre-cap split; the rest pays
          the post-cap split (default agent keeps 100%).
     4. = Agent share
     5. − Mentor/team split (% of agent share, while mentor deals remain)
     6. − Transaction fee (if the agent pays it; client-paid is shown but
          not deducted). Post-cap deals use the post-cap fee.
     7. = Agent net
   CDA payees (title pays exactly two): Agent (payable-to LLC) and YRL
   (company split + txn fee + referral + mentor − earnest YRL already holds).
   YRL then pays the referral brokerage and mentor out of its check
   (listed in `yrl_disburses`).
   ══════════════════════════════════════════════════════════════════════ */
(function (root) {
    'use strict';

    const toC = (v) => { const n = Number(v); return isFinite(n) ? Math.round(n * 100) : 0; };
    const fromC = (c) => Math.round(c) / 100;
    const num = (v) => (v === null || v === undefined || v === '' ? null : Number(v));
    const pick = (a, b) => (a === null || a === undefined || a === '' ? b : a);

    /* Merge an agent's plan over the company defaults. Any NULL plan field
       means "use the company default". */
    function effectivePlan(settings, plan) {
        const s = settings || {}, p = plan || {};
        const txnFee = num(pick(p.txn_fee, s.default_txn_fee)) || 0;
        const cap = num(pick(p.annual_cap, s.default_annual_cap));
        return {
            split_pct_agent:       num(pick(p.split_pct_agent, pick(s.default_split_pct, 70))),
            annual_cap:            cap === null ? null : cap,            // null = no cap
            post_cap_split_pct:    num(pick(p.post_cap_split_pct, pick(s.default_post_cap_split_pct, 100))),
            txn_fee:               txnFee,
            post_cap_txn_fee:      num(pick(p.post_cap_txn_fee, pick(s.default_post_cap_txn_fee, txnFee))),
            txn_fee_payer:         pick(p.txn_fee_payer, pick(s.default_txn_fee_payer, 'agent')),
            txn_fee_counts_to_cap: !!pick(p.txn_fee_counts_to_cap, pick(s.default_txn_fee_counts_to_cap, false)),
            mentor_name:           p.mentor_name || '',
            mentor_email:          p.mentor_email || '',
            mentor_pct:            num(p.mentor_pct) || 0,
            mentor_deals_total:    num(p.mentor_deals_total),            // null = unlimited while pct > 0
            payable_to:            p.payable_to || '',
            license_number:        p.license_number || '',
            has_custom_plan:       !!(plan && plan.id)
        };
    }

    /**
     * calc(plan, ctx, input)
     *   plan  — effectivePlan() output
     *   ctx   — { company_paid, mentor_deals_used, cap_year_start, cap_year_end }
     *   input — { gross, referral_pct, referral_amount, referral_payee,
     *             earnest_held, agent_name,
     *             overrides:{ referral, company, mentor, txn_fee } (optional $ amounts) }
     */
    function calc(plan, ctx, input) {
        plan = plan || effectivePlan(null, null);
        ctx = ctx || {};
        input = input || {};
        const ov = input.overrides || {};
        const has = (k) => ov[k] !== undefined && ov[k] !== null && ov[k] !== '';
        const warnings = [];

        const gross = Math.max(0, toC(input.gross));

        /* 2. referral off the top — flat $ wins over % */
        let referral;
        if (has('referral')) referral = toC(ov.referral);
        else if (Number(input.referral_amount) > 0) referral = toC(input.referral_amount);
        else if (Number(input.referral_pct) > 0) referral = Math.round(gross * Number(input.referral_pct) / 100);
        else referral = 0;
        if (referral > gross) { warnings.push('Referral fee exceeds the gross commission — capped at gross.'); referral = gross; }
        referral = Math.max(0, referral);
        const adj = gross - referral;

        /* 3. company split with cap */
        const rate = Math.max(0, Math.min(100, 100 - Number(plan.split_pct_agent))) / 100;
        const postRate = Math.max(0, Math.min(100, 100 - Number(plan.post_cap_split_pct))) / 100;
        const hasCap = plan.annual_cap !== null && plan.annual_cap !== undefined;
        const capC = hasCap ? toC(plan.annual_cap) : null;
        const paidBefore = Math.max(0, toC(ctx.company_paid));
        const remaining = hasCap ? Math.max(0, capC - paidBefore) : null;
        const cappedBefore = hasCap && remaining === 0;

        let company, capCounted, capHitThisDeal = false;
        if (!hasCap) {
            company = Math.round(adj * rate);
            capCounted = company;
        } else if (cappedBefore) {
            company = Math.round(adj * postRate);
            capCounted = 0;
        } else {
            const raw = Math.round(adj * rate);
            if (raw <= remaining) {
                company = raw;
                capCounted = raw;
                capHitThisDeal = raw === remaining && remaining > 0;
            } else {
                // crossing the cap: the slice of adj that "finishes" the cap pays the pre-cap rate
                const slice = rate > 0 ? Math.min(adj, Math.round(remaining / rate)) : adj;
                const post = Math.round((adj - slice) * postRate);
                company = remaining + post;
                capCounted = remaining;
                capHitThisDeal = true;
            }
        }
        let companyOverridden = false;
        if (has('company')) {
            company = Math.max(0, Math.min(adj, toC(ov.company)));
            capCounted = hasCap ? Math.min(company, remaining) : company;
            companyOverridden = true;
        }
        const agentShare = adj - company;

        /* 5. mentor / team split */
        const mentorUsed = Number(ctx.mentor_deals_used) || 0;
        const mentorEligible = plan.mentor_pct > 0 &&
            (plan.mentor_deals_total === null || plan.mentor_deals_total === undefined || mentorUsed < plan.mentor_deals_total);
        let mentor = mentorEligible ? Math.round(agentShare * plan.mentor_pct / 100) : 0;
        if (has('mentor')) mentor = Math.max(0, toC(ov.mentor));

        /* 6. transaction fee */
        let fee = toC(cappedBefore ? plan.post_cap_txn_fee : plan.txn_fee);
        if (has('txn_fee')) fee = Math.max(0, toC(ov.txn_fee));
        const feeFromAgent = plan.txn_fee_payer !== 'client';
        if (plan.txn_fee_counts_to_cap && hasCap) {
            capCounted += Math.min(fee, Math.max(0, remaining - capCounted));
        }

        /* 7. agent net */
        const agentNet = agentShare - mentor - (feeFromAgent ? fee : 0);
        if (agentNet < 0) warnings.push('Deductions exceed the agent share — agent net is negative.');

        /* payees — YRL's CDA pays exactly TWO parties at closing: the agent and
           YRL. Referral + mentor fees ride inside YRL's check and YRL pays them
           out afterward (per the CDA's own instructions to the title company). */
        const earnest = Math.max(0, toC(input.earnest_held));
        let yrl = company + fee + referral + mentor - earnest;
        if (yrl < 0) { warnings.push('Earnest money held exceeds what YRL is owed — YRL must refund the difference.'); }
        const agentPayee = plan.payable_to || input.agent_name || 'Agent';

        const pct = (r) => Math.round(r * 1000) / 10;
        const lines = [];
        lines.push({ key: 'gross', label: 'Gross commission', amount: fromC(gross) });
        if (referral) lines.push({ key: 'referral', label: 'Referral fee' + (input.referral_payee ? ' — ' + input.referral_payee : ''), amount: -fromC(referral), overridden: has('referral') });
        if (referral) lines.push({ key: 'adjusted', label: 'Adjusted gross', amount: fromC(adj), subtotal: true });
        let coLabel = 'Company split (' + pct(rate) + '%)';
        if (cappedBefore) coLabel = 'Company split — capped (' + pct(postRate) + '% post-cap)';
        else if (capHitThisDeal && company !== capCounted) coLabel = 'Company split — cap reached this deal';
        else if (capHitThisDeal) coLabel = 'Company split (' + pct(rate) + '%) — cap reached';
        lines.push({ key: 'company', label: coLabel, amount: -fromC(company), overridden: companyOverridden });
        lines.push({ key: 'agent_share', label: 'Agent share', amount: fromC(agentShare), subtotal: true });
        if (mentor) lines.push({ key: 'mentor', label: 'Mentor / team split' + (plan.mentor_name ? ' — ' + plan.mentor_name : '') + ' (' + plan.mentor_pct + '%)', amount: -fromC(mentor), overridden: has('mentor') });
        if (fee) lines.push({ key: 'txn_fee', label: 'Transaction fee' + (feeFromAgent ? '' : ' (paid by client — not deducted)'), amount: feeFromAgent ? -fromC(fee) : 0, info: !feeFromAgent, feeAmount: fromC(fee), overridden: has('txn_fee') });
        lines.push({ key: 'net', label: 'Agent net', amount: fromC(agentNet), total: true });

        const payees = [
            { key: 'agent', name: agentPayee, amount: fromC(agentNet) },
            { key: 'yrl', name: 'Your Realty Link', amount: fromC(Math.max(0, yrl)), note: earnest ? 'less $' + fromC(earnest).toFixed(2) + ' earnest held by YRL' : '' }
        ];
        /* what YRL pays out of its own check after closing */
        const yrlDisburses = [];
        if (referral) yrlDisburses.push({ key: 'referral', name: input.referral_payee || 'Referral brokerage', amount: fromC(referral) });
        if (mentor) yrlDisburses.push({ key: 'mentor', name: plan.mentor_name || 'Mentor', amount: fromC(mentor) });

        return {
            gross: fromC(gross), referral: fromC(referral), adjusted_gross: fromC(adj),
            company_dollar: fromC(company), agent_share: fromC(agentShare),
            mentor_fee: fromC(mentor), txn_fee: fromC(fee), txn_fee_payer: feeFromAgent ? 'agent' : 'client',
            agent_net: fromC(agentNet), yrl_payout: fromC(Math.max(0, yrl)), earnest_held: fromC(earnest),
            cap_counted: fromC(capCounted),
            cap: {
                cap: hasCap ? fromC(capC) : null,
                paid_before: fromC(paidBefore),
                paid_after: fromC(paidBefore + capCounted),
                remaining_after: hasCap ? fromC(Math.max(0, capC - paidBefore - capCounted)) : null,
                capped_before: cappedBefore,
                hit_this_deal: capHitThisDeal,
                year_start: ctx.cap_year_start || null,
                year_end: ctx.cap_year_end || null
            },
            lines, payees, yrl_disburses: yrlDisburses, warnings
        };
    }

    /* Cap-year window for a date — mirrors SQL commission_context() exactly.
       Returns { start:'YYYY-MM-DD', end:'YYYY-MM-DD' } (end inclusive). */
    function capWindow(settings, plan, dateStr) {
        const pad = (n) => String(n).padStart(2, '0');
        const iso = (y, m, d) => y + '-' + pad(m) + '-' + pad(d);
        const ds = dateStr || new Date().toISOString().slice(0, 10);
        const [y, mo, da] = ds.split('-').map(Number);
        let m, d;
        if (plan && plan.cap_anniversary) {
            const a = String(plan.cap_anniversary).split('-').map(Number);
            m = a[1]; d = Math.min(a[2], 28);
        } else {
            m = (settings && settings.year_start_month) || 10;
            d = (settings && settings.year_start_day) || 1;
        }
        let sy = (mo < m || (mo === m && da < d)) ? y - 1 : y;
        const endDate = new Date(Date.UTC(sy + 1, m - 1, d) - 86400000);
        return { start: iso(sy, m, d), end: endDate.toISOString().slice(0, 10) };
    }

    const money = (v) => (Number(v) < 0 ? '−' : '') + '$' + Math.abs(Number(v) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    function capYearLabel(start, end) {
        if (!start) return '';
        const f = (d) => { const x = new Date(d + 'T00:00:00'); return x.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); };
        return f(start) + ' – ' + (end ? f(end) : '');
    }

    const api = { effectivePlan, calc, capWindow, money, capYearLabel };
    root.CommissionCalc = api;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
