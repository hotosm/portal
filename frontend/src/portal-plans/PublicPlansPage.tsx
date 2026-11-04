import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Input from '../components/shared/Input'
import PageWrapper from '../components/shared/PageWrapper'
import Pagination from '../components/shared/Pagination'
import { useLanguage } from '../contexts/LanguageContext'
import { m } from '../paraglide/messages'
import { toPlainText } from '../utils/plainText'
import PlanSectionHeader from './components/PlanSectionHeader'
import PublicPlanCard from './components/PublicPlanCard'
import ViewToggle, { type PlanView } from './components/ViewToggle'
import { PUBLIC_PLANS_PAGE_SIZE, usePublicPlans } from './hooks'
import type { PublicPlanSummary } from './types'

const DESCRIPTION_MAX_LENGTH = 120
const SEARCH_DEBOUNCE_MS = 300

function truncateDescription(description: string | null): string {
  const text = toPlainText(description ?? '')
  if (text.length <= DESCRIPTION_MAX_LENGTH) return text
  return `${text.slice(0, DESCRIPTION_MAX_LENGTH)}...`
}

function matchesSearch(plan: PublicPlanSummary, needle: string): boolean {
  if (!needle) return true
  const createdBy = plan.group_name ?? plan.owner_name ?? ''
  return plan.name.toLowerCase().includes(needle) || createdBy.toLowerCase().includes(needle)
}

const VIEW_FADE_CLASSES = 'transition-opacity duration-300 motion-reduce:transition-none'

function parseView(value: string | null): PlanView {
  return value === 'card' ? 'card' : 'list'
}

function parsePage(value: string | null): number {
  const page = Number.parseInt(value ?? '', 10)
  return Number.isFinite(page) && page >= 1 ? page : 1
}

function PlanAuthor({ plan }: { plan: PublicPlanSummary }) {
  const { currentLanguage } = useLanguage()
  return plan.owner_slug && plan.group_name == null ? (
    <Link
      to={`/${currentLanguage}/people/${plan.owner_slug}`}
      className="text-hot-neutral-800 no-underline hover:underline"
    >
      {plan.owner_name}
    </Link>
  ) : plan.group_name != null && plan.group_slug ? (
    <Link
      to={`/${currentLanguage}/org/${plan.group_slug}`}
      className="text-hot-neutral-800 no-underline hover:underline"
    >
      {plan.group_name}
    </Link>
  ) : (
    <>{plan.group_name ?? plan.owner_name}</>
  )
}

function PublicPlansPage() {
  const { currentLanguage } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const page = parsePage(searchParams.get('page'))
  const view = parseView(searchParams.get('view'))

  const [searchText, setSearchText] = useState(q)
  const { data, isLoading, isError, isPlaceholderData } = usePublicPlans({ q, page })

  // Keep the input in sync when the URL changes from outside (back/forward).
  useEffect(() => {
    setSearchText(q)
  }, [q])

  useEffect(() => {
    const trimmed = searchText.trim()
    if (trimmed === q) return
    const timer = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (trimmed) next.set('q', trimmed)
        else next.delete('q')
        next.delete('page')
        return next
      })
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [searchText, q, setSearchParams])

  const setView = (value: PlanView) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value === 'card') next.set('view', 'card')
      else next.delete('view')
      return next
    })
  }

  const setPage = (value: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value > 1) next.set('page', String(value))
      else next.delete('page')
      return next
    })
  }

  // The server query is debounced, so narrow the rows already on screen as the
  // user types and let the server result replace them once it arrives.
  const needle = searchText.trim().toLowerCase()
  const isSearching = needle !== q.toLowerCase() || isPlaceholderData
  const loadedPlans = data?.items
  const plans = useMemo(
    () => (loadedPlans ?? []).filter((plan) => matchesSearch(plan, needle)),
    [loadedPlans, needle]
  )
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / PUBLIC_PLANS_PAGE_SIZE)

  return (
    <>
      <PlanSectionHeader
        buttonText={m.plan_public_see_my_plans()}
        buttonLink={`/${currentLanguage}/plan`}
        breadcrumbs={[
          { label: m.plan_header(), href: `/${currentLanguage}/plan` },
          { label: m.plan_public_title() },
        ]}
      >
        <strong>{m.plan_public_title()}</strong>
      </PlanSectionHeader>

      <PageWrapper>
        <p className="mb-lg max-w-5xl">{m.plan_public_intro()}</p>

        {data && (
          <p className="mb-lg text-sm text-hot-gray-500">
            {total === 1 ? m.plan_public_count_one() : m.plan_public_count({ count: total })}
          </p>
        )}

        <div className="mb-lg flex flex-col gap-md md:flex-row md:items-end">
          <div className="w-full md:w-[380px]">
            <Input
              type="text"
              label={m.plan_public_search_label()}
              placeholder={m.plan_public_search_placeholder()}
              value={searchText}
              onInput={(e) => setSearchText(e.currentTarget.value ?? '')}
            />
          </div>
          <div className="flex items-center gap-md md:ml-auto md:h-[var(--wa-form-control-height)]">
            <ViewToggle value={view} onChange={setView} />
          </div>
        </div>

        {isError && <p className="text-sm text-hot-red-600">{m.plan_public_error()}</p>}

        {!isError && !isLoading && !isSearching && plans.length === 0 && (
          <p className="text-sm">{m.plan_public_empty()}</p>
        )}

        {plans.length > 0 && (
          <div
            aria-busy={isSearching}
            className={`relative ${VIEW_FADE_CLASSES} ${isSearching ? 'opacity-60' : 'opacity-100'}`}
          >
            <div
              aria-hidden={view !== 'list'}
              inert={view !== 'list'}
              className={`${VIEW_FADE_CLASSES} ${view === 'list' ? 'relative opacity-100' : 'pointer-events-none absolute inset-x-0 top-0 opacity-0'}`}
            >
              <table className="w-full table-fixed text-left">
                <thead>
                  <tr className="border-b border-hot-gray-200 text-sm text-hot-neutral-800">
                    <th className="py-sm font-semibold">{m.plan_public_col_plan()}</th>
                    <th className="hidden py-sm pr-md font-semibold md:table-cell md:w-[280px]">
                      {m.plan_public_col_org()}
                    </th>
                    <th className="hidden py-sm font-semibold md:table-cell md:w-[100px]">
                      {m.plan_public_col_projects()}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan) => {
                    const description = truncateDescription(plan.description)
                    const hasAuthor = Boolean(plan.group_name ?? plan.owner_name)
                    return (
                      <tr key={plan.id} className="border-b border-hot-gray-100">
                        <td className="min-w-0 py-md pr-md align-middle">
                          <Link
                            to={`/${currentLanguage}/plan/${plan.id}`}
                            title={plan.name}
                            className="block line-clamp-2 break-words font-semibold text-hot-neutral-800 no-underline hover:underline md:truncate"
                          >
                            {plan.name}
                          </Link>
                          {description && (
                            <p className="m-0 truncate text-sm text-hot-gray-400">{description}</p>
                          )}
                          <p className="m-0 mt-2xs text-sm text-hot-gray-500 md:hidden">
                            {hasAuthor && (
                              <>
                                <PlanAuthor plan={plan} />
                                {' · '}
                              </>
                            )}
                            {plan.project_count}{' '}
                            {plan.project_count === 1
                              ? m.plan_card_projects_singular()
                              : m.plan_card_projects_plural()}
                          </p>
                        </td>
                        <td className="hidden py-md pr-md align-middle font-semibold text-hot-neutral-800 md:table-cell">
                          <PlanAuthor plan={plan} />
                        </td>
                        <td className="hidden py-md align-middle text-hot-gray-500 md:table-cell">
                          {plan.project_count}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div
              aria-hidden={view !== 'card'}
              inert={view !== 'card'}
              className={`${VIEW_FADE_CLASSES} ${view === 'card' ? 'relative opacity-100' : 'pointer-events-none absolute inset-x-0 top-0 opacity-0'}`}
            >
              <p className="mb-md text-sm text-hot-gray-500">
                {m.plan_public_showing({ shown: plans.length, total })}
              </p>
              <div className="grid grid-cols-1 gap-lg md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {plans.map((plan) => (
                  <PublicPlanCard key={plan.id} plan={plan} />
                ))}
              </div>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-lg">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </PageWrapper>
    </>
  )
}

export default PublicPlansPage
