import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { m } from '../../paraglide/messages'
import type { PlanAccess } from '../types'
import { planQueryKeys } from './queryKeys'

class AccessRequestError extends Error {
  status: number

  constructor(status: number) {
    super(`[${status}] Plan access request failed`)
    this.status = status
  }
}

async function accessRequest(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  body?: unknown
): Promise<PlanAccess> {
  const response = await fetch(`/api/plans/${path}`, {
    method,
    credentials: 'include',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!response.ok) throw new AccessRequestError(response.status)
  return response.json()
}

// Every write answers with the fresh access state: store it, then refetch the
// plan (my_role, is_public) and the lists it may have joined or left.
function useAccessMutation<TVars>(
  planId: string,
  request: (vars: TVars) => Promise<PlanAccess>
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: request,
    onSuccess: (access) => {
      queryClient.setQueryData(planQueryKeys.access(planId), access)
      queryClient.invalidateQueries({ queryKey: planQueryKeys.detail(planId) })
      queryClient.invalidateQueries({ queryKey: planQueryKeys.public(planId) })
      queryClient.invalidateQueries({ queryKey: planQueryKeys.list() })
    },
    onError: () => {
      toast.error(m.plan_access_toast_error())
    },
  })
}

/** Turn "anyone with the link" on (viewer) or off (null). */
export function useSetPlanLink(planId: string) {
  return useAccessMutation(planId, (role: 'viewer' | null) =>
    role
      ? accessRequest(`${planId}/access/link`, 'PUT', { role })
      : accessRequest(`${planId}/access/link`, 'DELETE')
  )
}
