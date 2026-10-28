import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { m } from '../../paraglide/messages'
import { resolveProjectImage } from '../../utils/projectImage'
import type { PublicPlanSummary } from '../types'

interface PublicPlanCardProps {
  plan: PublicPlanSummary
}

// Cover candidates in priority order: the plan's own image, then the map of its
// main project. A candidate that fails to load hands over to the next one.
function coverCandidates(plan: PublicPlanSummary): string[] {
  const candidates: string[] = []
  if (plan.cover_image_url) candidates.push(plan.cover_image_url)
  if (plan.cover_project) {
    const map = resolveProjectImage(plan.cover_project.app, null, plan.cover_project.data)
    if (map) candidates.push(map)
  }
  return candidates
}

function PublicPlanCard({ plan }: PublicPlanCardProps) {
  const { currentLanguage } = useLanguage()
  const [failedCount, setFailedCount] = useState(0)
  const cover = coverCandidates(plan)[failedCount] ?? null

  return (
    <Link
      to={`/${currentLanguage}/plan/${plan.id}`}
      className="flex h-full flex-col overflow-hidden rounded-xl border border-hot-gray-200 bg-white no-underline text-inherit transition-shadow hover:shadow-md"
    >
      {cover ? (
        <img
          src={cover}
          alt=""
          loading="lazy"
          className="h-40 w-full object-cover"
          onError={() => setFailedCount((count) => count + 1)}
        />
      ) : (
        <div className="h-40 w-full bg-hot-gray-300" aria-hidden="true" />
      )}
      <div className="flex flex-col gap-sm p-lg">
        <h3 className="m-0 line-clamp-2 text-base font-semibold text-hot-neutral-800">
          {plan.name}
        </h3>
        <p className="m-0 text-sm text-hot-gray-500">
          {plan.project_count}{' '}
          {plan.project_count === 1
            ? m.plan_card_projects_singular()
            : m.plan_card_projects_plural()}
        </p>
      </div>
    </Link>
  )
}

export default PublicPlanCard
