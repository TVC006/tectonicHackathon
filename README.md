# KBC SHIFT

> From personalized banking to situational banking.

Hackathon proof of concept for KBC: a **situational personalization engine** that detects meaningful life changes from customer signals, asks for confirmation, and temporarily reorganises existing banking capabilities around the current situation.

Moving Mode (Emma) is the hero **example**. The product story is the **engine**.

---

## Concept

```
Signals
  → Situation hypothesis
  → Customer confirmation
  → Is action useful?
       ├─ Yes → Capability selection → Temporary experience
       └─ No  → Quiet Mode
```

- **Signals** form a pattern (not a single transaction).
- **Hypothesis, not certainty** — the customer remains the source of truth.
- **Capabilities** come from a reusable library across domains (payments, cash, home, services, cards, …).
- **Experiences are temporary** — not a permanently personalised dashboard.
- **Quiet** is a valid engine outcome: knowing when not to act.

Scale idea for 2.3M+ customers:

**One engine · One capability library · Many situations · Different temporary experiences**

---

## Run

Requires [Node.js](https://nodejs.org/) (no `npm install`).

```bash
node server.js
```

Open [http://localhost:3000](http://localhost:3000).

- Offline-friendly hero demo (local vendor React + deterministic data)
- No env vars, backend, database, or API

---

## 60–90 second jury demo

1. **Emma — normal banking**  
   Rental deposit, IKEA, Brico, Cambio tagged as related signals.  
   **Situation signal:** “Something seems to be changing.” → **See what we noticed**

2. **Pattern → Moving · 91%**  
   Four signals become a situation hypothesis.

3. **Confirm** — “Are you moving?”  
   - **Yes** → capability selection from the library  
   - **Not really** → **Quiet Mode** (engine stays quiet)

4. **Moving Mode** (temporary)  
   Existing capabilities selected: Standing orders · Cashflow · Home setup · Moving day  
   - **Review standing order** → **Pause payment**  
   - **Continue setup** → address updated  
   - Exit → normal banking; completed actions remain

5. **Scale strip** (no second full demo required)  
   - Emma → Moving  
   - Noah → First job (supporting example)  
   - Quiet → no useful action  
   Optional: **Explore Noah** for a short First Job path

Demo controls (bottom-right): **Reset demo** · **Skip to Moving Mode** · **Explore Noah**

---

## Project structure

```
kbc-shift/
├── index.html                 # Shell + script load order
├── server.js                  # Static file server (port 3000)
├── css/styles.css             # Design tokens + UI
├── js/
│   ├── app.js                 # React UI (createElement) + state machine
│   └── lib/
│       ├── demo-data.js       # Emma / Noah demo data
│       ├── situation-engine.js# Situations + capability library + analyze*
│       └── types.js           # Demo type notes
└── vendor/                    # React 18 UMD bundles (local)
```

---

## Stack

| Layer        | Choice                                      |
| ------------ | ------------------------------------------- |
| UI           | React 18 (`createElement`, no JSX)          |
| Styling      | Vanilla CSS                                 |
| Logic        | Deterministic JS situation engine           |
| Data         | Local demo data                             |
| Server       | `node server.js`                            |

**Out of scope for this PoC:** TypeScript, Tailwind, Framer Motion, npm runtime deps, backend, LLM, auth, real APIs.

---

## What this answers (KBC challenge)

| Challenge theme                         | How SHIFT shows it                                      |
| --------------------------------------- | ------------------------------------------------------- |
| Understand needs from signals           | Multi-signal pattern → situation hypothesis             |
| Situation / behaviour / intent          | Moving, First job (+ Quiet when not useful)             |
| Personalised, adapted experience        | Temporary mode after confirmation                       |
| Across products / services              | Capabilities from different domains, one selection step |
| Scale to millions of customers          | One engine + reusable library + recombination           |
| PoC of a new approach, not a loose feature | Engine-first story; Moving is one output             |

---

## Notes

- Reset clears demo state (including paused rent / address).
- Exit Moving Mode ends the temporary experience but keeps completed actions until Reset.
- This is a **demo**, not production banking software.
