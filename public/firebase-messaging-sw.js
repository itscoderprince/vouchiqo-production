/**
 * Firebase Cloud Messaging Service Worker
 *
 * Served from the root domain at /firebase-messaging-sw.js
 * Handles background push messages when the app is not in focus.
 *
 * IMPORTANT: Uses compat SDK (v8 API) as required by FCM service workers.
 * The config values are injected via NEXT_PUBLIC_ env vars at build time
 * using next.config.mjs's env injection — these are public/safe values.
 */

// Import Firebase compat SDKs from CDN
importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js");

// Firebase config — these are NEXT_PUBLIC_ values (safe to expose in browser/SW)
// They will be replaced at build time via next.config.mjs env configuration
const firebaseConfig = {
  apiKey: "NEXT_PUBLIC_FIREBASE_API_KEY_PLACEHOLDER",
  authDomain: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_PLACEHOLDER",
  projectId: "NEXT_PUBLIC_FIREBASE_PROJECT_ID_PLACEHOLDER",
  storageBucket: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_PLACEHOLDER",
  messagingSenderId: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_PLACEHOLDER",
  appId: "NEXT_PUBLIC_FIREBASE_APP_ID_PLACEHOLDER",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

/**
 * Background message handler.
 *
 * Firebase automatically shows a notification if the payload contains
 * a `notification` field. We return early in that case to prevent
 * double/duplicate notifications (browser already handles it natively).
 *
 * We only call showNotification() for data-only payloads.
 */
messaging.onBackgroundMessage((payload) => {
  // Guard: if payload has a notification object, browser handles it natively
  if (payload.notification) {
    return;
  }

  // Data-only payload — we must show the notification manually
  const data = payload.data || {};
  const title = data.title || "Vouchiqo";
  const body = data.body || "You have a new update";

  const notificationOptions = {
    body,
    icon: data.icon || "/navbarlogovouchiqo.webp",
    badge: data.badge || "/navbarlogovouchiqo.webp",
    tag: data.tag || "vouchiqo-push",
    renotify: true,
    data: {
      url: data.url || "/",
    },
    ...(data.image ? { image: data.image } : {}),
  };

  self.registration.showNotification(title, notificationOptions);
});

/**
 * Notification click handler.
 *
 * Priority:
 * 1. Focus existing open tab if URL matches
 * 2. Navigate existing tab to target URL
 * 3. Open a new window/tab if none exist
 */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";
  const fullUrl = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Try to find an already-open tab on our domain
        for (const client of clientList) {
          if (client.url === fullUrl && "focus" in client) {
            return client.focus();
          }
        }

        // Fallback: navigate any open tab to the target URL
        for (const client of clientList) {
          if ("navigate" in client) {
            return client.navigate(fullUrl).then((c) => c && c.focus());
          }
        }

        // Last resort: open a new window
        if (clients.openWindow) {
          return clients.openWindow(fullUrl);
        }
      }),
  );
});
