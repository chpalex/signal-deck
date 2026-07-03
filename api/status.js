export default async function handler(req, res) {
  const apiKey = process.env.CAPTIONKIT_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server not configured: missing CAPTIONKIT_API_KEY" });
  }

  try {
    const upstream = await fetch(
      `https://api.captionkit.com/v2/me/status?key=${encodeURIComponent(apiKey)}`
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
