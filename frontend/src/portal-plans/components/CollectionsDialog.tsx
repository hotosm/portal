import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Button from '../../components/shared/Button'
import Dialog from '../../components/shared/Dialog'
import Icon from '../../components/shared/Icon'
import Input from '../../components/shared/Input'
import Spinner from '../../components/shared/Spinner'
import Textarea from '../../components/shared/Textarea'
import { m } from '../../paraglide/messages'
import { useCollections, useCreateCollection, useDeleteCollection } from '../hooks'
import type { Collection } from '../types'

interface CollectionsDialogProps {
  /** Plan the collections belong to. */
  planId: string
  open: boolean
  onClose: () => void
  onCreated?: (collection: Collection) => void
}

interface CollectionListItemProps {
  collection: Collection
  isDeleting: boolean
  onDelete: () => void
}

/**
 * One existing collection, with delete behind an inline confirmation.
 *
 * Inline rather than a confirm dialog: this list already lives inside one, and
 * nesting dialogs leaves the inner one unreachable.
 */
function CollectionListItem({ collection, isDeleting, onDelete }: CollectionListItemProps) {
  const [confirming, setConfirming] = useState(false)

  return (
    <li className="flex items-center gap-sm py-xs min-h-[2rem]">
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium break-words">{collection.name}</span>
        {collection.description && !confirming && (
          <span className="text-sm text-hot-gray-500 break-words"> — {collection.description}</span>
        )}
        {confirming && (
          <span className="text-sm text-hot-gray-600">
            {' '}
            — {m.plan_collections_delete_collection_message()}
          </span>
        )}
      </div>
      {isDeleting ? (
        <Spinner />
      ) : confirming ? (
        <div className="flex items-center gap-xs shrink-0">
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="text-sm text-hot-gray-500 hover:text-hot-gray-700 underline"
          >
            {m.plan_cancel()}
          </button>
          <Button type="button" size="small" variant="danger" onClick={onDelete}>
            {m.plan_collections_delete()}
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          aria-label={m.plan_collections_delete()}
          className="shrink-0 text-hot-gray-500 hover:text-hot-red-600"
        >
          <Icon library="bootstrap" name="trash" label={m.plan_collections_delete()} />
        </button>
      )}
    </li>
  )
}

function CollectionsDialog({ planId, open, onClose, onCreated }: CollectionsDialogProps) {
  const { data: collections = [], isLoading } = useCollections(planId)
  const createCollection = useCreateCollection(planId)
  const deleteCollection = useDeleteCollection(planId)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (!open) return
    setName('')
    setDescription('')
  }, [open])

  const trimmedName = name.trim()
  const canSubmit = trimmedName.length > 0 && !createCollection.isPending

  function submit() {
    if (!canSubmit) return
    createCollection.mutate(
      { name: trimmedName, description: description.trim() || null },
      {
        onSuccess: (collection) => {
          toast.success(m.plan_collections_toast_collection_created())
          onCreated?.(collection)
          setName('')
          setDescription('')
        },
      }
    )
  }

  function remove(id: string) {
    deleteCollection.mutate(id, {
      onSuccess: () => toast.success(m.plan_collections_toast_collection_deleted()),
    })
  }

  return (
    <Dialog
      open={open}
      label={m.plan_collections_section_collections()}
      onWaHide={(e: Event) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="flex flex-col gap-md">
        {isLoading ? (
          <Spinner label={m.plan_form_loading()} />
        ) : collections.length === 0 ? (
          <p className="text-sm text-hot-gray-500">{m.plan_collections_empty_collections()}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-hot-gray-200">
            {collections.map((collection) => (
              <CollectionListItem
                key={collection.id}
                collection={collection}
                isDeleting={
                  deleteCollection.isPending && deleteCollection.variables === collection.id
                }
                onDelete={() => remove(collection.id)}
              />
            ))}
          </ul>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
          className="flex flex-col gap-sm border-t border-hot-gray-200 pt-md"
        >
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide">
              {m.plan_collections_dialog_add_label()}
            </h4>
            <p className="text-sm text-hot-gray-500">{m.plan_collections_dialog_add_hint()}</p>
          </div>
          <Input
            type="text"
            value={name}
            onInput={(e) => setName(e.currentTarget.value ?? '')}
            placeholder={m.plan_collections_new_collection_placeholder()}
          />
          <Textarea
            value={description}
            rows={2}
            onInput={(e) => setDescription(e.currentTarget.value ?? '')}
            placeholder={m.plan_collections_description_placeholder()}
          />
          {/* Submit lives in the dialog footer, so keep a hidden one here for Enter. */}
          <button type="submit" className="hidden" tabIndex={-1} aria-hidden="true" />
        </form>
      </div>

      <div slot="footer" className="flex justify-end">
        <Button type="button" onClick={submit} disabled={!canSubmit}>
          {createCollection.isPending
            ? m.plan_collections_adding()
            : m.plan_collections_dialog_create()}
        </Button>
      </div>
    </Dialog>
  )
}

export default CollectionsDialog
