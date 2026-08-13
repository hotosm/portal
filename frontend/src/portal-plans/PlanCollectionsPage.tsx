import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import Button from '../components/shared/Button'
import Dialog from '../components/shared/Dialog'
import Icon from '../components/shared/Icon'
import Option from '../components/shared/Option'
import PageWrapper from '../components/shared/PageWrapper'
import Select from '../components/shared/Select'
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
  useCreateProjectTag,
  useDeleteCollection,
  useDeleteProjectTag,
  useMyGroups,
  usePlan,
  useProjectTags,
  useSetProjectCollections,
  useSetProjectTags,
  useUpdateCollection,
  useUpdateProjectTag,
} from './hooks'
import type { Collection, GroupType, HydratedProjectItem, ProjectTag } from './types'

/** Ownership scope of a new collection/tag, mirroring PlanPermissionsDialog. */
type Scope = 'personal' | GroupType

/** Read the selected value from a Web Awesome `<wa-select>` change event. */
function selectValue(event: unknown): string {
  return (event as { target: { value?: string } }).target?.value ?? ''
}

/**
 * Best-effort display name for a plan row. Deliberately simpler than
 * PlanProjectCard's usePlanProjectDisplay — this page lists rows to attach
 * taxonomies to, so it doesn't need the card's image/href resolution or its
 * extra ChatMap title fetch.
 */
function rowTitle(project: HydratedProjectItem): string {
  const src = project.upstream ?? project.data
  const raw = src?.name ?? src?.title ?? src?.project_name
  if (typeof raw === 'string' && raw) return raw
  return project.project_id ?? m.plan_collections_untitled()
}

interface ScopeFieldProps {
  scope: Scope
  groupId: string | null
  onScopeChange: (scope: Scope) => void
  onGroupIdChange: (groupId: string | null) => void
}

/**
 * Scope picker for a new collection/tag: personal, or shared with one of the user's
 * login teams/organizations. Renders nothing when the user has no memberships,
 * in which case everything they create is personal.
 */
function ScopeField({ scope, groupId, onScopeChange, onGroupIdChange }: ScopeFieldProps) {
  const { data: userGroups = [] } = useMyGroups()
  const teamGroups = userGroups.filter((g) => g.type === 'team')
  const orgGroups = userGroups.filter((g) => g.type === 'organization')
  if (userGroups.length === 0) return null

  const scopeGroups = scope === 'team' ? teamGroups : orgGroups

  return (
    <>
      <Select
        label={m.plan_collections_scope_label()}
        value={scope}
        onChange={(e) => {
          const next = selectValue(e) as Scope
          onScopeChange(next)
          if (next === 'personal') {
            onGroupIdChange(null)
            return
          }
          const list = next === 'team' ? teamGroups : orgGroups
          onGroupIdChange(list[0]?.id ?? null)
        }}
      >
        <Option value="personal">{m.plan_collections_scope_personal()}</Option>
        {teamGroups.length > 0 && <Option value="team">{m.plan_collections_scope_team()}</Option>}
        {orgGroups.length > 0 && (
          <Option value="organization">{m.plan_collections_scope_org()}</Option>
        )}
      </Select>
      {scope !== 'personal' && (
        <Select
          label={m.plan_collections_scope_which_label()}
          value={groupId ?? ''}
          onChange={(e) => onGroupIdChange(selectValue(e) || null)}
        >
          {scopeGroups.map((g) => (
            <Option key={g.id} value={g.id}>
              {g.name}
            </Option>
          ))}
        </Select>
      )}
    </>
  )
}

interface TaxonomyRowProps {
  entity: Collection | ProjectTag
  description?: string | null
  isSaving: boolean
  onRename: (name: string, description: string | null) => void
  onDelete: () => void
}

/** One collection/tag in the management list, with inline rename and delete. */
function TaxonomyRow({ entity, description, isSaving, onRename, onDelete }: TaxonomyRowProps) {
  // `description === undefined` marks a tag (no description field at all),
  // distinct from a collection whose description is null.
  const hasDescription = description !== undefined
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(entity.name)
  const [desc, setDesc] = useState(description ?? '')

  function startEditing() {
    setName(entity.name)
    setDesc(description ?? '')
    setEditing(true)
  }

  function save() {
    const trimmed = name.trim()
    if (!trimmed) return
    onRename(trimmed, hasDescription ? desc.trim() || null : null)
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
        {hasDescription && (
          <textarea
            value={desc}
            rows={2}
            placeholder={m.plan_collections_description_placeholder()}
            onChange={(e) => setDesc(e.target.value)}
            className="border border-hot-gray-300 rounded-lg px-md py-sm text-sm outline-none focus:border-hot-red-500 resize-y"
          />
        )}
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
        <div className="flex items-center gap-xs flex-wrap">
          <span className="font-medium break-words">{entity.name}</span>
          {entity.group_id && (
            <Tag variant="neutral" appearance="outlined" size="small">
              {m.plan_collections_shared_tag()}
            </Tag>
          )}
        </div>
        {description && (
          <p className="text-sm text-hot-gray-600 mt-xs break-words">{description}</p>
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

interface ChipPickerProps {
  label: string
  options: { id: string; name: string }[]
  selected: Set<string>
  disabled: boolean
  emptyHint: string
  onToggle: (id: string) => void
}

/**
 * Toggleable chips for assigning collections/tags to a plan row. Chips rather than a
 * multi-`<wa-select>`: assignments are usually one or two clicks and stay
 * readable at a glance next to every project.
 */
function ChipPicker({ label, options, selected, disabled, emptyHint, onToggle }: ChipPickerProps) {
  return (
    <div className="flex flex-col gap-xs">
      <span className="text-xs font-medium text-hot-gray-500 uppercase tracking-wide">{label}</span>
      {options.length === 0 ? (
        <span className="text-sm text-hot-gray-500">{emptyHint}</span>
      ) : (
        <div className="flex flex-wrap gap-xs">
          {options.map((option) => {
            const isSelected = selected.has(option.id)
            return (
              <button
                key={option.id}
                type="button"
                disabled={disabled}
                onClick={() => onToggle(option.id)}
                aria-pressed={isSelected}
                className="disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Tag
                  variant={isSelected ? 'brand' : 'neutral'}
                  appearance={isSelected ? 'filled' : 'outlined'}
                  size="small"
                >
                  {option.name}
                </Tag>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function PlanCollectionsPage() {
  const { planId } = useParams<{ planId: string }>()
  const { isLogin, isAuthLoading } = useAuth()
  const { currentLanguage } = useLanguage()

  const { data: plan, isLoading: planLoading, isError: planError } = usePlan(planId ?? '')
  const { data: collections = [], isLoading: collectionsLoading } = useCollections()
  const { data: tags = [], isLoading: tagsLoading } = useProjectTags()

  const createCollection = useCreateCollection()
  const updateCollection = useUpdateCollection()
  const deleteCollection = useDeleteCollection()
  const createTag = useCreateProjectTag()
  const updateTag = useUpdateProjectTag()
  const deleteTag = useDeleteProjectTag()
  const setProjectCollections = useSetProjectCollections(planId ?? '')
  const setProjectTags = useSetProjectTags(planId ?? '')

  const [collectionName, setCollectionName] = useState('')
  const [collectionDesc, setCollectionDesc] = useState('')
  const [collectionScope, setCollectionScope] = useState<Scope>('personal')
  const [collectionScopeId, setCollectionScopeId] = useState<string | null>(null)

  const [tagName, setTagName] = useState('')
  const [tagScope, setTagScope] = useState<Scope>('personal')
  const [tagScopeId, setTagScopeId] = useState<string | null>(null)

  // Which entity a delete confirmation is open for, if any.
  const [pendingDelete, setPendingDelete] = useState<{
    kind: 'collection' | 'tag'
    id: string
    name: string
  } | null>(null)

  const canEdit = plan?.can_edit ?? false
  const isLoading = isAuthLoading || planLoading

  function handleCreateCollection(e: React.FormEvent) {
    e.preventDefault()
    const name = collectionName.trim()
    if (!name) return
    createCollection.mutate(
      {
        name,
        description: collectionDesc.trim() || null,
        group_type: collectionScope === 'personal' ? null : collectionScope,
        group_id: collectionScope === 'personal' ? null : collectionScopeId,
      },
      {
        onSuccess: () => {
          setCollectionName('')
          setCollectionDesc('')
          toast.success(m.plan_collections_toast_collection_created())
        },
      }
    )
  }

  function handleCreateTag(e: React.FormEvent) {
    e.preventDefault()
    const name = tagName.trim()
    if (!name) return
    createTag.mutate(
      {
        name,
        group_type: tagScope === 'personal' ? null : tagScope,
        group_id: tagScope === 'personal' ? null : tagScopeId,
      },
      {
        onSuccess: () => {
          setTagName('')
          toast.success(m.plan_collections_toast_tag_created())
        },
      }
    )
  }

  function handleConfirmDelete() {
    if (!pendingDelete) return
    const { kind, id } = pendingDelete
    const mutation = kind === 'collection' ? deleteCollection : deleteTag
    mutation.mutate(id, {
      onSuccess: () => {
        setPendingDelete(null)
        toast.success(
          kind === 'collection'
            ? m.plan_collections_toast_collection_deleted()
            : m.plan_collections_toast_tag_deleted()
        )
      },
    })
  }

  // Assignment endpoints replace the whole set, so toggling means sending the
  // current ids with one added or removed.
  function toggleCollectionOnProject(project: HydratedProjectItem, collectionId: string) {
    const current = project.groups.map((g) => g.id)
    const next = current.includes(collectionId)
      ? current.filter((id) => id !== collectionId)
      : [...current, collectionId]
    setProjectCollections.mutate({ planProjectId: project.id, collectionIds: next })
  }

  function toggleTagOnProject(project: HydratedProjectItem, tagId: string) {
    const current = project.tags.map((t) => t.id)
    const next = current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId]
    setProjectTags.mutate({ planProjectId: project.id, tagIds: next })
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

      {/* Taxonomy management — collections and tags are owned by the user (or shared
          with a team/org), so edits here affect every plan that uses them. */}
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
            <ScopeField
              scope={collectionScope}
              groupId={collectionScopeId}
              onScopeChange={setCollectionScope}
              onGroupIdChange={setCollectionScopeId}
            />
            <div>
              <Button type="submit" disabled={createCollection.isPending || !collectionName.trim()}>
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
                <TaxonomyRow
                  key={collection.id}
                  entity={collection}
                  description={collection.description}
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
                  onDelete={() =>
                    setPendingDelete({
                      kind: 'collection',
                      id: collection.id,
                      name: collection.name,
                    })
                  }
                />
              ))}
            </ul>
          )}
        </div>
      </PageWrapper>

      <SubSectionHeader title={`<strong>${m.plan_collections_section_tags()}</strong>`} />
      <PageWrapper>
        <div className="flex flex-col gap-md py-lg max-w-2xl">
          <form onSubmit={handleCreateTag} className="flex flex-col gap-sm">
            <input
              type="text"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder={m.plan_collections_new_tag_placeholder()}
              className="border border-hot-gray-300 rounded-lg px-md py-sm text-base outline-none focus:border-hot-red-500"
            />
            <ScopeField
              scope={tagScope}
              groupId={tagScopeId}
              onScopeChange={setTagScope}
              onGroupIdChange={setTagScopeId}
            />
            <div>
              <Button type="submit" disabled={createTag.isPending || !tagName.trim()}>
                <Icon slot="start" library="bootstrap" name="plus" />
                {createTag.isPending ? m.plan_collections_adding() : m.plan_collections_add()}
              </Button>
            </div>
          </form>

          {tagsLoading ? (
            <Spinner label={m.plan_form_loading()} />
          ) : tags.length === 0 ? (
            <p className="text-sm text-hot-gray-500">{m.plan_collections_empty_tags()}</p>
          ) : (
            <ul className="flex flex-col gap-sm">
              {tags.map((tag) => (
                <TaxonomyRow
                  key={tag.id}
                  entity={tag}
                  isSaving={updateTag.isPending && updateTag.variables?.id === tag.id}
                  onRename={(name) =>
                    updateTag.mutate(
                      { id: tag.id, payload: { name } },
                      {
                        onSuccess: () => toast.success(m.plan_collections_toast_tag_updated()),
                      }
                    )
                  }
                  onDelete={() => setPendingDelete({ kind: 'tag', id: tag.id, name: tag.name })}
                />
              ))}
            </ul>
          )}
        </div>
      </PageWrapper>

      {/* Assignment — which collections/tags each project in *this* plan carries. */}
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
                  {project.groups.length === 0 && (
                    <Tag variant="neutral" appearance="outlined" size="small">
                      {m.plan_collections_all_bucket()}
                    </Tag>
                  )}
                </div>
                <ChipPicker
                  label={m.plan_collections_assign_collections_label()}
                  options={collections}
                  selected={new Set(project.groups.map((g) => g.id))}
                  disabled={!canEdit || setProjectCollections.isPending}
                  emptyHint={m.plan_collections_empty_collections()}
                  onToggle={(collectionId) => toggleCollectionOnProject(project, collectionId)}
                />
                <ChipPicker
                  label={m.plan_collections_assign_tags_label()}
                  options={tags}
                  selected={new Set(project.tags.map((t) => t.id))}
                  disabled={!canEdit || setProjectTags.isPending}
                  emptyHint={m.plan_collections_empty_tags()}
                  onToggle={(tagId) => toggleTagOnProject(project, tagId)}
                />
              </div>
            ))
          )}
        </div>
      </PageWrapper>

      <Dialog
        open={pendingDelete !== null}
        label={
          pendingDelete?.kind === 'tag'
            ? m.plan_collections_delete_tag_label()
            : m.plan_collections_delete_collection_label()
        }
        onWaHide={(e: Event) => {
          if (e.target === e.currentTarget) setPendingDelete(null)
        }}
      >
        <p>
          <strong className="break-words">{pendingDelete?.name}</strong>
          {' — '}
          {pendingDelete?.kind === 'tag'
            ? m.plan_collections_delete_tag_message()
            : m.plan_collections_delete_collection_message()}
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
            disabled={deleteCollection.isPending || deleteTag.isPending}
          >
            {m.plan_collections_delete()}
          </Button>
        </div>
      </Dialog>
    </>
  )
}

export default PlanCollectionsPage
