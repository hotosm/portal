import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import CollectionsDialog from '../CollectionsDialog'

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({ isLogin: true }),
}))

vi.mock('../../../components/shared/Button', () => ({
  default: ({ children, onClick, disabled }: any) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}))
vi.mock('../../../components/shared/Input', () => ({
  default: ({ value, onInput, onKeyDown, ...rest }: any) => (
    <input
      value={value}
      aria-label={rest['aria-label']}
      onChange={(e) => onInput?.({ currentTarget: e.currentTarget })}
      onKeyDown={onKeyDown}
    />
  ),
}))
vi.mock('../../../components/shared/Textarea', () => ({
  default: ({ value, onInput, onKeyDown, ...rest }: any) => (
    <textarea
      value={value}
      aria-label={rest['aria-label']}
      onChange={(e) => onInput?.({ currentTarget: e.currentTarget })}
      onKeyDown={onKeyDown}
    />
  ),
}))
vi.mock('../../../components/shared/Icon', () => ({ default: () => null }))
vi.mock('../../../components/shared/Spinner', () => ({ default: () => <span /> }))
vi.mock('../../../components/shared/Pagination', () => ({ default: () => null }))
vi.mock('../../../components/shared/Dialog', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}))
vi.mock('../../../components/shared/Tabs', () => ({
  TabGroup: ({ children }: any) => <div>{children}</div>,
  Tab: () => null,
  TabPanel: ({ children }: any) => <div>{children}</div>,
}))

const COLLECTION = {
  id: 'c1',
  plan_id: 'plan-1',
  name: 'Roads',
  description: null as string | null,
  display_order: 0,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

function setup(collection = COLLECTION) {
  const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
    if (init?.method === 'PATCH') {
      const body = JSON.parse(init.body as string)
      return new Response(JSON.stringify({ ...collection, ...body }), { status: 200 })
    }
    return new Response(JSON.stringify([collection]), { status: 200 })
  })
  vi.stubGlobal('fetch', fetchMock)
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const onClose = vi.fn()
  render(
    <QueryClientProvider client={client}>
      <CollectionsDialog planId="plan-1" open onClose={onClose} />
    </QueryClientProvider>
  )
  return { fetchMock, onClose }
}

async function openEditor() {
  fireEvent.click(await screen.findByRole('button', { name: 'Edit' }))
  return screen.getByLabelText('Collection name') as HTMLInputElement
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('CollectionsDialog edit', () => {
  it('sends only the new name and keeps the dialog open', async () => {
    const { fetchMock, onClose } = setup()
    const input = await openEditor()
    fireEvent.change(input, { target: { value: 'Highways' } })
    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      const patch = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH')
      expect(patch?.[0]).toBe('/api/plans/plan-1/collections/c1')
      expect(JSON.parse(patch?.[1]?.body as string)).toEqual({ name: 'Highways' })
    })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('discards the draft on cancel without a request', async () => {
    const { fetchMock } = setup()
    await openEditor()
    fireEvent.click(screen.getByText('Cancel'))

    expect(await screen.findByText('Roads')).toBeTruthy()
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'PATCH')).toBe(false)
  })

  it('sends only the new description', async () => {
    const { fetchMock } = setup()
    await openEditor()
    fireEvent.change(screen.getByLabelText('Optional description'), {
      target: { value: 'Main roads' },
    })
    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      const patch = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH')
      expect(JSON.parse(patch?.[1]?.body as string)).toEqual({ description: 'Main roads' })
    })
  })

  it('sends an empty string to clear an existing description', async () => {
    const { fetchMock } = setup({ ...COLLECTION, description: 'Old' })
    await openEditor()
    fireEvent.change(screen.getByLabelText('Optional description'), { target: { value: '' } })
    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      const patch = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH')
      expect(JSON.parse(patch?.[1]?.body as string)).toEqual({ description: '' })
    })
  })

  it('does not send a request when saving without changes', async () => {
    const { fetchMock } = setup()
    await openEditor()
    fireEvent.click(screen.getByText('Save'))

    expect(await screen.findByText('Roads')).toBeTruthy()
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'PATCH')).toBe(false)
  })
})
