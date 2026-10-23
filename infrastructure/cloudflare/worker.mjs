// Deploy as a Worker Route in front of the existing Tunnel DNS record.
export const fallbackHtml = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><meta name="theme-color" content="#080808"><title>CineVault Dashboard</title>
<style>*{box-sizing:border-box}body{margin:0;min-height:100svh;display:grid;place-items:center;padding:24px;background:radial-gradient(ellipse at top,#2c2415,transparent 65%),#080808;color:#eee;font-family:Arial,sans-serif}main{max-width:560px;width:100%;padding:48px 32px;border:1px solid #66512d;border-top:2px solid #e5b354;border-radius:12px;background:#191919;text-align:center}.brand{color:#e5b354;letter-spacing:.25em;font-weight:bold;font-size:13px}svg{display:block;width:80px;height:80px;margin:28px auto;color:#e5b354}h1{font-size:clamp(28px,6vw,40px);line-height:1.15;margin:0 0 18px;letter-spacing:-1px}p{color:#bbb;line-height:1.7}a{display:inline-block;margin-top:18px;padding:13px 24px;border:1px solid #e5b354;border-radius:5px;color:#e5b354;text-decoration:none}a:focus-visible{outline:2px solid #fff;outline-offset:5px}</style></head>
<body><main><div class="brand">CINEVAULT</div><svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><circle cx="40" cy="40" r="34"/><circle cx="40" cy="40" r="20"/><circle cx="40" cy="40" r="5"/><path d="M40 20v15m-4 8L23 50m21-7 13 7"/></svg><h1>The vault is taking an intermission.</h1><p>The dashboard is temporarily unavailable.<br>Please check back shortly.</p><a href="/">Try again</a></main></body></html>`;

function unavailable(request, document = false) {
  return new Response(request.method === "HEAD" ? null : document ? fallbackHtml : "Temporarily unavailable", {
    status: 503,
    headers: {
      "Content-Type": document ? "text/html; charset=utf-8" : "text/plain; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "Retry-After": "60",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
    },
  });
}

export async function handleRequest(request, fetchOrigin = fetch, timeoutMs = 8000) {
  const url = new URL(request.url);
  const document = ["GET", "HEAD"].includes(request.method) && url.pathname === "/" &&
    request.headers.get("accept")?.includes("text/html") && !request.headers.has("rsc") &&
    !request.headers.has("next-router-prefetch");
  // Asset, API and React-stream requests must never receive an HTML fallback.
  if (!document) {
    try { return await fetchOrigin(request); } catch { return unavailable(request); }
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchOrigin(request, { signal: controller.signal, redirect: "manual" });
    if (response.status < 500) return response;
    await response.body?.cancel();
    return unavailable(request, true);
  } catch {
    return unavailable(request, true);
  } finally {
    clearTimeout(timer);
  }
}

const worker = { fetch: request => handleRequest(request) };
export default worker;
