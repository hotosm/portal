import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { PlanProjectArtifact } from '../types'
import { planQueryKeys } from './queryKeys'

/** Fetch (if not already stored) the downloadable artifact for a SketchMap
 * Tool plan project — the printable PDF for a "create" job, the merged
 * GeoJSON for a "digitize" job — and return its metadata + download URL. */
export function useEnsureSketchmapArtifact(planId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (planProjectId: string): Promise<PlanProjectArtifact> => {
      const response = await fetch(
        `/api/plans/${planId}/projects/${planProjectId}/sketchmap-file`,
        { method: 'POST', credentials: 'include' }
      )
      if (!response.ok) {
        // Materializing the file needs a session, so a signed-out visitor on a
        // public plan lands here. Flag it so the dialog can say what to do
        // instead of showing the generic failure toast.
        if (response.status === 401) throw new Error('signin_required')
        const body = await response.json().catch(() => ({}))
        throw new Error(body.detail ?? `${response.status}`)
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planQueryKeys.detail(planId) })
    },
  })
}
