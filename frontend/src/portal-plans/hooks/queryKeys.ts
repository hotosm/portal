/**
 * React Query cache keys for plans, collections and groups.
 *
 * Kept in a module of their own — with no imports — so consumers outside
 * `portal-plans` (AuthContext invalidates plan data when auth changes) can use
 * them without pulling in the hooks, which import AuthContext themselves.
 */

export const planQueryKeys = {
  all: ['plans'] as const,
  list: () => [...planQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...planQueryKeys.all, 'detail', id] as const,
  // Sibling of detail(id), not a child: nested under it, every
  // invalidateQueries(detail(id)) also refetched the anonymous shared endpoint.
  public: (id: string) => [...planQueryKeys.all, 'public', id] as const,
}

export const collectionQueryKeys = {
  all: ['collections'] as const,
  ofPlan: (planId: string) => [...collectionQueryKeys.all, planId] as const,
}

export const groupsQueryKey = ['groups'] as const
