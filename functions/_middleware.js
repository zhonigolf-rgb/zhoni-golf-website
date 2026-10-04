const blockedPathPrefixes = ["/.env", "/.git", "/config/", "/cgi-bin/"];

function isSensitiveProbePath(pathname) {
  return blockedPathPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export async function onRequest(context) {
  const { pathname } = new URL(context.request.url);

  if (isSensitiveProbePath(pathname)) {
    return new Response("Not found", {
      status: 404,
      headers: {
        "cache-control": "no-store",
        "content-type": "text/plain; charset=UTF-8",
      },
    });
  }

  return context.next();
}
