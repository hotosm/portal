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
import { useOAMImagery } from "../useOAMImagery";
import { useDroneProjects } from "../useDroneProjects";

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
// useOAMImagery
// ---------------------------------------------------------------------------

describe("useOAMImagery — error handling", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("enters error state (isError=true) on 500 response", async () => {
    vi.stubGlobal("fetch", mockFetchResponse(500, "Internal Server Error"));

    const { result } = renderHook(() => useOAMImagery(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 5000,
    });

    expect(result.current.error?.message).toContain("[500]");
  });

  it("returns empty array on 401 (unauthenticated — expected state)", async () => {
    vi.stubGlobal("fetch", mockFetchResponse(401, "Unauthorized"));

    const { result } = renderHook(() => useOAMImagery(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true), {
      timeout: 5000,
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.isError).toBe(false);
  });

  it("returns empty array on 403 (forbidden — expected state)", async () => {
    vi.stubGlobal("fetch", mockFetchResponse(403, "Forbidden"));

    const { result } = renderHook(() => useOAMImagery(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true), {
      timeout: 5000,
    });

    expect(result.current.data).toEqual([]);
  });

  it("returns empty array on 400 (no email — expected state for OAM)", async () => {
    vi.stubGlobal("fetch", mockFetchResponse(400, "Bad Request"));

    const { result } = renderHook(() => useOAMImagery(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true), {
      timeout: 5000,
    });

    expect(result.current.data).toEqual([]);
  });

  it("error message contains the HTTP status code for diagnostics", async () => {
    vi.stubGlobal("fetch", mockFetchResponse(503, "Service Unavailable"));

    const { result } = renderHook(() => useOAMImagery(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 5000,
    });

    expect(result.current.error?.message).toContain("[503]");
  });
});

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
});
