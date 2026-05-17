const CACHE_VERSION = "smarthire-v6";
const APP_CACHE = `${CACHE_VERSION}-app`;
const STATIC_CACHE = `${CACHE_VERSION}-static`;

const CORE_APP_FILES = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.svg",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/locales/en/translation.json",
  "/locales/es/translation.json",
  "/locales/fr/translation.json",
];

// API and upload requests are not cached because they can contain private or changing backend data.
const isApiRequest = (url) => {
  return (
    url.pathname.startsWith("/api/") || url.pathname.startsWith("/uploads/")
  );
};

// Vite stores generated production JavaScript and CSS files inside the assets folder.
const isViteAssetRequest = (url) => {
  return (
    url.origin === self.location.origin && url.pathname.startsWith("/assets/")
  );
};

// Public frontend files such as translations, icons, and manifest are safe to cache.
const isPublicStaticRequest = (url) => {
  return (
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/locales/") ||
      url.pathname.startsWith("/icons/") ||
      url.pathname === "/manifest.json" ||
      url.pathname === "/favicon.svg")
  );
};

// Static frontend files can safely use stale-while-revalidate caching.
const isStaticRequest = (request) => {
  const url = new URL(request.url);

  return (
    isViteAssetRequest(url) ||
    isPublicStaticRequest(url) ||
    ["script", "style", "font", "image", "manifest"].includes(
      request.destination,
    )
  );
};

// This response prevents the browser from receiving an invalid undefined response offline.
const offlineFallbackResponse = () => {
  return new Response(
    `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>SmartHire Offline</title>
      </head>
      <body>
        <main style="font-family: Arial, sans-serif; padding: 24px;">
          <h1>SmartHire is offline</h1>
          <p>Please open SmartHire once while online, then try offline mode again.</p>
        </main>
      </body>
    </html>`,
    {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    },
  );
};

// This safely stores a file in cache only when the network response is valid.
const cacheFile = async (cache, fileUrl) => {
  try {
    const response = await fetch(fileUrl, { cache: "reload" });

    if (response && response.ok) {
      await cache.put(fileUrl, response.clone());
    }

    return response;
  } catch (error) {
    return null;
  }
};

// This reads index.html and finds the generated Vite JavaScript and CSS files.
const extractAssetUrlsFromHtml = (html) => {
  const assetUrls = new Set();
  const assetPattern = /(?:src|href)=["']([^"']*\/assets\/[^"']+)["']/g;

  let match = assetPattern.exec(html);

  while (match) {
    const assetUrl = new URL(match[1], self.location.origin).href;

    assetUrls.add(assetUrl);
    match = assetPattern.exec(html);
  }

  return Array.from(assetUrls);
};

// This caches the app shell, public files, translations, and generated Vite assets.
const cacheAppShellAndAssets = async () => {
  const appCache = await caches.open(APP_CACHE);
  const staticCache = await caches.open(STATIC_CACHE);

  await Promise.allSettled(
    CORE_APP_FILES.map((file) => {
      return cacheFile(appCache, file);
    }),
  );

  const indexResponse = await fetch("/index.html", { cache: "reload" });

  if (!indexResponse || !indexResponse.ok) {
    return;
  }

  const indexHtml = await indexResponse.clone().text();
  const assetUrls = extractAssetUrlsFromHtml(indexHtml);

  await appCache.put("/index.html", indexResponse.clone());

  await Promise.allSettled(
    assetUrls.map((assetUrl) => {
      return cacheFile(staticCache, assetUrl);
    }),
  );
};

// Stale-while-revalidate returns cached static assets first and updates them from the network.
const staleWhileRevalidate = async (request) => {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);

  const networkResponsePromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }

      return networkResponse;
    })
    .catch(() => {
      return cachedResponse || new Response("", { status: 504 });
    });

  return cachedResponse || networkResponsePromise;
};

// Navigation requests use network first online and cached index.html offline.
const networkFirstPage = async (request) => {
  const cache = await caches.open(APP_CACHE);

  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.ok) {
      await cache.put("/index.html", networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cachedIndex = await cache.match("/index.html");

    return cachedIndex || offlineFallbackResponse();
  }
};

// The install event prepares SmartHire for offline use.
self.addEventListener("install", (event) => {
  event.waitUntil(cacheAppShellAndAssets());
  self.skipWaiting();
});

// The activate event removes old SmartHire cache versions.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => !cacheName.startsWith(CACHE_VERSION))
          .map((cacheName) => caches.delete(cacheName)),
      );
    }),
  );

  self.clients.claim();
});

// The fetch event decides whether requests should be served from cache or network.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") {
    return;
  }

  if (isApiRequest(url)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (isStaticRequest(request)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
