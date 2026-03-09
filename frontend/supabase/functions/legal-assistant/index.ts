import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Comprehensive Indian Contract Act, 1872 legal detection rules
const legalDetectionRules = {
  act_name: "Indian Contract Act, 1872",
  year: 1872,
  rules: [
    {
      section: "Section 2",
      title: "Interpretation Clause",
      keywords: ["proposal", "offer", "acceptance", "promise", "consideration", "agreement", "contract", "void", "voidable"],
      explanation: "This section defines key terms used throughout the Act. A 'proposal' is when someone shows willingness to do or not do something to get another's agreement. When someone accepts a proposal, it becomes a 'promise'. Every promise forming consideration for each other is an 'agreement'. An agreement enforceable by law is a 'contract'.",
      issues: [
        { issue_type: "Invalid Offer/Acceptance", risk: "Invalid contract formation", severity: "High", remedy: "Ensure proper offer and acceptance as per Sections 3-9" }
      ],
      example: "If you say 'I will sell my bike for Rs. 10,000' - that's a proposal. When someone says 'I accept', it becomes a promise and then an agreement."
    },
    {
      section: "Section 10",
      title: "What Agreements are Contracts",
      keywords: ["free consent", "competent to contract", "lawful consideration", "lawful object", "expressly declared void"],
      explanation: "For an agreement to be a valid contract, it must have: (1) Free consent of parties, (2) Parties competent to contract, (3) Lawful consideration, (4) Lawful object, and (5) Not be expressly declared void. Missing any element makes the contract invalid.",
      issues: [
        { issue_type: "Invalid Contract Formation", risk: "Contract may be void or voidable", severity: "High", remedy: "Ensure all elements of valid contract are present" }
      ],
      example: "A contract to sell illegal drugs fails because the object is unlawful, even if both parties agree."
    },
    {
      section: "Section 11",
      title: "Who are Competent to Contract",
      keywords: ["age of majority", "sound mind", "disqualified from contracting"],
      explanation: "Only persons who are (1) of the age of majority (18 years), (2) of sound mind, and (3) not disqualified by law can make contracts. Contracts with minors are void from the beginning (void ab initio).",
      issues: [
        { issue_type: "Incompetent Party", risk: "Contract is void", severity: "High", remedy: "Verify age and mental capacity of all parties" }
      ],
      example: "A 16-year-old cannot sign a valid employment contract in India. Any such contract is void and cannot be enforced against the minor."
    },
    {
      section: "Section 12",
      title: "Sound Mind for Contracting",
      keywords: ["sound mind", "understanding", "rational judgment"],
      explanation: "A person is of sound mind if they can understand the contract and form a rational judgment about its effect on their interests. A person who is usually of unsound mind but occasionally of sound mind can contract during lucid intervals.",
      issues: [
        { issue_type: "Mental Incapacity", risk: "Contract is voidable", severity: "Medium", remedy: "Ensure parties have sound mind at time of contracting" }
      ],
      example: "A person who is drunk at the time of signing a contract may later void it if they can prove they didn't understand what they were signing."
    },
    {
      section: "Section 13-15",
      title: "Consent and Coercion",
      keywords: ["consent", "free consent", "coercion", "threatening", "forbidden act", "unlawful detaining"],
      explanation: "Coercion is committing or threatening to commit any act forbidden by Indian Penal Code, or unlawfully detaining or threatening to detain property, to cause someone to enter an agreement. Consent obtained by coercion is not free consent.",
      issues: [
        { issue_type: "Coercion", risk: "Contract is voidable at option of coerced party", severity: "High", remedy: "Ensure consent is free from coercion" }
      ],
      example: "If someone threatens to harm your family unless you sign a contract, that contract is voidable because your consent was obtained by coercion."
    },
    {
      section: "Section 16",
      title: "Undue Influence",
      keywords: ["undue influence", "dominate will", "unfair advantage", "fiduciary relation", "unconscionable"],
      explanation: "Undue influence exists when one party can dominate the will of another and uses that position to obtain an unfair advantage. This commonly occurs in relationships of trust like doctor-patient, lawyer-client, parent-child, or employer-employee.",
      issues: [
        { issue_type: "Undue Influence", risk: "Contract is voidable", severity: "High", remedy: "Ensure independent advice for vulnerable parties" }
      ],
      example: "An elderly person's caretaker convincing them to sign over property at far below market value could be undue influence."
    },
    {
      section: "Section 17",
      title: "Fraud",
      keywords: ["fraud", "deceive", "false statement", "concealment", "misrepresentation"],
      explanation: "Fraud includes: (1) False statement made knowingly, (2) Active concealment of facts, (3) Promise made without intention to perform, (4) Any deceptive act, (5) Any act declared fraudulent by law. The intention to deceive is essential.",
      issues: [
        { issue_type: "Fraud", risk: "Contract is voidable and damages may be claimed", severity: "High", remedy: "Full disclosure of all material facts" }
      ],
      example: "A car seller who hides that the car was in a major accident and sells it as 'accident-free' commits fraud."
    },
    {
      section: "Section 18",
      title: "Misrepresentation",
      keywords: ["misrepresentation", "positive assertion", "breach of duty", "causing mistake"],
      explanation: "Misrepresentation is an innocent incorrect statement of material fact that induces consent. Unlike fraud, there's no intention to deceive - the person making the statement believes it to be true.",
      issues: [
        { issue_type: "Misrepresentation", risk: "Contract is voidable", severity: "Medium", remedy: "Ensure all representations are accurate" }
      ],
      example: "A seller genuinely believes a painting is from the 18th century and says so, but it's actually a 20th-century copy. This is misrepresentation, not fraud."
    },
    {
      section: "Section 19",
      title: "Voidability of Agreements Without Free Consent",
      keywords: ["voidable", "coercion", "fraud", "misrepresentation", "means of discovering truth"],
      explanation: "When consent is caused by coercion, fraud, or misrepresentation, the contract is voidable at the option of the party whose consent was not free. They can choose to affirm or avoid the contract.",
      issues: [
        { issue_type: "Voidable Contract", risk: "Contract can be set aside", severity: "High", remedy: "Avoid practices that vitiate free consent" }
      ],
      example: "If you were misled into buying a property, you can choose to either cancel the deal or continue with it knowing the true facts."
    },
    {
      section: "Section 20",
      title: "Mistake of Fact",
      keywords: ["mutual mistake", "both parties mistaken", "essential fact", "common error"],
      explanation: "When both parties to an agreement are under a mistake about a fact essential to the agreement, the agreement is void. The mistake must be mutual and about something fundamental to the contract.",
      issues: [
        { issue_type: "Mutual Mistake", risk: "Contract is void", severity: "High", remedy: "Due diligence on essential facts before contracting" }
      ],
      example: "Both buyer and seller agree to sell a horse, not knowing the horse had already died. The contract is void due to mutual mistake."
    },
    {
      section: "Section 23",
      title: "Unlawful Consideration and Object",
      keywords: ["unlawful consideration", "unlawful object", "forbidden by law", "defeat provisions of law", "fraudulent", "injury to person", "immoral", "opposed to public policy"],
      explanation: "Consideration or object is unlawful if it: (1) Is forbidden by law, (2) Defeats any law's provisions, (3) Is fraudulent, (4) Involves injury to person or property, (5) Is immoral, or (6) Is opposed to public policy.",
      issues: [
        { issue_type: "Unlawful Consideration/Object", risk: "Contract is void", severity: "High", remedy: "Ensure purpose and consideration are lawful" }
      ],
      example: "A contract to bribe a government official is void because bribery is forbidden by law."
    },
    {
      section: "Section 25",
      title: "Agreements Without Consideration",
      keywords: ["without consideration", "natural love and affection", "written and registered", "compensate", "voluntarily done", "time barred debt"],
      explanation: "Generally, agreements without consideration are void. Exceptions: (1) Written promise to close relative from natural love and affection, (2) Promise to compensate for past voluntary service, (3) Written promise to pay a time-barred debt.",
      issues: [
        { issue_type: "Lack of Consideration", risk: "Agreement is void unless exceptions apply", severity: "Medium", remedy: "Include valid consideration or meet exception criteria" }
      ],
      example: "A father's written promise to gift his daughter Rs. 5 lakhs out of love is valid even without consideration."
    },
    {
      section: "Section 26",
      title: "Restraint of Marriage",
      keywords: ["restraint of marriage", "cannot marry", "prevent marriage"],
      explanation: "Every agreement in restraint of marriage of any person (other than a minor) is void. Any clause that prevents or restricts a person from getting married is unenforceable.",
      issues: [
        { issue_type: "Restraint of Marriage", risk: "Agreement is void", severity: "High", remedy: "Avoid any restrictions on marriage" }
      ],
      example: "An employment contract stating 'employee shall not marry for 5 years' is void to that extent."
    },
    {
      section: "Section 27",
      title: "Restraint of Trade",
      keywords: ["restraint of trade", "non-compete", "cannot compete", "restricted from business", "similar business", "profession", "trade"],
      explanation: "Every agreement that restrains anyone from exercising a lawful profession, trade, or business is void. The only exception is when selling a business's goodwill, the seller can agree not to carry on similar business within reasonable limits.",
      issues: [
        { issue_type: "Restraint of Trade", risk: "Restraint is void", severity: "High", remedy: "Limited exceptions for sale of goodwill with reasonable limits" }
      ],
      example: "A non-compete clause preventing an employee from ever working in the same industry anywhere in India is void and unenforceable."
    },
    {
      section: "Section 28",
      title: "Restraint of Legal Proceedings",
      keywords: ["restraint of legal proceedings", "cannot sue", "limited time to sue", "extinguishes rights", "time limit for enforcement"],
      explanation: "Agreements that restrict parties from enforcing their legal rights or limit the time for enforcement are void. Exceptions exist for arbitration agreements and certain bank guarantees.",
      issues: [
        { issue_type: "Restraint of Legal Proceedings", risk: "Clause is void", severity: "High", remedy: "Exceptions for arbitration agreements and bank guarantees" }
      ],
      example: "A clause saying 'buyer cannot sue seller under any circumstances' is void and unenforceable."
    },
    {
      section: "Section 29",
      title: "Uncertain Agreements",
      keywords: ["uncertain", "not certain", "incapable of being made certain", "ambiguous", "vague"],
      explanation: "Agreements where the meaning is not certain, or capable of being made certain, are void. The terms must be clear enough that parties and courts can understand what was agreed.",
      issues: [
        { issue_type: "Uncertain Agreement", risk: "Agreement is void", severity: "Medium", remedy: "Make terms definite and capable of being made certain" }
      ],
      example: "An agreement to sell 'some goods' without specifying what goods is void for uncertainty."
    },
    {
      section: "Section 56",
      title: "Impossibility of Performance",
      keywords: ["impossible act", "become impossible", "unlawful", "supervening impossibility"],
      explanation: "An agreement to do an impossible act is void. If an act becomes impossible or unlawful after the contract is made due to circumstances beyond control, the contract becomes void (doctrine of frustration).",
      issues: [
        { issue_type: "Impossibility of Performance", risk: "Contract becomes void", severity: "Medium", remedy: "Include force majeure clauses" }
      ],
      example: "A contract to perform at a venue that is destroyed by earthquake becomes void due to impossibility."
    },
    {
      section: "Section 73",
      title: "Compensation for Breach",
      keywords: ["compensation for breach", "damages", "loss or damage", "natural consequences", "remote damage"],
      explanation: "When a contract is breached, the injured party is entitled to compensation for any loss or damage that naturally arose from the breach, or which the parties knew could result from the breach. Remote or indirect damages are generally not recoverable.",
      issues: [
        { issue_type: "Breach of Contract Damages", risk: "Liability for natural and foreseeable losses", severity: "Medium", remedy: "Limit liability for indirect/consequential damages" }
      ],
      example: "If a supplier fails to deliver materials, causing factory shutdown, the buyer can claim compensation for losses that naturally follow."
    },
    {
      section: "Section 74",
      title: "Penalty and Liquidated Damages",
      keywords: ["penalty", "liquidated damages", "stipulated sum", "reasonable compensation"],
      explanation: "When a contract specifies a sum to be paid for breach (liquidated damages), the court will award only reasonable compensation, not exceeding the stipulated amount. Courts distinguish between genuine pre-estimates of damage and penalties meant to frighten.",
      issues: [
        { issue_type: "Penalty Clauses", risk: "Only reasonable compensation enforceable, not penalty", severity: "Medium", remedy: "Ensure stipulated sum represents genuine pre-estimate of damage" }
      ],
      example: "A clause requiring Rs. 10 lakhs penalty for a Rs. 1 lakh contract breach may be reduced by court to actual damages."
    },
    {
      section: "Section 124-147",
      title: "Indemnity and Guarantee",
      keywords: ["indemnity", "guarantee", "surety", "principal debtor", "creditor", "co-surety"],
      explanation: "Indemnity is a promise to save someone from loss. Guarantee involves three parties: principal debtor, creditor, and surety. The surety's liability is secondary to the principal debtor. Surety is discharged if creditor makes material changes without consent.",
      issues: [
        { issue_type: "Surety Discharge Issues", risk: "Surety may be discharged from liability", severity: "High", remedy: "Obtain surety's consent for material changes" }
      ],
      example: "If a bank extends the loan repayment period without the guarantor's consent, the guarantor may be discharged from liability."
    },
    {
      section: "Section 182",
      title: "Agent and Principal",
      keywords: ["agent", "principal", "authority", "employ", "represent"],
      explanation: "An 'agent' is a person employed to do any act for another or to represent another in dealings with third persons. The person for whom such act is done is the 'principal'. The relationship is based on authority, not on payment.",
      issues: [
        { issue_type: "Agency Definition", risk: "Unclear agency relationship", severity: "Medium", remedy: "Clearly establish and document agency relationship" }
      ],
      example: "A real estate broker showing properties on behalf of a seller is an agent, and the seller is the principal."
    },
    {
      section: "Section 182-238",
      title: "Agency Law",
      keywords: ["agency", "agent", "principal", "authority", "ratification", "undisclosed principal"],
      explanation: "Agency law governs the relationship between principals and agents. Key concepts include: express and implied authority, agent's duties, principal's liability for agent's acts, ratification of unauthorized acts, and rights of third parties dealing with agents.",
      issues: [
        { issue_type: "Agency Issues", risk: "Principal may not be bound, agent may be personally liable", severity: "Medium", remedy: "Clear scope of authority and disclosure of agency" }
      ],
      example: "If an employee signs a contract beyond their authority without the company's knowledge, the company may not be bound unless it ratifies the contract."
    }
  ],
  severity_levels: {
    High: "May render contract void or voidable, significant legal consequences",
    Medium: "May affect enforceability of specific clauses or lead to damages",
    Low: "Procedural or administrative issues"
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "recommendation") {
      // Generate 2-line recommendation
      const { risk_score, high_count, medium_count, sections_list } = data;
      
      systemPrompt = `You are an AI legal assistant for Indian freelancers and startups. You provide balanced, cautious advice without giving legal advice. Keep responses to EXACTLY 2 lines.`;
      
      userPrompt = `Based ONLY on the following analysis:
- Overall Risk Score: ${risk_score} / 100
- Number of HIGH risk clauses: ${high_count}
- Number of MEDIUM risk clauses: ${medium_count}
- Relevant Indian Contract Act sections involved: ${sections_list}

Generate a 2-line recommendation answering: "Should the user sign this contract?"

Rules:
- Use simple, non-technical language
- Do NOT give legal advice
- Be cautious and balanced
- Mention negotiation if risk is medium or high
- Keep it strictly to 2 lines`;

    } else if (type === "summary") {
      // Generate contract summary
      const { contract_text, detected_sections_with_risks } = data;
      
      systemPrompt = `You are an AI legal assistant specializing in Indian contract law. You explain complex contracts in simple terms for non-lawyers.`;
      
      userPrompt = `Given the following contract text:
"""
${contract_text}
"""

And detected risks under the Indian Contract Act, 1872:
${detected_sections_with_risks}

Task: Create a simple summary of the contract in plain English.

Rules:
- Use short paragraphs or bullet points
- Avoid legal jargon
- Explain:
  - What the contract is about
  - What the user must do
  - What the company/client controls
  - Major risks or unfair points
- Do NOT cite sections here
- Write for a non-lawyer freelancer

Length: 5–8 bullet points OR 1 short paragraph (max 150 words)`;

    } else if (type === "chat") {
      // Legal explainer chatbot
      const { user_input, conversation_history = [], detected_issues = [] } = data;
      
      // Build comprehensive legal reference from the rules
      const legalReference = legalDetectionRules.rules.map(rule => 
        `**${rule.section} - ${rule.title}**\n${rule.explanation}\nExample: ${rule.example}\nRisk: ${rule.issues.map(i => `${i.issue_type} (${i.severity}): ${i.risk}`).join('; ')}`
      ).join('\n\n');

      // Include context from detected issues if available
      const issuesContext = detected_issues.length > 0 
        ? `\n\nDetected issues in the current contract:\n${detected_issues.map((i: any) => `- ${i.law_cited}: ${i.explanation}`).join('\n')}`
        : '';
      
      systemPrompt = `You are an Indian legal explainer for the Indian Contract Act, 1872.

RULES:
- ONLY use Indian Contract Act, 1872
- NO foreign law
- NO legal advice
- NEVER mention you are an AI
- Keep explanations simple and educational
- Give real-world examples

When explaining a section:
1. State the section name and title
2. Explain in plain English
3. Common risks
4. Real-world example
5. What to be careful about

Legal Reference:
${legalReference}
${issuesContext}

If section not found, politely say it's not covered.`;

      userPrompt = user_input;

      // Build messages with conversation history
      const messages = [
        { role: "system", content: systemPrompt },
        ...conversation_history,
        { role: "user", content: userPrompt }
      ];

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages,
          stream: false,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        throw new Error("AI gateway error");
      }

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content || "I couldn't generate a response.";

      return new Response(JSON.stringify({ response: content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      throw new Error("Invalid request type");
    }

    // For recommendation and summary types
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "I couldn't generate a response.";

    return new Response(JSON.stringify({ response: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Legal assistant error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
