export const CLARITY_PROJECT_ID = "yxlrge2myo";

type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[][] };

declare global {
  interface Window {
    clarity?: ClarityFn;
  }
}

/** Loads Microsoft Clarity once. Mirrors the official snippet without inline script. */
export function loadClarity() {
  const src = "https://www.clarity.ms/tag/" + CLARITY_PROJECT_ID;
  if (window.clarity || document.querySelector(`script[src="${src}"]`)) return;

  const clarity: ClarityFn = (...args: unknown[]) => {
    (clarity.q = clarity.q || []).push(args);
  };
  window.clarity = clarity;

  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  const firstScript = document.getElementsByTagName("script")[0];
  if (firstScript?.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }
}
