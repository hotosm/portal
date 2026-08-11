import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import { cardClassNames } from '../../constants/classNames'
import { useUpdateProjectStatus } from '../hooks'
import type { HydratedProjectItem, ProjectOption, ProjectStatus } from '../types'
import LinkProjectDialog from './LinkProjectDialog'
import PlanProjectCard from './PlanProjectCard'

interface SortableViewProjectCardProps {
  id: string
  /**
   * Identity for drag and drop, when it has to differ from `id`: a project shown
   * in several sections needs a unique id per section, while `id` stays the plan
   * project id the callbacks below report. Defaults to `id`.
   */
  dragId?: string
  project: HydratedProjectItem
  planId: string
  onProjectSelected?: (oldKey: string, project: ProjectOption) => void
  onProjectDeleted?: (key: string) => void
  onFeaturedToggle?: (id: string, featured: boolean) => void
}

function SortableViewProjectCard({
  id,
  dragId,
  project,
  planId,
  onProjectSelected,
  onProjectDeleted,
  onFeaturedToggle,
}: SortableViewProjectCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: dragId ?? id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const { mutate: updateStatus } = useUpdateProjectStatus()
  const [dialogOpen, setDialogOpen] = useState(false)

  function handleStatusChange(status: ProjectStatus) {
    if (!project.project_id) return
    updateStatus({
      planId,
      app: project.app,
      projectId: project.project_id,
      status,
    })
  }

  return (
    <div ref={setNodeRef} style={style} className={`${cardClassNames} relative`}>
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-20 cursor-grab active:cursor-grabbing bg-black/30 text-white rounded px-1 leading-none select-none text-base"
      >
        ⠿
      </div>
      <PlanProjectCard
        project={project}
        onStatusChange={project.project_exists ? handleStatusChange : undefined}
        onSelectClick={project.project_exists ? undefined : () => setDialogOpen(true)}
        onDelete={project.project_exists ? () => onProjectDeleted?.(id) : undefined}
        onFeaturedChange={project.project_exists ? (featured) => onFeaturedToggle?.(id, featured) : undefined}
      />
      {!project.project_exists && (
        <LinkProjectDialog
          open={dialogOpen}
          app={project.app}
          onClose={() => setDialogOpen(false)}
          onDelete={() => onProjectDeleted?.(id)}
          onConfirm={(selected) => onProjectSelected?.(id, selected)}
        />
      )}
    </div>
  )
}

export default SortableViewProjectCard
