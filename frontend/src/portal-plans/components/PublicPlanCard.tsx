import { useState } from 'react'
import MediaCard from '../../components/shared/MediaCard'
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
    <MediaCard
      href={`/${currentLanguage}/plan/${plan.id}`}
      title={plan.name}
      imageSrc={cover}
      onImageError={() => setFailedCount((count) => count + 1)}
    >
      <p className="m-0 text-sm font-normal leading-[1.6] text-hot-neutral-600">
        {plan.project_count}{' '}
        {plan.project_count === 1
          ? m.plan_card_projects_singular()
          : m.plan_card_projects_plural()}
      </p>
    </MediaCard>
  )
}

export default PublicPlanCard
