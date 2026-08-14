import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import Button from '../components/shared/Button'
import Dialog from '../components/shared/Dialog'
import Icon from '../components/shared/Icon'
import PageWrapper from '../components/shared/PageWrapper'
import Spinner from '../components/shared/Spinner'
import SubSectionHeader from '../components/shared/SubSectionHeader'
import Tag from '../components/shared/Tag'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { m } from '../paraglide/messages'
import { APP_META } from '../utils/appMeta'
import PlanSectionHeader from './components/PlanSectionHeader'
import {
  useCollections,
  useCreateCollection,
  useDeleteCollection,
  usePlan,
  useSetProjectCollection,
  useUpdateCollection,
} from './hooks'
import type { Collection, HydratedProjectItem } from './types'

/**
 * Best-effort display name for a plan row. Deliberately simpler than
 * PlanProjectCard's usePlanProjectDisplay — this page lists rows to attach
 * collections to, so it doesn't need the card's image/href resolution or its
 * extra ChatMap title fetch.
 */
function rowTitle(project: HydratedProjectItem): string {
  const src = project.upstream ?? project.data
  const raw = src?.name ?? src?.title ?? src?.project_name
  if (typeof raw === 'string' && raw) return raw
  return project.project_id ?? m.plan_collections_untitled()
}

interface CollectionRowProps {
  collection: Collection
  isSaving: boolean
  onRename: (name: string, description: string | null) => void
  onDelete: () => void
}

/** One collection in the management list, with inline rename and delete. */
function CollectionRow({ collection, isSaving, onRename, onDelete }: CollectionRowProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(collection.name)
  const [desc, setDesc] = useState(collection.description ?? '')

  function startEditing() {
    setName(collection.name)
    setDesc(collection.description ?? '')
    setEditing(true)
  }

  function save() {
    const trimmed = name.trim()
    if (!trimmed) return
    onRename(trimmed, desc.trim() || null)
    setEditing(false)
  }

  if (editing) {
    return (
      <li className="flex flex-col gap-sm border border-hot-gray-300 rounded-lg p-md">
        <input
          type="text"
          value={name}
          autoFocus
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save()
            if (e.key === 'Escape') setEditing(false)
          }}
          className="border border-hot-gray-300 rounded-lg px-md py-sm text-base outline-none focus:border-hot-red-500"
        />
        <textarea
          value={desc}
          rows={2}
          placeholder={m.plan_collections_description_placeholder()}
          onChange={(e) => setDesc(e.target.value)}
          className="border border-hot-gray-300 rounded-lg px-md py-sm text-sm outline-none focus:border-hot-red-500 resize-y"
        />
        <div className="flex gap-sm justify-end">
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-sm text-hot-gray-500 hover:text-hot-gray-700 underline"
          >
            {m.plan_cancel()}
          </button>
          <Button type="button" size="small" onClick={save} disabled={isSaving || !name.trim()}>
            {m.plan_collections_save()}
          </Button>
        </div>
      </li>
    )
  }

  return (
    <li className="flex items-start gap-sm border border-hot-gray-300 rounded-lg p-md">
      <div className="flex-1 min-w-0">
        <span className="font-medium break-words">{collection.name}</span>
        {collection.description && (
          <p className="text-sm text-hot-gray-600 mt-xs break-words">{collection.description}</p>
        )}
      </div>
      {isSaving && <Spinner />}
      <button
        type="button"
        onClick={startEditing}
        aria-label={m.plan_collections_rename()}
        className="text-hot-gray-500 hover:text-hot-gray-700"
      >
        <Icon library="bootstrap" name="pencil" label={m.plan_collections_rename()} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={m.plan_collections_delete()}
        className="text-hot-gray-500 hover:text-hot-red-600"
      >
        <Icon library="bootstrap" name="trash" label={m.plan_collections_delete()} />
      </button>
    </li>
  )
}

interface CollectionChipsProps {
  collections: Collection[]
  /** Collection the project is in, or null for the virtual "All" bucket. */
  value: string | null
  disabled: boolean
  onSelect: (collectionId: string | null) => void
}

/**
 * Collection picker for one project row. Chips rather than a `<wa-select>`:
 * assigning is one click and the current choice stays readable at a glance.
 * Clicking the selected chip clears it, sending the project back to "All".
 */
function CollectionChips({ collections, value, disabled, onSelect }: CollectionChipsProps) {
  if (collections.length === 0) {
    return (
      <span className="text-sm text-hot-gray-500">{m.plan_collections_empty_collections()}</span>
    )
  }
  return (
    <div className="flex flex-col gap-xs">
      <span className="text-xs font-medium text-hot-gray-500 uppercase tracking-wide">
        {m.plan_collections_assign_collection_label()}
      </span>
      <div className="flex flex-wrap gap-xs">
        {collections.map((collection) => {
          const isSelected = value === collection.id
          return (
            <button
              key={collection.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(isSelected ? null : collection.id)}
              aria-pressed={isSelected}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Tag
                variant={isSelected ? 'brand' : 'neutral'}
                appearance={isSelected ? 'filled' : 'outlined'}
                size="small"
              >
                {collection.name}
              </Tag>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PlanCollectionsPage() {
  const { planId } = useParams<{ planId: string }>()
  const { isLogin, isAuthLoading } = useAuth()
  const { currentLanguage } = useLanguage()

  const { data: plan, isLoading: planLoading, isError: planError } = usePlan(planId ?? '')
  const { data: collections = [], isLoading: collectionsLoading } = useCollections(planId ?? '')

  const createCollection = useCreateCollection(planId ?? '')
  const updateCollection = useUpdateCollection(planId ?? '')
  const deleteCollection = useDeleteCollection(planId ?? '')
  const setProjectCollection = useSetProjectCollection(planId ?? '')

  const [collectionName, setCollectionName] = useState('')
  const [collectionDesc, setCollectionDesc] = useState('')

  // Which collection a delete confirmation is open for, if any.
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null)

  const canEdit = plan?.can_edit ?? false
  const isLoading = isAuthLoading || planLoading

  function handleCreateCollection(e: React.FormEvent) {
    e.preventDefault()
    const name = collectionName.trim()
    if (!name) return
    createCollection.mutate(
      { name, description: collectionDesc.trim() || null },
      {
        onSuccess: () => {
          setCollectionName('')
          setCollectionDesc('')
          toast.success(m.plan_collections_toast_collection_created())
        },
      }
    )
  }

  function handleConfirmDelete() {
    if (!pendingDelete) return
    deleteCollection.mutate(pendingDelete.id, {
      onSuccess: () => {
        setPendingDelete(null)
        toast.success(m.plan_collections_toast_collection_deleted())
      },
    })
  }

  if (!isLoading && planError) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center">
          <h3 className="py-xl">{m.plan_load_error()}</h3>
        </div>
      </PageWrapper>
    )
  }

  if (!isLoading && !plan) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center">
          <h3 className="py-xl">{isLogin ? m.plan_not_found() : m.plan_private()}</h3>
        </div>
      </PageWrapper>
    )
  }

  return (
    <>
      <PlanSectionHeader
        breadcrumbs={
          isLoading
            ? undefined
            : [
                { label: m.plan_header(), href: `/${currentLanguage}/plan` },
                {
                  label: plan!.name,
                  href: `/${currentLanguage}/plan/${plan!.id}`,
                },
                { label: m.plan_collections_header() },
              ]
        }
      >
        {isLoading ? (
          <div className="animate-pulse bg-hot-gray-300 rounded h-6 w-48" />
        ) : (
          m.plan_collections_header()
        )}
      </PlanSectionHeader>

      <PageWrapper>
        <p className="text-sm text-hot-gray-600 py-md">{m.plan_collections_intro()}</p>
      </PageWrapper>

      <SubSectionHeader title={`<strong>${m.plan_collections_section_collections()}</strong>`} />
      <PageWrapper>
        <div className="flex flex-col gap-md py-lg max-w-2xl">
          <form onSubmit={handleCreateCollection} className="flex flex-col gap-sm">
            <input
              type="text"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              placeholder={m.plan_collections_new_collection_placeholder()}
              className="border border-hot-gray-300 rounded-lg px-md py-sm text-base outline-none focus:border-hot-red-500"
            />
            <textarea
              value={collectionDesc}
              rows={2}
              onChange={(e) => setCollectionDesc(e.target.value)}
              placeholder={m.plan_collections_description_placeholder()}
              className="border border-hot-gray-300 rounded-lg px-md py-sm text-sm outline-none focus:border-hot-red-500 resize-y"
            />
            <div>
              <Button
                type="submit"
                disabled={!canEdit || createCollection.isPending || !collectionName.trim()}
              >
                <Icon slot="start" library="bootstrap" name="plus" />
                {createCollection.isPending
                  ? m.plan_collections_adding()
                  : m.plan_collections_add()}
              </Button>
            </div>
          </form>

          {collectionsLoading ? (
            <Spinner label={m.plan_form_loading()} />
          ) : collections.length === 0 ? (
            <p className="text-sm text-hot-gray-500">{m.plan_collections_empty_collections()}</p>
          ) : (
            <ul className="flex flex-col gap-sm">
              {collections.map((collection) => (
                <CollectionRow
                  key={collection.id}
                  collection={collection}
                  isSaving={
                    updateCollection.isPending && updateCollection.variables?.id === collection.id
                  }
                  onRename={(name, description) =>
                    updateCollection.mutate(
                      { id: collection.id, payload: { name, description } },
                      {
                        onSuccess: () =>
                          toast.success(m.plan_collections_toast_collection_updated()),
                      }
                    )
                  }
                  onDelete={() => setPendingDelete({ id: collection.id, name: collection.name })}
                />
              ))}
            </ul>
          )}
        </div>
      </PageWrapper>

      {/* Assignment — which collection each project of this plan sits in. */}
      <SubSectionHeader title={`<strong>${m.plan_collections_section_assign()}</strong>`} />
      <PageWrapper>
        <div className="flex flex-col gap-md py-lg">
          {isLoading ? (
            <Spinner label={m.plan_form_loading()} />
          ) : plan!.projects.length === 0 ? (
            <p className="text-sm text-hot-gray-500">{m.plan_collections_no_projects()}</p>
          ) : (
            plan!.projects.map((project) => (
              <div
                key={project.id}
                className="flex flex-col gap-sm border border-hot-gray-300 rounded-lg p-md"
              >
                <div className="flex items-center gap-xs flex-wrap">
                  <span className="text-sm text-hot-gray-600">
                    {project.app ? (APP_META[project.app]?.name ?? project.app) : ''}
                  </span>
                  <span className="font-medium break-words">{rowTitle(project)}</span>
                  {project.collection_id == null && (
                    <Tag variant="neutral" appearance="outlined" size="small">
                      {m.plan_collections_all_bucket()}
                    </Tag>
                  )}
                </div>
                <CollectionChips
                  collections={collections}
                  value={project.collection_id}
                  disabled={!canEdit || setProjectCollection.isPending}
                  onSelect={(collectionId) =>
                    setProjectCollection.mutate({ planProjectId: project.id, collectionId })
                  }
                />
              </div>
            ))
          )}
        </div>
      </PageWrapper>

      <Dialog
        open={pendingDelete !== null}
        label={m.plan_collections_delete_collection_label()}
        onWaHide={(e: Event) => {
          if (e.target === e.currentTarget) setPendingDelete(null)
        }}
      >
        <p>
          <strong className="break-words">{pendingDelete?.name}</strong>
          {' — '}
          {m.plan_collections_delete_collection_message()}
        </p>
        <div slot="footer" className="flex gap-sm justify-end">
          <button
            type="button"
            onClick={() => setPendingDelete(null)}
            className="text-sm text-hot-gray-500 hover:text-hot-gray-700 underline"
          >
            {m.plan_cancel()}
          </button>
          <Button
            type="button"
            variant="danger"
            onClick={handleConfirmDelete}
            disabled={deleteCollection.isPending}
          >
            {m.plan_collections_delete()}
          </Button>
        </div>
      </Dialog>
    </>
  )
}

export default PlanCollectionsPage
