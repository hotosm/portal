import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import CardSkeleton from "../components/shared/CardSkeleton";
import Carousel from "../components/shared/Carousel";
import CarouselItem from "../components/shared/CarouselItem";
import PageWrapper from "../components/shared/PageWrapper";
import { RichTextContent } from "../components/shared/RichTextContent";
import Tag from "../components/shared/Tag";
import { cardClassNames } from "../constants/classNames";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useIsMobile } from "../hooks/useIsMobile";
import { m } from "../paraglide/messages";
import { projectKey } from "../utils/utils";
import CardAddProject from "./components/CardAddProject";
import CollectionsDialog from "./components/CollectionsDialog";
import PlanMenu from "./components/PlanMenu";
import PlanProjectCard from "./components/PlanProjectCard";
import PlanSectionHeader from "./components/PlanSectionHeader";
import PlanShareButton from "./components/PlanShareButton";
import PlanSubSectionAccordion from "./components/PlanSubSectionAccordion";
import ProjectPickerDialog from "./components/ProjectPickerDialog";
import SortableViewProjectCard from "./components/SortableViewProjectCard";
import {
  planQueryKeys,
  useCollections,
  useCompleteTask,
  usePlan,
  useRefreshPlan,
  useSharedPlan,
  useUpdatePlan,
  useUpdateProjectStatus,
} from "./hooks";
import type {
  HydratedProjectItem,
  PendingTaskInput,
  PlanProjectItem,
  PlanReadHydrated,
  ProjectOption,
} from "./types";
import Button from "../components/shared/Button";
import Icon from "../components/shared/Icon";

/** Bucket for projects in no collection — the taxonomy API models it as an empty list. */
const ALL_SECTION_ID = "all";

const dragIdFor = (sectionId: string, id: string) => `${sectionId}:${id}`;
const planProjectId = (dragId: string) => dragId.slice(dragId.indexOf(":") + 1);

/** Map a hydrated project/task back to the payload shape expected by PATCH /plans. */
function toItem(p: HydratedProjectItem): PlanProjectItem {
  if (p.project_exists) {
    return {
      app: p.app,
      project_id: p.project_id,
      project_exists: true,
      status: p.status,
      data: p.data,
      featured: p.featured,
    };
  }
  return {
    app: p.app,
    project_exists: false,
    status: p.status,
    data: p.data,
    featured: p.featured,
  };
}

function MyPlanPage() {
  const { planId } = useParams<{ planId: string }>();
  const { isLogin, isAuthLoading } = useAuth();
  const { currentLanguage } = useLanguage();
  const isMobile = useIsMobile();

  const {
    data: ownPlan,
    isLoading: ownLoading,
    isError: ownError,
  } = usePlan(planId ?? "");

  const {
    data: publicPlan,
    isLoading: publicLoading,
    isError: publicError,
  } = useSharedPlan(planId ?? "");

  const plan = ownPlan ?? publicPlan;
  // Whether we're rendering the caller's private view (usePlan) vs. the public
  // shared view (useSharedPlan) — drives which endpoints/errors apply.
  const viewingOwn = ownPlan != null;
  // can_edit: creator OR a group member with edit rights (all editing actions).
  // Owner-only actions (delete, manage permissions) are gated inside PlanMenu
  // via plan.is_owner.
  const canEdit = plan?.can_edit ?? false;

  const [pickerOpen, setPickerOpen] = useState(false);
  const [collectionsDialogOpen, setCollectionsDialogOpen] = useState(false);
  const { data: collections = [] } = useCollections();

  const { mutate: updatePlan } = useUpdatePlan();
  const { mutate: updateStatus } = useUpdateProjectStatus();
  const { mutate: completeTask } = useCompleteTask(planId ?? "");
  const { mutate: refreshPlan, isPending: isRefreshing } = useRefreshPlan(
    planId ?? "",
    !viewingOwn,
  );
  const queryClient = useQueryClient();


  const revalidatedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!plan || !planId) return;
    if (revalidatedRef.current === planId) return;
    revalidatedRef.current = planId;
    refreshPlan();
  }, [plan, planId, refreshPlan]);


  const pendingRetriesRef = useRef(0);
  useEffect(() => {
    if (!plan || !planId) return;
    const hasPending = plan.projects.some((p) => p.error === "pending");
    if (!hasPending) {
      pendingRetriesRef.current = 0;
      return;
    }
    if (pendingRetriesRef.current >= 6) return;
    pendingRetriesRef.current += 1;
    const timer = setTimeout(() => refreshPlan(), 5000);
    return () => clearTimeout(timer);
  }, [plan, planId, refreshPlan]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function patchCachedProjects(projects: HydratedProjectItem[]) {
    queryClient.setQueryData<PlanReadHydrated | null>(
      planQueryKeys.detail(planId!),
      (old) => (old ? { ...old, projects } : old),
    );
  }


  function persistProjects(projects: PlanProjectItem[]) {
    if (!plan) return;
    updatePlan(
      { id: plan.id, payload: { projects } },
      {
        onSuccess: () => {
          revalidatedRef.current = null;
        },
      },
    );
  }

  function handleFeaturedToggle(id: string, featured: boolean) {
    if (!plan) return;
    const updated = plan.projects.map((p) => (p.id === id ? { ...p, featured } : p));
    patchCachedProjects(updated);
    persistProjects(updated.map(toItem));
  }

  // A PATCH only invalidates the plan query, so `plan.projects` still lags behind
  // right after a save. Keep the list we last sent here so reopening the picker
  // and adding again before the refetch lands doesn't drop the previous item.
  const draftRef = useRef<PlanProjectItem[] | null>(null);

  // The refreshed (or locally patched) list is authoritative again — drop the draft.
  useEffect(() => {
    draftRef.current = null;
  }, [plan?.projects]);

  /** Items as last sent to the API, newest edits included. */
  function currentItems(): PlanProjectItem[] {
    return draftRef.current ?? plan?.projects.map(toItem) ?? [];
  }

  function appendToPlan(item: PlanProjectItem) {
    if (!plan) return;
    const next = [...currentItems(), item];
    draftRef.current = next;
    persistProjects(next);
  }

  function handleAddProject(project: ProjectOption) {
    if (!plan) return;
    appendToPlan({
      app: project.app,
      project_id: project.project_id,
      project_exists: true,
      // Fall back to the resolved title so the card shows a name right away;
      // some apps only expose the title (no upstream) until rehydration.
      // Skip that fallback while still resolving (e.g. an OAM TMS URL) — its
      // "title" is just the raw project_id placeholder, not a real name, and
      // stashing it in `data` would mark the row as already hydrated, hiding
      // the pending spinner and never getting replaced by the real title.
      data:
        (project.upstream as Record<string, unknown> | null) ??
        (project.title && !project.isResolving ? { name: project.title } : null),
    });
  }

  function handleAddTask(task: PendingTaskInput) {
    appendToPlan({
      app: task.app,
      project_exists: false,
      data: { title: task.title },
    });
  }

  function handleTaskCompleted(planProjectId: string, project: ProjectOption) {
    completeTask({
      planProjectId,
      app: project.app,
      projectId: project.project_id,
    });
  }

  function handleProjectDeleted(id: string) {
    if (!plan) return;
    const remaining = plan.projects.filter((p) => p.id !== id);
    patchCachedProjects(remaining);
    persistProjects(remaining.map(toItem));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !plan) return;
    const ids = plan.projects.map((p) => p.id);
    // Cards are dragged by their section-scoped id; ordering is global.
    const reordered = arrayMove(
      ids,
      ids.indexOf(planProjectId(active.id as string)),
      ids.indexOf(planProjectId(over.id as string)),
    ).map((id) => plan.projects.find((p) => p.id === id)!);
    patchCachedProjects(reordered);
    persistProjects(reordered.map(toItem));
  }

  const isLoading =
    isAuthLoading || ownLoading || (ownPlan == null && publicLoading);
  const isError = viewingOwn ? ownError : publicError;

  if (!isLoading && isError) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center">
          <h3 className="py-xl">{m.plan_load_error()}</h3>
        </div>
      </PageWrapper>
    );
  }

  if (!isLoading && !plan) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center">
          <h3 className="py-xl">
            {isLogin ? m.plan_not_found() : m.plan_private()}
          </h3>
        </div>
      </PageWrapper>
    );
  }

  const featuredProjects = plan ? plan.projects.filter((p) => p.featured) : [];

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
                    canEdit && project.project_exists && project.project_id
                      ? (status) =>
                          updateStatus({
                            planId: planId!,
                            app: project.app,
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
    ) : null;

  const collectionsOnPlan = new Map(
    (plan?.projects ?? []).flatMap((p) => p.groups.map((g) => [g.id, g] as const)),
  );
  // "All" (projects in no collection) always renders last.
  const sectionDefs = [
    ...collections
      .filter((collection) => collectionsOnPlan.has(collection.id))
      .map((collection) => ({ id: collection.id, title: collection.name })),
    ...[...collectionsOnPlan.values()]
      .filter((collection) => !collections.some((own) => own.id === collection.id))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((collection) => ({ id: collection.id, title: collection.name })),
    { id: ALL_SECTION_ID, title: m.plan_collections_all_bucket() },
  ];

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
      );
    }

    const sectionProjects = plan!.projects.filter((p) =>
      section.id === ALL_SECTION_ID
        ? p.groups.length === 0
        : p.groups.some((g) => g.id === section.id),
    );
    // Adding is offered in "All" only: the picker knows apps, not collections, so
    // new projects arrive unassigned and are sorted on the plan collections page.
    const showAddCard = canEdit && section.id === ALL_SECTION_ID;
    if (!showAddCard && sectionProjects.length === 0) return null;

    return (
      <PlanSubSectionAccordion key={section.id} title={<strong>{section.title}</strong>}>
        <PageWrapper>
          <div className="flex flex-wrap gap-lg py-lg">
            {showAddCard && (
              <div className={cardClassNames}>
                <CardAddProject onButtonClick={() => setPickerOpen(true)} />
              </div>
            )}
            {canEdit ? (
              <SortableContext
                items={sectionProjects.map((p) => dragIdFor(section.id, p.id))}
                strategy={rectSortingStrategy}
              >
                {sectionProjects.map((project) => (
                  <SortableViewProjectCard
                    key={project.id}
                    id={project.id}
                    dragId={dragIdFor(section.id, project.id)}
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
          </div>
        </PageWrapper>
      </PlanSubSectionAccordion>
    );
  });

  return (
    <>
      <PlanSectionHeader
        plan={isLoading ? undefined : plan!}
        breadcrumbs={
          isLoading
            ? undefined
            : [
                { label: m.plan_header(), href: `/${currentLanguage}/plan` },
                { label: plan!.name },
              ]
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
              <RichTextContent content={plan!.description ?? ""} className="py-md" />
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
                      className={`overflow-hidden aspect-[16/9] ${plan!.images.length === 1 ? "max-w-2xl mx-auto w-full" : "w-full"}`}
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
      <PageWrapper>
        <div>
          <div className="flex gap-xs">
            <Button variant="danger" onClick={() => setPickerOpen(true)}>
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

      {featuredSection}

      {!isLoading && canEdit ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {sections}
        </DndContext>
      ) : (
        sections
      )}

      {canEdit && pickerOpen && (
        <ProjectPickerDialog
          open
          existingKeys={
            new Set(
              currentItems()
                .filter((p) => p.project_exists !== false && p.project_id)
                .map((p) => projectKey(p.app, p.project_id as string)),
            )
          }
          onAddProject={handleAddProject}
          onAddTask={handleAddTask}
          onClose={() => setPickerOpen(false)}
        />
      )}

      <CollectionsDialog
        open={collectionsDialogOpen}
        onClose={() => setCollectionsDialogOpen(false)}
      />
    </>
  );
}

export default MyPlanPage;
