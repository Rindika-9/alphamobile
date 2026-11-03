import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";

/** True inside the Android app (Capacitor), false on the website. */
export const isNative = Capacitor.isNativePlatform();

const EXTERNAL_SCHEMES = /^(upi|tel|mailto|sms|whatsapp|intent|market|geo):/i;

/**
 * Opens a link outside the app. Inside the Android WebView, navigating to a
 * URL that isn't the app's own origin is handed to Android as an
 * ACTION_VIEW intent by Capacitor, so `upi://` shows the UPI app chooser,
 * `tel:` opens the dialer, and wa.me / instagram.com open their apps (or the
 * browser).
 */
export function openExternal(url: string) {
  if (isNative) {
    window.location.href = url;
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function isExternalHref(href: string): boolean {
  if (EXTERNAL_SCHEMES.test(href)) return true;
  try {
    const u = new URL(href, window.location.href);
    return (u.protocol === "http:" || u.protocol === "https:") && u.origin !== window.location.origin;
  } catch {
    return false;
  }
}

/**
 * One-time native setup. `onBack` is called for the Android back button and
 * returns true if it handled it (otherwise the app exits).
 */
export function initNative(onBack: () => boolean) {
  if (!isNative) return () => {};

  StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
  StatusBar.setBackgroundColor({ color: "#0B1D3A" }).catch(() => {});
  SplashScreen.hide().catch(() => {});

  // Links with target="_blank" / external hosts / upi:, tel:, mailto: → outside the app.
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented) return;
    const a = (e.target as HTMLElement | null)?.closest?.("a");
    const href = a?.getAttribute("href");
    if (!a || !href || href === "#" || href.startsWith("#")) return;
    if (isExternalHref(href)) {
      e.preventDefault();
      openExternal(a.href || href);
    }
  };
  document.addEventListener("click", onClick, true);

  // window.open(...) has no new window inside the WebView.
  const originalOpen = window.open;
  window.open = ((url?: string | URL) => {
    if (url) openExternal(String(url));
    return null;
  }) as typeof window.open;

  const sub = CapApp.addListener("backButton", () => {
    if (!onBack()) CapApp.exitApp();
  });

  return () => {
    document.removeEventListener("click", onClick, true);
    window.open = originalOpen;
    sub.then(h => h.remove()).catch(() => {});
  };
}
