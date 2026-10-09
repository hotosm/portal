import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { planQueryKeys } from '../queryKeys'
import { useRemoveProject, useRemoveProjects } from '../useCollections'

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({ isLogin: true }),
}))

const PLAN_ID = 'plan-1'

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const invalidate = vi.spyOn(client, 'invalidateQueries')
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children)
  return { client, invalidate, wrapper }
}

function deferredFetch() {
  const resolvers: Array<() => void> = []
  const fetchMock = vi.fn(
    () =>
      new Promise<Response>((resolve) => {
        resolvers.push(() => resolve(new Response(null, { status: 204 })))
      })
  )
  vi.stubGlobal('fetch', fetchMock)
  return { fetchMock, resolvers }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('plan project removal', () => {
  it('refetches the plan once, after the last concurrent removal settles', async () => {
    const { invalidate, wrapper } = setup()
    const { resolvers } = deferredFetch()
    const { result } = renderHook(() => useRemoveProject(PLAN_ID), { wrapper })

    act(() => {
      result.current.mutate('a')
      result.current.mutate('b')
    })
    await waitFor(() => expect(resolvers).toHaveLength(2))

    await act(async () => resolvers[0]?.())
    expect(invalidate).not.toHaveBeenCalled()

    await act(async () => resolvers[1]?.())
    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith({ queryKey: planQueryKeys.detail(PLAN_ID) })
    )
    expect(
      invalidate.mock.calls.filter(
        ([filters]) =>
          JSON.stringify(filters?.queryKey) === JSON.stringify(planQueryKeys.detail(PLAN_ID))
      )
    ).toHaveLength(1)
  })

  it('does not let an in-flight plan read restore removed projects', async () => {
    const { client, wrapper } = setup()
    const detailKey = planQueryKeys.detail(PLAN_ID)
    client.setQueryData(detailKey, { projects: [{ id: 'a' }, { id: 'b' }] })

    let finishRead: (value: unknown) => void = () => {}
    const read = client.fetchQuery({
      queryKey: detailKey,
      staleTime: 0,
      queryFn: () =>
        new Promise((resolve) => {
          finishRead = resolve
        }),
    })
    const settledRead = read.catch(() => undefined)

    deferredFetch()
    const { result } = renderHook(() => useRemoveProject(PLAN_ID), { wrapper })

    client.setQueryData(detailKey, { projects: [{ id: 'b' }] })
    act(() => {
      result.current.mutate('a')
    })
    await waitFor(() => expect(result.current.isPending).toBe(true))
    finishRead({ projects: [{ id: 'a' }, { id: 'b' }] })
    await settledRead

    expect(client.getQueryData<{ projects: unknown[] }>(detailKey)?.projects).toEqual([{ id: 'b' }])
  })

  it('posts every id in a single request for a bulk removal', async () => {
    const { wrapper } = setup()
    const { fetchMock, resolvers } = deferredFetch()
    const { result } = renderHook(() => useRemoveProjects(PLAN_ID), { wrapper })

    act(() => {
      result.current.mutate(['a', 'b', 'c'])
    })
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe(`/api/plans/${PLAN_ID}/projects/remove`)
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toEqual({ ids: ['a', 'b', 'c'] })
    await act(async () => resolvers[0]?.())
  })
})
