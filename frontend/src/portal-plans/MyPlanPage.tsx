import {
  type CollisionDetection,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from '../components/shared/Button'
import CardSkeleton from '../components/shared/CardSkeleton'
import Carousel from '../components/shared/Carousel'
import CarouselItem from '../components/shared/CarouselItem'
import Icon from '../components/shared/Icon'
import PageWrapper from '../components/shared/PageWrapper'
import { RichTextContent } from '../components/shared/RichTextContent'
import Tag from '../components/shared/Tag'
import { cardClassNames } from '../constants/classNames'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useIsMobile } from '../hooks/useIsMobile'
import { m } from '../paraglide/messages'
import { projectKey } from '../utils/utils'
import CardAddProject from './components/CardAddProject'
import CollectionSection from './components/CollectionSection'
import CollectionsDialog from './components/CollectionsDialog'
import PlanMenu from './components/PlanMenu'
import PlanProjectCard from './components/PlanProjectCard'
import PlanSectionHeader from './components/PlanSectionHeader'
import PlanShareButton from './components/PlanShareButton'
import PlanSubSectionAccordion from './components/PlanSubSectionAccordion'
import ProjectPickerDialog from './components/ProjectPickerDialog'
import SortableViewProjectCard from './components/SortableViewProjectCard'
import { ALL_SECTION_ID, isSectionDropId } from './contstants'
import {
  planQueryKeys,
  useAddProject,
  useCollections,
  useCompleteTask,
  usePlan,
  useRefreshPlan,
  useRemoveProject,
  useReorderProjects,
  useSetProjectFeatured,
  useSharedPlan,
  useUpdateProjectStatus,
} from './hooks'
import type { AppName, HydratedProjectItem, PlanReadHydrated, ProjectOption } from './types'

/** Projects of one section, in their stored order. */
function projectsOf(projects: HydratedProjectItem[], sectionId: string) {
  return projects.filter((p) =>
    sectionId === ALL_SECTION_ID ? p.collection_id == null : p.collection_id === sectionId
  )
}

/**
 * Whatever sits under the pointer wins, cards before their section.
 *
 * The default `closestCorners` compares distances against every registered
 * droppable at once, so a card dragged across sections kept matching its own
 * neighbours — the drop read as a reorder inside the section it started in.
 * Falling back to rect intersection covers the gap when the pointer leaves the
 * page while dragging.
 */
const collisionDetection: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args)
  const hits = pointerHits.length > 0 ? pointerHits : rectIntersection(args)
  // A card and the section under it both match; the card gives an exact slot,
  // the bare section means "drop at the end".
  const cardHits = hits.filter((hit) => !isSectionDropId(String(hit.id)))
  return cardHits.length > 0 ? cardHits : hits
}

function MyPlanPage() {
  const { planId } = useParams<{ planId: string }>()
  const { isLogin, isAuthLoading } = useAuth()
  const { currentLanguage } = useLanguage()
  const isMobile = useIsMobile()

  const { data: ownPlan, isLoading: ownLoading, isError: ownError } = usePlan(planId ?? '')

  const {
    data: publicPlan,
    isLoading: publicLoading,
    isError: publicError,
  } = useSharedPlan(planId ?? '')

  const plan = ownPlan ?? publicPlan
  // Whether we're rendering the caller's private view (usePlan) vs. the public
  // shared view (useSharedPlan) — drives which endpoints/errors apply.
  const viewingOwn = ownPlan != null
  // can_edit: creator OR a group member with edit rights (all editing actions).
  // Owner-only actions (delete, manage permissions) are gated inside PlanMenu
  // via plan.is_owner.
  const canEdit = plan?.can_edit ?? false

  // Section whose picker is open, if any — what it adds lands in that
  // collection, so the choice of section travels with the dialog.
  const [pickerSection, setPickerSection] = useState<string | null>(null)
  const [collectionsDialogOpen, setCollectionsDialogOpen] = useState(false)
  // The plan carries its collections; the query keeps them fresh after a create
  // or rename without waiting for the plan to refetch.
  const { data: fetchedCollections } = useCollections(viewingOwn ? (planId ?? '') : '')
  const collections = fetchedCollections ?? plan?.collections ?? []

  const { mutate: updateStatus } = useUpdateProjectStatus()
  const { mutate: completeTask } = useCompleteTask(planId ?? '')
  const { mutate: addProject } = useAddProject(planId ?? '')
  const { mutate: removeProject } = useRemoveProject(planId ?? '')
  const { mutate: setFeatured } = useSetProjectFeatured(planId ?? '')
  const { mutate: reorderProjects } = useReorderProjects(planId ?? '')
  const { mutate: refreshPlan, isPending: isRefreshing } = useRefreshPlan(planId ?? '', !viewingOwn)
  const queryClient = useQueryClient()

  const revalidatedRef = useRef<string | null>(null)
  useEffect(() => {
    if (!plan || !planId) return
    if (revalidatedRef.current === planId) return
    revalidatedRef.current = planId
    refreshPlan()
  }, [plan, planId, refreshPlan])

  const pendingRetriesRef = useRef(0)
  useEffect(() => {
    if (!plan || !planId) return
    const hasPending = plan.projects.some((p) => p.error === 'pending')
    if (!hasPending) {
      pendingRetriesRef.current = 0
      return
    }
    if (pendingRetriesRef.current >= 6) return
    pendingRetriesRef.current += 1
    const timer = setTimeout(() => refreshPlan(), 5000)
    return () => clearTimeout(timer)
  }, [plan, planId, refreshPlan])
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function patchCachedProjects(projects: HydratedProjectItem[]) {
    queryClient.setQueryData<PlanReadHydrated | null>(planQueryKeys.detail(planId!), (old) =>
      old ? { ...old, projects } : old
    )
  }

  function handleFeaturedToggle(id: string, featured: boolean) {
    if (!plan) return
    patchCachedProjects(plan.projects.map((p) => (p.id === id ? { ...p, featured } : p)))
    setFeatured({ planProjectId: id, featured })
  }

  /** Collection the open picker adds into; null is the "All" bucket. */
  function pickerCollectionId() {
    return pickerSection && pickerSection !== ALL_SECTION_ID ? pickerSection : null
  }

  function handleAddProject(project: ProjectOption) {
    addProject({
      app: project.app,
      project_id: project.project_id,
      project_exists: true,
      collection_id: pickerCollectionId(),
      // Fall back to the resolved title so the card shows a name right away;
      // some apps only expose the title (no upstream) until rehydration.
      // Skip that fallback while still resolving (e.g. an OAM TMS URL) — its
      // "title" is just the raw project_id placeholder, not a real name, and
      // stashing it in `data` would mark the row as already hydrated, hiding
      // the pending spinner and never getting replaced by the real title.
      data:
        (project.upstream as Record<string, unknown> | null) ??
        (project.title && !project.isResolving ? { name: project.title } : null),
    })
  }

  function handleAddTask(title: string) {
    addProject({ project_exists: false, data: { title }, collection_id: pickerCollectionId() })
  }

  function handleTaskCompleted(planProjectId: string, project: ProjectOption) {
    completeTask({
      planProjectId,
      app: project.app,
      projectId: project.project_id,
    })
  }

  function handleProjectDeleted(id: string) {
    if (!plan) return
    patchCachedProjects(plan.projects.filter((p) => p.id !== id))
    removeProject(id)
  }

  /**
   * The card that follows the pointer, drawn by DragOverlay.
   *
   * Each section body lives inside a wa-accordion-item that clips its content,
   * so dragging the card's own node out of its section made it vanish. The
   * overlay renders a copy outside that hierarchy; `width` is carried over
   * because the card sizes itself as a fraction of the section's flex row.
   */
  const [dragging, setDragging] = useState<{
    project: HydratedProjectItem
    width: number
    /** Section the card started in — the one to renumber once it lands elsewhere. */
    fromSection: string
  } | null>(null)

  function handleDragStart(event: DragStartEvent) {
    const project = plan?.projects.find((p) => p.id === event.active.id)
    const fromSection = event.active.data.current?.sectionId as string | undefined
    if (!project || !fromSection) return
    setDragging({
      project,
      fromSection,
      width: event.active.rect.current.initial?.width ?? 0,
    })
  }

  /** Rewrite both sections in the cache, keeping every other section untouched. */
  function placeProjects(landed: HydratedProjectItem[], origin: HydratedProjectItem[]) {
    const touched = new Set([...landed, ...origin].map((p) => p.id))
    patchCachedProjects([...plan!.projects.filter((p) => !touched.has(p.id)), ...landed, ...origin])
  }

  /**
   * Move the card into the section it is hovering, mid-drag.
   *
   * Without this the target section has no idea it is about to receive a card,
   * so its own cards never step aside — reordering animated inside a section
   * but crossing into another one looked frozen. Moving it here puts the card
   * in the target's SortableContext, which opens the gap. Only cross-section
   * moves are handled; reordering within a section is the sortable's own job
   * and is settled on drop.
   */
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over || !plan) return
    const fromSection = active.data.current?.sectionId as string | undefined
    const toSection = over.data.current?.sectionId as string | undefined
    if (!fromSection || !toSection || fromSection === toSection) return

    const project = plan.projects.find((p) => p.id === active.id)
    if (!project) return

    const overProjectId = over.data.current?.projectId as string | undefined
    const target = projectsOf(plan.projects, toSection).filter((p) => p.id !== project.id)
    const overIndex = overProjectId ? target.findIndex((p) => p.id === overProjectId) : -1
    const insertAt = overIndex === -1 ? target.length : overIndex
    const moved = { ...project, collection_id: toSection === ALL_SECTION_ID ? null : toSection }

    placeProjects(
      [...target.slice(0, insertAt), moved, ...target.slice(insertAt)],
      projectsOf(plan.projects, fromSection).filter((p) => p.id !== project.id)
    )
  }

  /**
   * Settle the final order and persist it.
   *
   * By now handleDragOver has already put the card in its target section, so
   * this only has to resolve the slot inside that section — and renumber the
   * section the card originally came from, so positions stay contiguous.
   */
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    const fromSection = dragging?.fromSection
    setDragging(null)
    if (!plan || !fromSection) return
    // Dropped outside any section: undo whatever the hover moved.
    if (!over) {
      queryClient.invalidateQueries({ queryKey: planQueryKeys.detail(planId!) })
      return
    }

    const project = plan.projects.find((p) => p.id === active.id)
    const toSection = over.data.current?.sectionId as string | undefined
    if (!project || !toSection) return

    const current = projectsOf(plan.projects, toSection)
    const from = current.findIndex((p) => p.id === project.id)
    if (from === -1) return
    // Dropped on a card → take its slot; dropped on the section → stay last.
    const overProjectId = over.data.current?.projectId as string | undefined
    const overIndex = overProjectId ? current.findIndex((p) => p.id === overProjectId) : -1
    const to = overIndex === -1 ? current.length - 1 : overIndex
    if (fromSection === toSection && from === to) return

    const nextCollectionId = toSection === ALL_SECTION_ID ? null : toSection
    const landed = arrayMove(current, from, to).map((p) => ({
      ...p,
      collection_id: nextCollectionId,
    }))
    const origin =
      fromSection === toSection
        ? []
        : projectsOf(plan.projects, fromSection).filter((p) => p.id !== project.id)

    placeProjects(landed, origin)
    reorderProjects([
      ...landed.map((p, index) => ({
        id: p.id,
        collection_id: nextCollectionId,
        display_order: index,
      })),
      ...origin.map((p, index) => ({
        id: p.id,
        collection_id: fromSection === ALL_SECTION_ID ? null : fromSection,
        display_order: index,
      })),
    ])
  }

  const isLoading = isAuthLoading || ownLoading || (ownPlan == null && publicLoading)
  const isError = viewingOwn ? ownError : publicError

  if (!isLoading && isError) {
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

  const featuredProjects = plan ? plan.projects.filter((p) => p.featured) : []

  const featuredSection =
    featuredProjects.length > 0 ? (
      <PlanSubSectionAccordion key="featured" title={<strong>Featured</strong>}>
        <PageWrapper>
          <div className="flex flex-wrap gap-lg py-lg">
            {featuredProjects.map((project) => (
              <div key={project.id} className={cardClassNames}>
                <PlanProjectCard
                  project={project}
                  onStatusChange={
                    canEdit && project.project_exists && project.project_id && project.app
                      ? (status) =>
                          updateStatus({
                            planId: planId!,
                            app: project.app!,
                            projectId: project.project_id!,
                            status,
                          })
                      : undefined
                  }
                  onDelete={canEdit ? () => handleProjectDeleted(project.id) : undefined}
                  onFeaturedChange={
                    canEdit ? (featured) => handleFeaturedToggle(project.id, featured) : undefined
                  }
                  planId={canEdit ? planId : undefined}
                />
              </div>
            ))}
          </div>
        </PageWrapper>
      </PlanSubSectionAccordion>
    ) : null

  // Every collection of the plan renders, empty ones included: an empty section
  // is where a project gets dropped to join that collection. "All" goes last.
  const sectionDefs = [
    ...collections.map((collection) => ({ id: collection.id, title: collection.name })),
    { id: ALL_SECTION_ID, title: m.plan_collections_all_bucket() },
  ]

  const sections = sectionDefs.map((section) => {
    if (isLoading) {
      return (
        <PlanSubSectionAccordion key={section.id} title={<strong>{section.title}</strong>}>
          <PageWrapper>
            <div className="flex flex-wrap gap-lg py-lg">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={cardClassNames}>
                  <CardSkeleton hasImage linesCount={2} />
                </div>
              ))}
            </div>
          </PageWrapper>
        </PlanSubSectionAccordion>
      )
    }

    const sectionProjects = projectsOf(plan!.projects, section.id)
    // Every section offers adding, and what it adds lands in that collection.
    const showAddCard = canEdit
    if (!canEdit && sectionProjects.length === 0) return null

    return (
      <PlanSubSectionAccordion key={section.id} title={<strong>{section.title}</strong>}>
        <PageWrapper>
          <CollectionSection sectionId={section.id} isDroppable={canEdit}>
            {showAddCard && (
              <div className={cardClassNames}>
                <CardAddProject onButtonClick={() => setPickerSection(section.id)} />
              </div>
            )}
            {canEdit ? (
              <SortableContext
                items={sectionProjects.map((p) => p.id)}
                strategy={rectSortingStrategy}
              >
                {sectionProjects.map((project) => (
                  <SortableViewProjectCard
                    key={project.id}
                    id={project.id}
                    sectionId={section.id}
                    project={project}
                    planId={plan!.id}
                    onProjectSelected={handleTaskCompleted}
                    onProjectDeleted={handleProjectDeleted}
                    onFeaturedToggle={handleFeaturedToggle}
                  />
                ))}
              </SortableContext>
            ) : (
              sectionProjects.map((project) => (
                <div key={project.id} className={cardClassNames}>
                  <PlanProjectCard project={project} />
                </div>
              ))
            )}
            {canEdit && sectionProjects.length === 0 && (
              <p className="self-center text-sm text-hot-gray-500">
                {m.plan_collections_drop_hint()}
              </p>
            )}
          </CollectionSection>
        </PageWrapper>
      </PlanSubSectionAccordion>
    )
  })

  return (
    <>
      <PlanSectionHeader
        plan={isLoading ? undefined : plan!}
        breadcrumbs={
          isLoading
            ? undefined
            : [{ label: m.plan_header(), href: `/${currentLanguage}/plan` }, { label: plan!.name }]
        }
        menu={
          isLoading ? undefined : canEdit ? (
            <div className="flex items-center gap-sm">
              {isRefreshing && (
                <span
                  className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-hot-gray-300 border-t-hot-red"
                  aria-label="Updating"
                  title="Updating…"
                />
              )}
              <PlanMenu plan={plan!} />
            </div>
          ) : plan!.is_public ? (
            <PlanShareButton plan={plan!} />
          ) : undefined
        }
      >
        {isLoading ? (
          <div className="animate-pulse bg-hot-gray-300 rounded h-6 w-48" />
        ) : (
          plan!.name
        )}
      </PlanSectionHeader>

      <PageWrapper>
        {isLoading ? (
          <div className="animate-pulse space-y-sm py-md">
            <div className="h-4 bg-hot-gray-300 rounded w-3/4" />
            <div className="h-4 bg-hot-gray-300 rounded w-full" />
            <div className="h-4 bg-hot-gray-300 rounded w-1/2" />
          </div>
        ) : (
          <>
            {plan!.is_public && canEdit && (
              <Tag variant="neutral" appearance="filled" size="large" className="mb-[10px]">
                {m.plan_public_tag()}
              </Tag>
            )}
            {plan!.description && (
              <RichTextContent content={plan!.description ?? ''} className="py-md" />
            )}
            {plan!.images.length > 0 && (
              <Carousel
                loop
                mouseDragging
                navigation
                pagination
                slidesPerPage={isMobile ? 1 : 2}
                slidesPerMove={isMobile ? 1 : 2}
                className="w-full"
              >
                {plan!.images.map((img) => (
                  <CarouselItem key={img.id}>
                    <div
                      className={`overflow-hidden aspect-[16/9] ${plan!.images.length === 1 ? 'max-w-2xl mx-auto w-full' : 'w-full'}`}
                    >
                      <img
                        src={img.url}
                        alt={`Image ${img.id}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </Carousel>
            )}
          </>
        )}
      </PageWrapper>

      {/* actions */}
      {canEdit && (
        <PageWrapper>
          <div>
            <div className="flex gap-xs">
              <Button variant="danger" onClick={() => setPickerSection(ALL_SECTION_ID)}>
                <Icon name="circle-plus" />
                Add project
              </Button>
              <Button onClick={() => setCollectionsDialogOpen(true)}>
                <Icon name="folder" variant="regular" />
                Collections
              </Button>
            </div>
          </div>
        </PageWrapper>
      )}

      {featuredSection}

      {!isLoading && canEdit ? (
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={() => {
            setDragging(null)
            // The hover may have moved the card already; go back to the server's word.
            queryClient.invalidateQueries({ queryKey: planQueryKeys.detail(planId!) })
          }}
        >
          {sections}
          <DragOverlay>
            {dragging && (
              <div style={{ width: dragging.width || undefined }} className="cursor-grabbing">
                <PlanProjectCard project={dragging.project} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      ) : (
        sections
      )}

      {canEdit && pickerSection && (
        <ProjectPickerDialog
          open
          existingKeys={
            new Set(
              (plan?.projects ?? [])
                .filter((p) => p.project_exists && p.app && p.project_id)
                .map((p) => projectKey(p.app as AppName, p.project_id as string))
            )
          }
          onAddProject={handleAddProject}
          onAddTask={handleAddTask}
          onClose={() => setPickerSection(null)}
        />
      )}

      {canEdit && (
        <CollectionsDialog
          planId={planId ?? ''}
          open={collectionsDialogOpen}
          onClose={() => setCollectionsDialogOpen(false)}
        />
      )}
    </>
  )
}

export default MyPlanPage
