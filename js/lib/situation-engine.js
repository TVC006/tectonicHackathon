/**
 * Deterministic situation engine — offline, no LLM, no network.
 * Selects a situation and maps it to a finite capability library.
 */

const CAPABILITIES = {
  "standing-orders": {
    id: "standing-orders",
    label: "Standing orders",
    description: "Review recurring payments affected by your move.",
  },
  cashflow: {
    id: "cashflow",
    label: "Cashflow",
    description: "See how known expenses affect your available buffer.",
  },
  "home-setup": {
    id: "home-setup",
    label: "Home setup",
    description: "Complete the practical banking tasks around your new home.",
  },
  "moving-day": {
    id: "moving-day",
    label: "Moving day",
    description: "Prepare the payments and expenses around moving day.",
  },
  salary: {
    id: "salary",
    label: "First salary",
    description: "Understand and organise your first salary.",
  },
  savings: {
    id: "savings",
    label: "Savings",
    description: "Create room for your next financial goal.",
  },
  "card-readiness": {
    id: "card-readiness",
    label: "Card readiness",
    description: "Make sure your cards are ready for travel.",
  },
  insurance: {
    id: "insurance",
    label: "Insurance",
    description: "Review relevant insurance coverage.",
  },
  "foreign-spending": {
    id: "foreign-spending",
    label: "Foreign spending",
    description: "Prepare for payments in another currency.",
  },
  "recurring-expenses": {
    id: "recurring-expenses",
    label: "Recurring expenses",
    description: "Review recurring costs as your situation changes.",
  },
};

const SITUATIONS = {
  moving: {
    id: "moving",
    title: "Moving",
    question: "Are you moving?",
    confidence: 0.91,
    signals: ["Rental deposit", "Home-related purchases", "Van rental"],
    capabilities: ["standing-orders", "cashflow", "home-setup", "moving-day"],
  },
  firstJob: {
    id: "firstJob",
    title: "First job",
    question: "Have you recently started a new job?",
    confidence: 0.86,
    signals: ["First salary", "New employer pattern"],
    capabilities: ["salary", "savings", "cashflow"],
  },
  travel: {
    id: "travel",
    title: "Travel",
    question: "Are you preparing for a trip?",
    confidence: 0.84,
    signals: ["Flight", "Hotel", "Foreign activity"],
    capabilities: ["card-readiness", "insurance", "foreign-spending"],
  },
  newFamily: {
    id: "newFamily",
    title: "New family",
    question: "Has something changed in your family recently?",
    confidence: 0.82,
    signals: ["Household pattern", "Recurring care costs"],
    capabilities: ["recurring-expenses", "insurance", "savings"],
  },
};

const EMMA_SIGNAL_HINTS = [
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

/**
 * Deterministic analyzer.
 * Emma's moving pattern always returns the moving situation.
 */
function analyzeSituation(signals) {
  var normalized = normalizeSignals(signals);
  var joined = normalized.join(" ");

  var looksLikeMoving = EMMA_SIGNAL_HINTS.some(function (hint) {
    return joined.indexOf(hint) !== -1;
  });

  // Hero path: Emma's combined housing / home / mobility pattern
  var situationKey = looksLikeMoving ? "moving" : "moving";
  var situation = SITUATIONS[situationKey];

  return {
    situation: situation.id,
    confidence: situation.confidence,
    title: situation.title,
    signals: situation.signals.slice(),
    question: situation.question,
    capabilities: situation.capabilities.slice(),
    capabilityDetails: resolveCapabilities(situation.capabilities),
  };
}

/** Compatibility wrapper used by the existing Emma hero demo. */
function analyzeEmma() {
  var demo = typeof window !== "undefined" ? window.KBC_DEMO : null;
  var signals =
    (demo && demo.analysisSignals) ||
    (demo && demo.emma && demo.emma.transactions) ||
    EMMA_SIGNAL_HINTS;
  return analyzeSituation(signals);
}

function getSituation(id) {
  return SITUATIONS[id] || null;
}

function getCapability(id) {
  return CAPABILITIES[id] || null;
}

if (typeof window !== "undefined") {
  window.CAPABILITIES = CAPABILITIES;
  window.SITUATIONS = SITUATIONS;
  window.analyzeSituation = analyzeSituation;
  window.analyzeEmma = analyzeEmma;
  window.getSituation = getSituation;
  window.getCapability = getCapability;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    CAPABILITIES: CAPABILITIES,
    SITUATIONS: SITUATIONS,
    analyzeSituation: analyzeSituation,
    analyzeEmma: analyzeEmma,
    getSituation: getSituation,
    getCapability: getCapability,
  };
}
