const crypto = require("crypto");

function sign(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method not allowed");
    return;
  }

  const secret = process.env.AUTH_SECRET;
  const validUser = process.env.SITE_USERNAME;
  const validPass = process.env.SITE_PASSWORD;

  if (!secret || !validUser || !validPass) {
    res.status(500).send("Server not configured");
    return;
  }

  let body = "";
  await new Promise((resolve) => {
    req.on("data", (chunk) => (body += chunk));
    req.on("end", resolve);
  });

  const params = new URLSearchParams(body);
  const username = params.get("username") || "";
  const password = params.get("password") || "";
  const next = params.get("next") || "/";

  if (username !== validUser || password !== validPass) {
    res.writeHead(302, { Location: "/login.html?error=1&next=" + encodeURIComponent(next) });
    res.end();
    return;
  }

  const exp = Date.now() + 1000 * 60 * 60 * 24 * 14; // 14 days
  const payload = Buffer.from(JSON.stringify({ u: username, exp })).toString("base64");
  const sig = sign(payload, secret);
  const cookieVal = `${payload}.${sig}`;

  res.setHeader(
    "Set-Cookie",
    `sd_auth=${encodeURIComponent(cookieVal)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=1209600`
  );
  res.writeHead(302, { Location: next });
  res.end();
};
