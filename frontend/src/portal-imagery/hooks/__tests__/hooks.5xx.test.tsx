/**
 * Tests that portal hooks propagate 5xx errors instead of swallowing them.
 *
 * Before the fix: any non-401/403 error was caught, logged to console.error,
 * and the hook returned [] — making it impossible to distinguish "backend down"
 * from "user has no projects".
 *
 * After the fix: 5xx throws, React Query exposes it via `isError` / `error`,
 * and the UI can show a diagnostic message.
 */

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDroneProjects } from "../useDroneProjects";
import { useExportJobs } from "../../../portal-data/hooks/useExportToolData";
import { useMyMaps } from "../../../portal-data/hooks/useUMapData";

vi.mock("../../../contexts/AuthContext", () => ({
  useAuth: () => ({ isLogin: true, user: { id: "test-user", email: null, username: null, emailVerified: false }, osmConnection: null, isAuthLoading: false }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        // retryDelay: 0 so retries (defined in each hook) happen instantly in tests
        retryDelay: 0,
      },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client }, children);
  };
}

function mockFetchResponse(status: number, body = "") {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: async () => body,
    json: async () => ({}),
    headers: { get: () => "application/json" },
  } as unknown as Response);
}

// ---------------------------------------------------------------------------
// useDroneProjects
// ---------------------------------------------------------------------------

describe("useDroneProjects — error handling", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("enters error state on 500 response", async () => {
    vi.stubGlobal("fetch", mockFetchResponse(500, "Drone TM unreachable"));

    const { result } = renderHook(() => useDroneProjects(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 5000,
    });

    expect(result.current.error?.message).toContain("[500]");
  });

  it("returns empty array on 401 without entering error state", async () => {
    vi.stubGlobal("fetch", mockFetchResponse(401, "Unauthorized"));

    const { result } = renderHook(() => useDroneProjects(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true), {
      timeout: 5000,
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.isError).toBe(false);
  });

  it("enters error state on 503 response", async () => {
    vi.stubGlobal("fetch", mockFetchResponse(503, "Drone TM unavailable"));

    const { result } = renderHook(() => useDroneProjects(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 5000,
    });

    expect(result.current.error?.message).toContain("[503]");
  });
});

// ---------------------------------------------------------------------------
// useMyMaps
// ---------------------------------------------------------------------------

describe("useMyMaps — error handling", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("enters error state on 503 response", async () => {
    vi.stubGlobal("fetch", mockFetchResponse(503, "uMap unavailable"));

    const { result } = renderHook(() => useMyMaps(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 5000,
    });

    expect(result.current.error?.message).toContain("[503]");
  });

  it("returns an empty page on 401 without entering error state", async () => {
    vi.stubGlobal("fetch", mockFetchResponse(401, "Unauthorized"));

    const { result } = renderHook(() => useMyMaps(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true), {
      timeout: 5000,
    });

    expect(result.current.data).toEqual({ items: [], total: 0 });
    expect(result.current.isError).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// useExportJobs
// ---------------------------------------------------------------------------

describe("useExportJobs — error handling", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("enters error state on 500 response", async () => {
    vi.stubGlobal("fetch", mockFetchResponse(500, "Export Tool unreachable"));

    const { result } = renderHook(() => useExportJobs(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 5000,
    });

    expect(result.current.error?.message).toContain("[500]");
  });

  it("returns an empty page on 401 without entering error state", async () => {
    vi.stubGlobal("fetch", mockFetchResponse(401, "Unauthorized"));

    const { result } = renderHook(() => useExportJobs(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true), {
      timeout: 5000,
    });

    expect(result.current.data).toEqual({ items: [], total: 0 });
    expect(result.current.isError).toBe(false);
  });
});
