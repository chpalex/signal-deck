export const config = {
  matcher: ["/((?!api/login|api/signal|api/status|login.html).*)"],
};

async function sign(value, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function verifyCookie(cookieVal, secret) {
  if (!cookieVal) return false;
  const parts = cookieVal.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expectedSig = await sign(payload, secret);
  if (sig !== expectedSig) return false;
  try {
    const decoded = JSON.parse(atob(payload));
    if (!decoded.exp || Date.now() > decoded.exp) return false;
    return true;
  } catch (e) {
    return false;
  }
}

export default async function middleware(req) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    return new Response("Server not configured: missing AUTH_SECRET", { status: 500 });
  }

  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/sd_auth=([^;]+)/);
  const cookieVal = match ? decodeURIComponent(match[1]) : null;

  const valid = await verifyCookie(cookieVal, secret);
  if (valid) return;

  const url = new URL(req.url);
  const loginUrl = new URL("/login.html", url.origin);
  loginUrl.searchParams.set("next", url.pathname);
  return Response.redirect(loginUrl, 302);
}
