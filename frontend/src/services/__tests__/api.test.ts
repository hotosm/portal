/**
 * Unit tests for buildApiEndpoint utility.
 *
 * Verifies the fix for the /api/api/ double-prefix bug: when VITE_API_URL
 * already ends with /api, the function must not append /api again.
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { buildApiEndpoint } from "../api";

describe("buildApiEndpoint", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  // --- no VITE_API_URL set ---

  it("falls back to /api when VITE_API_URL is empty", () => {
    vi.stubEnv("VITE_API_URL", "");
    expect(buildApiEndpoint("/homepage-map/projects/snapshot")).toBe(
      "/api/homepage-map/projects/snapshot",
    );
  });

  it("adds leading slash to path when missing", () => {
    vi.stubEnv("VITE_API_URL", "");
    expect(buildApiEndpoint("homepage-map/projects/snapshot")).toBe(
      "/api/homepage-map/projects/snapshot",
    );
  });

  // --- VITE_API_URL set without /api suffix ---

  it("appends /api when VITE_API_URL has no /api suffix", () => {
    vi.stubEnv("VITE_API_URL", "https://dev.portal.hotosm.org");
    expect(buildApiEndpoint("/health")).toBe(
      "https://dev.portal.hotosm.org/api/health",
    );
  });

  // --- VITE_API_URL already ends with /api (the double-prefix bug) ---

  it("does NOT double /api when VITE_API_URL already ends with /api", () => {
    vi.stubEnv("VITE_API_URL", "https://dev.portal.hotosm.org/api");
    const url = buildApiEndpoint("/health");
    expect(url).toBe("https://dev.portal.hotosm.org/api/health");
    expect(url).not.toContain("/api/api/");
  });

  it("is case-insensitive when checking /api suffix", () => {
    vi.stubEnv("VITE_API_URL", "https://dev.portal.hotosm.org/API");
    const url = buildApiEndpoint("/health");
    expect(url).toBe("https://dev.portal.hotosm.org/API/health");
    expect(url).not.toContain("/API/api/");
  });

  it("strips trailing slash before building the URL", () => {
    vi.stubEnv("VITE_API_URL", "https://dev.portal.hotosm.org/api/");
    const url = buildApiEndpoint("/health");
    expect(url).toBe("https://dev.portal.hotosm.org/api/health");
    expect(url).not.toContain("//health");
  });

  // --- real-world URL used by the snapshot endpoint ---

  it("builds the homepage-map snapshot URL correctly with no env var", () => {
    vi.stubEnv("VITE_API_URL", "");
    expect(buildApiEndpoint("/homepage-map/projects/snapshot")).toBe(
      "/api/homepage-map/projects/snapshot",
    );
  });
});
