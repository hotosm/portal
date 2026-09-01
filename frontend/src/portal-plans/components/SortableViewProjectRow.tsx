import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import { useUpdateProjectStatus } from '../hooks'
import type { HydratedProjectItem, ProjectOption, ProjectStatus } from '../types'
import LinkProjectDialog from './LinkProjectDialog'
import PlanProjectRow from './PlanProjectRow'

interface SortableViewProjectRowProps {
  /** The plan_project id, which is what every callback below reports. */
  id: string
  /** Collection the row renders under (ALL_SECTION_ID when unassigned). */
  sectionId: string
  project: HydratedProjectItem
  planId: string
  onProjectSelected?: (oldKey: string, project: ProjectOption) => void
  onProjectDeleted?: (key: string) => void
  onFeaturedToggle?: (id: string, featured: boolean) => void
}

/**
 * The list-view counterpart of SortableViewProjectCard.
 *
 * Same draggable contract — the id and the `{ sectionId, projectId }` data the
 * page's drag handlers read back — so the layout is all that changes.
 */
function SortableViewProjectRow({
  id,
  sectionId,
  project,
  planId,
  onProjectSelected,
  onProjectDeleted,
  onFeaturedToggle,
}: SortableViewProjectRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    // The plan_project id, kept stable across sections: dnd-kit tracks the
    // active draggable by id, so an id derived from the section would change
    // mid-move and abort the drag.
    id,
    // Read back by the drop handler to know which bucket this row sits in.
    data: { sectionId, projectId: id },
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const { mutate: updateStatus } = useUpdateProjectStatus()
  const [dialogOpen, setDialogOpen] = useState(false)

  function handleStatusChange(status: ProjectStatus) {
    if (!project.project_id || !project.app) return
    updateStatus({
      planId,
      app: project.app,
      projectId: project.project_id,
      status,
    })
  }

  return (
    <div ref={setNodeRef} style={style} className="w-full flex items-center gap-xs">
      <div
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab active:cursor-grabbing text-hot-gray-400 hover:text-hot-gray-600 leading-none select-none text-base"
      >
        ⠿
      </div>
      <PlanProjectRow
        project={project}
        onStatusChange={project.project_exists ? handleStatusChange : undefined}
        onSelectClick={project.project_exists ? undefined : () => setDialogOpen(true)}
        onDelete={project.project_exists ? () => onProjectDeleted?.(id) : undefined}
        onFeaturedChange={
          project.project_exists ? (featured) => onFeaturedToggle?.(id, featured) : undefined
        }
        planId={planId}
      />
      {!project.project_exists && (
        <LinkProjectDialog
          open={dialogOpen}
          planId={planId}
          planProjectId={id}
          collectionId={project.collection_id}
          onClose={() => setDialogOpen(false)}
          onDelete={() => onProjectDeleted?.(id)}
          onConfirm={(selected) => onProjectSelected?.(id, selected)}
        />
      )}
    </div>
  )
}

export default SortableViewProjectRow
