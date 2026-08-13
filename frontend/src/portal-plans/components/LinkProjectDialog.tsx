import Button from '../../components/shared/Button'
import Checkbox from '../../components/shared/Checkbox'
import Dialog from '../../components/shared/Dialog'
import { APP_LABELS, useSetProjectCollections } from '../hooks'
import { useLinkProject } from '../hooks/useLinkProject'
import type { AppName, ProjectOption } from '../types'
import { AddByUrlSection } from './AddByUrlSection'
import CollectionPicker from './CollectionPicker'

interface SelectProjectDialogProps {
  open: boolean
  /** Null when the task isn't tied to a tool yet — then it can only be linked by URL. */
  app: AppName | null
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
  app,
  planId,
  planProjectId,
  collectionId,
  onClose,
  onDelete,
  onConfirm,
}: SelectProjectDialogProps) {
  const setCollections = useSetProjectCollections(planId)
  const {
    selected,
    setSelected,
    allProjects,
    isLoading,
    isError,
    urlInput,
    setUrlInput,
    urlError,
    setUrlError,
    isPending,
    handleAddUrl,
  } = useLinkProject({ open, app })

  return (
    <Dialog
      open={open}
      label="Link project"
      onWaHide={onClose}
      style={{ '--width': '480px' } as React.CSSProperties}
    >
      {/* A task with no tool yet has no list to pick from — the URL decides the app. */}
      {app && (
        <>
          <p>{`Is this project already created in ${APP_LABELS[app]}? Select it from the list.`}</p>
          <div className="overflow-y-auto max-h-[50vh] flex flex-col gap-xs">
            {isLoading && allProjects.length === 0 ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-hot-gray-100 rounded-lg animate-pulse" />
                ))}
              </>
            ) : isError && allProjects.length === 0 ? (
              <p className="text-sm text-hot-gray-400">Failed to load projects.</p>
            ) : allProjects.length === 0 ? (
              <p className="text-sm text-hot-gray-400">No projects found. Add one by URL below.</p>
            ) : (
              allProjects.map((p) => (
                <Checkbox
                  key={p.project_id}
                  checked={selected?.project_id === p.project_id}
                  onChange={() =>
                    setSelected((prev) => (prev?.project_id === p.project_id ? null : p))
                  }
                >
                  {p.title}
                </Checkbox>
              ))
            )}
          </div>
        </>
      )}

      <AddByUrlSection
        urlInput={urlInput}
        setUrlInput={setUrlInput}
        urlError={urlError}
        setUrlError={setUrlError}
        isPending={isPending}
        onAdd={handleAddUrl}
        divider={app != null}
      />

      {/* Saved against the task row as soon as it's picked, so it survives
          closing the dialog without linking a project. */}
      <div className="border-t border-hot-gray-200 pt-md mt-md">
        <CollectionPicker
          value={collectionId}
          onChange={(id) => setCollections.mutate({ planProjectId, collectionIds: id ? [id] : [] })}
          isPending={setCollections.isPending}
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
          Delete
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
          Link
        </Button>
      </div>
    </Dialog>
  )
}

export default LinkProjectDialog
