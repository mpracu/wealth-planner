# Wealth Planner — Product Brief for GTM Brainstorming

> **How to use this document**: Feed it to a Claude project as context. Ask Claude to help brainstorm positioning, pricing, go-to-market strategy, target audience, monetisation, and growth — not code. Treat Claude as a strategic co-founder who knows the product well.

---

## What This Product Is

**Wealth Planner** is a personal finance web app that helps individuals track, understand, and grow their net worth. It is live at [https://d2787qonhlkw2.cloudfront.net/](https://d2787qonhlkw2.cloudfront.net/).

It sits at the intersection of **portfolio tracker** and **wealth simulator** — a combination that currently has no dominant, clean, affordable solution for the European retail investor.

The product is built, deployed, and working. It is not a mockup or prototype. It is currently free and does not yet charge users.

---

## Core Features (What Users Can Do Today)

### 1. Net Worth Dashboard
- Add any asset or liability (cash, property, pension, mortgage, etc.)
- Tag holdings by category (Stocks, Real Estate, Bonds, etc.)
- Track investments by **ISIN** (the international security identifier used in Europe) — e.g. `IE00BYX5MX67` for the Fidelity S&P 500 index fund
- Enter the number of shares/units held
- Hit **Refresh Prices** to pull live prices from Yahoo Finance — the app automatically recalculates the value of each holding (shares × live price)
- See a portfolio breakdown with allocation bars per category
- Export/import data via CSV
- Multi-currency: EUR, USD, GBP

### 2. Wealth Simulator
- Interactive sliders and inputs for: starting capital, monthly investment, annual return, inflation, and a financial goal
- Projects wealth 50 years forward with compound interest
- Shows both nominal and inflation-adjusted (real) values on a chart
- Users can save and compare multiple "scenarios" (e.g. "aggressive" vs "conservative" investment plan)
- Tells you at exactly what age you hit your financial goal

### 3. Recurring Investment Tracker (DCA)
- Set up monthly contributions to any holding
- Link the contribution to an existing asset by name
- When the monthly processor runs, the value of that holding is increased and new shares are calculated proportionally to the current price
- Shows total monthly DCA amount

### 4. History & Forecasting
- Net worth snapshots are saved daily
- Chart shows net worth over time
- Forecast module projects future net worth based on current holdings + recurring contributions + user-defined return/inflation assumptions

### 5. Investment Blog
- AI-generated blog posts about index fund investing, ETFs, long-term wealth building
- Publicly accessible (no login required)
- Refreshed every 2 days automatically

---

## Technology (High-Level, Non-Technical Summary)

- Fully serverless — no servers to manage, no infrastructure overhead
- Hosted on AWS — data is secure, fast, globally distributed
- User authentication with email/password (no Google/social sign-in yet)
- Data is private and per-user — no one else can see your net worth
- Mobile-responsive design

---

## What Makes It Different

### vs. spreadsheets
Most European retail investors track their portfolio in Excel or Google Sheets. This is painful, error-prone, and has no live pricing. Wealth Planner replaces the spreadsheet with something that auto-updates and visualises better.

### vs. Mint / YNAB / Emma
These are **budgeting** apps focused on cash flow and spending. Wealth Planner is about **wealth accumulation** — net worth, investments, and long-term growth. Different job to be done.

### vs. Wealthfront / Betterment / Nutmeg
These are **robo-advisors** — they manage your money for you and charge AUM fees. Wealth Planner does not touch your money. It just helps you understand and plan it. No regulatory headaches, no custody requirements.

### vs. Sharesight / Portfoliovisualizer / Morningstar
These are more powerful but also more complex and expensive. They target sophisticated investors or financial professionals. Wealth Planner targets the **mass-market European retail investor** — someone who has started investing in index funds and ETFs and wants a simple, beautiful tool to track everything in one place.

### vs. nothing
Many users — especially in their 20s and 30s — have never had a structured view of their net worth. The product creates a new habit: checking and growing your net worth like you check your bank account.

---

## Target User Hypotheses (To Be Validated)

These are hypotheses, not confirmed facts. Good starting point for discussion.

**Primary**: European young professional, 25–40 years old, who:
- Has started investing in index funds or ETFs (likely through platforms like Degiro, Trading 212, Interactive Brokers, or Scalable Capital)
- Earns a salary and saves a portion monthly ("DIY investor")
- Understands ISIN codes (common in Europe — unlike US ticker symbols)
- Wants to know "am I on track to be financially independent?"
- Does not have a financial advisor
- Is not a trader — they are a long-term, passive investor

**Secondary**: Personal finance content creators who want to show their audience a tool and share scenarios.

**Tertiary**: People preparing for a big life event (buying a house, having kids, early retirement) who want to model "what if" scenarios.

---

## Pricing — Nothing Decided Yet

The product is currently 100% free. No paywall, no trial, no card required.

**Questions to explore:**
- What is the right business model? Freemium? Flat subscription? One-time purchase?
- What features belong in a free tier vs paid?
- What price point is defensible for this audience? (€5/mo? €10/mo? €50/year?)
- Is there a B2B angle — could financial advisors or fintechs white-label this?

---

## Distribution — Nothing Decided Yet

The product has no active marketing. It is live and accessible but undiscovered.

**Channels to explore:**
- Personal finance communities (Reddit: r/EuropeFIRE, r/BogleheadsEurope, r/personalfinance_de, etc.)
- YouTube / TikTok creators in the "personal finance" or "FIRE" niche
- SEO targeting "net worth tracker Europe", "ISIN portfolio tracker", "wealth simulator"
- Product Hunt launch
- Newsletter partnerships with European personal finance newsletters
- Comparisons / reviews in "tools for index fund investors" articles

---

## Key Strategic Questions for Brainstorming

Use these as conversation starters with Claude:

1. **Positioning**: What is the single most compelling one-liner for this product? Who exactly is the hero customer?

2. **Pricing**: What model fits best — monthly subscription, annual plan, freemium with feature gates, or pay-once? What should be free vs paid?

3. **First 100 users**: What is the most direct path to 100 paying users without paid advertising?

4. **FIRE / index investor niche**: The "FIRE" (Financial Independence, Retire Early) community is vocal and engaged. Is this the right beachhead? What are their exact pain points?

5. **European specificity**: The ISIN support is a genuine differentiator — most US tools don't understand European securities. How aggressively should we lean into "built for Europe"?

6. **Trust and data privacy**: People are nervous about entering their real financial data online. How do we build trust? What does the privacy story look like?

7. **Content as distribution**: The blog is AI-generated. Could content (SEO articles about index investing, net worth tracking, etc.) be a major organic growth channel?

8. **Feature gaps**: What is missing that paying users would expect? (Tax reporting? Broker integrations? Mobile app? Two-factor auth? Google sign-in?)

9. **Competitive moat**: The core features could be copied. What makes this hard to replicate at scale?

10. **Business model alternatives**: Is there a path to monetising without charging users directly — e.g. affiliate commissions with brokers like Degiro, or partnerships with ETF providers?

---

## Constraints and Context

- **Solo founder / small team**: This has been built by one person. GTM strategy must be lean and executable without a large team or big marketing budget.
- **European context**: Default currency is EUR, formatting is European (es-ES locale), ISIN codes are first-class. The product has a natural home in Europe.
- **No regulatory complexity yet**: The app gives no investment advice. It is a tracker and simulator. This matters for avoiding FCA/ESMA regulatory obligations.
- **Infrastructure cost is near-zero**: Serverless AWS means the cost of serving more users is very low until significant scale.

---

## Tone and Brand (Early Thinking)

The product should feel:
- **Clean and premium** — not another fintech startup with a neon green logo
- **Calm and confident** — money is stressful; the product should feel reassuring
- **Smart but not arrogant** — for the curious, thoughtful investor, not the Wall Street type
- **European** — understated, data-driven, long-term oriented (not get-rich-quick)

Name options are open — "Wealth Planner" is a working title.

---

## What Claude Should Help With

In this project, Claude's job is **not** to write code. The goal is to think through:

- Go-to-market strategy
- Pricing and packaging
- Positioning and messaging
- Target customer definition
- Growth channels
- Competitive differentiation
- Feature prioritisation from a business (not technical) perspective
- Naming and branding
- Partnership or distribution ideas

Push back, challenge assumptions, suggest frameworks (Jobs to Be Done, Crossing the Chasm, etc.), and help stress-test ideas. Be direct — this is early stage and honest feedback is more useful than validation.
