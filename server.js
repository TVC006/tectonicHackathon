#!/usr/bin/env node
/**
 * Zero-dependency static server for the KBC SHIFT demo.
 * Usage: node server.js
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const REAL_ROOT = fs.realpathSync(ROOT);
const LM_STUDIO_URL =
  process.env.LM_STUDIO_URL || "http://127.0.0.1:1234/v1/chat/completions";
const LM_STUDIO_MODEL = process.env.LM_STUDIO_MODEL || "google/gemma-4-e4b";
const analysisCache = new Map();

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

function json(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise(function (resolve, reject) {
    let body = "";
    req.on("data", function (chunk) {
      body += chunk;
      if (body.length > 2 * 1024 * 1024) reject(new Error("Request too large"));
    });
    req.on("end", function () {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (error) {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function amountOf(transaction) {
  return Math.abs(Number(transaction.amount) || 0);
}

function dayOf(transaction) {
  const parsed = Date.parse(transaction.date || "");
  return Number.isNaN(parsed) ? 0 : parsed / 86400000;
}

function featureFor(customer) {
  const transactions = Array.isArray(customer.transactions)
    ? customer.transactions
    : [];
  const amounts = transactions.map(amountOf).filter(Boolean);
  const days = transactions.map(dayOf).filter(Boolean);
  const text = transactions
    .map(function (item) {
      return [item.merchant, item.category, item.signal]
        .filter(Boolean)
        .join(" ");
    })
    .join(" ")
    .toLowerCase();
  const tokens = new Set(
    text.split(/[^a-z0-9]+/).filter(function (token) {
      return token.length > 2;
    }),
  );
  return {
    total: amounts.reduce(function (sum, amount) {
      return sum + amount;
    }, 0),
    average: amounts.length
      ? amounts.reduce(function (sum, amount) {
          return sum + amount;
        }, 0) / amounts.length
      : 0,
    count: transactions.length,
    span:
      days.length > 1
        ? Math.max.apply(null, days) - Math.min.apply(null, days)
        : 0,
    tokens: tokens,
    text: text,
  };
}

function relativeDifference(left, right) {
  const scale = Math.max(Math.abs(left), Math.abs(right), 1);
  return Math.abs(left - right) / scale;
}

function similarity(left, right) {
  const union = new Set(
    [].concat(Array.from(left.tokens), Array.from(right.tokens)),
  );
  let overlap = 0;
  union.forEach(function (token) {
    if (left.tokens.has(token) && right.tokens.has(token)) overlap += 1;
  });
  const tokenScore = union.size ? overlap / union.size : 0;
  const numericDistance =
    0.32 * relativeDifference(left.total, right.total) +
    0.18 * relativeDifference(left.average, right.average) +
    0.16 * relativeDifference(left.count, right.count) +
    0.14 * Math.min(Math.abs(left.span - right.span) / 30, 1);
  return 1 - Math.min(1, numericDistance + 0.2 * (1 - tokenScore));
}

function clusterCustomers(customers) {
  const features = customers.map(featureFor);
  const groups = [];
  const assigned = new Set();
  customers.forEach(function (_, index) {
    if (assigned.has(index)) return;
    const group = [index];
    assigned.add(index);
    customers.forEach(function (__, candidate) {
      if (
        !assigned.has(candidate) &&
        similarity(features[index], features[candidate]) >= 0.48
      ) {
        group.push(candidate);
        assigned.add(candidate);
      }
    });
    groups.push(group);
  });
  return groups.map(function (indexes, groupIndex) {
    const members = indexes.map(function (index) {
      return customers[index];
    });
    const representative = members.reduce(
      function (summary, customer) {
        const feature = features[customers.indexOf(customer)];
        summary.total += feature.total;
        summary.average += feature.average;
        summary.count += feature.count;
        summary.span += feature.span;
        summary.text.push(feature.text);
        return summary;
      },
      { total: 0, average: 0, count: 0, span: 0, text: [] },
    );
    representative.average /= members.length;
    representative.span /= members.length;
    representative.customerCount = members.length;
    representative.groupId = "group-" + (groupIndex + 1);
    return {
      id: representative.groupId,
      members: members,
      representative: representative,
    };
  });
}

function cacheKey(representative) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(representative))
    .digest("hex");
}

async function analyzeGroup(representative) {
  const key = cacheKey(representative);
  if (analysisCache.has(key))
    return Object.assign({}, analysisCache.get(key), { cached: true });
  const prompt = [
    "Classify this customer group into one financial life situation.",
    "Return JSON only with: situation (moving|firstJob|travel|newFamily|other), title, confidence (0..1), signals (array of 3 short strings), question, capabilities (array of ids from standing-orders,cashflow,home-setup,moving-day,salary,savings,card-readiness,insurance,foreign-spending,recurring-expenses). The question must be a natural, specific confirmation question based on the predicted title and signals, not a fixed template.",
    "Use approximate patterns. Do not infer sensitive traits. Group summary:",
    JSON.stringify(representative),
  ].join("\n");
  const response = await fetch(LM_STUDIO_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: LM_STUDIO_MODEL,
      temperature: 0.1,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!response.ok)
    throw new Error("LM Studio returned HTTP " + response.status);
  const payload = await response.json();
  const content =
    payload.choices &&
    payload.choices[0] &&
    payload.choices[0].message &&
    payload.choices[0].message.content;
  const result = JSON.parse(
    String(content || "")
      .replace(/^```json\s*/i, "")
      .replace(/\s*```$/, ""),
  );
  result.confidence = Math.max(0, Math.min(1, Number(result.confidence) || 0));
  if (typeof result.question !== "string" || !result.question.trim()) {
    result.question =
      "Does this sound like " +
      (result.title || "the situation we detected") +
      "?";
  }
  result.cached = false;
  analysisCache.set(key, result);
  return result;
}

function fallbackAnalysis(representative) {
  const text = representative.text.join(" ");
  const moving = /rental|housing|home|ikea|brico|van|moving|mobility/i.test(
    text,
  );
  return {
    situation: moving ? "moving" : "other",
    title: moving ? "Moving" : "A changing situation",
    confidence: moving ? 0.62 : 0.35,
    signals: moving
      ? ["Housing activity", "Home-related purchases", "Mobility pattern"]
      : ["Recent activity", "Spending pattern", "Timing pattern"],
    question: moving ? "Are you moving?" : "Has something changed recently?",
    capabilities: moving
      ? ["standing-orders", "cashflow", "home-setup", "moving-day"]
      : ["cashflow"],
    cached: false,
    source: "local-fallback",
  };
}

async function handleAnalysis(req, res) {
  const body = await readBody(req);
  const customers = Array.isArray(body.customers) ? body.customers : [];
  if (!customers.length)
    return json(res, 400, { error: "customers must be a non-empty array" });
  const groups = clusterCustomers(customers);
  const results = await Promise.all(
    groups.map(async function (group) {
      let analysis;
      try {
        analysis = await analyzeGroup(group.representative);
      } catch (error) {
        analysis = fallbackAnalysis(group.representative);
      }
      return {
        groupId: group.id,
        customerIds: group.members.map(function (customer) {
          return customer.id;
        }),
        analysis: analysis,
      };
    }),
  );
  json(res, 200, {
    groups: results,
    groupCount: results.length,
    model: LM_STUDIO_MODEL,
    llm: results.some(function (item) {
      return item.analysis.source !== "local-fallback";
    })
      ? "lm-studio"
      : "fallback",
  });
}

const server = http.createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  } catch (error) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Invalid URL");
    return;
  }
  if (urlPath.indexOf("\0") !== -1) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Invalid URL");
    return;
  }
  if (req.method === "POST" && urlPath === "/api/analyze-groups") {
    handleAnalysis(req, res).catch(function (error) {
      json(res, 502, { error: error.message, fallback: true });
    });
    return;
  }
  const requestedPath = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = path.resolve(ROOT, "." + requestedPath);
  const relativePath = path.relative(ROOT, filePath);

  if (
    relativePath === ".." ||
    relativePath.startsWith(".." + path.sep) ||
    path.isAbsolute(relativePath)
  ) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.realpath(filePath, (realPathError, realFilePath) => {
    if (realPathError) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }
    const realRelativePath = path.relative(REAL_ROOT, realFilePath);
    if (
      realRelativePath === ".." ||
      realRelativePath.startsWith(".." + path.sep) ||
      path.isAbsolute(realRelativePath)
    ) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    fs.readFile(realFilePath, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not found");
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        "Content-Type": TYPES[ext] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log("");
  console.log("  KBC SHIFT demo");
  console.log("  → http://localhost:" + PORT);
  console.log("");
});
