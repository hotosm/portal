import { useEffect, useMemo, useState } from 'react'
import Button from '../../components/shared/Button'
import Dialog from '../../components/shared/Dialog'
import { m } from '../../paraglide/messages'
import { projectKey } from '../../utils/utils'
import { APP_LABELS, usePlan, useSetProjectCollection } from '../hooks'
import { useAddProjectByUrl } from '../hooks/useAddProjectByUrl'
import type { AppName, ProjectOption } from '../types'
import { AddByUrlSection } from './AddByUrlSection'
import CollectionPicker from './CollectionPicker'
import SketchmapNameStep from './SketchmapNameStep'

interface LinkProjectDialogProps {
  open: boolean
  planId: string
  /** Plan project (task) row being linked — the collection is stored against it. */
  planProjectId: string
  /** Collection the task is already in, or null for the virtual "All" bucket. */
  collectionId: string | null
  onClose: () => void
  onDelete?: () => void
  onConfirm: (project: ProjectOption) => void
}

function LinkProjectDialog({
  open,
  planId,
  planProjectId,
  collectionId,
  onClose,
  onDelete,
  onConfirm,
}: LinkProjectDialogProps) {
  const setCollection = useSetProjectCollection(planId)
  const { data: plan } = usePlan(planId)
  const existingKeys = useMemo(
    () =>
      new Set(
        (plan?.projects ?? [])
          .filter((p) => p.project_exists && p.app && p.project_id)
          .map((p) => projectKey(p.app as AppName, p.project_id as string))
      ),
    [plan]
  )
  const [selected, setSelected] = useState<ProjectOption | null>(null)
  const [sketchmapName, setSketchmapName] = useState('')
  const {
    urlInput,
    setUrlInput,
    urlError,
    setUrlError,
    isPending,
    handleAddUrl: resolveUrl,
    pendingSketchmap,
    cancelSketchmapAdd,
    confirmSketchmapAdd,
  } = useAddProjectByUrl()

  // biome-ignore lint/correctness/useExhaustiveDependencies: only reset on open transition
  useEffect(() => {
    if (open) {
      setSelected(null)
      setSketchmapName('')
      setUrlInput('')
      setUrlError(null)
      cancelSketchmapAdd()
    }
  }, [open])

  function handleAddUrl() {
    resolveUrl({
      localSelected: existingKeys,
      onAdded: (project) => setSelected(project),
    })
  }

  // A SketchMap Tool URL resolves into a name step instead of a project: without
  // this, resolveUrl just set pendingSketchmap and returned, so pasting one here
  // showed no error, no resolved project and left the Link button inert.
  function confirmSketchmap() {
    confirmSketchmapAdd(sketchmapName, {
      localSelected: existingKeys,
      onAdded: (project) => setSelected(project),
    })
  }

  return (
    <Dialog
      open={open}
      label={m.plan_link_label()}
      onWaHide={onClose}
      style={{ '--width': '480px' } as React.CSSProperties}
    >
      {pendingSketchmap ? (
        <SketchmapNameStep
          app={pendingSketchmap.app}
          projectId={pendingSketchmap.project_id}
          value={sketchmapName}
          onChange={setSketchmapName}
          onConfirm={confirmSketchmap}
          onBack={() => {
            setSketchmapName('')
            cancelSketchmapAdd()
          }}
        />
      ) : (
        <AddByUrlSection
          urlInput={urlInput}
          setUrlInput={setUrlInput}
          urlError={urlError}
          setUrlError={setUrlError}
          isPending={isPending}
          onAdd={handleAddUrl}
          divider={false}
        />
      )}

      {/* confirmation */}
      {selected && (
        <div className="border border-hot-gray-200 rounded-lg p-sm mt-md flex flex-col gap-2xs">
          <span className="text-xs font-semibold text-hot-gray-500 uppercase tracking-wide">
            {m.plan_link_resolved_label()}
          </span>
          <span className="text-sm text-hot-gray-800">{selected.title}</span>
          <span className="text-xs text-hot-gray-400">{APP_LABELS[selected.app]}</span>
        </div>
      )}

      <div className="border-t border-hot-gray-200 pt-md mt-md">
        <CollectionPicker
          planId={planId}
          value={collectionId}
          onChange={(collectionId) => setCollection.mutate({ planProjectId, collectionId })}
          isPending={setCollection.isPending}
        />
      </div>

      <div slot="footer" className="flex gap-sm justify-between w-full">
        <Button
          appearance="outlined"
          variant="danger"
          onClick={() => {
            onDelete?.()
            onClose()
          }}
        >
          {m.plan_link_delete()}
        </Button>
        <Button
          type="button"
          disabled={!selected}
          onClick={() => {
            if (selected) {
              onConfirm(selected)
              onClose()
            }
          }}
        >
          {m.plan_link_confirm()}
        </Button>
      </div>
    </Dialog>
  )
}

export default LinkProjectDialog
