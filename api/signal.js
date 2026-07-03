export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.CAPTIONKIT_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server not configured: missing CAPTIONKIT_API_KEY" });
  }

  const { event, value } = req.body || {};
  if (!event) {
    return res.status(400).json({ error: "Missing 'event' in request body" });
  }

  const payload = { event };
  if (value) payload.value = value;

  try {
    const upstream = await fetch(
      `https://api.captionkit.com/v2/signal?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const contentType = upstream.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await upstream.json()
      : await upstream.text();

    res.status(upstream.status).json(
      typeof body === "string" ? { message: body } : body
    );
  } catch (err) {
    res.status(502).json({ error: "Upstream request failed", details: err.message });
  }
}
