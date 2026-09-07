/** Bucket for projects in no collection — the API models it as a null collection_id. */
export const ALL_SECTION_ID = 'all'

/**
 * Drop-target id of a section. Cards are dragged by their plan_project id, which
 * must stay stable across a move: dnd-kit tracks the active draggable by id, so
 * an id built from the section would change mid-drag and drop the gesture.
 */
export const sectionDropId = (sectionId: string) => `section:${sectionId}`

export const isSectionDropId = (id: string) => id.startsWith('section:')
