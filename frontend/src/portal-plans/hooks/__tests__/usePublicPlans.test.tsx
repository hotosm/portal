import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { usePublicPlans } from '../usePlans'

function wrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children)
}

const emptyList = { items: [], total: 0, page: 1, page_size: 20, organizations: [] }

describe('usePublicPlans', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends only the active filters in the query string', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => emptyList })
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => usePublicPlans({ q: 'flood', org: 'g1', page: 2 }), {
      wrapper: wrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const url = new URL(fetchMock.mock.calls[0]?.[0], 'http://localhost')
    expect(url.pathname).toBe('/api/plans/public')
    expect(url.searchParams.get('search')).toBe('flood')
    expect(url.searchParams.get('org')).toBe('g1')
    expect(url.searchParams.get('page')).toBe('2')
  })

  it('omits empty filters', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => emptyList })
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => usePublicPlans({ q: '', org: '', page: 1 }), {
      wrapper: wrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const url = new URL(fetchMock.mock.calls[0]?.[0], 'http://localhost')
    expect(url.searchParams.has('search')).toBe(false)
    expect(url.searchParams.has('org')).toBe(false)
  })

  it('exposes a server error through isError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))

    const { result } = renderHook(() => usePublicPlans({ q: '', org: '', page: 1 }), {
      wrapper: wrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 5000 })
  })
})
