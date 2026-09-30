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

/* ── Compact capability library (compiler only) ── */
function CapabilityLibraryStrip({ selectedIds, compact }) {
  const selected = selectedIds || [];
  const library =
    (typeof window !== "undefined" &&
      window.listCapabilities &&
      window.listCapabilities()) ||
    [];

  return e(
    "div",
    { className: "cap-library" + (compact ? " is-compact" : "") },
    e("div", { className: "cap-library-label" }, "From the capability library"),
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
    e("div", { className: "analysis-label" }, "Pattern detected"),
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
      e("div", { className: "converge-eyebrow" }, "Situation"),
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
    e("div", { className: "hypothesis-eyebrow" }, "Hypothesis"),
    e("h3", { className: "hypothesis-question" }, hypothesis.question),
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
    e("div", { className: "compiler-confirmed" }, title + " confirmed"),
    e("h2", { className: "compiler-title" }, "Selecting capabilities"),
    e(CapabilityLibraryStrip, { selectedIds: caps, compact: true }),
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
    e("div", { className: "compiler-ready" }, "Ready")
  );
}

/* ── Exit notice ── */
function ExitNotice() {
  return e(
    "div",
    { className: "exit-panel modal-enter" },
    e("h2", { className: "exit-title" }, "Back to normal banking"),
    e(
      "p",
      { className: "exit-body soft" },
      "Completed actions stay completed."
    )
  );
}

/* ── Quiet Mode ── */
function QuietMode({ onBack, reason }) {
  return e(
    "div",
    { className: "quiet-panel quiet-mode-enter" },
    e("div", { className: "quiet-eyebrow" }, "Quiet Mode"),
    e("h2", { className: "quiet-title" }, "Nothing needed right now."),
    e(
      "p",
      { className: "quiet-body" },
      reason ||
        "Some signals are changing, but there is no useful action right now."
    ),
    e(
      "button",
      { className: "ghost-btn", type: "button", onClick: onBack },
      "Back to banking"
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
    e("div", { className: "m-card-domain" }, "Banking"),
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
        data.daysToGo + " days to go"
      ),
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
            "Situation-aware experience"
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
        "button",
        { className: "text-action", type: "button", onClick: onViewSignals },
        "View signals"
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
      e(
        "button",
        { className: "ghost-btn", type: "button", onClick: onExit },
        "Exit Moving Mode"
      )
    )
  );
}

/* ── First Job Mode (shortened second situation) ── */
function FirstJobMode({ data, onExit, onBackToEmma, onViewSignals }) {
  const cards = [
    {
      id: "salary",
      domain: "Payments",
      title: "First salary received",
      body: "€" + data.salary.toLocaleString("en-US") + " on the " + data.payday + ".",
    },
    {
      id: "savings",
      domain: "Cash",
      title: "Start a savings habit",
      body: "€" + data.savingsNow + " toward a €" + data.savingsGoal + " goal.",
    },
    {
      id: "card-readiness",
      domain: "Cards",
      title: "Card readiness",
      body: "Daily card use is rising with your new routine.",
    },
    {
      id: "recurring-expenses",
      domain: "Recurring",
      title: "New recurring costs",
      body: "€" + data.recurringTotal + " in new subscriptions this month.",
    },
  ];

  return e(
    "div",
    { className: "moving-shell first-job-shell" },
    e(
      "header",
      { className: "moving-hero" },
      e("div", { className: "moving-eyebrow" }, "KBC SHIFT"),
      e("h1", { className: "moving-title" }, "First Job Mode"),
      e(
        "p",
        { className: "temp-badge temporary-badge-enter" },
        "Temporary · Until your first months settle"
      ),
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
          e("span", { className: "before-now-text" }, "Situation-aware experience")
        )
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
          e("p", { className: "m-card-body" }, card.body)
        );
      })
    ),
    e(
      "div",
      { className: "moving-foot" },
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
        e("div", { className: "insight-eyebrow" }, "Situation signal"),
        e("h2", { className: "insight-title" }, "Something seems to be changing."),
        e(
          "p",
          { className: "insight-body" },
          "4 related signals detected."
        ),
        e(
          "button",
          { className: "primary-cta", type: "button", onClick: onAnalyze },
          "See what we noticed"
        )
      )
  );
}

/* ── Engine story / scale ── */
function EngineStory({ onShowQuiet }) {
  return e(
    "section",
    { className: "scale-section", id: "scale" },
    e("h2", { className: "scale-title" }, "One engine. Many experiences."),
    e(
      "div",
      { className: "combo-model" },
      e(
        "div",
        { className: "combo-flow", "aria-hidden": "true" },
        e("span", null, "Signals"),
        e("span", { className: "combo-flow-arrow" }, "→"),
        e("span", null, "Situation"),
        e("span", { className: "combo-flow-arrow" }, "→"),
        e("span", null, "Capabilities"),
        e("span", { className: "combo-flow-arrow" }, "→"),
        e("span", null, "Experience")
      ),
      e(
        "p",
        { className: "combo-result" },
        "2.3M customers · one capability library · different situations"
      )
    ),
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
          "Standing orders · Cashflow · Home · Moving day"
        )
      ),
      e(
        "div",
        { className: "scale-evidence-card" },
        e("div", { className: "scale-evidence-label" }, "Noah"),
        e("div", { className: "scale-evidence-title" }, "First job"),
        e(
          "div",
          { className: "scale-evidence-body" },
          "Salary · Savings · Cards · Recurring"
        )
      ),
      e(
        "button",
        {
          type: "button",
          className: "scale-evidence-card is-quiet is-interactive",
          onClick: onShowQuiet,
        },
        e("div", { className: "scale-evidence-label" }, "Outcome"),
        e("div", { className: "scale-evidence-title" }, "Quiet"),
        e("div", { className: "scale-evidence-body" }, "No useful action · stay quiet")
      )
    ),
    e(
      "div",
      { className: "final-message" },
      e("div", { className: "final-kicker" }, "KBC SHIFT"),
      e("h2", null, "From personalized banking"),
      e("h2", null, "to situational banking.")
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
  const [quietReason, setQuietReason] = useState("");
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
    setQuietReason("");
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
    setQuietReason("");
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
    setQuietReason("");
    setExiting(false);
    setExitNotice(false);
    setRentReviewing(false);
    setConfirmLocked(false);
    setStage("moving");
  }, []);

  const startAnalyze = function () {
    if (showQuietMode) return;
    if (customerId === "noah") {
      setHypothesis(window.analyzeNoah());
    } else {
      setCustomerId("emma");
      setHypothesis(window.analyzeEmma());
    }
    setStage("analyzing");
  };

  const startNoah = function () {
    if (showQuietMode) return;
    setCustomerId("noah");
    setShowQuietMode(false);
    setQuietReason("");
    setShowTrustModal(false);
    setShowSignalsModal(false);
    setExitNotice(false);
    setExiting(false);
    setConfirmLocked(false);
    setHypothesis(null);
    setStage("normal");
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
    setShowTrustModal(false);
    setConfirmLocked(false);
    setStage("normal");
    setHypothesis(null);
    setQuietReason(
      customerId === "noah"
        ? "Some signals are changing, but there is no useful action right now."
        : "You did not confirm the hypothesis. The engine stays quiet."
    );
    setShowQuietMode(true);
    if (customerId === "noah") {
      setCustomerId("emma");
    }
  };

  const openQuietOutcome = function () {
    setShowTrustModal(false);
    setShowSignalsModal(false);
    setQuietReason(
      "Some signals are changing, but there is no useful action right now."
    );
    setShowQuietMode(true);
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
          onExit: exitExperience,
          onBackToEmma: backToEmma,
          onViewSignals: function () {
            setShowSignalsModal(true);
          },
        }),
      showQuietMode &&
        e(QuietMode, {
          reason: quietReason,
          onBack: function () {
            setShowQuietMode(false);
            setQuietReason("");
            setCustomerId("emma");
            setStage("normal");
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
      e(EngineStory, {
        onShowQuiet: openQuietOutcome,
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
      customerId === "noah"
        ? e("button", { type: "button", onClick: backToEmma }, "Back to Emma")
        : e("button", { type: "button", onClick: startNoah }, "Explore Noah")
    )
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(e(App));
