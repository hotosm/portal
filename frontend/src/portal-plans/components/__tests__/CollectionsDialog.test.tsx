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
  default: ({ value, onInput, onKeyDown, maxlength, placeholder, ...rest }: any) => (
    <input
      value={value}
      maxLength={maxlength}
      placeholder={placeholder}
      aria-label={rest['aria-label']}
      onChange={(e) => onInput?.({ currentTarget: e.currentTarget })}
      onKeyDown={onKeyDown}
    />
  ),
}))
vi.mock('../../../components/shared/Textarea', () => ({ default: () => <textarea /> }))
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
  description: 'Main roads',
  display_order: 0,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

function setup() {
  const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
    if (init?.method === 'PATCH') {
      const body = JSON.parse(init.body as string)
      return new Response(JSON.stringify({ ...COLLECTION, ...body }), { status: 200 })
    }
    return new Response(JSON.stringify([COLLECTION]), { status: 200 })
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
  fireEvent.click(await screen.findByRole('button', { name: 'Rename' }))
  return screen.getByLabelText('Rename') as HTMLInputElement
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('CollectionsDialog rename', () => {
  it('sends the new name and description and keeps the dialog open', async () => {
    const { fetchMock, onClose } = setup()
    const input = await openEditor()
    fireEvent.change(input, { target: { value: 'Highways' } })
    fireEvent.change(screen.getByLabelText('Edit description'), { target: { value: 'Big roads' } })
    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      const patch = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH')
      expect(patch?.[0]).toBe('/api/plans/plan-1/collections/c1')
      expect(JSON.parse(patch?.[1]?.body as string)).toEqual({ name: 'Highways', description: 'Big roads' })
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

  it('clears the description with an empty string', async () => {
    const { fetchMock } = setup()
    await openEditor()
    fireEvent.change(screen.getByLabelText('Edit description'), { target: { value: '' } })
    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      const patch = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH')
      expect(JSON.parse(patch?.[1]?.body as string)).toEqual({ name: 'Roads', description: '' })
    })
  })

  it('limits the description to 60 characters and sends no request when nothing changed', async () => {
    const { fetchMock } = setup()
    await openEditor()
    const description = screen.getByLabelText('Edit description') as HTMLInputElement
    expect(description.maxLength).toBe(60)
    fireEvent.click(screen.getByText('Save'))

    expect(await screen.findByText('Roads')).toBeTruthy()
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'PATCH')).toBe(false)
  })
})
