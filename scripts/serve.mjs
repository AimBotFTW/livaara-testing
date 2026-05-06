import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

function getPort() {
  const raw = process.env.PORT
  const port = raw ? Number(raw) : 3000
  return Number.isFinite(port) ? port : 3000
}

const distClientDir = fileURLToPath(new URL('../dist/client', import.meta.url))

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  switch (ext) {
    case '.css':
      return 'text/css; charset=utf-8'
    case '.js':
      return 'text/javascript; charset=utf-8'
    case '.mjs':
      return 'text/javascript; charset=utf-8'
    case '.map':
      return 'application/json; charset=utf-8'
    case '.json':
      return 'application/json; charset=utf-8'
    case '.svg':
      return 'image/svg+xml'
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.webp':
      return 'image/webp'
    case '.avif':
      return 'image/avif'
    case '.ico':
      return 'image/x-icon'
    case '.txt':
      return 'text/plain; charset=utf-8'
    default:
      return 'application/octet-stream'
  }
}

function tryServeStatic(req, res) {
  const method = req.method ?? 'GET'
  if (method !== 'GET' && method !== 'HEAD') return false

  const host = req.headers.host ?? 'localhost'
  const url = new URL(req.url ?? '/', `http://${host}`)

  // TanStack Start/Vite emits assets under `/assets/*` in `dist/client/assets/*`.
  // Also allow direct files like `/favicon.ico` if present later.
  const pathname = decodeURIComponent(url.pathname)
  if (!pathname.startsWith('/assets/') && pathname !== '/favicon.ico' && pathname !== '/robots.txt') {
    return false
  }

  const onDisk = path.normalize(path.join(distClientDir, pathname))
  if (!onDisk.startsWith(distClientDir + path.sep)) return false

  if (!fs.existsSync(onDisk) || !fs.statSync(onDisk).isFile()) return false

  res.statusCode = 200
  res.setHeader('content-type', contentTypeFor(onDisk))
  res.setHeader('cache-control', 'public, max-age=31536000, immutable')

  if (method === 'HEAD') {
    res.end()
    return true
  }

  fs.createReadStream(onDisk).pipe(res)
  return true
}

function toWebRequest(req) {
  const host = req.headers.host ?? 'localhost'
  const url = new URL(req.url ?? '/', `http://${host}`)

  // Node provides incoming headers as string|string[]|undefined; the Web
  // `Headers` object accepts string values (and repeated keys via append).
  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') {
      headers.set(key, value)
    } else if (Array.isArray(value)) {
      headers.delete(key)
      for (const v of value) headers.append(key, v)
    }
  }

  // For GET/HEAD there is no body. For others, stream the request body through.
  const method = req.method ?? 'GET'
  const body = method === 'GET' || method === 'HEAD' ? undefined : req

  return new Request(url, { method, headers, body })
}

async function writeWebResponse(res, webResponse) {
  res.statusCode = webResponse.status
  res.statusMessage = webResponse.statusText

  webResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      // Node wants set-cookie as a string[] when multiple are present.
      const cookies = webResponse.headers.getSetCookie?.() ?? [value]
      res.setHeader('set-cookie', cookies)
      return
    }
    res.setHeader(key, value)
  })

  if (!webResponse.body) {
    res.end()
    return
  }

  // Convert WHATWG ReadableStream -> Node response.
  const reader = webResponse.body.getReader()
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      res.write(Buffer.from(value))
    }
  } finally {
    try {
      reader.releaseLock()
    } catch {
      // ignore
    }
  }
  res.end()
}

async function getFetchHandler() {
  // Build output: `dist/server/server.js` exports default `{ fetch(req): Response }`
  const mod = await import(new URL('../dist/server/server.js', import.meta.url))
  const handler = mod?.default
  if (!handler || typeof handler.fetch !== 'function') {
    throw new Error('SSR handler not found. Did you run `npm run build`?')
  }
  return handler.fetch.bind(handler)
}

const fetchHandler = await getFetchHandler()
const port = getPort()

const server = http.createServer(async (req, res) => {
  try {
    if (tryServeStatic(req, res)) return
    const webReq = toWebRequest(req)
    const webRes = await fetchHandler(webReq)
    await writeWebResponse(res, webRes)
  } catch (err) {
    res.statusCode = 500
    res.setHeader('content-type', 'text/plain; charset=utf-8')
    res.end(err instanceof Error ? err.stack ?? err.message : 'Internal Server Error')
  }
})

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`)
})
