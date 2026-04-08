"use client";

// Converts VAPID public key from base64url to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const ASKED_KEY = "devpath_push_asked";

export function usePushNotifications() {
  /**
   * Called after first lesson complete.
   * Requests permission once, registers SW, saves subscription to server.
   * Never shows a prompt on page load.
   */
  async function requestPermissionAfterComplete(): Promise<void> {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (!("serviceWorker" in navigator)) return;
    if (!("PushManager" in window)) return;

    // Only ask once
    if (localStorage.getItem(ASKED_KEY)) return;
    localStorage.setItem(ASKED_KEY, "true");

    // If already granted (e.g. user previously allowed), just subscribe
    if (Notification.permission === "denied") return;

    const permission =
      Notification.permission === "granted"
        ? "granted"
        : await Notification.requestPermission();

    if (permission !== "granted") return;

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) return;

    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      await navigator.serviceWorker.ready;

      const keyArray = urlBase64ToUint8Array(vapidPublicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: new Uint8Array(keyArray.buffer as ArrayBuffer),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });
    } catch {
      // Silently fail — push is non-critical
    }
  }

  /**
   * Called from settings page when user explicitly enables push.
   * Requests permission, registers SW, subscribes, saves to server.
   */
  async function subscribe(): Promise<void> {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (!("serviceWorker" in navigator)) return;
    if (!("PushManager" in window)) return;
    if (Notification.permission === "denied") return;

    const permission =
      Notification.permission === "granted"
        ? "granted"
        : await Notification.requestPermission();

    if (permission !== "granted") return;

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) return;

    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      await navigator.serviceWorker.ready;

      const keyArray = urlBase64ToUint8Array(vapidPublicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: new Uint8Array(keyArray.buffer as ArrayBuffer),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      // Mark as asked so lesson-complete flow doesn't prompt again
      localStorage.setItem(ASKED_KEY, "true");
    } catch {
      // Silently fail — push is non-critical
    }
  }

  /**
   * Called from settings page when user disables push.
   * Unsubscribes from PushManager and removes from server.
   */
  async function unsubscribe(): Promise<void> {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.getRegistration("/");
      if (!registration) return;

      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) return;

      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint }),
      });
    } catch {
      // Silently fail — push is non-critical
    }
  }

  return { requestPermissionAfterComplete, subscribe, unsubscribe };
}
