import { useState } from 'react'
import { m } from '../../paraglide/messages'
import { projectKey } from '../../utils/utils'
import type { AppName, ProjectOption } from '../types'
import { useResolveProjectUrl } from './usePlans'

interface AddedArgs {
  localSelected: Set<string>
  onAdded: (project: ProjectOption, key: string) => void
}

interface PendingSketchmap {
  app: AppName
  project_id: string
  upstream: Record<string, unknown> | null | undefined
}

export function useAddProjectByUrl() {
  const [urlInput, setUrlInput] = useState('')
  const [urlError, setUrlError] = useState<string | null>(null)
  // Set once a pasted URL resolves to SketchMap Tool — the name step is
  // required before the project actually gets added (see confirmSketchmapAdd).
  const [pendingSketchmap, setPendingSketchmap] = useState<PendingSketchmap | null>(null)
  const resolveUrl = useResolveProjectUrl()

  async function handleAddUrl({ localSelected, onAdded }: AddedArgs) {
    const trimmed = urlInput.trim()
    if (!trimmed) return
    setUrlError(null)
    try {
      const result = await resolveUrl.mutateAsync(trimmed)
      const key = projectKey(result.app, result.project_id)
      if (localSelected.has(key)) {
        setUrlError(m.plan_picker_url_duplicate())
        return
      }
      let resolvedUpstream = result.upstream
      if (result.app === 'chatmap' && !resolvedUpstream) {
        try {
          const r = await fetch(`https://chatmap.hotosm.org/api/v1/map/${result.project_id}`, {
            credentials: 'include',
            headers: { accept: 'application/json' },
          })
          if (r.ok) {
            const d = await r.json()
            if (d?.name)
              resolvedUpstream = {
                name: d.name,
                id: d.id ?? result.project_id,
              }
          }
        } catch {
          // CORS or network error — fall back to UUID title
        }
      }
      if (result.app === 'chatmap' && !resolvedUpstream) {
        setUrlError(m.plan_picker_url_chatmap_private())
        return
      }

      // SketchMap Tool has no name of its own upstream — hold off adding until
      // the user has typed one (see ProjectPickerDialog's name step).
      if (result.app === 'sketchmap-tool') {
        setPendingSketchmap({
          app: result.app,
          project_id: result.project_id,
          upstream: resolvedUpstream,
        })
        return
      }

      const upstream = resolvedUpstream ?? {}
      const isPendingOamTms =
        result.app === 'open-aerial-map' &&
        result.project_id.startsWith('tms:') &&
        !resolvedUpstream
      const title =
        (upstream.name as string | undefined) ??
        (upstream.title as string | undefined) ??
        result.project_id

      onAdded(
        {
          app: result.app,
          project_id: result.project_id,
          title,
          upstream: resolvedUpstream,
          isResolving: isPendingOamTms,
        },
        key
      )
      setUrlInput('')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      if (msg.includes('project_not_found')) {
        setUrlError(m.plan_picker_url_not_found())
      } else if (msg.includes('upstream_unavailable')) {
        setUrlError(m.plan_picker_url_service_unavailable())
      } else {
        setUrlError(m.plan_picker_url_not_recognized())
      }
    }
  }

  function cancelSketchmapAdd() {
    setPendingSketchmap(null)
  }

  function confirmSketchmapAdd(name: string, { localSelected, onAdded }: AddedArgs) {
    if (!pendingSketchmap) return
    const trimmedName = name.trim()
    if (!trimmedName) return
    const key = projectKey(pendingSketchmap.app, pendingSketchmap.project_id)
    if (localSelected.has(key)) {
      setUrlError(m.plan_picker_url_duplicate())
      setPendingSketchmap(null)
      return
    }
    onAdded(
      {
        app: pendingSketchmap.app,
        project_id: pendingSketchmap.project_id,
        title: trimmedName,
        upstream: pendingSketchmap.upstream,
        customTitle: trimmedName,
      },
      key
    )
    setPendingSketchmap(null)
    setUrlInput('')
  }

  return {
    urlInput,
    setUrlInput,
    urlError,
    setUrlError,
    isPending: resolveUrl.isPending,
    handleAddUrl,
    pendingSketchmap,
    cancelSketchmapAdd,
    confirmSketchmapAdd,
  }
}
