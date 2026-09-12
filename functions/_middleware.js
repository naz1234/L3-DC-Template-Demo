const responseHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Content-Type': 'application/json; charset=utf-8',
};

const unsafeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function isSameOriginMutation(request) {
  if (!unsafeMethods.has(request.method)) return true;
  if (request.headers.get('Origin') !== new URL(request.url).origin) return false;

  const fetchSite = request.headers.get('Sec-Fetch-Site');
  return !fetchSite || fetchSite === 'same-origin';
}

export function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // Retire old login endpoints even when stale auth settings remain on Pages.
  // No requests should reach the former PIN service.
  if (url.pathname === '/api/auth' || url.pathname.startsWith('/api/auth/')
    || url.pathname.startsWith('/auth/')) {
    return new Response(JSON.stringify({
      ok: false,
      error: 'Login has been removed. Open the application directly.',
    }), { status: 410, headers: responseHeaders });
  }

  if (['GET', 'HEAD'].includes(request.method)
    && /^\/login(?:\.html)?\/?$/.test(url.pathname)) {
    return new Response(null, {
      status: 302,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Location: '/',
      },
    });
  }

  // The app is public; keep the existing same-origin rule for writes.
  if (!isSameOriginMutation(request)) {
    return new Response(JSON.stringify({
      ok: false,
      error: 'Cross-site requests are not allowed.',
    }), { status: 403, headers: responseHeaders });
  }

  return context.next();
}
