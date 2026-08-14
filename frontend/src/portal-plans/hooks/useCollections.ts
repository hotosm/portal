import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '../../contexts/AuthContext'
import { m } from '../../paraglide/messages'
import type {
  Collection,
  CollectionCreate,
  CollectionUpdate,
  PlanProjectItem,
  ProjectPlacement,
} from '../types'
import { planQueryKeys } from './usePlans'

const STALE_TIME = 5 * 60 * 1000
const GC_TIME = 30 * 60 * 1000

export const collectionQueryKeys = {
  all: ['collections'] as const,
  ofPlan: (planId: string) => [...collectionQueryKeys.all, planId] as const,
}

/**
 * Read the `detail` field of a FastAPI error response. These endpoints answer
 * 422 with a human-readable reason (duplicate name, collection of another
 * plan), which is worth surfacing verbatim instead of a generic failure toast.
 */
async function errorDetail(response: Response, fallback: string): Promise<string> {
  const body = await response.json().catch(() => ({}))
  return typeof body?.detail === 'string' && body.detail ? body.detail : fallback
}

/**
 * The collections of one plan. Everyone who can see the plan sees the same
 * list, so a shared plan reads identically for its owner and its editors.
 */
export function useCollections(planId: string) {
  const { isLogin } = useAuth()
  return useQuery({
    queryKey: collectionQueryKeys.ofPlan(planId),
    queryFn: async (): Promise<Collection[]> => {
      const response = await fetch(`/api/plans/${planId}/collections`, {
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error(`[${response.status}] Failed to fetch collections`)
      }
      return response.json()
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    enabled: isLogin && !!planId,
    retry: 1,
  })
}

/** The plan carries its collections, so every mutation refreshes both caches. */
function useCollectionInvalidation(planId: string) {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: collectionQueryKeys.ofPlan(planId) })
    queryClient.invalidateQueries({ queryKey: planQueryKeys.detail(planId) })
  }
}

export function useCreateCollection(planId: string) {
  const invalidate = useCollectionInvalidation(planId)
  return useMutation({
    mutationFn: async (payload: CollectionCreate): Promise<Collection> => {
      const response = await fetch(`/api/plans/${planId}/collections`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error(await errorDetail(response, m.plan_taxonomy_collection_create_error()))
      }
      return response.json()
    },
    onSuccess: invalidate,
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateCollection(planId: string) {
  const invalidate = useCollectionInvalidation(planId)
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      payload: CollectionUpdate
    }): Promise<Collection> => {
      const response = await fetch(`/api/plans/${planId}/collections/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error(await errorDetail(response, m.plan_taxonomy_collection_update_error()))
      }
      return response.json()
    },
    onSuccess: invalidate,
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteCollection(planId: string) {
  const invalidate = useCollectionInvalidation(planId)
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/plans/${planId}/collections/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error(await errorDetail(response, m.plan_taxonomy_collection_delete_error()))
      }
    },
    // Projects that were in it fall back to the virtual "All" bucket.
    onSuccess: invalidate,
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/** Move one project to a collection of the same plan; null means "All". */
export function useSetProjectCollection(planId: string) {
  const invalidate = useCollectionInvalidation(planId)
  return useMutation({
    mutationFn: async ({
      planProjectId,
      collectionId,
    }: {
      planProjectId: string
      collectionId: string | null
    }): Promise<void> => {
      const response = await fetch(`/api/plans/${planId}/projects/${planProjectId}/collection`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection_id: collectionId }),
      })
      if (!response.ok) {
        throw new Error(await errorDetail(response, m.plan_taxonomy_assign_error()))
      }
    },
    onSuccess: invalidate,
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/**
 * Persist a drag: the placement (collection + position) of every project the
 * drag shifted, in one request. The caller patches the cache optimistically,
 * so this only reconciles once the server confirms.
 */
export function useReorderProjects(planId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (items: ProjectPlacement[]): Promise<void> => {
      const response = await fetch(`/api/plans/${planId}/projects/reorder`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      if (!response.ok) {
        throw new Error(await errorDetail(response, m.plan_toast_update_error()))
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: planQueryKeys.detail(planId) })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/** Append one project/task, leaving every other row (and its collection) alone. */
export function useAddProject(planId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (item: PlanProjectItem): Promise<PlanProjectItem> => {
      const response = await fetch(`/api/plans/${planId}/projects`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      })
      if (!response.ok) {
        throw new Error(await errorDetail(response, m.plan_toast_update_error()))
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planQueryKeys.detail(planId) })
      queryClient.invalidateQueries({ queryKey: planQueryKeys.list() })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/** Delete one project/task from the plan. */
export function useRemoveProject(planId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (planProjectId: string): Promise<void> => {
      const response = await fetch(`/api/plans/${planId}/projects/${planProjectId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error(await errorDetail(response, m.plan_toast_update_error()))
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: planQueryKeys.detail(planId) })
      queryClient.invalidateQueries({ queryKey: planQueryKeys.list() })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/** Mark/unmark one project as featured. */
export function useSetProjectFeatured(planId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      planProjectId,
      featured,
    }: {
      planProjectId: string
      featured: boolean
    }): Promise<void> => {
      const response = await fetch(`/api/plans/${planId}/projects/${planProjectId}/featured`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured }),
      })
      if (!response.ok) {
        throw new Error(await errorDetail(response, m.plan_toast_featured_error()))
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: planQueryKeys.detail(planId) })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
