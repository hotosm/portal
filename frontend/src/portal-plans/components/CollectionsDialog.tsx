import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Button from '../../components/shared/Button'
import Dialog from '../../components/shared/Dialog'
import Icon from '../../components/shared/Icon'
import Input from '../../components/shared/Input'
import Pagination from '../../components/shared/Pagination'
import Spinner from '../../components/shared/Spinner'
import { Tab, TabGroup, TabPanel } from '../../components/shared/Tabs'
import Textarea from '../../components/shared/Textarea'
import { m } from '../../paraglide/messages'
import { useCollections, useCreateCollection, useDeleteCollection } from '../hooks'
import type { Collection } from '../types'

/** Collections shown per page on the manage tab. */
const PAGE_SIZE = 5
/** Minimum height of one row, in rem. The list reserves a full page of these
 *  so a short last page doesn't shrink the dialog. */
const ROW_HEIGHT_REM = 2

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

/** One existing collection, deleted straight from its trash button. */
function CollectionListItem({ collection, isDeleting, onDelete }: CollectionListItemProps) {
  return (
    <li className="flex items-center gap-sm ms-0" style={{ minHeight: `${ROW_HEIGHT_REM}rem` }}>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium break-words">{collection.name}</span>
        {collection.description && (
          <span className="text-sm text-hot-gray-500 break-words"> — {collection.description}</span>
        )}
      </div>
      {isDeleting ? (
        <Spinner />
      ) : (
        <button
          type="button"
          onClick={onDelete}
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
  const [tab, setTab] = useState<'add' | 'manage'>('add')
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!open) return
    setName('')
    setDescription('')
    setTab('add')
    setPage(1)
  }, [open])

  const totalPages = Math.max(1, Math.ceil(collections.length / PAGE_SIZE))
  // Deleting the last row of the last page shrinks the list under the current
  // page, so clamp on render rather than chasing it with an effect.
  const currentPage = Math.min(page, totalPages)
  const pageCollections = collections.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

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
          // Fields are cleared on reopen; closing here is enough.
          onClose()
        },
      }
    )
  }

  function remove(id: string) {
    deleteCollection.mutate(id, {
      onSuccess: () => {
        toast.success(m.plan_collections_toast_collection_deleted())
        onClose()
      },
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
      <TabGroup
        active={tab}
        onWaTabShow={(e) => setTab(e.detail.name as 'add' | 'manage')}
        className="wa-tabs-equal-height wa-tabs-compact"
      >
        <Tab panel="add">{m.plan_collections_dialog_add_label()}</Tab>
        <Tab panel="manage">{m.plan_collections_dialog_manage_label()}</Tab>

        <TabPanel name="add">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
            className="flex flex-col gap-sm"
          >
            <p className="text-sm text-hot-gray-500">{m.plan_collections_dialog_add_hint()}</p>
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
            {/* Enter-to-submit looks through `form.elements` for a native submit
                button; wa-button isn't form-associated and never appears there,
                so keep a hidden native one alongside it. */}
            <button type="submit" className="hidden" tabIndex={-1} aria-hidden="true" />
            <div className="flex justify-end">
              <Button type="submit" disabled={!canSubmit}>
                {createCollection.isPending
                  ? m.plan_collections_adding()
                  : m.plan_collections_dialog_create()}
              </Button>
            </div>
          </form>
        </TabPanel>

        <TabPanel name="manage">
          {isLoading ? (
            <Spinner label={m.plan_form_loading()} />
          ) : collections.length === 0 ? (
            <p className="text-sm text-hot-gray-500">{m.plan_collections_empty_collections()}</p>
          ) : (
            <div className="flex flex-col gap-md">
              {/* Reserve a full page (rows plus the dividers between them) so
                  every page is the same height, however short the last one is. */}
              <ul
                className="flex flex-col divide-y divide-hot-gray-200"
                style={{
                  minHeight: `calc(${PAGE_SIZE * ROW_HEIGHT_REM}rem + ${PAGE_SIZE - 1}px)`,
                }}
              >
                {pageCollections.map((collection) => (
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
              {totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </div>
          )}
        </TabPanel>
      </TabGroup>
    </Dialog>
  )
}

export default CollectionsDialog
