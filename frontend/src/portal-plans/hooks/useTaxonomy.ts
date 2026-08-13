import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '../../contexts/AuthContext'
import { m } from '../../paraglide/messages'
import type {
  Collection,
  CollectionCreate,
  CollectionUpdate,
  ProjectTag,
  ProjectTagCreate,
  ProjectTagUpdate,
} from '../types'
import { planQueryKeys } from './usePlans'

const STALE_TIME = 5 * 60 * 1000
const GC_TIME = 30 * 60 * 1000

export const taxonomyQueryKeys = {
  all: ['taxonomy'] as const,
  collections: () => [...taxonomyQueryKeys.all, 'collections'] as const,
  tags: () => [...taxonomyQueryKeys.all, 'tags'] as const,
}

/**
 * Read the `detail` field of a FastAPI error response. The taxonomy endpoints
 * answer 422 with a human-readable reason (duplicate name, unknown id), which is
 * worth surfacing verbatim instead of a generic failure toast.
 */
async function errorDetail(response: Response, fallback: string): Promise<string> {
  const body = await response.json().catch(() => ({}))
  return typeof body?.detail === 'string' && body.detail ? body.detail : fallback
}

/** Collections visible to the user: their own, plus any shared with their teams/orgs. */
export function useCollections() {
  const { isLogin } = useAuth()
  return useQuery({
    queryKey: taxonomyQueryKeys.collections(),
    queryFn: async (): Promise<Collection[]> => {
      const response = await fetch('/api/project-groups', { credentials: 'include' })
      if (!response.ok) {
        throw new Error(`[${response.status}] Failed to fetch collections`)
      }
      return response.json()
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    enabled: isLogin,
    retry: 1,
  })
}

/** Tags visible to the user: their own, plus any shared with their teams/orgs. */
export function useProjectTags() {
  const { isLogin } = useAuth()
  return useQuery({
    queryKey: taxonomyQueryKeys.tags(),
    queryFn: async (): Promise<ProjectTag[]> => {
      const response = await fetch('/api/tags', { credentials: 'include' })
      if (!response.ok) {
        throw new Error(`[${response.status}] Failed to fetch tags`)
      }
      return response.json()
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    enabled: isLogin,
    retry: 1,
  })
}

export function useCreateCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CollectionCreate): Promise<Collection> => {
      const response = await fetch('/api/project-groups', {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxonomyQueryKeys.collections() })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      payload: CollectionUpdate
    }): Promise<Collection> => {
      const response = await fetch(`/api/project-groups/${id}`, {
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
    // A rename also changes how the collection reads on every plan that uses it, so
    // drop the plan caches alongside the taxonomy list.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxonomyQueryKeys.collections() })
      queryClient.invalidateQueries({ queryKey: planQueryKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/project-groups/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error(await errorDetail(response, m.plan_taxonomy_collection_delete_error()))
      }
    },
    // Deleting unassigns the collection everywhere; plan projects that had only
    // this collection fall back to the virtual "All" bucket.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxonomyQueryKeys.collections() })
      queryClient.invalidateQueries({ queryKey: planQueryKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useCreateProjectTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ProjectTagCreate): Promise<ProjectTag> => {
      const response = await fetch('/api/tags', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error(await errorDetail(response, m.plan_taxonomy_tag_create_error()))
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxonomyQueryKeys.tags() })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateProjectTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      payload: ProjectTagUpdate
    }): Promise<ProjectTag> => {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error(await errorDetail(response, m.plan_taxonomy_tag_update_error()))
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxonomyQueryKeys.tags() })
      queryClient.invalidateQueries({ queryKey: planQueryKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteProjectTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error(await errorDetail(response, m.plan_taxonomy_tag_delete_error()))
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxonomyQueryKeys.tags() })
      queryClient.invalidateQueries({ queryKey: planQueryKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/**
 * Replace the full set of collections on one plan project/task. An empty list
 * means "All" — the backend stores no rows and the UI renders the virtual
 * bucket. The route and body keys still say "group"; they follow the API.
 */
export function useSetProjectCollections(planId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      planProjectId,
      collectionIds,
    }: {
      planProjectId: string
      collectionIds: string[]
    }): Promise<void> => {
      const response = await fetch(`/api/plans/${planId}/projects/${planProjectId}/groups`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_ids: collectionIds }),
      })
      if (!response.ok) {
        throw new Error(await errorDetail(response, m.plan_taxonomy_assign_error()))
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planQueryKeys.detail(planId) })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/** Replace the full set of tags on one plan project/task. */
export function useSetProjectTags(planId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      planProjectId,
      tagIds,
    }: {
      planProjectId: string
      tagIds: string[]
    }): Promise<void> => {
      const response = await fetch(`/api/plans/${planId}/projects/${planProjectId}/tags`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag_ids: tagIds }),
      })
      if (!response.ok) {
        throw new Error(await errorDetail(response, m.plan_taxonomy_assign_error()))
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planQueryKeys.detail(planId) })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
