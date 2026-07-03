export const config = {
  matcher: ["/((?!api/signal|api/status).*)"],
};

export default function middleware(req) {
  const auth = req.headers.get("authorization");
  const user = process.env.SITE_USERNAME;
  const pass = process.env.SITE_PASSWORD;

  if (!user || !pass) {
    return new Response(
      "Server not configured: missing SITE_USERNAME or SITE_PASSWORD",
      { status: 500 }
    );
  }

  if (auth) {
    const [scheme, encoded] = auth.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      const [reqUser, reqPass] = decoded.split(":");
      if (reqUser === user && reqPass === pass) {
        return;
      }
    }
  }

  return new Response("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Signal Deck"' },
  });
}
