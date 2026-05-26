export const config = {
  runtime: "nodejs",
};

function toWebRequest(req) {
  const proto = req.headers["x-forwarded-proto"] ?? "https";
  const host = req.headers["x-forwarded-host"] ?? req.headers.host;
  const url = new URL(req.url ?? "/", `${proto}://${host}`);

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === "string") headers.set(key, value);
    else if (Array.isArray(value)) {
      headers.delete(key);
      for (const v of value) headers.append(key, v);
    }
  }

  const method = req.method ?? "GET";
  const body = method === "GET" || method === "HEAD" ? undefined : req;
  return new Request(url, { method, headers, body });
}

async function writeWebResponse(res, webResponse) {
  res.statusCode = webResponse.status;
  res.statusMessage = webResponse.statusText;

  // Basic header copy. Vercel/Node will handle compression automatically.
  webResponse.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  if (!webResponse.body) {
    res.end();
    return;
  }

  const reader = webResponse.body.getReader();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // ignore
    }
  }
  res.end();
}

async function getFetchHandler() {
  const mod = await import("../dist/server/server.js");
  const handler = mod?.default;
  if (!handler || typeof handler.fetch !== "function") {
    throw new Error("SSR handler not found. Ensure build output exists in dist/server/server.js");
  }
  return handler.fetch.bind(handler);
}

let _fetchHandlerPromise;
export default async function handler(req, res) {
  try {
    _fetchHandlerPromise ??= getFetchHandler();
    const fetchHandler = await _fetchHandlerPromise;
    const webReq = toWebRequest(req);
    const webRes = await fetchHandler(webReq);
    await writeWebResponse(res, webRes);
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end(err instanceof Error ? (err.stack ?? err.message) : "Internal Server Error");
  }
}
