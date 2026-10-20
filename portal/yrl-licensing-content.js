/* ══════════════════════════════════════════════════════════════════════
   yrl-licensing-content.js — STARTER content for Licensing Training
   ----------------------------------------------------------------------
   Used by yrl-licensing-training.html until the broker saves an edit —
   after that the page loads hub_content['yrl-licensing-training'] and
   this file is only a fallback.

   Shape: { tracks:[{ id, name, icon, desc, modules:[{ id, title, icon,
            summary, notes, resources:[{title,link}], questions:[{ id, q,
            options:[..], answer:<index>, explain, verify? }] }] }] }

   verify:true = a state-specific number/rule worth double-checking against
   current IREC rules. Shows a "Check this fact" chip in edit mode only.
   All questions are original wording — not copied from exam-prep books.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
    function Q(id, q, options, answer, explain, verify) {
        var o = { id: id, q: q, options: options, answer: answer, explain: explain };
        if (verify) o.verify = true;
        return o;
    }

    /* ─────────────────────────── NATIONAL ─────────────────────────── */
    var national = [
        { id: 'n-own', title: 'Property Ownership & Interests', icon: 'fa-solid fa-house',
          summary: 'Real vs. personal property, estates, forms of ownership, easements and liens.',
          notes: 'Real property = land + everything permanently attached + the bundle of rights (possession, control, enjoyment, exclusion, disposition).\n\n' +
                 '- Fee simple absolute: the most complete ownership, unlimited duration.\n- Life estate: lasts for someone\'s lifetime; "pur autre vie" = measured by another person\'s life.\n- Severalty = one owner. Tenancy in common = undivided shares, no survivorship. Joint tenancy = right of survivorship, needs the four unities (time, title, interest, possession).\n\n' +
                 'Fixture tests (MARIA): Method of attachment, Adaptability, Relationship of the parties, Intention, Agreement.\n\n' +
                 'Easement appurtenant: the dominant tenement benefits, the servient tenement is burdened. A license is revocable permission, not an interest in land.',
          resources: [],
          questions: [
            Q('n-own-1', 'Which of these is NOT part of the "bundle of rights"?', ['Possession', 'Control', 'Enjoyment', 'Guaranteed appreciation'], 3, 'The bundle is possession, control, enjoyment, exclusion and disposition. Nobody gets a legal right to appreciation.'),
            Q('n-own-2', 'The most complete form of ownership, with unlimited duration and freely transferable, is:', ['Life estate', 'Fee simple absolute', 'Leasehold estate', 'Fee simple defeasible'], 1, 'Fee simple absolute is the highest form of ownership recognized by law.'),
            Q('n-own-3', 'A life estate measured by the life of someone OTHER than the life tenant is a:', ['Life estate pur autre vie', 'Conventional life estate', 'Remainder interest', 'Reversionary interest'], 0, '"Pur autre vie" means "for the life of another."'),
            Q('n-own-4', 'Two owners hold title with a right of survivorship and all four unities. This is:', ['Tenancy in common', 'Joint tenancy', 'Ownership in severalty', 'Tenancy at will'], 1, 'Joint tenancy requires unity of time, title, interest and possession, and includes the right of survivorship.'),
            Q('n-own-5', 'Ownership by one person alone is called:', ['Tenancy by the entirety', 'Severalty', 'Community property', 'Joint tenancy'], 1, 'Severalty = "severed" from others; one owner holds all the rights.'),
            Q('n-own-6', 'Which is NOT one of the tests used to decide whether an item is a fixture?', ['Method of attachment', 'Adaptability to the property', 'Agreement between the parties', 'What the item originally cost'], 3, 'The tests are Method, Adaptability, Relationship, Intention and Agreement (MARIA). Cost is not a test.'),
            Q('n-own-7', 'With an easement appurtenant, the property that BENEFITS from the easement is the:', ['Servient tenement', 'Dominant tenement', 'Easement in gross', 'Licensee'], 1, 'The dominant tenement enjoys the benefit; the servient tenement carries the burden.'),
            Q('n-own-8', 'A neighbor gives you revocable permission to fish in their pond. This is a:', ['License', 'Easement appurtenant', 'Encroachment', 'Lien'], 0, 'A license is personal, revocable permission and is not an interest in the land.'),
            Q('n-own-9', 'Which of these is a GENERAL lien?', ['A mortgage lien', 'A real estate tax lien', 'A judgment lien', 'A mechanic\'s lien'], 2, 'A judgment lien attaches to all of the debtor\'s property. The others attach to one specific property.'),
            Q('n-own-10', 'Riparian rights are the rights of owners whose land borders:', ['A flowing river or stream', 'A lake or ocean', 'An interstate highway', 'Mineral deposits'], 0, 'Riparian = flowing water. Land bordering a lake or ocean has littoral rights.')
          ] },

        { id: 'n-land', title: 'Land Use Controls', icon: 'fa-solid fa-map',
          summary: 'Government powers, zoning, variances, and private restrictions.',
          notes: 'Government powers (PETE): Police power, Eminent domain, Taxation, Escheat.\n\n' +
                 '- Police power: zoning, building codes, subdivision rules — for public health, safety and welfare.\n- Eminent domain: taking private property for public use with just compensation; the process is condemnation.\n- Escheat: property goes to the state when someone dies with no will and no heirs.\n\n' +
                 'Zoning tools: nonconforming use (was there first, may continue), variance (hardship exception), conditional/special use. Private controls = deed restrictions and CC&Rs. When public and private rules conflict, the more restrictive one usually applies.',
          resources: [],
          questions: [
            Q('n-land-1', 'The government\'s power to regulate land use for public health, safety and welfare is:', ['Eminent domain', 'Police power', 'Escheat', 'Taxation'], 1, 'Zoning and building codes are exercises of police power.'),
            Q('n-land-2', 'The legal process used to take private property under eminent domain is:', ['Condemnation', 'Escheat', 'Adverse possession', 'Foreclosure'], 0, 'Eminent domain is the power; condemnation is the process. The owner must receive just compensation.'),
            Q('n-land-3', 'A person dies with no will and no heirs. Their property passes to the state by:', ['Adverse possession', 'Eminent domain', 'Escheat', 'Reversion'], 2, 'Escheat keeps property from being ownerless.'),
            Q('n-land-4', 'A corner store operated before the area was zoned residential. It may usually keep operating as a:', ['Variance', 'Conditional use', 'Legal nonconforming use', 'Spot zone'], 2, 'A legal nonconforming ("grandfathered") use existed before the zoning change.'),
            Q('n-land-5', 'An owner with an odd-shaped lot asks to build a garage 3 feet inside the required setback. They need a:', ['Rezoning', 'Variance', 'Nonconforming use', 'Deed restriction'], 1, 'A variance allows a limited departure from zoning because of a hardship tied to the property.'),
            Q('n-land-6', 'Which is a PRIVATE land use control?', ['Zoning ordinance', 'Building code', 'Restrictive covenant', 'Subdivision regulations'], 2, 'Restrictive covenants (deed restrictions, CC&Rs) are created by private parties, not government.'),
            Q('n-land-7', 'When a zoning ordinance and a deed restriction conflict, generally:', ['Zoning always wins', 'The deed restriction always wins', 'The older rule wins', 'The more restrictive rule applies'], 3, 'Owners generally must comply with whichever rule is stricter.'),
            Q('n-land-8', 'A community\'s long-range plan to guide growth and development is the:', ['Comprehensive (master) plan', 'Plat map', 'Survey', 'Building permit'], 0, 'Zoning ordinances are used to carry out the comprehensive plan.'),
            Q('n-land-9', 'Building codes are mainly enforced through:', ['Deed restrictions', 'Building permits and inspections', 'HOA fines', 'The MLS'], 1, 'Permits and inspections make sure construction meets code.'),
            Q('n-land-10', 'A strip of park land separating a shopping center from a neighborhood is a:', ['Buffer zone', 'Spot zone', 'Cluster zone', 'Easement in gross'], 0, 'Buffer zones separate uses that don\'t mix well.')
          ] },

        { id: 'n-val', title: 'Valuation & Market Analysis', icon: 'fa-solid fa-chart-line',
          summary: 'The three approaches to value, depreciation, and CMA vs. appraisal.',
          notes: 'Three approaches:\n\n- Sales comparison: best for homes. Adjust the COMPS, not the subject. Comp better = subtract; comp worse = add.\n- Cost approach: land value + (cost new − depreciation). Best for new or special-purpose buildings (churches, schools).\n- Income approach: Value = NOI ÷ cap rate. Best for income property.\n\n' +
                 'Depreciation: physical deterioration, functional obsolescence (bad design, outdated), external/economic obsolescence (outside the property — always incurable).\n\n' +
                 'Reconciliation is the final step — weighing the approaches, not averaging them.',
          resources: [],
          questions: [
            Q('n-val-1', 'Which approach is most relied on to value a single-family home?', ['Cost approach', 'Income approach', 'Sales comparison approach', 'Gross rent multiplier'], 2, 'Buyers of homes compare recent similar sales, so the sales comparison approach carries the most weight.'),
            Q('n-val-2', 'A comparable sale has a finished basement; the subject does not. The appraiser should:', ['Add the basement value to the comp', 'Subtract the basement value from the comp', 'Adjust the subject property', 'Make no adjustment'], 1, 'Always adjust the comp. Comp Better = Subtract; Comp Poorer = Add.'),
            Q('n-val-3', 'The cost approach is MOST useful for:', ['A resale condo', 'A church or school', 'A duplex rental', 'A vacant lot'], 1, 'Special-purpose buildings rarely sell and don\'t produce rent, so cost is the best evidence.'),
            Q('n-val-4', 'Which formula is used in the income approach?', ['Value = NOI × cap rate', 'Value = NOI ÷ cap rate', 'Value = gross income ÷ expenses', 'Value = cap rate ÷ NOI'], 1, 'I-R-V: Income ÷ Rate = Value.'),
            Q('n-val-5', 'The most probable price a property should bring in a competitive, open market is its:', ['Market price', 'Market value', 'Assessed value', 'Replacement cost'], 1, 'Market price is what actually sold; market value is the most probable price under normal conditions.'),
            Q('n-val-6', 'A five-bedroom home with only one bathroom suffers from:', ['Physical deterioration', 'Functional obsolescence', 'External obsolescence', 'Deferred maintenance'], 1, 'A design problem inside the property is functional obsolescence.'),
            Q('n-val-7', 'A new highway nearby adds noise and lowers home values. This is:', ['Functional obsolescence', 'Curable physical deterioration', 'External obsolescence', 'Deferred maintenance'], 2, 'It comes from outside the property, so it is external (economic) obsolescence — the owner can\'t cure it.'),
            Q('n-val-8', 'A buyer won\'t pay more for a home than the cost of an equally desirable substitute. This is the principle of:', ['Conformity', 'Contribution', 'Substitution', 'Anticipation'], 2, 'Substitution is the foundation of the sales comparison approach.'),
            Q('n-val-9', 'What is the key difference between a CMA and an appraisal?', ['An appraisal is a licensed/certified appraiser\'s opinion of value; a CMA is a licensee\'s market analysis to help price', 'They are the same thing', 'A CMA is required by lenders; an appraisal is optional', 'Only a CMA uses comparable sales'], 0, 'Lenders rely on appraisals. A CMA helps a seller or buyer choose a price — never call it an appraisal.'),
            Q('n-val-10', 'The final step where an appraiser weighs the results of each approach is called:', ['Averaging', 'Reconciliation', 'Capitalization', 'Depreciation'], 1, 'Reconciliation weighs the approaches by how reliable each is for that property.')
          ] },

        { id: 'n-fin', title: 'Financing', icon: 'fa-solid fa-money-bill-wave',
          summary: 'Notes and mortgages, loan types, points, PMI and key disclosure timing.',
          notes: 'The promissory note is the promise to pay; the mortgage pledges the property as security.\n\n' +
                 '- Lien theory: borrower keeps title, lender has a lien.\n- Amortized loan: each payment covers interest and principal until paid off.\n- 1 discount point = 1% of the LOAN amount.\n- PMI: usually required on conventional loans over 80% LTV.\n- FHA = insured by FHA/HUD. VA = guaranteed by the Dept. of Veterans Affairs (can be 0% down).\n\n' +
                 'Clauses: acceleration (whole balance due on default), alienation/due-on-sale (due if sold).\n\nTRID: Loan Estimate within 3 business days of application; Closing Disclosure received at least 3 business days before closing.',
          resources: [],
          questions: [
            Q('n-fin-1', 'In a lien-theory state, who holds title while the loan is being repaid?', ['The lender', 'The borrower', 'A trustee', 'The county recorder'], 1, 'The borrower keeps title; the lender holds a lien.'),
            Q('n-fin-2', 'Which document is the borrower\'s personal promise to repay the debt?', ['Mortgage', 'Promissory note', 'Deed', 'Title policy'], 1, 'The note is the promise to pay; the mortgage is the security instrument.'),
            Q('n-fin-3', 'A loan whose regular payments pay off both interest and principal by the end of the term is:', ['A balloon loan', 'An interest-only loan', 'A fully amortized loan', 'A reverse mortgage'], 2, 'Fully amortized = paid to zero by the last scheduled payment.'),
            Q('n-fin-4', 'One discount point equals:', ['1% of the purchase price', '1% of the loan amount', '$1,000', '1/8 of the interest rate'], 1, 'Points are always based on the loan amount.'),
            Q('n-fin-5', 'Private mortgage insurance is typically required on a conventional loan when the loan-to-value is above:', ['70%', '75%', '80%', '95%'], 2, 'Less than 20% down (over 80% LTV) usually means PMI.'),
            Q('n-fin-6', 'FHA loans are:', ['Insured by the FHA (part of HUD)', 'Guaranteed by the VA', 'Funded directly by Fannie Mae', 'Made only by credit unions'], 0, 'The FHA insures loans made by approved lenders.'),
            Q('n-fin-7', 'Which program can let eligible veterans buy with no down payment?', ['FHA', 'VA', 'Conventional conforming', 'Bridge loan'], 1, 'VA loans are guaranteed by the Department of Veterans Affairs and can allow 0% down.'),
            Q('n-fin-8', 'The clause that lets a lender declare the whole balance due when the borrower defaults is the:', ['Alienation clause', 'Acceleration clause', 'Defeasance clause', 'Prepayment clause'], 1, 'Acceleration speeds up the debt after default.'),
            Q('n-fin-9', 'A "due-on-sale" clause is also called:', ['An acceleration clause', 'A subordination clause', 'An alienation clause', 'An escalation clause'], 2, 'Alienation = transferring the property; the loan comes due if the property is sold.'),
            Q('n-fin-10', 'Under TRID, the borrower must receive the Closing Disclosure at least how long before closing?', ['1 day', '3 business days', '7 days', '10 days'], 1, 'Three business days gives the borrower time to compare it with the Loan Estimate.')
          ] },

        { id: 'n-agency', title: 'Agency', icon: 'fa-solid fa-handshake',
          summary: 'Clients vs. customers, fiduciary duties, dual agency and disclosure.',
          notes: 'Fiduciary duties to a CLIENT (OLDCAR): Obedience, Loyalty, Disclosure, Confidentiality, Accounting, Reasonable care.\n\n' +
                 '- Client = the person you represent. Customer = the other party you work with but don\'t represent.\n- A listing broker is usually a special agent (one specific task).\n- Dual/limited agency requires informed written consent from both sides.\n\n' +
                 'Even to customers you must be honest and disclose known material defects. Puffing ("stunning kitchen") is opinion; misrepresentation is a false statement of fact.',
          resources: [],
          questions: [
            Q('n-agency-1', 'Which is NOT a fiduciary duty owed to a client?', ['Loyalty', 'Confidentiality', 'Guaranteeing the lowest possible price', 'Accounting'], 2, 'OLDCAR: Obedience, Loyalty, Disclosure, Confidentiality, Accounting, Reasonable care. No agent can guarantee a price.'),
            Q('n-agency-2', 'The person a real estate agent represents is the:', ['Customer', 'Client (principal)', 'Third party', 'Subagent'], 1, 'The client is owed fiduciary duties; a customer is owed honesty and fair dealing.'),
            Q('n-agency-3', 'A listing broker hired to market one property is usually what kind of agent?', ['Universal', 'General', 'Special', 'Dual'], 2, 'A special agent is authorized for one specific task.'),
            Q('n-agency-4', 'Dual (limited) agency is allowed only with:', ['The seller\'s consent only', 'Informed written consent of both parties', 'The managing broker\'s approval only', 'No consent at all'], 1, 'Both clients must understand and agree in writing that you represent both sides.'),
            Q('n-agency-5', 'Which does NOT end an agency relationship?', ['The sale closes', 'The listing agreement expires', 'Both parties mutually agree to cancel', 'The seller receives an offer below list price'], 3, 'A low offer is just an offer. Agency ends by completion, expiration, mutual agreement, and similar events.'),
            Q('n-agency-6', 'An agency relationship created by the parties\' conduct rather than a written agreement is:', ['Express agency', 'Implied agency', 'Subagency', 'Universal agency'], 1, 'Acting like someone\'s agent can create an implied agency — another reason to get agreements in writing.'),
            Q('n-agency-7', 'A listing agent knows the basement floods. The agent must:', ['Keep it confidential because the seller is the client', 'Disclose it to buyers', 'Disclose it only if asked directly', 'Tell only the buyer\'s lender'], 1, 'Known material defects must be disclosed. Confidentiality never covers hiding defects.'),
            Q('n-agency-8', 'Without the seller\'s permission, the listing agent MAY tell a buyer:', ['The seller will take less than list price', 'The seller is going through a divorce', 'Known material defects of the property', 'The seller\'s lowest acceptable price'], 2, 'Defects must be disclosed. Price, motivation and personal matters are confidential.'),
            Q('n-agency-9', 'Which statement is puffing rather than misrepresentation?', ['"The roof is two years old" (it\'s fifteen)', '"This kitchen is gorgeous"', '"The basement has never flooded" (it has)', '"HOA dues are $50" (they\'re $150)'], 1, 'Puffing is an opinion no reasonable buyer would rely on as fact. The others are false statements of fact.'),
            Q('n-agency-10', 'Procuring cause generally refers to the broker who:', ['First showed the buyer any home', 'Started an unbroken chain of events that led to the sale', 'Holds the listing', 'Wrote the accepted offer, no matter what came before'], 1, 'Procuring cause disputes look at who started the uninterrupted series of events resulting in the sale.')
          ] },

        { id: 'n-contracts', title: 'Contracts', icon: 'fa-solid fa-file-signature',
          summary: 'Valid contract elements, offers and counteroffers, and remedies.',
          notes: 'Essential elements: competent parties, offer and acceptance (mutual assent), consideration, legal purpose. Real estate sales contracts must be in writing (Statute of Frauds).\n\n' +
                 '- Void = no contract at all. Voidable = valid until one party (e.g., a minor) chooses to cancel.\n- A counteroffer rejects and ends the original offer.\n- An offer can be withdrawn any time before acceptance is communicated.\n- Executory = still being performed (signed, not closed). Executed = fully performed.\n\n' +
                 'Remedies: specific performance (court orders the sale), liquidated damages (agreed in advance — often the earnest money), rescission. Novation replaces a contract or party entirely.',
          resources: [],
          questions: [
            Q('n-contracts-1', 'Which is NOT an essential element of a valid contract?', ['Competent parties', 'Legal purpose', 'Consideration', 'Notarization'], 3, 'Notarization is needed to record a deed, not to make a contract valid.'),
            Q('n-contracts-2', 'Under the Statute of Frauds, a contract to sell real estate must be:', ['Notarized', 'In writing to be enforceable', 'Recorded', 'Witnessed by two people'], 1, 'Oral contracts for the sale of real estate are generally unenforceable.'),
            Q('n-contracts-3', 'A contract signed by a minor is generally:', ['Void', 'Voidable by the minor', 'Unenforceable by either party', 'Fully binding on both'], 1, 'The minor can choose to cancel; the adult cannot.'),
            Q('n-contracts-4', 'A buyer offers $250,000 and the seller responds with $260,000. The original $250,000 offer is:', ['Still open for the seller to accept later', 'Terminated', 'Accepted', 'Binding on the buyer'], 1, 'A counteroffer is a rejection plus a new offer.'),
            Q('n-contracts-5', 'A buyer may withdraw an offer:', ['Any time before acceptance is communicated', 'Only after 24 hours', 'Never, once it\'s signed', 'Only with the seller\'s permission'], 0, 'Until acceptance is communicated, there is no contract to break.'),
            Q('n-contracts-6', 'A contract in which both parties exchange promises is:', ['Unilateral', 'Bilateral', 'Implied', 'Executed'], 1, 'A purchase agreement is bilateral — a promise to buy for a promise to sell.'),
            Q('n-contracts-7', 'A signed purchase agreement that has not closed yet is:', ['Executed', 'Executory', 'Void', 'Voidable'], 1, 'Executory = obligations are still being performed.'),
            Q('n-contracts-8', 'An amount the parties agree in advance will be paid if one side defaults is:', ['Specific performance', 'Liquidated damages', 'Rescission', 'Novation'], 1, 'Earnest money is often designated as liquidated damages.'),
            Q('n-contracts-9', 'A buyer sues to force the seller to complete the sale. This remedy is:', ['Compensatory damages', 'Specific performance', 'Rescission', 'Liquidated damages'], 1, 'Because every property is unique, a court can order the sale to go through.'),
            Q('n-contracts-10', 'Replacing a contract with a new one that releases the original party from liability is:', ['Assignment', 'Novation', 'An option', 'An addendum'], 1, 'With assignment the original party usually stays liable; novation releases them.')
          ] },

        { id: 'n-title', title: 'Transfer of Title', icon: 'fa-solid fa-key',
          summary: 'Deeds, recording, title insurance and legal descriptions.',
          notes: 'Grantor conveys; grantee receives. A deed transfers title when it is delivered and accepted.\n\n' +
                 '- General warranty deed: the most protection for the buyer.\n- Special warranty: covers only the grantor\'s time of ownership.\n- Quitclaim: no warranties at all.\n\n' +
                 'Recording gives constructive notice to the world. Owner\'s title policy protects the buyer; lender\'s policy protects the loan.\n\n' +
                 'Legal descriptions: metes and bounds, rectangular (government) survey, lot and block. A section = 1 square mile = 640 acres. An acre = 43,560 sq ft.',
          resources: [],
          questions: [
            Q('n-title-1', 'Which deed gives the buyer the MOST protection?', ['Quitclaim deed', 'Special warranty deed', 'General warranty deed', 'Deed in lieu of foreclosure'], 2, 'The grantor warrants title against defects from any time, not just their own ownership.'),
            Q('n-title-2', 'Which deed carries no warranties at all?', ['Quitclaim deed', 'General warranty deed', 'Special warranty deed', 'Bargain and sale deed with covenants'], 0, 'A quitclaim conveys only whatever interest the grantor happens to have.'),
            Q('n-title-3', 'Title passes when the deed is:', ['Signed by the grantor', 'Recorded', 'Delivered and accepted', 'Notarized'], 2, 'Recording protects the buyer, but delivery and acceptance transfer title.'),
            Q('n-title-4', 'Recording a deed provides:', ['Actual notice', 'Constructive notice', 'No legal notice', 'Equitable title'], 1, 'Constructive notice means everyone is presumed to know what is in the public record.'),
            Q('n-title-5', 'A lender\'s title insurance policy protects:', ['The buyer\'s equity', 'The lender, up to the loan amount', 'The seller', 'The listing broker'], 1, 'Buyers need an owner\'s policy to protect their own interest.'),
            Q('n-title-6', 'Which is NOT a requirement for adverse possession?', ['Open and notorious use', 'Hostile use', 'Continuous use for the statutory period', 'Permission from the owner'], 3, 'Permission defeats adverse possession — the use must be hostile (without permission).'),
            Q('n-title-7', 'In a deed, the party conveying title is the:', ['Grantee', 'Grantor', 'Trustee', 'Mortgagee'], 1, 'Grantor gives; grantee gets.'),
            Q('n-title-8', 'Which is NOT an acceptable legal description method?', ['Metes and bounds', 'Lot and block', 'Rectangular survey', 'Street address'], 3, 'A street address identifies a property but is not a legal description.'),
            Q('n-title-9', 'How many acres are in one section of the rectangular survey system?', ['160', '320', '640', '43,560'], 2, 'A section is one square mile = 640 acres.'),
            Q('n-title-10', 'One acre contains how many square feet?', ['5,280', '43,560', '640', '36,000'], 1, 'Memorize 43,560 — it shows up in math questions.')
          ] },

        { id: 'n-fair', title: 'Fair Housing & Practice', icon: 'fa-solid fa-scale-balanced',
          summary: 'Protected classes, steering, blockbusting, redlining and antitrust.',
          notes: 'Federal Fair Housing Act protected classes: race, color, religion, national origin, sex, familial status, disability. (Civil Rights Act of 1866 = race, no exceptions.)\n\n' +
                 '- Steering: guiding buyers toward or away from areas based on a protected class.\n- Blockbusting: urging owners to sell because a protected class is moving in.\n- Redlining: refusing loans or insurance in certain areas based on a protected class.\n\n' +
                 'Describe the property, not the buyer, in ads. Reasonable accommodation = changing a rule (e.g., a service animal in a no-pet building). Antitrust: brokers may never agree on commission rates (price fixing).',
          resources: [],
          questions: [
            Q('n-fair-1', 'Which is NOT a protected class under the federal Fair Housing Act?', ['Familial status', 'Disability', 'Religion', 'Marital status'], 3, 'Marital status isn\'t protected federally (some states and cities add it).'),
            Q('n-fair-2', 'An agent only shows a family homes in neighborhoods where people share their religion. This is:', ['Blockbusting', 'Steering', 'Redlining', 'Panic selling'], 1, 'Steering limits a buyer\'s choices based on a protected class — even if the buyer didn\'t ask.'),
            Q('n-fair-3', 'Telling owners to sell quickly because "a certain group is moving in" is:', ['Steering', 'Redlining', 'Blockbusting', 'Puffing'], 2, 'Blockbusting (panic selling) profits from fear about a protected class.'),
            Q('n-fair-4', 'A lender refuses to make loans in a neighborhood because of its racial makeup. This is:', ['Redlining', 'Steering', 'Blockbusting', 'Price fixing'], 0, 'Redlining is illegal discrimination by lenders or insurers.'),
            Q('n-fair-5', 'Familial status protects:', ['Married couples only', 'Households with children under 18 (and pregnant persons)', 'Seniors only', 'Roommates'], 1, 'Housing providers can\'t refuse families with children (outside of qualifying senior housing).'),
            Q('n-fair-6', 'The Civil Rights Act of 1866 prohibits discrimination based on:', ['Race', 'Sex', 'Disability', 'Familial status'], 0, 'It applies to race with no exceptions.'),
            Q('n-fair-7', 'A landlord allows a tenant\'s assistance animal despite a no-pets policy. This is a:', ['Reasonable modification', 'Reasonable accommodation', 'Fair housing exemption', 'Steering violation'], 1, 'An accommodation changes a rule or policy; a modification changes the physical property.'),
            Q('n-fair-8', 'Two brokerages agree to charge the same commission rate. This is:', ['Price fixing', 'Market allocation', 'A group boycott', 'A tie-in arrangement'], 0, 'Price fixing violates antitrust law. Every brokerage sets its own fees independently.'),
            Q('n-fair-9', 'Which ad language is most likely to create a fair housing problem?', ['"3 bedrooms, 2 baths"', '"Walk to the park"', '"Ideal for young professionals — no kids"', '"Updated kitchen"'], 2, 'It shows a preference based on familial status. Describe the property, not the people.'),
            Q('n-fair-10', 'A fair housing complaint may be filed with HUD within how long of the alleged violation?', ['30 days', '6 months', '1 year', '5 years'], 2, 'HUD complaints: within 1 year. A private lawsuit can be filed within 2 years.')
          ] },

        { id: 'n-env', title: 'Disclosures & Environmental', icon: 'fa-solid fa-leaf',
          summary: 'Lead paint, radon, asbestos, storage tanks, flood zones and material facts.',
          notes: 'Lead-based paint (homes built before 1978): give the EPA pamphlet and disclosure form, allow a 10-day inspection opportunity (buyer can waive), keep records 3 years.\n\n' +
                 '- Radon: radioactive gas from the soil; EPA action level 4 pCi/L.\n- Asbestos: most dangerous when friable (crumbling).\n- Underground storage tanks: risk of leaks into soil and groundwater.\n- CERCLA (Superfund): current and past owners can be liable for cleanup.\n\n' +
                 'A material fact is anything that would affect a reasonable buyer\'s decision.',
          resources: [],
          questions: [
            Q('n-env-1', 'The federal lead-based paint disclosure rule applies to housing built before:', ['1960', '1978', '1985', '1990'], 1, 'Lead paint was banned for residential use in 1978.'),
            Q('n-env-2', 'Buyers of pre-1978 homes must be given an opportunity to inspect for lead for:', ['3 days', '7 days', '10 days', '30 days'], 2, 'The buyer can waive or change the 10-day period in writing.'),
            Q('n-env-3', 'Agents and sellers must keep lead-based paint disclosure records for:', ['1 year', '3 years', '5 years', '7 years'], 1, 'Keep the signed disclosure for 3 years from closing.'),
            Q('n-env-4', 'The EPA recommends fixing a home when radon levels are at or above:', ['2 pCi/L', '4 pCi/L', '10 pCi/L', '20 pCi/L'], 1, '4 picocuries per liter is the EPA action level.'),
            Q('n-env-5', 'Asbestos is generally most hazardous when it is:', ['Encapsulated', 'Left undisturbed', 'Friable (crumbling)', 'Painted over'], 2, 'Friable asbestos releases fibers into the air.'),
            Q('n-env-6', 'A material fact is best described as:', ['Any fact that would affect a reasonable buyer\'s decision', 'Only facts listed on a form', 'Facts the seller wants shared', 'Facts about the neighbors'], 0, 'If a reasonable person would care when deciding, it is material.'),
            Q('n-env-7', 'A home where a violent crime took place is often called:', ['Stigmatized', 'Encumbered', 'Functionally obsolete', 'Contaminated'], 0, 'Disclosure rules for stigmatized property vary by state — know your state\'s law.'),
            Q('n-env-8', 'The main concern with an old underground fuel oil tank is:', ['It raises property taxes', 'Leaking into the soil and groundwater', 'It counts as personal property', 'It causes radon'], 1, 'Leaking tanks can mean expensive environmental cleanup.'),
            Q('n-env-9', 'Under CERCLA (Superfund), who may be liable for cleanup costs?', ['Only the party who caused the contamination', 'Current and past owners and operators', 'Only the EPA', 'Only the lender'], 1, 'Liability can reach current owners even if they didn\'t cause the contamination.'),
            Q('n-env-10', 'Federally backed lenders generally require flood insurance when a property is in a:', ['Zone X (minimal risk) area', 'Special flood hazard area', 'Neighborhood near any lake', 'Coastal state only'], 1, 'Special flood hazard areas (the "100-year floodplain") trigger mandatory flood insurance.')
          ] },

        { id: 'n-math', title: 'Real Estate Math', icon: 'fa-solid fa-calculator',
          summary: 'Commission, price per square foot, LTV, cap rates, taxes, prorations and area.',
          notes: 'Handy formulas:\n\n- Commission = sale price × rate, then split between brokerages, then agent\'s share.\n- Value = NOI ÷ cap rate. Cap rate = NOI ÷ value.\n- Loan = price × LTV. Points: 1 point = 1% of the LOAN.\n- Property tax = assessed value × rate (watch for "per $100" or mills).\n- Monthly interest = loan × annual rate ÷ 12.\n- Acre = 43,560 sq ft.\n\nProrate: find the daily amount (annual ÷ 365 or 360, as the question says), then multiply by the days.',
          resources: [],
          questions: [
            Q('n-math-1', 'A home sells for $240,000 with a 6% total commission split 50/50 between the brokerages. The agent gets 60% of their brokerage\'s share. What does the agent earn?', ['$4,320', '$7,200', '$8,640', '$14,400'], 0, '$240,000 × 6% = $14,400. Half = $7,200. 60% of $7,200 = $4,320.'),
            Q('n-math-2', 'A 1,850 sq ft home sells for $277,500. What is the price per square foot?', ['$140', '$150', '$155', '$160'], 1, '$277,500 ÷ 1,850 = $150.'),
            Q('n-math-3', 'A buyer puts 10% down on a $300,000 home. What is the loan amount?', ['$30,000', '$270,000', '$300,000', '$330,000'], 1, '$300,000 × 90% = $270,000.'),
            Q('n-math-4', 'A building has NOI of $36,000 and sold for $450,000. What is the cap rate?', ['6%', '7.5%', '8%', '12.5%'], 2, '$36,000 ÷ $450,000 = 0.08 = 8%.'),
            Q('n-math-5', 'A property has NOI of $50,000 and the market cap rate is 10%. What is its value?', ['$50,000', '$450,000', '$500,000', '$5,000,000'], 2, '$50,000 ÷ 0.10 = $500,000.'),
            Q('n-math-6', 'Assessed value is $180,000 and the tax rate is $2.50 per $100. What is the annual tax?', ['$450', '$4,500', '$45,000', '$2,500'], 1, '$180,000 ÷ 100 = 1,800 units × $2.50 = $4,500.'),
            Q('n-math-7', 'Annual taxes of $3,650 are paid in arrears. The seller owned the home 120 days of the year. Using a 365-day year, what happens at closing?', ['$1,200 debit to the seller', '$1,200 credit to the seller', '$2,450 debit to the seller', '$3,650 debit to the seller'], 0, '$3,650 ÷ 365 = $10/day × 120 = $1,200. The seller owes it (debit) because the taxes haven\'t been paid yet.'),
            Q('n-math-8', 'A lot measures 150 ft by 290.4 ft. About how many acres is it?', ['0.5', '1', '1.5', '2'], 1, '150 × 290.4 = 43,560 sq ft = 1 acre.'),
            Q('n-math-9', 'What is the first month\'s interest on a $200,000 loan at 6% annual interest?', ['$1,000', '$1,200', '$12,000', '$600'], 0, '$200,000 × 6% = $12,000 per year ÷ 12 = $1,000.'),
            Q('n-math-10', 'A lender charges 2 points on a $250,000 loan. How much are the points?', ['$2,500', '$5,000', '$500', '$50,000'], 1, '2% × $250,000 = $5,000.')
          ] }
    ];

    /* ─────────────────────────── INDIANA ─────────────────────────── */
    var indiana = [
        { id: 'i-law', title: 'IREC & License Law', icon: 'fa-solid fa-building-columns',
          summary: 'Who regulates Indiana licensees, license types, and what requires a license.',
          notes: 'Indiana real estate licensees are regulated by the Indiana Real Estate Commission (IREC), with administration handled by the Indiana Professional Licensing Agency (IPLA). The license law is in Indiana Code Title 25, Article 34.1.\n\n' +
                 '- Since July 1, 2014, Indiana licenses practitioners as brokers (no separate salesperson license); a managing broker supervises.\n- A broker\'s license is active only when associated with a managing broker.\n- Compensation for licensed activity is paid through your managing broker — never directly, and never shared with unlicensed people.',
          resources: [{ title: 'License Lookup — IPLA Portal', link: 'https://mylicense.in.gov/EVerification/Search.aspx' }],
          questions: [
            Q('i-law-1', 'Which agency handles administration of Indiana real estate licenses along with the Real Estate Commission?', ['Indiana Department of Revenue', 'Indiana Professional Licensing Agency (IPLA)', 'HUD', 'Indiana Association of REALTORS'], 1, 'IPLA provides the administrative support; the IREC sets and enforces the rules.'),
            Q('i-law-2', 'Indiana\'s real estate license law is found in:', ['IC 25-34.1', 'IC 32-21', 'IC 24-5', 'IC 6-1.1'], 0, 'Title 25 covers professions and occupations; Article 34.1 is real estate brokers.'),
            Q('i-law-3', 'Since July 1, 2014, a newly licensed Indiana real estate practitioner holds a:', ['Salesperson license', 'Broker license', 'Associate broker license', 'Apprentice license'], 1, 'Indiana moved to a broker / managing broker structure in 2014.'),
            Q('i-law-4', 'A new Indiana broker\'s license can be active only when the broker is:', ['Passed the exam', 'Associated with a managing broker', 'A member of the MLS', 'A member of a REALTOR association'], 1, 'You must hang your license with a managing broker to practice.'),
            Q('i-law-5', 'Which task can an unlicensed assistant generally do?', ['Negotiate price with a buyer', 'Host a showing and discuss terms', 'Schedule showings and prepare mailings', 'Give opinions of value to consumers'], 2, 'Clerical and scheduling work is fine. Negotiating, showing and advising require a license.'),
            Q('i-law-6', 'When an Indiana licensee buys or sells property for themselves, they must:', ['Do nothing special', 'Disclose in writing that they hold a real estate license', 'Get Commission approval first', 'Use a different brokerage'], 1, 'Licensees must disclose in writing that they hold a license, and their interest in the property, in their own transactions (876 IAC 8-2-6).'),
            Q('i-law-7', 'A broker\'s commission must be paid:', ['Directly from the seller to the broker', 'Through the broker\'s managing broker / brokerage', 'By the title company to any licensee', 'In cash at closing'], 1, 'Compensation for licensed activity flows through the managing broker. At YRL, the CDA pays the agent and YRL.'),
            Q('i-law-8', 'An unlicensed friend refers you a buyer. Can you pay them part of your commission?', ['Yes, if under $500', 'Yes, if you disclose it', 'No — compensation for licensed activity can\'t be shared with unlicensed people', 'Only after closing'], 2, 'Paying unlicensed people for licensed activity is prohibited. Ask your managing broker about any thank-you gift rules.'),
            Q('i-law-9', 'Which is NOT a disciplinary action the Commission can take?', ['License suspension', 'License revocation', 'A civil penalty (fine)', 'A jail sentence'], 3, 'Criminal penalties come from a court, not the Commission.'),
            Q('i-law-10', 'Where can anyone verify an Indiana real estate license?', ['Zillow', 'The IPLA license lookup (mylicense.in.gov)', 'The MLS roster', 'The Secretary of State business search'], 1, 'The IPLA eVerification search is the official source.')
          ] },

        { id: 'i-edu', title: 'Licensing & Education Requirements', icon: 'fa-solid fa-graduation-cap',
          summary: 'Pre-license, post-license, yearly CE, activating your license, and REALTOR cycles.',
          notes: 'Continuing education: brokers with an active or unassigned license complete 12 hours of approved CE every year. The Indiana CE year runs July 1 through June 30.\n\n' +
                 '- You don\'t submit certificates at renewal, but the Commission can audit — keep your certificates.\n- REALTOR members: Code of Ethics training every 3 years, and (from 2025) Fair Housing training on the same 3-year cycle.\n- New brokers activate by submitting the Application to Activate plus the Supplemental form signed by the managing broker.\n- If you use an LLC for commissions, file the Indiana Business Entity Report every two years.',
          resources: [],
          questions: [
            Q('i-edu-1', 'How many hours of approved CE must an Indiana broker (active or unassigned) complete each year?', ['6', '12', '16', '24'], 1, '12 hours every year.'),
            Q('i-edu-2', 'The Indiana CE year runs:', ['January 1 – December 31', 'July 1 – June 30', 'Your birth month to birth month', 'From your license issue date'], 1, 'Finish your 12 hours before June 30.'),
            Q('i-edu-3', 'At renewal, Indiana brokers:', ['Must mail in their CE certificates', 'Don\'t submit certificates but must keep them for a possible random audit', 'Don\'t need certificates at all', 'Have the MLS file them'], 1, 'Keep your certificates and course records — audits happen.'),
            Q('i-edu-4', 'How many hours of pre-licensing education does Indiana require for a broker license?', ['60', '75', '90', '120'], 2, 'Indiana requires a 90-hour broker pre-licensing course before the exam.'),
            Q('i-edu-5', 'New Indiana brokers must complete 30 hours of post-licensing education:', ['Within 6 months', 'Within 1 year', 'Within 2 years of getting licensed', 'There is no post-licensing requirement'], 2, 'Post-licensing must be done within two years or the license is at risk.'),
            Q('i-edu-6', 'REALTOR members must complete Code of Ethics training:', ['Every year', 'Every 2 years', 'Every 3 years', 'Once in a career'], 2, 'This is an NAR membership requirement, separate from state CE. Janet recommends taking it every year anyway.'),
            Q('i-edu-7', 'Starting in 2025, NAR\'s Fair Housing training requirement for REALTORS runs:', ['Every year', 'On the same 3-year cycle as Code of Ethics', 'Once in a career', 'Only for managing brokers'], 1, 'It lines up with the Code of Ethics cycle.'),
            Q('i-edu-8', 'The Supplemental form submitted with the Application to Activate a license must be signed by:', ['The seller', 'The managing broker', 'Only a notary', 'The title company'], 1, 'Your broker signs it to confirm you are joining the brokerage.'),
            Q('i-edu-9', 'If you receive commissions through an Indiana LLC, how often must you file the Business Entity Report to avoid dissolution?', ['Every year', 'Every two years', 'Every five years', 'Never'], 1, 'Miss it and the state can administratively dissolve your LLC.'),
            Q('i-edu-10', 'Which CE topics does YRL recommend including every year?', ['Fair Housing and Code of Ethics', 'Only math', 'Only commercial topics', 'None — any 12 hours are the same'], 0, 'Taking them yearly keeps you current and covers the NAR 3-year cycle.')
          ] },

        { id: 'i-agency', title: 'Indiana Agency Law', icon: 'fa-solid fa-user-tie',
          summary: 'Limited agency, in-house agency, duties to customers and disclosure.',
          notes: 'Indiana\'s agency rules for licensees are set by statute (IC 25-34.1-10).\n\n' +
                 '- Limited agency (representing both sides) requires written consent from both clients.\n- As a limited agent you may not disclose, without permission, that a seller would take less or a buyer would pay more, or either party\'s motivation.\n- When two brokers in the same company represent the buyer and seller separately, Indiana calls it an in-house agency relationship.\n- Confidentiality survives the end of the agency relationship.\n- Indiana does not require disclosing psychologically affected facts (for example, that a death occurred in the home).',
          resources: [],
          questions: [
            Q('i-agency-1', 'Indiana\'s agency rules for real estate licensees are found in:', ['IC 25-34.1-10', 'Only the NAR Code of Ethics', 'The MLS rules', 'Common law only'], 0, 'The statute spells out duties to clients and customers.'),
            Q('i-agency-2', 'An Indiana licensee may act as a limited agent (representing both buyer and seller) only with:', ['Verbal consent from the seller', 'Written consent of both the seller and the buyer', 'The managing broker\'s approval', 'No consent'], 1, 'Both clients must agree in writing after the arrangement is explained.'),
            Q('i-agency-3', 'As a limited agent, which may you NOT disclose without permission?', ['Known defects in the property', 'That the buyer would pay more than they offered', 'The home\'s square footage', 'The HOA dues'], 1, 'Price positions and motivation stay confidential. Defects must still be disclosed.'),
            Q('i-agency-4', 'Two brokers from the same company separately represent the buyer and the seller. Indiana calls this:', ['In-house agency', 'Subagency', 'Transaction brokerage', 'Universal agency'], 0, 'Each broker represents their own client; the managing broker handles confidential information carefully.'),
            Q('i-agency-5', 'Toward a customer you do not represent, you must:', ['Owe full fiduciary loyalty', 'Deal honestly and disclose adverse material facts you actually know', 'Share your client\'s lowest price', 'Refuse to answer any questions'], 1, 'Honesty and disclosure of known material defects apply to everyone.'),
            Q('i-agency-6', 'Under Indiana law, a seller or licensee generally is NOT required to disclose:', ['A known leaking roof', 'That a death occurred in the home', 'A cracked foundation', 'A known sewer backup'], 1, 'Psychologically affected facts don\'t have to be disclosed, but never lie if a buyer asks directly — check with your managing broker.'),
            Q('i-agency-7', 'After the seller accepts an offer, a second offer arrives. Generally the listing broker should:', ['Ignore it', 'Present it immediately, unless the seller has directed otherwise', 'Accept it on the seller\'s behalf', 'Hold it until after closing'], 1, 'Indiana law says to present every offer right away, even after one is accepted, unless the seller tells you not to (IC 25-34.1-10-10). Get that instruction in writing to protect yourself, and have the seller talk to an attorney about backup offers.'),
            Q('i-agency-8', 'Which duty continues after the agency relationship ends?', ['Obedience', 'Confidentiality', 'Loyalty in negotiations', 'Marketing the property'], 1, 'You can\'t later share a former client\'s confidential information.'),
            Q('i-agency-9', 'The party you work with in a transaction but do NOT represent is called a:', ['Client', 'Customer', 'Principal', 'Subagent'], 1, 'Clients get fiduciary duties; customers get honesty and fair dealing.'),
            Q('i-agency-10', 'Indiana requires each managing broker to:', ['Have a written company policy on agency relationships', 'Offer only limited agency', 'Refuse buyer agency', 'Publish its commission rates'], 0, 'Know your company\'s agency policy — ask for YRL\'s.')
          ] },

        { id: 'i-escrow', title: 'Trust Funds & Earnest Money', icon: 'fa-solid fa-vault',
          summary: 'Escrow accounts, commingling and conversion, deposits and disputes.',
          notes: 'Earnest money belongs in the escrow/trust account named in the purchase agreement — never your personal account.\n\n' +
                 '- Commingling: mixing client money with the broker\'s own funds.\n- Conversion: using client money for personal use.\n- The managing broker is responsible for the brokerage escrow account.\n- Disputed earnest money isn\'t released without a written mutual release or a court order.\n\n' +
                 'Deposit timing: Indiana rules require prompt deposit after acceptance — confirm the exact deadline with your managing broker.',
          resources: [],
          questions: [
            Q('i-escrow-1', 'Earnest money held by a brokerage must be deposited into:', ['The agent\'s personal account', 'The brokerage\'s escrow/trust account', 'The seller\'s account', 'A drawer at the office, in cash'], 1, 'Trust money stays separate from everyone\'s personal funds.'),
            Q('i-escrow-2', 'Mixing client funds with the broker\'s own funds is:', ['Conversion', 'Commingling', 'Escrow', 'A kickback'], 1, 'Commingling is a violation even if no money is lost.'),
            Q('i-escrow-3', 'Using client funds for personal expenses is:', ['Commingling', 'Conversion', 'Proration', 'Novation'], 1, 'Conversion is essentially theft of trust funds.'),
            Q('i-escrow-4', 'Indiana requires earnest money held by a broker to be deposited:', ['The same day, always', 'No later than two banking days after acceptance', 'Within 7 days', 'Any time before closing'], 1, 'Deposit promptly after acceptance — two banking days is the Indiana standard.'),
            Q('i-escrow-5', 'Who is responsible for the brokerage escrow account?', ['The agent who collected the money', 'The managing broker', 'The buyer\'s lender', 'The title company'], 1, 'The managing broker supervises and reconciles trust accounts.'),
            Q('i-escrow-6', 'Buyer and seller both claim the earnest money after a deal falls apart. The escrow holder should:', ['Release it to the seller', 'Release it to the buyer', 'Hold it until a written mutual release or court order', 'Split it 50/50'], 2, 'Never pick a side. Follow the purchase agreement and your managing broker\'s direction.'),
            Q('i-escrow-7', 'A buyer hands you an earnest money check at a Friday evening showing. Best practice is to:', ['Hold it in your car until the deal closes', 'Deliver it promptly to the escrow holder named in the contract and document the receipt', 'Deposit it in your own account and write a new check', 'Give it to the seller'], 1, 'Document when and from whom you received it, and get it where it belongs quickly.'),
            Q('i-escrow-8', 'The earnest money check bounces. You should:', ['Say nothing and hope the buyer fixes it', 'Promptly notify your managing broker and the parties', 'Cover it with your own money', 'Cancel the contract yourself'], 1, 'The seller needs to know — the contract may give them remedies.')
          ] },

        { id: 'i-ads', title: 'Advertising Rules', icon: 'fa-solid fa-bullhorn',
          summary: 'Brokerage name, blind ads, team names, social media and other agents\' listings.',
          notes: 'Every ad — including social media, signs and websites — must identify the brokerage.\n\n' +
                 '- Blind ads (no brokerage identified) are prohibited.\n- Team names can\'t make the team look like its own brokerage.\n- You need permission to advertise another brokerage\'s listing.\n- Selling your own home? Disclose that you are a licensee.\n- Describe the property, not the people (fair housing).',
          resources: [],
          questions: [
            Q('i-ads-1', 'Indiana requires a licensee\'s advertising to include:', ['The agent\'s home address', 'The broker company\'s name (as licensed or its publicly known name), clearly visible', 'The list price', 'The agent\'s license number'], 1, 'Every ad has to clearly show your brokerage\'s name, either as licensed or as the public knows it (876 IAC 8-1-8).'),
            Q('i-ads-2', 'An ad that doesn\'t reveal it was placed by a licensee or brokerage is a:', ['Blind ad', 'Puffing ad', 'Bait-and-switch ad', 'Teaser ad'], 0, 'Blind ads mislead consumers about who they\'re dealing with.'),
            Q('i-ads-3', 'Before advertising a property listed by another brokerage, you need:', ['Nothing, if it\'s on the MLS', 'Written consent from the owner or the owner\'s agent (usually the listing broker)', 'The buyer\'s permission', 'Only a disclaimer'], 1, 'Indiana rules require written consent from the owner or their authorized agent before you advertise someone else\'s listing (876 IAC 8-1-8).'),
            Q('i-ads-4', 'A team advertises as "Hoosier Home Group." What else must appear?', ['The team leader\'s cell number', 'The brokerage name', 'The MLS number', 'Nothing else'], 1, 'The brokerage name must be there so it\'s clear the team isn\'t a separate company.'),
            Q('i-ads-5', 'An Instagram post promoting your real estate services is:', ['Not advertising', 'Advertising, and must follow the same rules', 'Only regulated if it\'s paid', 'Only regulated if it includes a price'], 1, 'Social media counts as advertising.'),
            Q('i-ads-6', 'Which listing phrase describes the property rather than the buyer?', ['"Great for families"', '"Quiet cul-de-sac"', '"Perfect for empty nesters"', '"Christian neighborhood"'], 1, 'Stick to features of the home and area.'),
            Q('i-ads-7', 'Advertising a great deal that isn\'t really available to draw in buyers, then pushing a different property, is:', ['Bait and switch', 'Puffing', 'Steering', 'Clear cooperation'], 0, 'It is deceptive advertising.'),
            Q('i-ads-8', 'You list your own home "for sale by owner." Your ads should:', ['Hide that you\'re an agent', 'Disclose that the owner is a licensed real estate broker', 'Use a fake name', 'List your brokerage as the seller'], 1, 'Being a licensee must be disclosed even when selling your own property.')
          ] },

        { id: 'i-disc', title: 'Discipline & Prohibited Acts', icon: 'fa-solid fa-gavel',
          summary: 'What gets licensees in trouble, and how consumers are protected.',
          notes: 'Common violations: misrepresentation, failing to disclose known defects, commingling or converting funds, unlicensed activity, practicing law, undisclosed dual compensation, guaranteeing future profits, and failure to supervise.\n\n' +
                 '- Fill in approved forms and addenda — don\'t draft legal language or give legal/tax advice.\n- Get consent before accepting compensation from more than one party.\n- Indiana\'s Real Estate Recovery Fund can compensate consumers harmed by a licensee\'s fraud when a court judgment can\'t be collected.',
          resources: [],
          questions: [
            Q('i-disc-1', 'Telling a buyer "this house will double in value in five years" is:', ['Good salesmanship', 'Guaranteeing future profits — prohibited', 'Required disclosure', 'Puffing, so always fine'], 1, 'Licensees must not guarantee future value or profits.'),
            Q('i-disc-2', 'Indiana\'s Real Estate Recovery Fund:', ['Pays agents\' unpaid commissions', 'Compensates consumers who can\'t collect a court judgment against a licensee for embezzlement, trickery or similar theft', 'Pays for E&O insurance', 'Funds the MLS'], 1, 'It\'s a last-resort backstop (IC 25-34.1-7): it pays up to $20,000 per judgment for actual cash lost, only after the consumer wins in court and can\'t collect.'),
            Q('i-disc-3', 'When completing a purchase agreement, a broker may:', ['Draft a complex new legal clause', 'Fill in blanks on approved forms and use approved addenda', 'Give legal advice about title', 'Give tax advice'], 1, 'Anything beyond that is the practice of law — refer to an attorney.'),
            Q('i-disc-4', 'Accepting compensation from both the buyer and the seller without both knowing and agreeing is:', ['Allowed if the price is fair', 'A prohibited act', 'Required in limited agency', 'Only a MLS violation'], 1, 'All compensation must be disclosed and agreed to.'),
            Q('i-disc-5', 'A managing broker who ignores an agent\'s repeated escrow problems can be disciplined for:', ['Failure to supervise', 'Nothing — only the agent is responsible', 'Puffing', 'Steering'], 0, 'Managing brokers are responsible for supervising their brokers.'),
            Q('i-disc-6', 'Your license lapsed and you keep showing homes for pay. This is:', ['Fine for 90 days', 'Unlicensed practice', 'Allowed if your broker agrees', 'Only a fine for the brokerage'], 1, 'Keep CE and renewals current so this never happens.'),
            Q('i-disc-7', 'You tell a buyer the home is on city sewer, but you never checked and it\'s on septic. This can be:', ['Puffing', 'Negligent misrepresentation', 'Acceptable if you didn\'t know', 'The seller\'s problem only'], 1, 'Verify facts or say you don\'t know. "I\'ll find out" beats guessing.'),
            Q('i-disc-8', 'A client complains about how you handled their deal. Your first step is to:', ['Ignore it', 'Tell your managing broker right away', 'Post about it online', 'Offer cash to settle it'], 1, 'Your managing broker needs to know about complaints immediately.')
          ] }
    ];

    /* ───────────────────────── NEW LICENSEE ───────────────────────── */
    var newlic = [
        { id: 'nl-broker', title: 'Working Under Your Managing Broker', icon: 'fa-solid fa-people-group',
          summary: 'Supervision, getting paid, complaints and what belongs to the brokerage.',
          notes: 'Your managing broker supervises your real estate activity. When in doubt, ask them first — not the other side\'s agent.\n\n' +
                 '- Commissions are paid to the brokerage; at YRL the CDA pays you and YRL.\n- Listings are agreements between the seller and the brokerage.\n- Keep every document in the transaction file.\n- Report complaints and problems right away.',
          resources: [],
          questions: [
            Q('nl-broker-1', 'Who is responsible for supervising your real estate activity?', ['You alone', 'Your managing broker', 'The MLS', 'Your title company'], 1, 'That\'s why your broker reviews files and signs off on key forms.'),
            Q('nl-broker-2', 'You\'re unsure how to fill in a contract term. Your first call should be to:', ['The other side\'s agent', 'Your managing broker', 'A friend who used to be an agent', 'The seller'], 1, 'The other agent represents someone else.'),
            Q('nl-broker-3', 'At YRL, how are you paid at closing?', ['The title company pays you directly from the seller\'s proceeds', 'Through the CDA, which pays you and YRL', 'In cash from the client', 'The buyer pays you after closing'], 1, 'Submit your Commission Distribution Form so the CDA can be prepared.'),
            Q('nl-broker-4', 'A listing agreement is between the seller and:', ['You personally', 'The brokerage', 'The MLS', 'The buyer'], 1, 'Listings belong to the brokerage, which is why they stay if an agent leaves.'),
            Q('nl-broker-5', 'A client emails you upset about how the inspection was handled. You should:', ['Ignore it and hope it passes', 'Tell your managing broker promptly', 'Reply with a long argument', 'Delete the email'], 1, 'Early heads-up lets your broker help.'),
            Q('nl-broker-6', 'Can your unlicensed spouse host your open house and discuss price with visitors?', ['Yes, if you\'re nearby', 'No — showing and discussing terms requires a license', 'Yes, if they wear a name tag', 'Only on weekends'], 1, 'Unlicensed helpers can greet and hand out flyers only if allowed by your broker — no negotiating or advising.'),
            Q('nl-broker-7', 'Can you post "Just Sold!" about a home where you didn\'t represent either party?', ['Yes, you saw it on the MLS', 'No — only claim sales you were actually part of', 'Yes, if you tag the listing agent', 'Only if the price was public'], 1, 'Claiming a sale you didn\'t handle is misleading advertising.'),
            Q('nl-broker-8', 'Where do copies of all signed transaction documents belong?', ['Your personal email only', 'The YRL transaction file', 'The client\'s house', 'Nowhere after closing'], 1, 'A complete file protects you, the client and the brokerage.')
          ] },

        { id: 'nl-pa', title: 'Purchase Agreement Basics', icon: 'fa-solid fa-file-contract',
          summary: 'Offers, counters, contingencies, deadlines and possession.',
          notes: 'Use your approved forms and addenda. An offer becomes a contract once it is accepted and the acceptance is delivered according to its terms.\n\n' +
                 '- Changing any term = a counteroffer, which rejects the original.\n- Contingencies (inspection, financing, appraisal) have deadlines — missing one can waive your client\'s rights.\n- Closing date and possession date can be different; spell out possession clearly.\n- Earnest money amount is negotiable.',
          resources: [],
          questions: [
            Q('nl-pa-1', 'When does a purchase agreement become binding?', ['When the buyer signs it', 'When it is accepted and acceptance is delivered as the contract requires', 'When the lender approves the loan', 'At closing'], 1, 'Track the exact time of acceptance — deadlines usually run from it.'),
            Q('nl-pa-2', 'The seller signs the buyer\'s offer but changes the closing date. This is:', ['An acceptance', 'A counteroffer', 'A binding contract', 'An addendum that doesn\'t matter'], 1, 'Any change makes it a counteroffer the buyer must accept.'),
            Q('nl-pa-3', 'Your buyer misses the inspection response deadline. What\'s the risk?', ['None', 'They may lose the right to object to inspection items', 'The seller must lower the price', 'The contract becomes void automatically'], 1, 'Put every deadline on your calendar the day the contract is accepted.'),
            Q('nl-pa-4', 'A financing contingency generally protects the buyer if:', ['They find a nicer house', 'They can\'t obtain the loan described in the contract', 'Rates go down', 'The seller changes their mind'], 1, 'Follow the contract\'s steps and timelines to use it.'),
            Q('nl-pa-5', 'The appraisal comes in $10,000 below the contract price. Common options include:', ['Nothing can be done', 'Renegotiate the price, the buyer covers the gap, or use the contract\'s appraisal terms', 'The agent pays the difference', 'The lender must raise the appraisal'], 1, 'Know what your contract and any appraisal addendum say.'),
            Q('nl-pa-6', 'The amount of earnest money is:', ['Set by state law', 'Negotiable between buyer and seller', 'Always 1% of the price', 'Set by the MLS'], 1, 'A stronger deposit can make an offer more competitive.'),
            Q('nl-pa-7', 'The closing date and the possession date:', ['Must always be the same day', 'Can be different, and the contract should spell out possession clearly', 'Are decided by the title company', 'Don\'t need to be in the contract'], 1, 'Unclear possession terms cause some of the worst closing-day problems.'),
            Q('nl-pa-8', 'A client asks you to add a custom legal clause to the contract. You should:', ['Write it yourself', 'Use an approved addendum or refer them to an attorney', 'Copy one from the internet', 'Tell them it isn\'t allowed'], 1, 'Drafting legal language is the practice of law.')
          ] },

        { id: 'nl-disc', title: 'Seller\'s Disclosure & Lead Paint', icon: 'fa-solid fa-clipboard-check',
          summary: 'Indiana\'s seller disclosure form, timing, updates and the lead paint rules.',
          notes: 'Indiana\'s Seller\'s Residential Real Estate Sales Disclosure form (IC 32-21-5) applies to most sales of 1–4 unit residential property. The SELLER completes it, based on their actual knowledge. It is not a warranty — buyers should still inspect.\n\n' +
                 '- Deliver it before an offer is accepted.\n- If the seller learns something new before closing, the disclosure should be updated.\n- Lead paint (pre-1978): EPA pamphlet "Protect Your Family From Lead in Your Home," the disclosure form, and the 10-day inspection opportunity.',
          resources: [],
          questions: [
            Q('nl-disc-1', 'Indiana\'s Seller\'s Residential Real Estate Sales Disclosure form generally applies to:', ['Commercial buildings', '1–4 unit residential property', 'Vacant land only', 'New construction only'], 1, 'Covers up to four dwelling units (IC 32-21-5-1); some transfers are exempt. Always use the current form (revised July 2025).'),
            Q('nl-disc-2', 'Who fills out the seller\'s disclosure?', ['The listing agent', 'The seller', 'The home inspector', 'The buyer\'s agent'], 1, 'Agents should never complete it for the seller.'),
            Q('nl-disc-3', 'The seller\'s disclosure should be delivered to the buyer:', ['At closing', 'Before an offer is accepted', 'After the inspection', 'Only if the buyer asks'], 1, 'Get the signed disclosure to buyers early.'),
            Q('nl-disc-4', 'The seller\'s disclosure form is:', ['A warranty of the home\'s condition', 'Based on the seller\'s actual knowledge, and not a warranty', 'A substitute for an inspection', 'Optional for listings'], 1, 'Always recommend a professional inspection.'),
            Q('nl-disc-5', 'For a home built before 1978, the buyer must get:', ['Nothing extra', 'The EPA lead pamphlet, a lead disclosure, and a 10-day inspection opportunity', 'A mandatory lead inspection paid by the seller', 'A radon test'], 1, 'The buyer can waive the inspection period in writing.'),
            Q('nl-disc-6', 'Your seller forgot to list a past roof leak you know about. You should:', ['Leave it — it\'s their form', 'Advise the seller to update the disclosure; you can\'t take part in hiding a known defect', 'Fix the form yourself', 'Tell the buyer to skip the inspection'], 1, 'You have your own duty to disclose known material defects.'),
            Q('nl-disc-7', 'After the disclosure is delivered, the seller discovers a new water heater leak before closing. The seller should:', ['Say nothing', 'Update the disclosure / notify the buyer', 'Wait until after closing', 'Only tell the lender'], 1, 'Disclosures should reflect what the seller knows before closing.'),
            Q('nl-disc-8', 'If a buyer receives the seller\'s disclosure after making an offer, Indiana law lets the buyer:', ['Do nothing about it', 'Cancel within two business days after receiving it, if the form discloses a defect, and get the earnest money back', 'Reduce the price automatically', 'Sue the listing agent immediately'], 1, 'A late disclosure that reveals a defect gives the buyer two business days to back out with their deposit (IC 32-21-5-13) — which is why early delivery matters.')
          ] },

        { id: 'nl-fh', title: 'Fair Housing in Daily Practice', icon: 'fa-solid fa-scale-balanced',
          summary: 'Handling everyday questions about neighborhoods, schools and people.',
          notes: 'Everyday rules:\n\n- Point buyers to objective sources (crime maps, school sites, census data) instead of giving your opinion about neighborhoods.\n- Apply the same standards to every buyer (pre-approval, ID, showing policy).\n- Never follow a seller\'s instruction to exclude any protected class.\n- Describe the property, not the people who "should" live there.',
          resources: [],
          questions: [
            Q('nl-fh-1', 'A buyer asks, "Is this a safe neighborhood?" The best answer is to:', ['Give your personal opinion', 'Point them to objective sources like police crime maps', 'Tell them who lives there', 'Suggest a different area'], 1, 'Let buyers decide with real data.'),
            Q('nl-fh-2', 'A seller tells you not to show the home to a certain group. You should:', ['Follow the seller\'s instructions', 'Refuse — you can\'t follow a discriminatory instruction', 'Show it only on weekends', 'Ask your buyer\'s background first'], 1, 'Talk to your managing broker; you may need to end the listing.'),
            Q('nl-fh-3', 'You require pre-approval before showings. To stay compliant you should:', ['Require it only from some buyers', 'Apply the same requirement to every buyer', 'Waive it for friends only', 'Ask only first-time buyers'], 1, 'Consistency is the best protection against discrimination claims.'),
            Q('nl-fh-4', 'Why do many brokerages discourage buyer "love letters" to sellers?', ['They take too long to read', 'They can reveal protected characteristics and create fair housing risk', 'They\'re illegal in every state', 'Sellers never read them'], 1, 'Ask your managing broker about YRL\'s policy.'),
            Q('nl-fh-5', 'A buyer asks, "Which school district is best?" You should:', ['Rank them from your own opinion', 'Share objective sources like the state school report cards', 'Say where people like them send their kids', 'Refuse to talk about schools'], 1, 'Give sources, not opinions.'),
            Q('nl-fh-6', 'At an open house, a visitor asks what "kind of people" live on the street. You should:', ['Describe the neighbors', 'Redirect to the home\'s features and objective public information', 'Guess at demographics', 'Ask them what kind they\'d prefer'], 1, 'Talk about the property, not the people.'),
            Q('nl-fh-7', 'Which listing description is safest?', ['"Perfect for a young couple"', '"Walk-in closet and fenced yard"', '"Great for singles"', '"Ideal bachelor pad"'], 1, 'Describe features, not ideal occupants.'),
            Q('nl-fh-8', 'A tenant with a disability asks to install grab bars in a rental bathroom. This is a request for a:', ['Reasonable accommodation', 'Reasonable modification', 'Fair housing exemption', 'Code violation'], 1, 'Modifications are physical changes; accommodations are rule changes.')
          ] },

        { id: 'nl-mls', title: 'MLS, Buyer Agreements & Advertising', icon: 'fa-solid fa-list-check',
          summary: 'Written buyer agreements, compensation, clear cooperation, photos and data.',
          notes: 'Since August 17, 2024 (NAR practice changes):\n\n- MLS participants must have a written agreement with a buyer before touring a home.\n- The agreement must state compensation as an objective amount (a set fee, percentage or hourly rate) — not open-ended.\n- Offers of compensation to buyer brokers can\'t appear on the MLS.\n\n' +
                 'Clear Cooperation: once you publicly market a listing, it generally must go into the MLS within one business day. Use only photos you have rights to, and keep MLS data accurate.',
          resources: [],
          questions: [
            Q('nl-mls-1', 'Under NAR\'s rules effective August 2024, MLS participants working with a buyer must:', ['Get a written agreement before closing', 'Have a written agreement before touring a home', 'Only need a verbal agreement', 'Never have a written agreement'], 1, 'Have the buyer agreement signed before the first tour.'),
            Q('nl-mls-2', 'The compensation in a written buyer agreement must be:', ['Left blank', 'An objective amount — a set fee, percentage or rate', '"Whatever the seller offers"', 'Decided after closing'], 1, 'It can\'t be open-ended.'),
            Q('nl-mls-3', 'Can an offer of compensation to buyer brokers be shown on the MLS?', ['Yes, in the remarks', 'No', 'Only for new construction', 'Only as a percentage'], 1, 'Compensation can still be negotiated — just not advertised on the MLS.'),
            Q('nl-mls-4', 'Under the Clear Cooperation Policy, once a listing is publicly marketed it generally must be submitted to the MLS within:', ['1 business day', '3 days', '7 days', '30 days'], 0, 'Public marketing includes signs, social posts and websites — unless the seller chose an office-exclusive or delayed-marketing option under NAR\'s Multiple Listing Options for Sellers.'),
            Q('nl-mls-5', 'You want to use photos from the previous agent\'s listing. You should:', ['Use them — they\'re on the MLS', 'Get permission or take new photos', 'Crop out the watermark', 'Use them if the seller says it\'s fine'], 1, 'Photos are copyrighted by the photographer or the agent who bought them.'),
            Q('nl-mls-6', 'Where should the square footage you enter in the MLS come from?', ['Your guess', 'A reliable, stated source (assessor, appraisal or measurement)', 'The seller\'s memory', 'A neighbor\'s listing'], 1, 'Note the source — wrong square footage is a common complaint.'),
            Q('nl-mls-7', 'Your personal Facebook post about your new listing must include:', ['Your home address', 'The brokerage name', 'The seller\'s name', 'Nothing — it\'s personal'], 1, 'Social posts about your listings are advertising.'),
            Q('nl-mls-8', 'Before putting up a "Coming Soon" sign, you should:', ['Just put it up', 'Check the MLS rules and the listing agreement for coming-soon requirements', 'Wait until after closing', 'Ask the buyer\'s agent'], 1, 'Coming-soon marketing can trigger MLS submission deadlines.')
          ] },

        { id: 'nl-file', title: 'Earnest Money & the Transaction File', icon: 'fa-solid fa-folder-open',
          summary: 'The YRL deal flow from contract to closing — and why the file matters.',
          notes: 'The YRL deal flow:\n\n- Under contract → open the transaction file in Transactions and upload the executed contract.\n- Log earnest money receipt and deliver it where the contract says.\n- Key dates show on your Tasks and Calendar — work them.\n- Submit the Commission Distribution Form so the CDA can be prepared.\n- After closing: the hub sets the home anniversary and post-closing follow-ups.\n\nSee Help → Transaction Workflow for the full SOP.',
          resources: [],
          questions: [
            Q('nl-file-1', 'Your listing goes under contract. In the YRL hub you should:', ['Wait until closing to do anything', 'Open the transaction file in Transactions and upload the executed contract', 'Email the contract to the seller only', 'Start a new contact'], 1, 'The hub prompts you to open the file when a contact moves to Under Contract.'),
            Q('nl-file-2', 'To get paid at closing at YRL, you submit a:', ['Commission Distribution Form, which prepares the CDA', 'Commission invoice to the seller', 'W-9 to the title company', 'Text to your broker'], 0, 'The Commission Distribution Form flows into the CDA.'),
            Q('nl-file-3', 'The YRL CDA pays:', ['Everyone involved in the deal', 'Only the agent and YRL', 'Only the buyer\'s agent', 'The seller'], 1, 'Other payouts are handled separately.'),
            Q('nl-file-4', 'Why keep a complete transaction file?', ['It\'s optional busywork', 'For audits, complaints and legal protection', 'Only for the MLS', 'Only for big deals'], 1, 'If it isn\'t in the file, it didn\'t happen.'),
            Q('nl-file-5', 'Where do your deal deadlines show up in the hub?', ['Nowhere', 'Tasks and Calendar', 'Only in email', 'Only on paper'], 1, 'Check them every day your deal is active.'),
            Q('nl-file-6', 'When you receive earnest money, you should:', ['Keep it until closing', 'Document receipt and deliver it to the escrow holder named in the contract', 'Give it to the seller', 'Deposit it in your personal account'], 1, 'Note who gave it to you, when, and where it went.'),
            Q('nl-file-7', 'After a deal closes, the hub automatically:', ['Deletes the contact', 'Sets the home anniversary and post-closing follow-up tasks', 'Emails the CDA', 'Marks the client as a Past Client'], 1, 'Moving the contact to Past Client stays a manual step.'),
            Q('nl-file-8', 'Where can you find YRL\'s full step-by-step transaction SOP?', ['The MLS', 'Help → Transaction Workflow', 'The title company', 'Nowhere yet'], 1, 'Use it with every deal until the steps are second nature.')
          ] }
    ];

    window.LICENSING_DEFAULT = {
        version: 1,
        tracks: [
            { id: 'national', name: 'National Exam Prep', icon: 'fa-solid fa-flag-usa',
              desc: 'The national portion of the license exam — principles, practices and math. Study the notes, then quiz yourself.', modules: national },
            { id: 'indiana', name: 'Indiana Exam Prep', icon: 'fa-solid fa-landmark',
              desc: 'Indiana license law, agency, escrow and advertising rules for the state portion of the exam.', modules: indiana },
            { id: 'newlicensee', name: 'New Licensee', icon: 'fa-solid fa-seedling',
              desc: 'Just licensed? Practical training for your first year — contracts, disclosures, fair housing and the YRL deal flow.', modules: newlic }
        ]
    };
})();
