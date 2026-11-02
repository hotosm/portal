import { useQuery } from '@tanstack/react-query'
import type { PlanSummary } from '../../portal-plans/types'
import { PublicProfileUnavailableError } from '../../portal-user-profile/hooks/usePublicProfile'

export const publicOrgPlansQueryKey = (slug: string) => ['public-org', slug, 'plans'] as const

/**
 * Fetches an organization's public plans by slug. Public route, no
 * credentials. Plans aren't translated, so there's no locale.
 *
 * Resolves to `[]` on 404, like an org with no public plans: the profile page
 * already handles the org itself not being there.
 */
export function usePublicOrgPlans(slug?: string) {
  return useQuery({
    queryKey: publicOrgPlansQueryKey(slug ?? ''),
    queryFn: async (): Promise<PlanSummary[]> => {
      const response = await fetch(`/api/public/org/${encodeURIComponent(slug ?? '')}/plans`)

      if (response.status === 404) return []
      if (response.status === 502) throw new PublicProfileUnavailableError()
      if (!response.ok) {
        throw new Error(`[${response.status}] Failed to fetch organization plans`)
      }

      return response.json()
    },
    staleTime: 0,
    gcTime: 0,
    enabled: !!slug,
    // Retrying a down upstream just delays the error state by a round trip.
    retry: (failureCount, error) =>
      failureCount < 1 && !(error instanceof PublicProfileUnavailableError),
  })
}
