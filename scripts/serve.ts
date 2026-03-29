const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".js.map": "application/json",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function getMime(path: string): string {
  for (const [ext, mime] of Object.entries(MIME_TYPES)) {
    if (path.endsWith(ext)) return mime;
  }
  return "text/plain";
}

Deno.serve({ port: 8000 }, async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const path = url.pathname === "/" ? "/index.html" : url.pathname;

  try {
    const file = await Deno.readFile(`./web${path}`);
    return new Response(file, {
      headers: {
        "content-type": getMime(path),
        "cache-control": "no-cache",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
});

console.log("🌐 Playground running at http://localhost:8000");
