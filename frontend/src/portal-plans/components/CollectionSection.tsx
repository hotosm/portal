import { useDroppable } from '@dnd-kit/core'
import type { ReactNode } from 'react'
import { sectionDropId } from '../contstants'

interface CollectionSectionProps {
  /** Collection id, or ALL_SECTION_ID for the unassigned bucket. */
  sectionId: string
  /** Only an editable plan accepts drops; a read-only view just lays the cards out. */
  isDroppable: boolean
  /** How the children are laid out: the card grid, or one row per project. */
  layout?: 'grid' | 'list'
  children: ReactNode
}

/**
 * The card area of one collection, registered as a drop target.
 *
 * Dropping on the area (rather than on a card) is what lets a project join an
 * empty collection — with only the cards as targets, a section with nothing in
 * it could never be reached.
 */
function CollectionSection({
  sectionId,
  isDroppable,
  layout = 'grid',
  children,
}: CollectionSectionProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: sectionDropId(sectionId),
    data: { sectionId },
    disabled: !isDroppable,
  })

  return (
    <div
      ref={setNodeRef}
      className={`${
        layout === 'list' ? 'flex flex-col gap-sm' : 'flex flex-wrap gap-lg'
      } py-lg min-h-[80px] rounded-lg transition-colors ${isOver ? 'bg-hot-gray-100' : ''}`}
    >
      {children}
    </div>
  )
}

export default CollectionSection
