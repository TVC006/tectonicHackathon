# KBC SHIFT

> From personalized banking to situational banking.

Hackathon proof of concept — not a production banking app.

## Run

```bash
node server.js
```

Open [http://localhost:3000](http://localhost:3000).

The situation analysis uses a local LM Studio server when available. The demo remains usable with a local fallback when LM Studio is offline.

## LM Studio and scalable grouping

Start LM Studio's local server with `google/gemma-4-e4b` loaded. The app uses `http://127.0.0.1:1234/v1/chat/completions` and defaults to that model. Configure a different endpoint or model with:

```powershell
$env:LM_STUDIO_URL = "http://127.0.0.1:1234/v1/chat/completions"
$env:LM_STUDIO_MODEL = "google/gemma-4-e4b"
node server.js
```

`POST /api/analyze-groups` accepts `{ "customers": [{ "id": "...", "transactions": [...] }] }`. The implementation is customer-agnostic: the demo data is only an example input and the classifier does not depend on a person's name.

### Mathematical grouping model

For every customer, the server builds a feature vector containing total amount, average transaction amount, transaction count, activity time span and a set of normalized signal tokens. Two customers receive a weighted distance:

```text
d = 0.32 * rel(total) + 0.18 * rel(average)
	+ 0.16 * rel(count) + 0.14 * timeSpan
	+ 0.20 * (1 - Jaccard(tokens))
similarity = 1 - min(1, d)
```

`rel(a,b) = |a-b| / max(|a|, |b|, 1)` prevents large amounts from dominating the comparison. The time component is capped at 30 days, so nearby periods remain comparable. `Jaccard(tokens) = |A ∩ B| / |A ∪ B|` measures semantic overlap between merchant, category and signal words. Customers are placed in the same group when similarity is at least `0.48`; therefore amounts and dates may differ while the combined pattern still matches. Only the aggregate representative of each group is sent to the AI model. The returned event and confidence are cached by a SHA-256 fingerprint of that representative and reused for all group members.

## 60-second demo

1. Start LM Studio with a loaded model and set `LM_STUDIO_MODEL` to its model identifier.
2. Start the app with `node server.js` and open `http://localhost:3000`.
3. Use an example account containing a housing payment, home purchases and a mobility payment. Keep the amounts and dates slightly different between example customers.
4. **Connect the signals** → the model returns an event and confidence for the detected group.
5. Confirm the suggested situation.
6. **Moving Mode** opens.
7. Demonstrate one banking action, then show the persona strip to explain that one engine handles many situations.

For a convincing scalability demo, prepare 6–10 customer records: three with similar housing/mobility patterns, three with salary/start-work patterns, and one or two unrelated records. Change amounts by 10–20% and dates by a few days. Explain that the local algebra groups the records first, so the AI is called once per distinct group rather than once per customer. When LM Studio is unavailable, the UI remains demonstrable through the local fallback.

Demo controls (bottom-right): **Reset demo** · **Skip to Moving Mode**
