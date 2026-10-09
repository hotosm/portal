import { createContext, useCallback, useContext, useMemo, useState } from 'react'

export interface ProjectSelection {
  /** True while the plan is in "select projects" mode. */
  selectMode: boolean
  selectedIds: ReadonlySet<string>
  enter: () => void
  /** Leave select mode and forget the selection. */
  exit: () => void
  toggle: (id: string) => void
  /** Select exactly these ids. */
  selectAll: (ids: string[]) => void
  clear: () => void
}

/**
 * Selection state for removing several projects of a plan at once.
 *
 * Exposed through a context (see ProjectSelectionContext) so the cards and
 * rows, which sit several components below the page, can react to it without
 * every intermediate component forwarding props.
 */
export function useProjectSelectionState(): ProjectSelection {
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set())

  const enter = useCallback(() => setSelectMode(true), [])
  const exit = useCallback(() => {
    setSelectMode(false)
    setSelectedIds(new Set())
  }, [])
  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])
  const selectAll = useCallback((ids: string[]) => setSelectedIds(new Set(ids)), [])
  const clear = useCallback(() => setSelectedIds(new Set()), [])

  return useMemo(
    () => ({ selectMode, selectedIds, enter, exit, toggle, selectAll, clear }),
    [selectMode, selectedIds, enter, exit, toggle, selectAll, clear]
  )
}

const noop = () => {}

const inactiveSelection: ProjectSelection = {
  selectMode: false,
  selectedIds: new Set(),
  enter: noop,
  exit: noop,
  toggle: noop,
  selectAll: noop,
  clear: noop,
}

export const ProjectSelectionContext = createContext<ProjectSelection>(inactiveSelection)

export function useProjectSelectionContext(): ProjectSelection {
  return useContext(ProjectSelectionContext)
}

export { useProjectSelectionState as useProjectSelection }
