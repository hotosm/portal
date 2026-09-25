import { resolveAppLabel } from './components/PlanProjectCard'
import type { HydratedProjectItem } from './types'

/**
 * Width, in characters, of the tool label column of a plan's list view.
 *
 * One width for every row of the plan, so the project titles all start at the
 * same x — sections included. Measured on the very label that gets rendered,
 * since SketchMap Tool's is far longer than the rest; projects with no tool
 * resolve to an empty label and don't count.
 */
export function toolColumnChars(projects: HydratedProjectItem[]): number {
  return projects.reduce(
    (longest, p) => Math.max(longest, resolveAppLabel(p.app, p.project_id ?? null).length),
    0
  )
}
