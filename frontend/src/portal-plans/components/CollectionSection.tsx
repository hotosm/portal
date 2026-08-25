import { useDroppable } from '@dnd-kit/core'
import type { ReactNode } from 'react'
import { sectionDropId } from '../contstants'

interface CollectionSectionProps {
  /** Collection id, or ALL_SECTION_ID for the unassigned bucket. */
  sectionId: string
  /** Only an editable plan accepts drops; a read-only view just lays the cards out. */
  isDroppable: boolean
  children: ReactNode
}

/**
 * The card area of one collection, registered as a drop target.
 *
 * Dropping on the area (rather than on a card) is what lets a project join an
 * empty collection — with only the cards as targets, a section with nothing in
 * it could never be reached.
 */
function CollectionSection({ sectionId, isDroppable, children }: CollectionSectionProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: sectionDropId(sectionId),
    data: { sectionId },
    disabled: !isDroppable,
  })

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-wrap gap-lg py-lg min-h-[80px] rounded-lg transition-colors ${
        isOver ? 'bg-hot-gray-100' : ''
      }`}
    >
      {children}
    </div>
  )
}

export default CollectionSection
