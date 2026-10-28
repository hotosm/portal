import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import PublicPlansPage from '../PublicPlansPage'
import type { PublicPlanList } from '../types'

vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => ({ currentLanguage: 'en' }),
}))
vi.mock('../components/PlanSectionHeader', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
vi.mock('../../components/shared/Icon', () => ({
  default: ({ name }: { name: string }) => <span data-icon={name} />,
}))
vi.mock('../../components/shared/Input', () => ({
  default: ({
    label,
    value,
    onInput,
  }: {
    label: string
    value?: string
    onInput?: (e: React.FormEvent<HTMLInputElement>) => void
  }) => <input aria-label={label} value={value} onInput={onInput} onChange={() => {}} />,
}))
vi.mock('../../components/shared/Select', () => ({
  default: ({ children }: { children: React.ReactNode }) => <select>{children}</select>,
}))
vi.mock('../../components/shared/Option', () => ({
  default: ({ children, value }: { children: React.ReactNode; value?: string }) => (
    <option value={value}>{children}</option>
  ),
}))
vi.mock('../../components/shared/Pagination', () => ({
  default: ({ currentPage, totalPages }: { currentPage: number; totalPages: number }) => (
    <div>{`page ${currentPage} of ${totalPages}`}</div>
  ),
}))

const longDescription = `<h1>Title</h1><p>**${'a'.repeat(150)}**</p>`

function list(overrides: Partial<PublicPlanList> = {}): PublicPlanList {
  return {
    items: [
      {
        id: 'p1',
        name: 'Flood plan',
        description: longDescription,
        project_count: 5,
        apps: ['tasking-manager', 'fair'],
        group_id: 'g1',
        group_name: 'OSM Argentina',
        owner_name: null,
        owner_slug: null,
        cover_image_url: null,
        cover_project: null,
        created_at: '2026-01-01T00:00:00Z',
      },
    ],
    total: 1,
    page: 1,
    page_size: 20,
    organizations: [{ group_id: 'g1', group_name: 'OSM Argentina' }],
    ...overrides,
  }
}

function renderPage(url: string, body: PublicPlanList) {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => body })
  vi.stubGlobal('fetch', fetchMock)
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[url]}>
        <PublicPlansPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
  return fetchMock
}

describe('PublicPlansPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders title link, plain-text truncated description, creator and count', async () => {
    renderPage('/en/plan/public', list())

    const link = await screen.findByRole('link', { name: 'Flood plan' })
    expect(link.getAttribute('href')).toBe('/en/plan/p1')
    expect(screen.getByText(`Title ${'a'.repeat(114)}...`)).toBeTruthy()
    expect(screen.queryByText('Tasking Manager', { exact: false })).toBeNull()
    expect(screen.getByText('Created by')).toBeTruthy()
    expect(screen.getAllByText('OSM Argentina').length).toBeGreaterThan(0)
    expect(screen.getByText('5')).toBeTruthy()
    expect(screen.getByText('1 public plan')).toBeTruthy()
  })

  it('reads q and page from the URL', async () => {
    const fetchMock = renderPage('/en/plan/public?q=flood&page=3', list({ total: 60, page: 3 }))

    await screen.findByText('page 3 of 5')
    const url = new URL(fetchMock.mock.calls[0]?.[0], 'http://localhost')
    expect(url.searchParams.get('search')).toBe('flood')
    expect(url.searchParams.get('page')).toBe('3')
  })

  it('narrows the visible rows by name or creator as the user types', async () => {
    renderPage(
      '/en/plan/public',
      list({
        items: [
          { ...list().items[0], id: 'p1', name: 'Flood plan', group_name: 'OSM Argentina' },
          {
            ...list().items[0],
            id: 'p2',
            name: 'Schools map',
            group_name: null,
            owner_name: 'Ana Perez',
            owner_slug: null,
          },
        ],
        total: 2,
      })
    )
    await screen.findByRole('link', { name: 'Flood plan' })
    const input = screen.getByLabelText('Search')

    fireEvent.input(input, { target: { value: 'ana' } })
    expect(screen.queryByRole('link', { name: 'Flood plan' })).toBeNull()
    expect(screen.getAllByRole('link', { name: 'Schools map' }).length).toBeGreaterThan(0)

    fireEvent.input(input, { target: { value: 'argentina' } })
    expect(screen.getAllByRole('link', { name: 'Flood plan' }).length).toBeGreaterThan(0)
    expect(screen.queryByRole('link', { name: 'Schools map' })).toBeNull()
  })

  it('falls back to page 1 for an invalid page param', async () => {
    const fetchMock = renderPage('/en/plan/public?page=abc', list())

    await screen.findByRole('link', { name: 'Flood plan' })
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const url = new URL(fetchMock.mock.calls[0]?.[0], 'http://localhost')
    expect(url.searchParams.get('page')).toBe('1')
  })

  it('shows the empty state when there are no plans', async () => {
    renderPage('/en/plan/public', list({ items: [], total: 0, organizations: [] }))

    expect(await screen.findByText('There are no public plans to show.')).toBeTruthy()
  })

  it('shows the error message when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/en/plan/public']}>
          <PublicPlansPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(
      await screen.findByText(
        'Something went wrong while loading public plans.',
        {},
        { timeout: 5000 }
      )
    ).toBeTruthy()
  })
  it('falls back to the owner name when the plan has no organization', async () => {
    const base = list().items[0]
    renderPage(
      '/en/plan/public',
      list({ items: [{ ...base, group_id: null, group_name: null, owner_name: 'andre' }] })
    )

    expect(await screen.findByText('andre')).toBeTruthy()
  })

  it('links the creator to their public profile only when they have one', async () => {
    const base = list().items[0]
    renderPage(
      '/en/plan/public',
      list({
        items: [
          { ...base, id: 'a', name: 'A', group_name: null, owner_name: 'Ana', owner_slug: 'ana' },
          { ...base, id: 'b', name: 'B', group_name: null, owner_name: 'Bob', owner_slug: null },
          {
            ...base,
            id: 'c',
            name: 'C',
            group_name: 'Red Cross',
            owner_name: 'Cy',
            owner_slug: 'cy',
          },
        ],
        total: 3,
      })
    )

    const link = await screen.findByRole('link', { name: 'Ana' })
    expect(link.getAttribute('href')).toBe('/en/people/ana')
    expect(screen.queryByRole('link', { name: 'Bob' })).toBeNull()
    expect(screen.getAllByText('Bob').length).toBeGreaterThan(0)
    expect(screen.queryByRole('link', { name: 'Red Cross' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Cy' })).toBeNull()
  })

  it('keeps the description on a single line', async () => {
    renderPage('/en/plan/public', list())

    const description = await screen.findByText(`Title ${'a'.repeat(114)}...`)
    expect(description.className).toContain('truncate')
  })

  it('switches between list and grid from the URL view param', async () => {
    renderPage('/en/plan/public?view=grid', list())

    const gridButton = await screen.findByRole('button', { name: 'Grid view' })
    expect(gridButton.getAttribute('aria-pressed')).toBe('true')
    expect(await screen.findByText('Showing 1 of 1 plans')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'List view' }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'List view' }).getAttribute('aria-pressed')).toBe(
        'true'
      )
    )
  })

  it('renders the plan cover image and a gray placeholder when there is none', async () => {
    const base = list().items[0]
    renderPage(
      '/en/plan/public?view=grid',
      list({
        items: [
          { ...base, id: 'a', name: 'With cover', cover_image_url: '/img/a.png' },
          { ...base, id: 'b', name: 'No cover' },
        ],
        total: 2,
      })
    )

    await screen.findAllByText('With cover')
    expect(document.querySelector('img[src="/img/a.png"]')).toBeTruthy()
    expect(document.querySelectorAll('.bg-hot-gray-300').length).toBe(1)
  })
  it('truncates long titles to one line', async () => {
    renderPage('/en/plan/public', list())

    const link = await screen.findByRole('link', { name: 'Flood plan' })
    expect(link.className).toContain('truncate')
  })

  it('falls back to the project map when the plan image fails to load', async () => {
    const base = list().items[0]
    renderPage(
      '/en/plan/public?view=grid',
      list({
        items: [
          {
            ...base,
            cover_image_url: '/img/broken.png',
            cover_project: { app: 'open-aerial-map', data: { thumbnail: '/img/map.png' } },
          },
        ],
      })
    )

    await screen.findAllByText('Flood plan')
    const image = document.querySelector('img[src="/img/broken.png"]') as HTMLImageElement
    fireEvent.error(image)

    await waitFor(() => expect(document.querySelector('img[src="/img/map.png"]')).toBeTruthy())
    fireEvent.error(document.querySelector('img[src="/img/map.png"]') as HTMLImageElement)
    await waitFor(() => expect(document.querySelectorAll('.bg-hot-gray-300').length).toBe(1))
  })
})
