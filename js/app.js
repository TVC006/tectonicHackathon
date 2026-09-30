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
    (typeof window !== "undefined" &&
      window.getCapability &&
      window.getCapability(id)) ||
    null;
  return cap ? cap.label : id;
}

/* ── Header ── */
function BankingShell({ children, isMoving }) {
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
          e("span", { className: "brand-name" }, "KBC"),
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
                  className:
                    "nav-item" + (item === "Overview" ? " active" : ""),
                },
                item,
              ),
          ),
        ),
        e(
          "div",
          { className: "top-actions" },
          e("span", { className: "top-link" }, "Search"),
          e("span", { className: "top-link" }, "Help"),
          e("span", { className: "avatar" }, "Customer"),
        ),
      ),
    ),
    children,
  );
}

/* ── Trust Modal ── */
function TrustModal({ onClose }) {
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
        { className: "modal-text" },
        "KBC noticed a combination of recent signals that can sometimes occur when someone is moving.",
      ),
      e(
        "p",
        { className: "modal-text" },
        "We don't assume that's what is happening.",
      ),
      e(
        "p",
        { className: "modal-text" },
        "Nothing changes until you confirm it.",
      ),
      e("div", { className: "modal-signals-label" }, "Signals used"),
      e(
        "ul",
        { className: "modal-signals" },
        ["Rental deposit", "IKEA", "Brico", "Van rental"].map((s) =>
          e("li", { key: s }, s),
        ),
      ),
      e("p", { className: "modal-footer" }, "You stay in control."),
      e(
        "button",
        { className: "btn-yes", type: "button", onClick: onClose },
        "Got it",
      ),
    ),
  );
}

/* ── Signals Modal (Why Moving Mode) ── */
function SignalsModal({ hypothesis, onClose }) {
  return e(
    "div",
    { className: "modal-root", role: "dialog", "aria-modal": "true" },
    e("div", { className: "modal-dim", onClick: onClose }),
    e(
      "div",
      { className: "modal-panel modal-enter" },
      e("h2", { className: "modal-title" }, "Why Moving Mode?"),
      e(
        "p",
        { className: "modal-text" },
        "These were the signals behind the situation we detected.",
      ),
      e(
        "p",
        { className: "modal-text" },
        "We detected a pattern that can sometimes happen when someone moves.",
      ),
      e(
        "ul",
        { className: "signals-detail-list" },
        [
          ["Rental deposit", "Housing"],
          ["Home-related purchases", "IKEA + Brico"],
          ["Van rental", "Mobility"],
        ].map(([title, detail]) =>
          e(
            "li",
            { key: title },
            e("span", { className: "evidence-check" }, "✓"),
            e(
              "div",
              null,
              e("div", { className: "signals-detail-title" }, title),
              e("div", { className: "signals-detail-sub" }, detail),
            ),
          ),
        ),
      ),
      e(
        "div",
        { className: "signals-result" },
        e("div", { className: "modal-signals-label" }, "Possible situation"),
        e(
          "div",
          { className: "signals-result-title" },
          hypothesis?.title || "Moving",
        ),
        e(
          "div",
          { className: "signals-result-conf" },
          Math.round((hypothesis?.confidence || 0.91) * 100) +
            "% confidence before confirmation",
        ),
      ),
      e("p", { className: "modal-footer" }, "You confirmed this situation."),
      e(
        "button",
        { className: "btn-yes", type: "button", onClick: onClose },
        "Close",
      ),
    ),
  );
}

/* ── Signal Analysis ── */
function SignalAnalysis({ signals, hypothesis }) {
  const detectedSignals =
    hypothesis && hypothesis.signals && hypothesis.signals.length
      ? hypothesis.signals
      : signals.map(function (signal) {
          return signal.from;
        });
  return e(
    "div",
    { className: "analysis-panel" },
    e("div", { className: "analysis-label" }, "Connecting the signals"),
    e(
      "p",
      { className: "analysis-sub" },
      "KBC is looking at recent activity as a pattern, not as individual transactions.",
    ),
    e(
      "div",
      { className: "signal-grid" },
      detectedSignals.map((s, index) =>
        e(
          "div",
          { className: "signal-row", key: String(s) + index },
          e(
            "div",
            { className: "signal-from" },
            typeof s === "string" ? s : s.from,
          ),
          e("div", { className: "signal-arrow" }, "→"),
          e(
            "div",
            { className: "signal-to" },
            typeof s === "string" ? "group signal" : s.to,
          ),
        ),
      ),
    ),
    e(
      "div",
      { className: "converge" },
      e(
        "div",
        { className: "converge-meta" },
        detectedSignals.length + " signals → one emerging pattern",
      ),
      e("div", { className: "converge-eyebrow" }, "Possible life change"),
      e(
        "h2",
        { className: "converge-title" },
        (hypothesis && hypothesis.title) || "Analysing",
      ),
      e(
        "div",
        { className: "converge-conf" },
        Math.round(((hypothesis && hypothesis.confidence) || 0) * 100) +
          "% confidence",
      ),
    ),
  );
}

/* ── Confirmation ── */
function SituationConfirmation({ hypothesis, onYes, onNo, onWhy }) {
  return e(
    "div",
    { className: "hypothesis-card" },
    e(
      "div",
      { className: "hypothesis-eyebrow" },
      "Something seems to be changing",
    ),
    e(
      "p",
      { className: "hypothesis-body" },
      "We noticed a combination of recent activity that can sometimes point to " +
        (hypothesis.title || "a changing situation").toLowerCase() +
        ".",
    ),
    e("h3", { className: "hypothesis-question" }, hypothesis.question),
    e(
      "ul",
      { className: "evidence-list" },
      hypothesis.signals.map((s) =>
        e("li", { key: s }, e("span", { className: "evidence-check" }, "✓"), s),
      ),
    ),
    e(
      "div",
      { className: "btn-stack" },
      e(
        "button",
        { className: "btn-yes", type: "button", onClick: onYes },
        "Yes, that's right",
      ),
      e(
        "button",
        { className: "btn-no", type: "button", onClick: onNo },
        "Not really",
      ),
      e(
        "button",
        { className: "btn-why", type: "button", onClick: onWhy },
        "Why am I seeing this?",
      ),
    ),
  );
}

/* ── Capability Compiler ── */
function CapabilityCompiler({ hypothesis }) {
  const caps = (hypothesis && hypothesis.capabilities) || [
    "standing-orders",
    "cashflow",
    "home-setup",
    "moving-day",
  ];

  return e(
    "div",
    { className: "compiler-panel compiler-enter" },
    e("div", { className: "compiler-eyebrow" }, "KBC SHIFT"),
    e("div", { className: "compiler-confirmed" }, "Situation confirmed"),
    e("h2", { className: "compiler-title" }, hypothesis?.title || "Moving"),
    e(
      "p",
      { className: "compiler-body" },
      "We're reorganising your banking around what matters now.",
    ),
    e(
      "div",
      { className: "shift-chain", "aria-hidden": "true" },
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
            { className: "shift-chain-node" },
            e("span", { className: "shift-chain-num" }, pair[0]),
            e("span", { className: "shift-chain-label" }, pair[1]),
          ),
          i < arr.length - 1 &&
            e("div", { className: "shift-chain-arrow" }, "↓"),
        );
      }),
    ),
    e(
      "div",
      { className: "compiler-selecting" },
      "Selected for this situation",
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
            capabilityLabel(id),
          );
        }),
      ),
    ),
    e("div", { className: "compiler-ready" }, "Your experience is ready"),
  );
}

/* ── Exit notice ── */
function ExitNotice() {
  return e(
    "div",
    { className: "exit-panel modal-enter" },
    e("h2", { className: "exit-title" }, "Moving Mode ended"),
    e(
      "p",
      { className: "exit-body" },
      "Your regular banking experience is back.",
    ),
    e(
      "p",
      { className: "exit-body soft" },
      "Your completed actions remain completed.",
    ),
  );
}

/* ── Quiet Mode ── */
function QuietMode({ onBack }) {
  return e(
    "div",
    { className: "quiet-panel quiet-mode-enter" },
    e("div", { className: "quiet-eyebrow" }, "No action needed"),
    e(
      "p",
      { className: "quiet-body" },
      "We noticed some changes in your recent activity, but there isn't enough evidence of a meaningful situation.",
    ),
    e("p", { className: "quiet-body" }, "So KBC won't interrupt you."),
    e(
      "ul",
      { className: "quiet-list" },
      ["No notification", "No recommendation", "No intervention"].map(
        function (line) {
          return e("li", { key: line }, line);
        },
      ),
    ),
    e(
      "p",
      { className: "quiet-principle" },
      "Relevance also means knowing when to stay out of the way.",
    ),
    e(
      "button",
      { className: "ghost-btn", type: "button", onClick: onBack },
      "Back to demo",
    ),
  );
}

/* ── Rent Warning ── */
function RentWarning({
  rent,
  rentDate,
  rentPaused,
  rentReviewing,
  onReview,
  onPause,
  onKeep,
}) {
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
          " will no longer be sent automatically.",
      ),
    );
  }

  if (rentReviewing) {
    return e(
      "article",
      { className: "m-card card-rent anim-rent" },
      e("div", { className: "m-card-kicker" }, "Standing order"),
      e("h3", { className: "m-card-title" }, "Pause this payment?"),
      e(
        "div",
        { className: "rent-meta" },
        e("div", null, e("span", null, "Date"), e("strong", null, rentDate)),
        e(
          "div",
          null,
          e("span", null, "Amount"),
          e("strong", null, "€" + rent),
        ),
        e(
          "div",
          null,
          e("span", null, "Type"),
          e("strong", null, "Old rental payment"),
        ),
      ),
      e(
        "div",
        { className: "rent-confirm" },
        e(
          "button",
          { className: "card-btn", type: "button", onClick: onPause },
          "Pause payment",
        ),
        e(
          "button",
          { className: "text-action", type: "button", onClick: onKeep },
          "Keep scheduled",
        ),
      ),
    );
  }

  return e(
    "article",
    { className: "m-card card-rent anim-rent" },
    e("div", { className: "m-card-kicker warn" }, "Needs attention"),
    e(
      "h3",
      { className: "m-card-title" },
      "€" + rent + " rent payment needs attention",
    ),
    e(
      "p",
      { className: "m-card-body" },
      "Your old monthly rent is still scheduled for " + rentDate + ".",
    ),
    e(
      "div",
      { className: "rent-meta" },
      e("div", null, e("span", null, "Date"), e("strong", null, rentDate)),
      e("div", null, e("span", null, "Amount"), e("strong", null, "€" + rent)),
      e(
        "div",
        null,
        e("span", null, "Type"),
        e("strong", null, "Automatic payment"),
      ),
    ),
    e(
      "button",
      { className: "card-btn", type: "button", onClick: onReview },
      "Review standing order",
    ),
  );
}

/* ── Cashflow ── */
function CashflowForecast({ data }) {
  return e(
    "article",
    { className: "m-card anim-cash" },
    e("div", { className: "m-card-kicker teal" }, "Cashflow"),
    e("h3", { className: "m-card-title" }, "Your moving budget"),
    e(
      "div",
      { className: "cash-big" },
      "€" + data.buffer.toLocaleString("en-US"),
    ),
    e(
      "div",
      { className: "cash-label" },
      "Expected buffer after known moving expenses",
    ),
    e(
      "div",
      { className: "cash-steps" },
      [
        ["Today", "€" + data.balanceToday.toLocaleString("en-US"), null],
        ["Deposit", "−€" + data.deposit.toLocaleString("en-US"), "neg"],
        [
          "Home purchases",
          "−€" + data.homePurchases.toLocaleString("en-US"),
          "neg",
        ],
        ["Expected buffer", "€" + data.buffer.toLocaleString("en-US"), "pos"],
      ].map(function ([label, val, tone], i, arr) {
        return e(
          React.Fragment,
          { key: label },
          e(
            "div",
            { className: "cash-step" },
            e("span", { className: "cash-step-label" }, label),
            e("span", { className: "cash-step-val " + (tone || "") }, val),
          ),
          i < arr.length - 1 && e("div", { className: "cash-step-arrow" }, "↓"),
        );
      }),
    ),
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
    { className: "m-card anim-home" },
    e("div", { className: "m-card-kicker blue" }, "Home"),
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
          item.label,
        );
      }),
    ),
    e(
      "button",
      {
        className: "card-btn secondary",
        type: "button",
        onClick: onContinue,
        disabled: addressCompleted,
      },
      addressCompleted ? "Next step" : "Continue setup",
    ),
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
        e("div", { className: "m-card-kicker teal" }, "Moving day"),
        e("h3", { className: "m-card-title" }, moveDate),
      ),
      e("div", { className: "cal-icon", "aria-hidden": "true" }, "12"),
    ),
    e(
      "p",
      { className: "m-card-body" },
      "You've already booked your moving van. We've prepared the relevant things for the day.",
    ),
    e(
      "div",
      { className: "day-items" },
      e(
        "div",
        { className: "day-item done" },
        e("span", { className: "check-mark" }, "✓"),
        "Van",
      ),
      e(
        "div",
        { className: "day-item done" },
        e("span", { className: "check-mark" }, "✓"),
        "Card",
      ),
      e(
        "div",
        { className: "day-item" },
        e("span", { className: "check-mark empty" }),
        "Expected expenses",
      ),
    ),
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
      e(
        "div",
        { className: "moving-eyebrow-row" },
        e("div", { className: "moving-eyebrow" }, "KBC SHIFT"),
        e(
          "span",
          { className: "temp-badge temporary-badge-enter" },
          "Temporary",
        ),
      ),
      e("h1", { className: "moving-title" }, "Moving Mode"),
      e(
        "p",
        { className: "moving-subtitle" },
        "Your move · " + data.daysToGo + " days to go",
      ),
      e("p", { className: "moving-until" }, "Until your move is complete"),
      e(
        "p",
        { className: "moving-caps-line" },
        "4 capabilities prioritised for your move",
      ),
      e(
        "div",
        { className: "before-now" },
        e(
          "div",
          { className: "before-now-item" },
          e("span", { className: "before-now-label" }, "Before"),
          e(
            "span",
            { className: "before-now-text" },
            "Regular banking experience",
          ),
        ),
        e("div", { className: "before-now-arrow", "aria-hidden": "true" }, "→"),
        e(
          "div",
          { className: "before-now-item now" },
          e("span", { className: "before-now-label" }, "Now"),
          e(
            "span",
            { className: "before-now-text" },
            "Temporarily adapted to your move",
          ),
        ),
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
          }),
        ),
        e(
          "div",
          { className: "progress-label" },
          tasksReady + " of 5 tasks ready",
        ),
      ),
      e(
        "p",
        { className: "moving-intro" },
        "We've brought together the things that matter most for your move.",
      ),
      e(
        "p",
        { className: "moving-confirmed" },
        "You confirmed this situation.",
      ),
      e(
        "div",
        { className: "why-now" },
        e("div", { className: "why-now-label" }, "Why you're seeing this"),
        e(
          "p",
          { className: "why-now-body" },
          "Recent activity suggested your situation may have changed. You confirmed you're moving, so we've temporarily prioritised the things most relevant to your move.",
        ),
        e(
          "button",
          { className: "text-action", type: "button", onClick: onViewSignals },
          "View signals",
        ),
      ),
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
      e(MovingDay, { moveDate: data.moveDate }),
    ),
    e(
      "div",
      { className: "moving-foot" },
      e("h3", null, "Why these actions?"),
      e(
        "p",
        null,
        "KBC selected these capabilities because they are relevant to the situation you confirmed. You can leave Moving Mode at any time.",
      ),
      e(
        "button",
        { className: "ghost-btn", type: "button", onClick: onExit },
        "Exit Moving Mode",
      ),
    ),
  );
}

/* ── Normal Dashboard ── */
function AccountOverview({
  customer,
  transactions,
  dimmed,
  exiting,
  onAnalyze,
}) {
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
      e(
        "div",
        { className: "balance-amount" },
        formatBalance(customer.balance),
      ),
      e("div", { className: "balance-meta" }, "Available balance"),
      e(
        "div",
        { className: "balance-actions" },
        e("button", { className: "ghost-btn", type: "button" }, "Transfer"),
        e("button", { className: "ghost-btn", type: "button" }, "Pay"),
        e("button", { className: "ghost-btn", type: "button" }, "Manage"),
      ),
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
              tx.signal && e("span", { className: "tx-tag" }, tx.signal),
            ),
            e("div", { className: "tx-date" }, tx.category + " · " + tx.date),
          ),
          e(
            "div",
            {
              className: "tx-amount " + (tx.amount >= 0 ? "pos" : "neg"),
            },
            (tx.amount >= 0 ? "+" : "") + formatEUR(tx.amount),
          ),
        );
      }),
    ),
    !dimmed &&
      e(
        "article",
        { className: "insight-card" },
        e(
          "h2",
          { className: "insight-title" },
          "Something seems to be changing.",
        ),
        e(
          "p",
          { className: "insight-body" },
          "KBC noticed a pattern across your recent activity.",
        ),
        e(
          "button",
          { className: "primary-cta", type: "button", onClick: onAnalyze },
          "Connect the signals",
        ),
        e("p", { className: "insight-hint" }, "See how KBC arrived at this"),
      ),
  );
}

/* ── Persona Strip ── */
function PersonaStrip({ personas, activePreview, onSelect, onBack }) {
  const noah = personas.find(function (p) {
    return p.id === "noah";
  });

  return e(
    "section",
    { className: "scale-section", id: "scale" },
    e("p", { className: "scale-kicker" }, "Same engine. Different situations."),
    e(
      "h2",
      { className: "scale-title" },
      "One engine. Millions of situations.",
    ),
    e(
      "p",
      { className: "scale-sub" },
      "2.3M customers. One capability library. Different situations.",
    ),
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
            e("div", { className: "arch-step-body" }, step[1]),
          ),
          i < arr.length - 1 && e("div", { className: "arch-step-arrow" }, "↓"),
        );
      }),
    ),
    e(
      "div",
      { className: "persona-grid" },
      personas.map(function (p) {
        const interactive = p.id === "noah";
        return e(
          interactive ? "button" : "div",
          {
            key: p.id,
            type: interactive ? "button" : undefined,
            className:
              "persona-card" +
              (interactive ? " is-interactive" : "") +
              (activePreview === p.id ? " active" : ""),
            onClick: interactive
              ? function () {
                  onSelect(p.id);
                }
              : undefined,
          },
          e("div", { className: "persona-avatar" }, p.initial),
          e("div", { className: "persona-name" }, p.name),
          e("div", { className: "persona-mode" }, p.mode),
          e("div", { className: "persona-hint" }, p.modules.join(" · ")),
        );
      }),
    ),
    activePreview === "noah" &&
      noah &&
      e(
        "div",
        { className: "persona-preview persona-preview-enter" },
        e("div", { className: "persona-preview-kicker" }, "Demonstration"),
        e("div", { className: "persona-preview-title" }, "First job"),
        e(
          "p",
          { className: "persona-preview-line" },
          "A new salary changes more than your balance.",
        ),
        e(
          "div",
          { className: "modal-signals-label" },
          "Prioritised capabilities",
        ),
        e(
          "ul",
          { className: "compiler-list static" },
          ["First salary", "Savings", "Cashflow"].map(function (label) {
            return e(
              "li",
              { key: label, className: "compiler-item visible" },
              e("span", { className: "evidence-check" }, "✓"),
              label,
            );
          }),
        ),
        e(
          "p",
          { className: "persona-preview-tagline" },
          "Same engine. Different situation.",
        ),
        e(
          "button",
          { className: "ghost-btn", type: "button", onClick: onBack },
          "Back to account",
        ),
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
        "The right KBC experience for what is happening in your life right now.",
      ),
    ),
  );
}

/* ── App ── */
function App() {
  const data = window.KBC_DEMO;
  const customer = data.customer;
  const [stage, setStage] = useState("normal");
  const [rentPaused, setRentPaused] = useState(false);
  const [rentReviewing, setRentReviewing] = useState(false);
  const [addressCompleted, setAddressCompleted] = useState(false);
  const [showTrustModal, setShowTrustModal] = useState(false);
  const [showSignalsModal, setShowSignalsModal] = useState(false);
  const [showQuietMode, setShowQuietMode] = useState(false);
  const [personaPreview, setPersonaPreview] = useState(null);
  const [exiting, setExiting] = useState(false);
  const [exitNotice, setExitNotice] = useState(false);
  const [hypothesis, setHypothesis] = useState(null);
  const [confirmLocked, setConfirmLocked] = useState(false);

  const reset = useCallback(function () {
    setStage("normal");
    setRentPaused(false);
    setRentReviewing(false);
    setAddressCompleted(false);
    setShowTrustModal(false);
    setShowSignalsModal(false);
    setShowQuietMode(false);
    setPersonaPreview(null);
    setExiting(false);
    setExitNotice(false);
    setHypothesis(null);
    setConfirmLocked(false);
  }, []);

  const startAnalyze = function () {
    if (showQuietMode) return;
    window
      .analyzeCustomerWithModel()
      .then(setHypothesis)
      .catch(function () {
        setHypothesis(window.analyzeCustomer());
      });
    setStage("analyzing");
  };

  useEffect(
    function () {
      if (stage !== "analyzing" || !hypothesis) return;
      const t = setTimeout(function () {
        setStage("confirmation");
      }, 1900);
      return function () {
        clearTimeout(t);
      };
    },
    [stage, hypothesis],
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
    [stage],
  );

  useEffect(
    function () {
      if (!exitNotice) return;
      const t = setTimeout(function () {
        setExitNotice(false);
        setStage("normal");
      }, 1400);
      return function () {
        clearTimeout(t);
      };
    },
    [exitNotice],
  );

  const confirmYes = function () {
    if (confirmLocked) return;
    setConfirmLocked(true);
    setShowTrustModal(false);
    setStage("compiling");
  };

  const confirmNo = function () {
    setStage("normal");
    setHypothesis(null);
    setConfirmLocked(false);
  };

  const exitMoving = function () {
    setShowSignalsModal(false);
    setExitNotice(true);
  };

  const isOverlay =
    stage === "analyzing" || stage === "confirmation" || stage === "compiling";
  const isMoving = stage === "moving";
  const hideMain = showQuietMode || exitNotice;

  return e(
    BankingShell,
    { isMoving: isMoving },
    e(
      "main",
      { className: "main" },
      !hideMain &&
        !isMoving &&
        e(AccountOverview, {
          customer: customer,
          transactions: customer.transactions,
          dimmed: isOverlay,
          exiting: exiting,
          onAnalyze: startAnalyze,
        }),
      !hideMain &&
        isMoving &&
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
          onExit: exitMoving,
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
      exitNotice && e("div", { className: "overlay" }, e(ExitNotice, null)),
      isOverlay && e("div", { className: "overlay-dim" }),
      stage === "analyzing" &&
        e(
          "div",
          { className: "overlay" },
          e(SignalAnalysis, {
            signals: data.analysisSignals,
            hypothesis: hypothesis,
          }),
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
          }),
        ),
      stage === "compiling" &&
        hypothesis &&
        e(
          "div",
          { className: "overlay" },
          e(CapabilityCompiler, { hypothesis: hypothesis }),
        ),
    ),
    !showQuietMode &&
      !exitNotice &&
      e(PersonaStrip, {
        personas: data.personas,
        activePreview: personaPreview,
        onSelect: setPersonaPreview,
        onBack: function () {
          setPersonaPreview(null);
        },
      }),
    showTrustModal &&
      e(TrustModal, {
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
      e(
        "button",
        {
          type: "button",
          onClick: function () {
            setShowQuietMode(true);
            setShowTrustModal(false);
            setShowSignalsModal(false);
            setPersonaPreview(null);
            setStage("normal");
          },
        },
        "Show quiet mode",
      ),
    ),
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(e(App));
