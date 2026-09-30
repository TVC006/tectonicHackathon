const { useState, useEffect, useCallback } = React;
const e = React.createElement;

function formatEUR(n) {
  const abs = Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return (n < 0 ? "−" : "") + "€" + abs;
}

function formatBalance(n) {
  return (
    "€" +
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function capabilityLabel(id) {
  const cap =
    (typeof window !== "undefined" && window.getCapability && window.getCapability(id)) ||
    null;
  return cap ? cap.label : id;
}

function capabilityDomain(id) {
  const cap =
    (typeof window !== "undefined" && window.getCapability && window.getCapability(id)) ||
    null;
  return cap && cap.domain ? cap.domain : "";
}

/* ── Engine progress rail ── */
function EngineRail({ activeStep, situationTitle }) {
  const steps = [
    { id: "signals", label: "Signals" },
    { id: "situation", label: situationTitle || "Situation" },
    { id: "capabilities", label: "Capabilities" },
    { id: "experience", label: "Experience" },
  ];
  const order = ["signals", "situation", "capabilities", "experience"];
  const activeIdx = order.indexOf(activeStep);

  return e(
    "div",
    { className: "engine-rail", "aria-hidden": "true" },
    steps.map(function (step, i) {
      const done = activeIdx > i;
      const active = activeIdx === i;
      return e(
        React.Fragment,
        { key: step.id },
        e(
          "div",
          {
            className:
              "engine-rail-step" +
              (done ? " is-done" : "") +
              (active ? " is-active" : ""),
          },
          e("span", { className: "engine-rail-mark" }, done ? "✓" : i + 1),
          e("span", { className: "engine-rail-label" }, step.label)
        ),
        i < steps.length - 1 &&
          e("div", { className: "engine-rail-arrow" }, "→")
      );
    })
  );
}

/* ── Compact capability library ── */
function CapabilityLibraryStrip({ selectedIds }) {
  const selected = selectedIds || [];
  const library =
    (typeof window !== "undefined" &&
      window.listCapabilities &&
      window.listCapabilities()) ||
    [];

  return e(
    "div",
    { className: "cap-library" },
    e("div", { className: "cap-library-label" }, "Capability library"),
    e(
      "div",
      { className: "cap-library-grid" },
      library.map(function (cap) {
        const isSelected = selected.indexOf(cap.id) !== -1;
        return e(
          "div",
          {
            key: cap.id,
            className: "cap-chip" + (isSelected ? " is-selected" : ""),
          },
          e("span", { className: "cap-chip-domain" }, cap.domain),
          e("span", { className: "cap-chip-label" }, cap.label)
        );
      })
    )
  );
}

/* ── Header ── */
function BankingShell({ children, isMoving, customerName }) {
  return e(
    "div",
    { className: "app-shell" + (isMoving ? " is-moving" : "") },
    e(
      "header",
      { className: "topbar" },
      e(
        "div",
        { className: "topbar-inner" },
        e(
          "div",
          { className: "brand" },
          e("div", { className: "brand-mark" }, "KBC"),
          e("span", { className: "brand-name" }, "KBC")
        ),
        e(
          "nav",
          { className: "nav", "aria-label": "Primary" },
          ["Overview", "Payments", "Accounts", "Insurance", "Investments"].map(
            (item) =>
              e(
                "span",
                {
                  key: item,
                  className: "nav-item" + (item === "Overview" ? " active" : ""),
                },
                item
              )
          )
        ),
        e(
          "div",
          { className: "top-actions" },
          e("span", { className: "top-link" }, "Search"),
          e("span", { className: "top-link" }, "Help"),
          e("span", { className: "avatar" }, customerName || "Emma")
        )
      )
    ),
    children
  );
}

/* ── Trust Modal ── */
function TrustModal({ onClose, hypothesis }) {
  const signals =
    hypothesis && hypothesis.situation === "firstJob"
      ? ["First salary", "Subscriptions", "Card activity", "Savings"]
      : ["Rental deposit", "IKEA", "Brico", "Cambio"];
  const title = (hypothesis && hypothesis.title) || "Moving";

  return e(
    "div",
    { className: "modal-root", role: "dialog", "aria-modal": "true" },
    e("div", { className: "modal-dim", onClick: onClose }),
    e(
      "div",
      { className: "modal-panel modal-enter" },
      e("h2", { className: "modal-title" }, "Why am I seeing this?"),
      e(
        "p",
        { className: "signals-combine" },
        "No single signal is enough."
      ),
      e("div", { className: "modal-signals-label" }, "Signals used"),
      e(
        "ul",
        { className: "modal-signals" },
        signals.map((s) => e("li", { key: s }, s))
      ),
      e("div", { className: "signals-flow-arrow", "aria-hidden": "true" }, "↓"),
      e(
        "div",
        { className: "signals-result" },
        e("div", { className: "modal-signals-label" }, "Hypothesis"),
        e("div", { className: "signals-result-title" }, title)
      ),
      e(
        "p",
        { className: "modal-footer" },
        "Nothing changes until you confirm."
      ),
      e(
        "button",
        { className: "btn-yes", type: "button", onClick: onClose },
        "Got it"
      )
    )
  );
}

/* ── Signals Modal ── */
function SignalsModal({ hypothesis, onClose }) {
  const isFirstJob = hypothesis && hypothesis.situation === "firstJob";
  const details = isFirstJob
    ? [
        ["First salary", "Income"],
        ["Subscriptions", "Recurring"],
        ["Card activity", "Cards"],
        ["Savings transfer", "Savings"],
      ]
    : [
        ["Rental deposit", "Housing"],
        ["IKEA", "Home"],
        ["Brico", "Home improvement"],
        ["Cambio", "Mobility"],
      ];
  const modeTitle = (hypothesis && hypothesis.modeLabel) || "Moving Mode";

  return e(
    "div",
    { className: "modal-root", role: "dialog", "aria-modal": "true" },
    e("div", { className: "modal-dim", onClick: onClose }),
    e(
      "div",
      { className: "modal-panel modal-enter" },
      e("h2", { className: "modal-title" }, "Why " + modeTitle + "?"),
      e(
        "p",
        { className: "modal-text" },
        "These were the signals behind the situation we detected."
      ),
      e(
        "ul",
        { className: "signals-detail-list" },
        details.map(([title, detail]) =>
          e(
            "li",
            { key: title },
            e("span", { className: "evidence-check" }, "✓"),
            e(
              "div",
              null,
              e("div", { className: "signals-detail-title" }, title),
              e("div", { className: "signals-detail-sub" }, detail)
            )
          )
        )
      ),
      e(
        "p",
        { className: "signals-combine" },
        "No single signal is enough. Together they form a pattern."
      ),
      e("div", { className: "signals-flow-arrow", "aria-hidden": "true" }, "↓"),
      e(
        "div",
        { className: "signals-result" },
        e("div", { className: "modal-signals-label" }, "Hypothesis"),
        e("div", { className: "signals-result-title" }, hypothesis?.title || "Moving"),
        e(
          "div",
          { className: "signals-result-conf" },
          Math.round((hypothesis?.confidence || 0.91) * 100) +
            "% confidence before confirmation"
        )
      ),
      e("p", { className: "modal-footer" }, "You confirmed this situation."),
      e(
        "button",
        { className: "btn-yes", type: "button", onClick: onClose },
        "Close"
      )
    )
  );
}

/* ── Signal Analysis ── */
function SignalAnalysis({ signals, hypothesis }) {
  const title = (hypothesis && hypothesis.title) || "Moving";
  const conf = Math.round(((hypothesis && hypothesis.confidence) || 0.91) * 100);

  return e(
    "div",
    { className: "analysis-panel" },
    e(EngineRail, { activeStep: "signals", situationTitle: title }),
    e("div", { className: "analysis-label" }, "Pattern detected"),
    e(
      "p",
      { className: "analysis-sub" },
      "Evidence is being combined into a situation hypothesis."
    ),
    e(
      "div",
      { className: "signal-grid" },
      signals.map((s) =>
        e(
          "div",
          { className: "signal-row", key: s.id },
          e("div", { className: "signal-from" }, s.from),
          e("div", { className: "signal-arrow" }, "→"),
          e("div", { className: "signal-to" }, s.to)
        )
      )
    ),
    e(
      "div",
      { className: "converge" },
      e(
        "div",
        { className: "converge-meta" },
        "4 signals → pattern → " + title
      ),
      e("div", { className: "converge-eyebrow" }, "Hypothesis"),
      e("h2", { className: "converge-title" }, title),
      e("div", { className: "converge-conf" }, conf + "% confidence")
    )
  );
}

/* ── Confirmation ── */
function SituationConfirmation({ hypothesis, onYes, onNo, onWhy }) {
  return e(
    "div",
    { className: "hypothesis-card" },
    e(EngineRail, {
      activeStep: "situation",
      situationTitle: hypothesis.title,
    }),
    e("div", { className: "hypothesis-eyebrow" }, "Hypothesis — not certainty"),
    e("h3", { className: "hypothesis-question" }, hypothesis.question),
    e(
      "p",
      { className: "hypothesis-body" },
      "A pattern of signals suggests this. You remain the source of truth."
    ),
    e(
      "ul",
      { className: "evidence-list" },
      hypothesis.signals.map((s) =>
        e("li", { key: s }, e("span", { className: "evidence-check" }, "✓"), s)
      )
    ),
    e(
      "div",
      { className: "btn-stack" },
      e("button", { className: "btn-yes", type: "button", onClick: onYes }, "Yes, that's right"),
      e("button", { className: "btn-no", type: "button", onClick: onNo }, "Not really"),
      e(
        "button",
        { className: "btn-why", type: "button", onClick: onWhy },
        "Why am I seeing this?"
      )
    )
  );
}

/* ── Capability Compiler ── */
function CapabilityCompiler({ hypothesis }) {
  const caps =
    (hypothesis && hypothesis.capabilities) ||
    ["standing-orders", "cashflow", "home-setup", "moving-day"];
  const title = (hypothesis && hypothesis.title) || "Moving";

  return e(
    "div",
    { className: "compiler-panel compiler-enter" },
    e(EngineRail, { activeStep: "capabilities", situationTitle: title }),
    e("div", { className: "compiler-eyebrow" }, "KBC SHIFT"),
    e("div", { className: "compiler-confirmed" }, "Situation confirmed"),
    e("h2", { className: "compiler-title" }, title),
    e(
      "p",
      { className: "compiler-body" },
      "Not a new product — selecting existing trusted capabilities."
    ),
    e(
      "div",
      { className: "shift-chain shift-chain-vertical", "aria-hidden": "true" },
      [
        ["4", "signals"],
        ["1", "situation"],
        ["4", "capabilities"],
        ["1", "experience"],
      ].map(function (pair, i, arr) {
        return e(
          React.Fragment,
          { key: pair[1] },
          e(
            "div",
            {
              className:
                "shift-chain-node" +
                (pair[1] === "situation" || pair[1] === "experience"
                  ? " is-emphasis"
                  : ""),
            },
            e("span", { className: "shift-chain-num" }, pair[0]),
            e("span", { className: "shift-chain-label" }, pair[1])
          ),
          i < arr.length - 1 &&
            e("div", { className: "shift-chain-arrow" }, "↓")
        );
      })
    ),
    e(CapabilityLibraryStrip, { selectedIds: caps }),
    e(
      "div",
      { className: "compiler-selecting" },
      "Selected for " + title
    ),
    e(
      "div",
      { className: "compiler-spine" },
      e(
        "ul",
        { className: "compiler-list" },
        caps.map(function (id, i) {
          return e(
            "li",
            {
              key: id,
              className: "compiler-item",
              style: { animationDelay: 1.1 + i * 0.2 + "s" },
            },
            e("span", { className: "evidence-check" }, "✓"),
            e(
              "div",
              { className: "compiler-item-meta" },
              e("span", { className: "compiler-item-domain" }, capabilityDomain(id)),
              e("span", { className: "compiler-item-label" }, capabilityLabel(id))
            )
          );
        })
      )
    ),
    e("div", { className: "compiler-ready" }, "Temporary experience ready")
  );
}

/* ── Exit notice ── */
function ExitNotice() {
  return e(
    "div",
    { className: "exit-panel modal-enter" },
    e("h2", { className: "exit-title" }, "Temporary experience ended"),
    e("p", { className: "exit-body" }, "Your regular banking experience is back."),
    e(
      "p",
      { className: "exit-body soft" },
      "Actions you completed stay completed."
    )
  );
}

/* ── Quiet Mode ── */
function QuietMode({ onBack }) {
  return e(
    "div",
    { className: "quiet-panel quiet-mode-enter" },
    e("div", { className: "quiet-eyebrow" }, "Quiet Mode · Engine decision"),
    e(
      "p",
      { className: "quiet-principle" },
      "Knowing when not to act is part of situational banking."
    ),
    e(
      "div",
      { className: "quiet-branch", "aria-hidden": "true" },
      e("div", { className: "quiet-branch-step" }, "Signals"),
      e("div", { className: "quiet-branch-arrow" }, "↓"),
      e("div", { className: "quiet-branch-step" }, "Situation"),
      e("div", { className: "quiet-branch-arrow" }, "↓"),
      e("div", { className: "quiet-branch-step" }, "Is action useful?"),
      e(
        "div",
        { className: "quiet-branch-fork" },
        e("div", { className: "quiet-branch-path" }, "Yes → Experience"),
        e(
          "div",
          { className: "quiet-branch-path is-active" },
          "No → Quiet Mode"
        )
      )
    ),
    e(
      "p",
      { className: "quiet-body" },
      "Not every signal needs an action. Some changes are noticed — and left alone."
    ),
    e(
      "ul",
      { className: "quiet-list" },
      ["No notification", "No recommendation", "No intervention"].map(function (line) {
        return e("li", { key: line }, line);
      })
    ),
    e(
      "button",
      { className: "ghost-btn", type: "button", onClick: onBack },
      "Back to demo"
    )
  );
}

/* ── Rent Warning ── */
function RentWarning({ rent, rentDate, rentPaused, rentReviewing, onReview, onPause, onKeep }) {
  if (rentPaused) {
    return e(
      "article",
      { className: "m-card card-rent is-paused anim-rent" },
      e("div", { className: "m-card-kicker success" }, "Action completed"),
      e("h3", { className: "m-card-title" }, "✓ Payment paused"),
      e(
        "p",
        { className: "m-card-body" },
        "The €" +
          rent +
          " payment scheduled for " +
          rentDate +
          " will no longer be sent automatically."
      )
    );
  }

  if (rentReviewing) {
    return e(
      "article",
      { className: "m-card card-rent anim-rent" },
      e("div", { className: "m-card-domain" }, "Payments"),
      e("div", { className: "m-card-kicker" }, "Standing orders"),
      e("h3", { className: "m-card-title" }, "Pause this payment?"),
      e(
        "div",
        { className: "rent-meta" },
        e("div", null, e("span", null, "Date"), e("strong", null, rentDate)),
        e("div", null, e("span", null, "Amount"), e("strong", null, "€" + rent)),
        e("div", null, e("span", null, "Type"), e("strong", null, "Old rental payment"))
      ),
      e(
        "div",
        { className: "rent-confirm" },
        e(
          "button",
          { className: "card-btn", type: "button", onClick: onPause },
          "Pause payment"
        ),
        e(
          "button",
          { className: "text-action", type: "button", onClick: onKeep },
          "Keep scheduled"
        )
      )
    );
  }

  return e(
    "article",
    { className: "m-card card-rent anim-rent" },
    e("div", { className: "m-card-domain" }, "Payments"),
    e("div", { className: "m-card-kicker warn" }, "Standing orders"),
    e("h3", { className: "m-card-title" }, "€" + rent + " rent payment needs attention"),
    e(
      "p",
      { className: "m-card-body" },
      "Your old monthly rent is still scheduled for " + rentDate + "."
    ),
    e(
      "div",
      { className: "rent-meta" },
      e("div", null, e("span", null, "Date"), e("strong", null, rentDate)),
      e("div", null, e("span", null, "Amount"), e("strong", null, "€" + rent)),
      e("div", null, e("span", null, "Type"), e("strong", null, "Automatic payment"))
    ),
    e(
      "button",
      { className: "card-btn", type: "button", onClick: onReview },
      "Review standing order"
    )
  );
}

/* ── Cashflow ── */
function CashflowForecast({ data }) {
  return e(
    "article",
    { className: "m-card card-cash anim-cash" },
    e("div", { className: "m-card-domain" }, "Cash"),
    e("div", { className: "m-card-kicker teal" }, "Cashflow"),
    e("h3", { className: "m-card-title" }, "Your moving budget"),
    e("div", { className: "cash-big" }, "€" + data.buffer.toLocaleString("en-US")),
    e(
      "div",
      { className: "cash-label" },
      "Expected buffer after known moving expenses"
    ),
    e(
      "div",
      { className: "cash-steps" },
      [
        ["Today", "€" + data.balanceToday.toLocaleString("en-US"), null],
        ["Deposit", "−€" + data.deposit.toLocaleString("en-US"), "neg"],
        ["Home purchases", "−€" + data.homePurchases.toLocaleString("en-US"), "neg"],
        ["Expected buffer", "€" + data.buffer.toLocaleString("en-US"), "pos"],
      ].map(function ([label, val, tone], i, arr) {
        return e(
          React.Fragment,
          { key: label },
          e(
            "div",
            { className: "cash-step" },
            e("span", { className: "cash-step-label" }, label),
            e("span", { className: "cash-step-val " + (tone || "") }, val)
          ),
          i < arr.length - 1 && e("div", { className: "cash-step-arrow" }, "↓")
        );
      })
    )
  );
}

/* ── Home Setup ── */
function HomeSetup({ addressCompleted, onContinue }) {
  const items = [
    { label: "Rental deposit", done: true },
    { label: "Home selected", done: true },
    {
      label: addressCompleted ? "Address updated" : "Update your address",
      done: addressCompleted,
    },
    { label: "Check home insurance", done: false },
  ];

  return e(
    "article",
    { className: "m-card card-home anim-home" },
    e("div", { className: "m-card-domain" }, "Home"),
    e("div", { className: "m-card-kicker blue" }, "Home setup"),
    e("h3", { className: "m-card-title" }, "Your new home"),
    e(
      "ul",
      { className: "check-list" },
      items.map(function (item) {
        return e(
          "li",
          {
            key: item.label,
            className: "check-item " + (item.done ? "done" : "todo"),
          },
          e("span", { className: "check-mark" }, item.done ? "✓" : ""),
          item.label
        );
      })
    ),
    e(
      "button",
      {
        className: "card-btn secondary",
        type: "button",
        onClick: onContinue,
        disabled: addressCompleted,
      },
      addressCompleted ? "Next step" : "Continue setup"
    )
  );
}

/* ── Moving Day ── */
function MovingDay({ moveDate }) {
  return e(
    "article",
    { className: "m-card card-day anim-day" },
    e(
      "div",
      { className: "day-head" },
      e(
        "div",
        null,
        e("div", { className: "m-card-domain" }, "Services"),
        e("div", { className: "m-card-kicker teal" }, "Moving day"),
        e("h3", { className: "m-card-title" }, moveDate)
      ),
      e("div", { className: "cal-icon", "aria-hidden": "true" }, "12")
    ),
    e(
      "p",
      { className: "m-card-body" },
      "You've already booked your moving van. We've prepared the relevant things for the day."
    ),
    e(
      "div",
      { className: "day-items" },
      e(
        "div",
        { className: "day-item done" },
        e("span", { className: "check-mark" }, "✓"),
        "Van"
      ),
      e(
        "div",
        { className: "day-item done" },
        e("span", { className: "check-mark" }, "✓"),
        "Card"
      ),
      e(
        "div",
        { className: "day-item" },
        e("span", { className: "check-mark empty" }),
        "Expected expenses"
      )
    )
  );
}

/* ── Moving Mode ── */
function MovingMode({
  data,
  rentPaused,
  rentReviewing,
  addressCompleted,
  onReview,
  onPause,
  onKeep,
  onContinue,
  onExit,
  onViewSignals,
}) {
  const tasksReady = 2 + (rentPaused ? 1 : 0) + (addressCompleted ? 1 : 0);
  const progress = Math.min(100, (tasksReady / 5) * 100);

  return e(
    "div",
    { className: "moving-shell" },
      e(
      "header",
      { className: "moving-hero" },
      e(EngineRail, { activeStep: "experience", situationTitle: "Moving" }),
      e("div", { className: "moving-eyebrow" }, "KBC SHIFT"),
      e("h1", { className: "moving-title" }, "Moving Mode"),
      e(
        "p",
        { className: "temp-badge temporary-badge-enter" },
        "Temporary · Until your move is complete"
      ),
      e(
        "p",
        { className: "moving-subtitle" },
        "Your move · " + data.daysToGo + " days to go"
      ),
      e(
        "p",
        { className: "moving-caps-line" },
        "4 existing capabilities prioritised for your move"
      ),
      e(CapabilityLibraryStrip, {
        selectedIds: ["standing-orders", "cashflow", "home-setup", "moving-day"],
      }),
      e(
        "div",
        { className: "before-now" },
        e(
          "div",
          { className: "before-now-item" },
          e("span", { className: "before-now-label" }, "Before"),
          e("span", { className: "before-now-text" }, "Normal banking")
        ),
        e("div", { className: "before-now-arrow", "aria-hidden": "true" }, "→"),
        e(
          "div",
          { className: "before-now-item now" },
          e("span", { className: "before-now-label" }, "Now"),
          e(
            "span",
            { className: "before-now-text" },
            "Banking reorganised around the current situation"
          )
        )
      ),
      e(
        "div",
        { className: "progress-wrap" },
        e(
          "div",
          { className: "progress-track", "aria-hidden": "true" },
          e("div", {
            className: "progress-fill",
            style: { width: progress + "%" },
          })
        ),
        e("div", { className: "progress-label" }, tasksReady + " of 5 tasks ready")
      ),
      e(
        "p",
        { className: "moving-intro" },
        "Same bank. Temporarily reorganised around your move."
      ),
      e("p", { className: "moving-confirmed" }, "You confirmed this situation."),
      e(
        "div",
        { className: "why-now" },
        e("div", { className: "why-now-label" }, "Why you're seeing this"),
        e(
          "p",
          { className: "why-now-body" },
          "Signals formed a pattern. You confirmed. Existing capabilities are temporarily prioritised."
        ),
        e(
          "button",
          { className: "text-action", type: "button", onClick: onViewSignals },
          "View signals"
        )
      )
    ),
    e(
      "div",
      { className: "moving-grid" },
      e(RentWarning, {
        rent: data.oldRent,
        rentDate: data.rentDate,
        rentPaused: rentPaused,
        rentReviewing: rentReviewing,
        onReview: onReview,
        onPause: onPause,
        onKeep: onKeep,
      }),
      e(CashflowForecast, { data: data }),
      e(HomeSetup, {
        addressCompleted: addressCompleted,
        onContinue: onContinue,
      }),
      e(MovingDay, { moveDate: data.moveDate })
    ),
    e(
      "div",
      { className: "moving-foot" },
      e("h3", null, "Why these actions?"),
      e(
        "p",
        null,
        "These already exist in KBC. SHIFT decides which ones matter right now."
      ),
      e(
        "button",
        { className: "ghost-btn", type: "button", onClick: onExit },
        "Exit Moving Mode"
      )
    )
  );
}

/* ── First Job Mode (shortened second situation) ── */
function FirstJobMode({ data, hypothesis, onExit, onBackToEmma, onViewSignals }) {
  const caps =
    (hypothesis && hypothesis.capabilities) ||
    ["salary", "savings", "card-readiness", "recurring-expenses"];

  const cards = [
    {
      id: "salary",
      domain: "Payments",
      title: "First salary received",
      body: "€" + data.salary.toLocaleString("en-US") + " arrived on the " + data.payday + ".",
      meta: "Organise income from day one",
    },
    {
      id: "savings",
      domain: "Cash",
      title: "Start a savings habit",
      body:
        "€" +
        data.savingsNow +
        " saved toward a €" +
        data.savingsGoal +
        " buffer goal.",
      meta: "Existing savings capability",
    },
    {
      id: "card-readiness",
      domain: "Cards",
      title: "Card readiness",
      body: "Daily card use is rising with your new routine.",
      meta: "Existing cards capability",
    },
    {
      id: "recurring-expenses",
      domain: "Recurring",
      title: "New recurring costs",
      body: "€" + data.recurringTotal + " in new subscriptions this month.",
      meta: "Existing recurring capability",
    },
  ];

  return e(
    "div",
    { className: "moving-shell first-job-shell" },
    e(
      "header",
      { className: "moving-hero" },
      e(EngineRail, { activeStep: "experience", situationTitle: "First job" }),
      e("div", { className: "moving-eyebrow" }, "KBC SHIFT · Same engine"),
      e("h1", { className: "moving-title" }, "First Job Mode"),
      e(
        "p",
        { className: "temp-badge temporary-badge-enter" },
        "Temporary · Until your first months settle"
      ),
      e(
        "p",
        { className: "moving-caps-line" },
        "4 existing capabilities prioritised for your first job"
      ),
      e(CapabilityLibraryStrip, { selectedIds: caps }),
      e(
        "div",
        { className: "before-now" },
        e(
          "div",
          { className: "before-now-item" },
          e("span", { className: "before-now-label" }, "Before"),
          e("span", { className: "before-now-text" }, "Normal banking")
        ),
        e("div", { className: "before-now-arrow", "aria-hidden": "true" }, "→"),
        e(
          "div",
          { className: "before-now-item now" },
          e("span", { className: "before-now-label" }, "Now"),
          e(
            "span",
            { className: "before-now-text" },
            "Banking reorganised around the current situation"
          )
        )
      ),
      e(
        "p",
        { className: "moving-intro" },
        "Same engine as Moving. Different signals. Different capabilities."
      ),
      e(
        "button",
        { className: "text-action", type: "button", onClick: onViewSignals },
        "View signals"
      )
    ),
    e(
      "div",
      { className: "moving-grid" },
      cards.map(function (card, i) {
        return e(
          "article",
          {
            key: card.id,
            className: "m-card anim-rent",
            style: { animationDelay: 0.05 + i * 0.05 + "s" },
          },
          e("div", { className: "m-card-domain" }, card.domain),
          e("div", { className: "m-card-kicker teal" }, capabilityLabel(card.id)),
          e("h3", { className: "m-card-title" }, card.title),
          e("p", { className: "m-card-body" }, card.body),
          e("div", { className: "fj-meta" }, card.meta)
        );
      })
    ),
    e(
      "div",
      { className: "moving-foot" },
      e("h3", null, "Same library. Different selection."),
      e(
        "p",
        null,
        "These already exist in KBC. SHIFT decides which ones matter right now."
      ),
      e(
        "div",
        { className: "fj-actions" },
        e(
          "button",
          { className: "ghost-btn", type: "button", onClick: onExit },
          "Exit First Job Mode"
        ),
        e(
          "button",
          { className: "primary-cta", type: "button", onClick: onBackToEmma },
          "Back to Emma"
        )
      )
    )
  );
}

/* ── Normal Dashboard ── */
function AccountOverview({ customer, transactions, dimmed, exiting, onAnalyze }) {
  return e(
    "div",
    {
      className:
        "dash-enter" +
        (dimmed ? " dash-dimmed" : "") +
        (exiting ? " normal-out" : ""),
    },
    e("h1", { className: "greeting" }, customer.greeting),
    e("p", { className: "sub-greeting" }, "Here's your financial overview."),
    e(
      "div",
      { className: "balance-card" },
      e("div", { className: "balance-label" }, "Current account"),
      e("div", { className: "balance-amount" }, formatBalance(customer.balance)),
      e("div", { className: "balance-meta" }, "Available balance"),
      e(
        "div",
        { className: "balance-actions" },
        e("button", { className: "ghost-btn", type: "button" }, "Transfer"),
        e("button", { className: "ghost-btn", type: "button" }, "Pay"),
        e("button", { className: "ghost-btn", type: "button" }, "Manage")
      )
    ),
    e("h2", { className: "section-title" }, "Your recent activity"),
    e(
      "div",
      { className: "tx-list" },
      transactions.map(function (tx) {
        return e(
          "div",
          {
            key: tx.id,
            className: "tx-row" + (tx.signal ? " highlight" : ""),
          },
          e(
            "div",
            { className: "tx-body" },
            e(
              "div",
              { className: "tx-merchant-line" },
              e("span", { className: "tx-merchant" }, tx.merchant),
              tx.signal && e("span", { className: "tx-tag" }, tx.signal)
            ),
            e("div", { className: "tx-date" }, tx.category + " · " + tx.date)
          ),
          e(
            "div",
            {
              className: "tx-amount " + (tx.amount >= 0 ? "pos" : "neg"),
            },
            (tx.amount >= 0 ? "+" : "") + formatEUR(tx.amount)
          )
        );
      })
    ),
    !dimmed &&
      e(
        "article",
        { className: "insight-card" },
        e("h2", { className: "insight-title" }, "Something seems to be changing."),
        e(
          "p",
          { className: "insight-body" },
          "We noticed a pattern across your recent activity — together, not alone."
        ),
        e(
          "button",
          { className: "primary-cta", type: "button", onClick: onAnalyze },
          "See what we noticed"
        ),
        e("p", { className: "insight-hint" }, "KBC detected this. You confirm.")
      )
  );
}

/* ── Persona Strip / Scale evidence ── */
function PersonaStrip({ personas, activeCustomer, onSelectNoah, onSelectEmma }) {
  return e(
    "section",
    { className: "scale-section", id: "scale" },
    e("p", { className: "scale-kicker" }, "Evidence from this demo"),
    e("h2", { className: "scale-title" }, "One engine. Many situations."),
    e(
      "div",
      { className: "scale-evidence" },
      e(
        "div",
        { className: "scale-evidence-card" },
        e("div", { className: "scale-evidence-label" }, "Emma"),
        e("div", { className: "scale-evidence-title" }, "Moving"),
        e(
          "div",
          { className: "scale-evidence-body" },
          "4 signals → Moving → 4 capabilities → Moving Mode"
        )
      ),
      e("div", { className: "scale-evidence-plus" }, "+"),
      e(
        "div",
        { className: "scale-evidence-card" },
        e("div", { className: "scale-evidence-label" }, "Noah"),
        e("div", { className: "scale-evidence-title" }, "First job"),
        e(
          "div",
          { className: "scale-evidence-body" },
          "4 signals → First job → 4 capabilities → First Job Mode"
        )
      )
    ),
    e(
      "div",
      { className: "scale-story", "aria-hidden": "true" },
      [
        "2.3M customers",
        "1 situational engine",
        "1 reusable capability library",
        "Different combinations by context",
      ].map(function (label, i, arr) {
        return e(
          React.Fragment,
          { key: label },
          e(
            "div",
            {
              className:
                "scale-story-item" +
                (i === 0 || i === arr.length - 1 ? " is-emphasis" : ""),
            },
            label
          ),
          i < arr.length - 1 &&
            e("div", { className: "scale-story-arrow" }, "↓")
        );
      })
    ),
    e(
      "div",
      { className: "scale-stats" },
      e("span", null, "2.3M customers"),
      e("span", { className: "scale-stats-dot", "aria-hidden": "true" }, "·"),
      e("span", null, "One capability library"),
      e("span", { className: "scale-stats-dot", "aria-hidden": "true" }, "·"),
      e("span", null, "Different situations")
    ),
    e(CapabilityLibraryStrip, { selectedIds: [] }),
    e(
      "div",
      { className: "arch-steps" },
      [
        ["Signals", "What changed?"],
        ["Situation", "What might be happening?"],
        ["Capabilities", "What can KBC already do?"],
        ["Experience", "What matters now?"],
      ].map(function (step, i, arr) {
        return e(
          React.Fragment,
          { key: step[0] },
          e(
            "div",
            { className: "arch-step" },
            e("div", { className: "arch-step-title" }, step[0]),
            e("div", { className: "arch-step-body" }, step[1])
          ),
          i < arr.length - 1 && e("div", { className: "arch-step-arrow" }, "↓")
        );
      })
    ),
    e(
      "p",
      { className: "persona-section-label" },
      "Try the same engine on another customer · Noah runs the full short path"
    ),
    e(
      "div",
      { className: "persona-grid" },
      personas.map(function (p) {
        const interactive = p.id === "noah" || p.id === "emma";
        const isActive =
          (p.id === "emma" && activeCustomer === "emma") ||
          (p.id === "noah" && activeCustomer === "noah");
        return e(
          interactive ? "button" : "div",
          {
            key: p.id,
            type: interactive ? "button" : undefined,
            className:
              "persona-card" +
              (interactive ? " is-interactive" : "") +
              (isActive ? " active" : ""),
            onClick: interactive
              ? function () {
                  if (p.id === "noah") onSelectNoah();
                  else onSelectEmma();
                }
              : undefined,
          },
          e("div", { className: "persona-avatar" }, p.initial),
          e("div", { className: "persona-name" }, p.name),
          e("div", { className: "persona-mode" }, p.mode),
          e("div", { className: "persona-hint" }, p.modules.join(" · "))
        );
      })
    ),
    e(
      "div",
      { className: "final-message" },
      e("div", { className: "final-kicker" }, "KBC SHIFT"),
      e("h2", null, "From personalized banking"),
      e("h2", null, "to situational banking."),
      e(
        "p",
        null,
        "The right existing KBC capabilities for what is happening in a customer's life right now."
      )
    )
  );
}

/* ── App ── */
function App() {
  const data = window.KBC_DEMO;
  const [customerId, setCustomerId] = useState("emma");
  const [stage, setStage] = useState("normal");
  const [rentPaused, setRentPaused] = useState(false);
  const [rentReviewing, setRentReviewing] = useState(false);
  const [addressCompleted, setAddressCompleted] = useState(false);
  const [showTrustModal, setShowTrustModal] = useState(false);
  const [showSignalsModal, setShowSignalsModal] = useState(false);
  const [showQuietMode, setShowQuietMode] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [exitNotice, setExitNotice] = useState(false);
  const [hypothesis, setHypothesis] = useState(null);
  const [confirmLocked, setConfirmLocked] = useState(false);

  const customer = customerId === "noah" ? data.noah : data.emma;
  const isFirstJob = hypothesis && hypothesis.situation === "firstJob";
  const analysisSignals =
    customerId === "noah" ? data.noahAnalysisSignals : data.analysisSignals;

  const reset = useCallback(function () {
    setCustomerId("emma");
    setStage("normal");
    setRentPaused(false);
    setRentReviewing(false);
    setAddressCompleted(false);
    setShowTrustModal(false);
    setShowSignalsModal(false);
    setShowQuietMode(false);
    setExiting(false);
    setExitNotice(false);
    setHypothesis(null);
    setConfirmLocked(false);
  }, []);

  const backToEmma = useCallback(function () {
    setCustomerId("emma");
    setStage("normal");
    setShowTrustModal(false);
    setShowSignalsModal(false);
    setShowQuietMode(false);
    setExiting(false);
    setExitNotice(false);
    setHypothesis(null);
    setConfirmLocked(false);
    setRentReviewing(false);
  }, []);

  const skipToMoving = useCallback(function () {
    setCustomerId("emma");
    setHypothesis(window.analyzeEmma());
    setShowTrustModal(false);
    setShowSignalsModal(false);
    setShowQuietMode(false);
    setExiting(false);
    setExitNotice(false);
    setRentReviewing(false);
    setConfirmLocked(false);
    setStage("moving");
  }, []);

  const startAnalyze = function () {
    if (showQuietMode) return;
    setCustomerId("emma");
    setHypothesis(window.analyzeEmma());
    setStage("analyzing");
  };

  const startNoah = function () {
    if (showQuietMode) return;
    setCustomerId("noah");
    setShowQuietMode(false);
    setShowTrustModal(false);
    setShowSignalsModal(false);
    setExitNotice(false);
    setConfirmLocked(false);
    setHypothesis(window.analyzeNoah());
    setStage("analyzing");
  };

  useEffect(
    function () {
      if (stage !== "analyzing") return;
      const t = setTimeout(function () {
        setStage("confirmation");
      }, 1900);
      return function () {
        clearTimeout(t);
      };
    },
    [stage]
  );

  useEffect(
    function () {
      if (stage !== "compiling") return;
      const t = setTimeout(function () {
        setStage("moving");
        setConfirmLocked(false);
      }, 2100);
      return function () {
        clearTimeout(t);
      };
    },
    [stage]
  );

  useEffect(
    function () {
      if (!exitNotice) return;
      const t = setTimeout(function () {
        setExitNotice(false);
        if (customerId === "noah") {
          setCustomerId("emma");
          setHypothesis(null);
        }
        setStage("normal");
      }, 1400);
      return function () {
        clearTimeout(t);
      };
    },
    [exitNotice, customerId]
  );

  const confirmYes = function () {
    if (confirmLocked) return;
    setConfirmLocked(true);
    setShowTrustModal(false);
    setStage("compiling");
  };

  const confirmNo = function () {
    if (customerId === "noah") {
      backToEmma();
      return;
    }
    setStage("normal");
    setHypothesis(null);
    setConfirmLocked(false);
  };

  const exitExperience = function () {
    setShowSignalsModal(false);
    setExitNotice(true);
  };

  const isOverlay =
    stage === "analyzing" || stage === "confirmation" || stage === "compiling";
  const isExperience = stage === "moving";
  const hideMain = showQuietMode || exitNotice;

  return e(
    BankingShell,
    { isMoving: isExperience, customerName: customer.name },
    e(
      "main",
      { className: "main" },
      !hideMain &&
        !isExperience &&
        e(AccountOverview, {
          customer: customer,
          transactions: customer.transactions,
          dimmed: isOverlay,
          exiting: exiting,
          onAnalyze: startAnalyze,
        }),
      !hideMain &&
        isExperience &&
        !isFirstJob &&
        e(MovingMode, {
          data: data.moving,
          rentPaused: rentPaused,
          rentReviewing: rentReviewing,
          addressCompleted: addressCompleted,
          onReview: function () {
            setRentReviewing(true);
          },
          onPause: function () {
            setRentPaused(true);
            setRentReviewing(false);
          },
          onKeep: function () {
            setRentReviewing(false);
          },
          onContinue: function () {
            setAddressCompleted(true);
          },
          onExit: exitExperience,
          onViewSignals: function () {
            setShowSignalsModal(true);
          },
        }),
      !hideMain &&
        isExperience &&
        isFirstJob &&
        e(FirstJobMode, {
          data: data.firstJob,
          hypothesis: hypothesis,
          onExit: exitExperience,
          onBackToEmma: backToEmma,
          onViewSignals: function () {
            setShowSignalsModal(true);
          },
        }),
      showQuietMode &&
        e(QuietMode, {
          onBack: function () {
            setShowQuietMode(false);
          },
        }),
      exitNotice && e("div", { className: "overlay-dim" }),
      exitNotice &&
        e("div", { className: "overlay" }, e(ExitNotice, null)),
      isOverlay && e("div", { className: "overlay-dim" }),
      stage === "analyzing" &&
        e(
          "div",
          { className: "overlay" },
          e(SignalAnalysis, {
            signals: analysisSignals,
            hypothesis: hypothesis,
          })
        ),
      stage === "confirmation" &&
        hypothesis &&
        e(
          "div",
          { className: "overlay" },
          e(SituationConfirmation, {
            hypothesis: hypothesis,
            onYes: confirmYes,
            onNo: confirmNo,
            onWhy: function () {
              setShowTrustModal(true);
            },
          })
        ),
      stage === "compiling" &&
        hypothesis &&
        e(
          "div",
          { className: "overlay" },
          e(CapabilityCompiler, { hypothesis: hypothesis })
        )
    ),
    !showQuietMode &&
      !exitNotice &&
      !isOverlay &&
      e(PersonaStrip, {
        personas: data.personas,
        activeCustomer: customerId,
        onSelectNoah: startNoah,
        onSelectEmma: backToEmma,
      }),
    showTrustModal &&
      e(TrustModal, {
        hypothesis: hypothesis,
        onClose: function () {
          setShowTrustModal(false);
        },
      }),
    showSignalsModal &&
      e(SignalsModal, {
        hypothesis: hypothesis,
        onClose: function () {
          setShowSignalsModal(false);
        },
      }),
    e(
      "div",
      { className: "demo-bar", "aria-label": "Demo controls" },
      e("button", { type: "button", onClick: reset }, "Reset demo"),
      e("button", { type: "button", onClick: skipToMoving }, "Skip to Moving Mode"),
      e(
        "button",
        {
          type: "button",
          onClick: function () {
            setShowQuietMode(true);
            setShowTrustModal(false);
            setShowSignalsModal(false);
            setStage("normal");
            setCustomerId("emma");
            setHypothesis(null);
          },
        },
        "Show quiet mode"
      )
    )
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(e(App));
