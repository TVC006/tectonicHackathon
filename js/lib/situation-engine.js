/**
 * Deterministic situation engine — offline, no LLM, no network.
 * Selects a situation and maps it to a finite capability library.
 */

const CAPABILITIES = {
  "standing-orders": {
    id: "standing-orders",
    label: "Standing orders",
    domain: "Payments",
    description: "Review recurring payments affected by your move.",
  },
  cashflow: {
    id: "cashflow",
    label: "Cashflow",
    domain: "Cash",
    description: "See how known expenses affect your available buffer.",
  },
  "home-setup": {
    id: "home-setup",
    label: "Home setup",
    domain: "Home",
    description: "Complete the practical banking tasks around your new home.",
  },
  "moving-day": {
    id: "moving-day",
    label: "Moving day",
    domain: "Services",
    description: "Prepare the payments and expenses around moving day.",
  },
  salary: {
    id: "salary",
    label: "Salary",
    domain: "Payments",
    description: "Understand and organise your first salary.",
  },
  savings: {
    id: "savings",
    label: "Savings",
    domain: "Cash",
    description: "Create room for your next financial goal.",
  },
  "card-readiness": {
    id: "card-readiness",
    label: "Card readiness",
    domain: "Cards",
    description: "Make sure your cards are ready for everyday use.",
  },
  insurance: {
    id: "insurance",
    label: "Insurance",
    domain: "Protection",
    description: "Review relevant insurance coverage.",
  },
  "foreign-spending": {
    id: "foreign-spending",
    label: "Foreign spending",
    domain: "Travel",
    description: "Prepare for payments in another currency.",
  },
  "recurring-expenses": {
    id: "recurring-expenses",
    label: "Recurring expenses",
    domain: "Recurring",
    description: "Review recurring costs as your situation changes.",
  },
};

const SITUATIONS = {
  moving: {
    id: "moving",
    title: "Moving",
    modeLabel: "Moving Mode",
    question: "Are you moving?",
    confidence: 0.91,
    signals: ["Rental deposit", "Home-related purchases", "Van rental"],
    capabilities: ["standing-orders", "cashflow", "home-setup", "moving-day"],
  },
  firstJob: {
    id: "firstJob",
    title: "First job",
    modeLabel: "First Job Mode",
    question: "Have you recently started a new job?",
    confidence: 0.86,
    signals: [
      "Salary income",
      "New recurring expenses",
      "Card activity",
      "Savings behaviour",
    ],
    capabilities: ["salary", "savings", "card-readiness", "recurring-expenses"],
  },
  travel: {
    id: "travel",
    title: "Travel",
    modeLabel: "Travel Mode",
    question: "Are you preparing for a trip?",
    confidence: 0.84,
    signals: ["Flight", "Hotel", "Foreign activity"],
    capabilities: ["card-readiness", "insurance", "foreign-spending"],
  },
  newFamily: {
    id: "newFamily",
    title: "New family",
    modeLabel: "Family Mode",
    question: "Has something changed in your family recently?",
    confidence: 0.82,
    signals: ["Household pattern", "Recurring care costs"],
    capabilities: ["recurring-expenses", "insurance", "savings"],
  },
};

const DEFAULT_SIGNAL_HINTS = [
  "rental deposit",
  "housing",
  "ikea",
  "brico",
  "home",
  "cambio",
  "van",
  "moving",
  "mobility",
];

const NOAH_SIGNAL_HINTS = [
  "salary",
  "first salary",
  "employer",
  "recurring",
  "subscription",
  "card",
  "savings",
  "first job",
  "income",
];

function normalizeSignals(signals) {
  if (!signals || !signals.length) return [];
  return signals.map(function (s) {
    if (typeof s === "string") return s.toLowerCase();
    if (s && typeof s === "object") {
      return [s.from, s.to, s.signal, s.merchant, s.id]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    }
    return String(s).toLowerCase();
  });
}

function resolveCapabilities(ids) {
  return ids
    .map(function (id) {
      return CAPABILITIES[id];
    })
    .filter(Boolean);
}
function buildHypothesis(situation) {
  return {
    situation: situation.id,
    confidence: situation.confidence,
    title: situation.title,
    modeLabel: situation.modeLabel,
    signals: situation.signals.slice(),
    question: situation.question,
    capabilities: situation.capabilities.slice(),
    capabilityDetails: resolveCapabilities(situation.capabilities),
  };
}

function analyzeSituation(signals) {
  var normalized = normalizeSignals(signals);
  var joined = normalized.join(" ");

  var looksLikeFirstJob = NOAH_SIGNAL_HINTS.some(function (hint) {
    return joined.indexOf(hint) !== -1;
  });
  var looksLikeMoving = DEFAULT_SIGNAL_HINTS.some(function (hint) {
    return joined.indexOf(hint) !== -1;
  });

  var situationKey = "moving";
  if (looksLikeFirstJob && !looksLikeMoving) {
    situationKey = "firstJob";
  } else if (looksLikeMoving) {
    situationKey = "moving";
  } else if (looksLikeFirstJob) {
    situationKey = "firstJob";
  }

  return buildHypothesis(SITUATIONS[situationKey]);
}

function analyzeCustomer() {
  var demo = typeof window !== "undefined" ? window.KBC_DEMO : null;
  var signals =
    (demo && demo.analysisSignals) ||
    (demo && demo.customer && demo.customer.transactions) ||
    DEFAULT_SIGNAL_HINTS;
  return analyzeSituation(signals);
}

function analyzeCustomerWithModel(customerOverride) {
  var demo = typeof window !== "undefined" ? window.KBC_DEMO : null;
  var customer = customerOverride || {
    id: demo && demo.customer ? demo.customer.name : "demo-customer",
    transactions: (demo && demo.customer && demo.customer.transactions) || [],
  };
  return fetch("/api/analyze-groups", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customers: [customer] }),
  })
    .then(function (response) {
      if (!response.ok) throw new Error("Group analysis unavailable");
      return response.json();
    })
    .then(function (payload) {
      var result =
        payload.groups && payload.groups[0] && payload.groups[0].analysis;
      if (!result) throw new Error("No group analysis returned");
      result.capabilityDetails = resolveCapabilities(result.capabilities || []);
      return result;
    });
}

/** Shortened second path — same engine, First Job. */
function analyzeNoah() {
  var demo = typeof window !== "undefined" ? window.KBC_DEMO : null;
  var signals =
    (demo && demo.noahAnalysisSignals) ||
    (demo && demo.noah && demo.noah.transactions) ||
    NOAH_SIGNAL_HINTS;
  return analyzeSituation(signals);
}

function getSituation(id) {
  return SITUATIONS[id] || null;
}

function getCapability(id) {
  return CAPABILITIES[id] || null;
}

function listCapabilities() {
  return Object.keys(CAPABILITIES).map(function (id) {
    return CAPABILITIES[id];
  });
}

if (typeof window !== "undefined") {
  window.CAPABILITIES = CAPABILITIES;
  window.SITUATIONS = SITUATIONS;
  window.analyzeSituation = analyzeSituation;
  window.analyzeCustomer = analyzeCustomer;
  window.analyzeCustomerWithModel = analyzeCustomerWithModel;
  window.analyzeNoah = analyzeNoah;
  window.getSituation = getSituation;
  window.getCapability = getCapability;
  window.listCapabilities = listCapabilities;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    CAPABILITIES: CAPABILITIES,
    SITUATIONS: SITUATIONS,
    analyzeSituation: analyzeSituation,
    analyzeCustomer: analyzeCustomer,
    analyzeCustomerWithModel: analyzeCustomerWithModel,
    analyzeNoah: analyzeNoah,
    getSituation: getSituation,
    getCapability: getCapability,
    listCapabilities: listCapabilities,
  };
}
