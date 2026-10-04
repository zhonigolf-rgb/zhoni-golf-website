const blockedSpaFallbackPrefixes = ["/.env", "/.git", "/config/", "/cgi-bin/"];

function isBlockedSpaFallbackPath(pathname) {
  return blockedSpaFallbackPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const acceptsHtml = request.headers.get("accept")?.includes("text/html");
    const { pathname } = new URL(request.url);

    if (
      response.status !== 404 ||
      !acceptsHtml ||
      !["GET", "HEAD"].includes(request.method) ||
      isBlockedSpaFallbackPath(pathname)
    ) {
      return response;
    }

    const indexUrl = new URL(request.url);
    indexUrl.pathname = "/index.html";
    indexUrl.search = "";
    return env.ASSETS.fetch(new Request(indexUrl, request));
  },
};
