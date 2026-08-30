import { useEffect, useState } from 'react'
import starFill from '../../assets/icons/star-fill.svg'
import starOutline from '../../assets/icons/star.svg'
import Icon from '../../components/shared/Icon'
import Spinner from '../../components/shared/Spinner'
import { m } from '../../paraglide/messages'
import { APP_META } from '../../utils/appMeta'
import type { HydratedProjectItem, ProjectStatus } from '../types'
import { usePlanProjectDisplay } from './PlanProjectCard'
import ProjectDialog from './ProjectDialog'

interface PlanProjectRowProps {
  project: HydratedProjectItem
  onStatusChange?: (status: ProjectStatus) => void
  onSelectClick?: () => void
  onDelete?: () => void
  onFeaturedChange?: (featured: boolean) => void
  /** Set on editable views only — lets the dialog offer collection assignment. */
  planId?: string
}

function PlanProjectRow({
  project,
  onStatusChange,
  onSelectClick,
  onDelete,
  onFeaturedChange,
  planId,
}: PlanProjectRowProps) {
  const { title, imageUrl, href } = usePlanProjectDisplay(project)
  // Null on a task that isn't tied to a tool yet.
  const meta = project.app ? APP_META[project.app] : null
  const [localStatus, setLocalStatus] = useState<ProjectStatus>(project.status)
  const [dialogOpen, setDialogOpen] = useState(false)

  // The same three upstream states the card tells apart; see PlanProjectCard.
  const missing = project.project_exists && project.error === 'not_found'
  const unavailable =
    project.project_exists &&
    (project.error === 'upstream_unavailable' || project.error === 'upstream_timeout')
  const pending = project.project_exists && project.error === 'pending'

  useEffect(() => {
    setLocalStatus(project.status)
  }, [project.status])

  const rowClassName = `w-full min-w-0 bg-white rounded-lg shadow-[0_0_8px_rgba(0,0,0,0.15)] px-md py-sm flex items-center gap-sm${!project.project_exists ? ' opacity-50' : ''}${unavailable ? ' grayscale opacity-60' : ''}`
  const titleClassName = `min-w-0 flex-1 truncate text-left text-base font-bold${missing ? ' text-hot-gray-600 line-through' : ''}`
  const featuredLabel = project.featured ? 'Remove from featured' : 'Mark as featured'

  return (
    <>
      {project.project_exists && !unavailable && !pending && (
        <ProjectDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title={title}
          href={href}
          project={project}
          imageUrl={imageUrl}
          onDelete={onDelete}
          initialStatus={localStatus}
          onStatusChange={
            onStatusChange
              ? (status) => {
                  setLocalStatus(status)
                  onStatusChange(status)
                }
              : undefined
          }
          onFeaturedChange={onFeaturedChange}
          planId={planId}
        />
      )}
      <div className={rowClassName}>
        {onFeaturedChange && (
          <button
            type="button"
            onClick={() => onFeaturedChange(!project.featured)}
            title={featuredLabel}
            className={`shrink-0 cursor-pointer leading-none transition-colors ${project.featured ? 'text-hot-yellow-600' : 'text-hot-gray-300 hover:text-hot-gray-500'}`}
          >
            <Icon src={project.featured ? starFill : starOutline} label={featuredLabel} />
          </button>
        )}
        {meta && (
          <>
            <img src={meta.icon} alt="" className="w-5 h-5 shrink-0" />
            <span className="shrink-0 text-sm text-hot-gray-600">{meta.name}</span>
          </>
        )}
        {pending ? (
          <span className="flex min-w-0 flex-1 items-center gap-xs text-sm text-hot-gray-600">
            <Spinner />
            {m.plan_project_pending_badge()}
          </span>
        ) : unavailable ? (
          // Upstream can't be reached: nothing to open, but the row can still be
          // removed below.
          <span className={titleClassName}>{title}</span>
        ) : (
          <button
            type="button"
            onClick={project.project_exists ? () => setDialogOpen(true) : onSelectClick}
            className={`${titleClassName} cursor-pointer`}
          >
            {title}
          </button>
        )}
        {missing && (
          <span className="shrink-0 bg-red-600 text-white text-xs font-medium px-2 py-0.5 rounded">
            {m.plan_project_missing_badge()}
          </span>
        )}
        {unavailable && (
          <span className="shrink-0 bg-hot-gray-600 text-white text-xs font-medium px-2 py-0.5 rounded">
            {m.plan_project_unavailable_badge()}
          </span>
        )}
        {(missing || unavailable || pending) && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="shrink-0 cursor-pointer text-sm font-medium text-red-700 underline hover:text-red-800"
          >
            {m.plan_project_remove_button()}
          </button>
        )}
      </div>
    </>
  )
}

export default PlanProjectRow
