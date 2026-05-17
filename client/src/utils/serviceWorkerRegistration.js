// This helper checks whether the app is running on a local development host.
const isLocalhost = () => {
  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "[::1]"
  );
};

// This function registers the service worker only after the production app loads.
export const registerServiceWorker = () => {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  // Service workers are skipped in Vite development to avoid cache confusion while coding.
  if (!import.meta.env.PROD) {
    console.info("Service worker registration is skipped during development.");
    return;
  }

  window.addEventListener("load", () => {
    const serviceWorkerUrl = "/sw.js";

    navigator.serviceWorker
      .register(serviceWorkerUrl)
      .then((registration) => {
        // updatefound helps detect when a newer service worker is being installed.
        registration.addEventListener("updatefound", () => {
          const installingWorker = registration.installing;

          if (!installingWorker) {
            return;
          }

          installingWorker.addEventListener("statechange", () => {
            if (installingWorker.state !== "installed") {
              return;
            }

            if (navigator.serviceWorker.controller) {
              console.info("A new SmartHire version is available after refresh.");
            } else {
              console.info("SmartHire is ready for offline use.");
            }
          });
        });

        if (isLocalhost()) {
          console.info("SmartHire service worker registered for local production preview.");
        }
      })
      .catch((error) => {
        console.error("Service worker registration failed:", error);
      });
  });
};

// This function is useful if the service worker needs to be removed during debugging.
export const unregisterServiceWorker = () => {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  navigator.serviceWorker.ready
    .then((registration) => {
      registration.unregister();
    })
    .catch((error) => {
      console.error("Service worker unregistration failed:", error);
    });
};