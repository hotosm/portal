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
import { useState } from "react";
import { useParams } from "react-router-dom";
import CardSkeleton from "../components/shared/CardSkeleton";
import Carousel from "../components/shared/Carousel";
import CarouselItem from "../components/shared/CarouselItem";
import PageWrapper from "../components/shared/PageWrapper";
import { RichTextContent } from "../components/shared/RichTextEditor";
import SubSectionHeader from "../components/shared/SubSectionHeader";
import Tag from "../components/shared/Tag";
import { cardClassNames } from "../constants/classNames";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useIsMobile } from "../hooks/useIsMobile";
import { m } from "../paraglide/messages";
import { projectKey } from "../utils/utils";
import CardAddProject from "./components/CardAddProject";
import PlanMenu from "./components/PlanMenu";
import PlanProjectCard from "./components/PlanProjectCard";
import PlanSectionHeader from "./components/PlanSectionHeader";
import PlanShareButton from "./components/PlanShareButton";
import ProjectPickerDialog from "./components/ProjectPickerDialog";
import SortableViewProjectCard from "./components/SortableViewProjectCard";
import { PLAN_SECTIONS } from "./contstants";
import {
  planQueryKeys,
  useAllUserProjects,
  useCompleteTask,
  usePlan,
  useSharedPlan,
  useUpdatePlan,
  useUpdateProjectStatus,
} from "./hooks";
import type {
  AppName,
  HydratedProjectItem,
  PendingTaskInput,
  PlanProjectItem,
  PlanReadHydrated,
  ProjectOption,
} from "./types";

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

  const isOwner = isLogin && ownPlan != null;
  const plan = ownPlan ?? publicPlan;

  const [pickerSection, setPickerSection] = useState<AppName[] | null>(null);
  const { sources } = useAllUserProjects();

  const { mutate: updatePlan } = useUpdatePlan();
  const { mutate: updateStatus } = useUpdateProjectStatus();
  const { mutate: completeTask } = useCompleteTask(planId ?? "");
  /* const { mutate: refreshPlan, isPending: isRefreshing } = useRefreshPlan(
    planId ?? "",
  ); */
  const queryClient = useQueryClient();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function patchCachedProjects(projects: HydratedProjectItem[]) {
    queryClient.setQueryData<PlanReadHydrated | null>(
      planQueryKeys.detail(planId!),
      (old) => (old ? { ...old, projects } : old),
    );
  }

  function handleFeaturedToggle(id: string, featured: boolean) {
    if (!plan) return;
    const updated = plan.projects.map((p) => (p.id === id ? { ...p, featured } : p));
    patchCachedProjects(updated);
    updatePlan({ id: plan.id, payload: { projects: updated.map(toItem) } });
  }

  function handlePickerConfirm(
    next: Set<string>,
    nextExtra: ProjectOption[],
    keptTaskIds: Set<string>,
    newTasks: PendingTaskInput[],
  ) {
    if (!plan) return;
    const apps = new Set(pickerSection ?? []);
    const options = new Map<string, ProjectOption>([
      ...sources
        .flatMap((s) => s.projects)
        .map((p) => [projectKey(p.app, p.project_id), p] as const),
      ...nextExtra.map((p) => [projectKey(p.app, p.project_id), p] as const),
    ]);

    const projects: PlanProjectItem[] = [];
    // Other sections preserved; tasks of this section kept only if the picker
    // left them checked; real projects of this section kept only if still selected.
    for (const p of plan.projects) {
      const inSection = apps.has(p.app);
      if (!inSection) {
        projects.push(toItem(p));
        continue;
      }
      if (!p.project_exists) {
        if (keptTaskIds.has(p.id)) projects.push(toItem(p));
        continue;
      }
      if (p.project_id && next.has(projectKey(p.app, p.project_id))) {
        projects.push(toItem(p));
      }
    }
    // Append newly picked real projects (the old "pending" option is gone).
    for (const key of next) {
      const opt = options.get(key);
      const colon = key.indexOf(":");
      const app = key.slice(0, colon) as AppName;
      const projId = key.slice(colon + 1);
      if (!projId) continue;
      const already = plan.projects.some(
        (p) => p.project_exists && p.app === app && p.project_id === projId,
      );
      if (already) continue;
      projects.push({
        app,
        project_id: projId,
        project_exists: true,
        data: (opt?.upstream as Record<string, unknown> | null) ?? null,
      });
    }
    // Append newly created tasks.
    for (const t of newTasks) {
      projects.push({
        app: t.app,
        project_exists: false,
        data: { title: t.title },
      });
    }

    updatePlan({ id: plan.id, payload: { projects } });
    setPickerSection(null);
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
    updatePlan({ id: plan.id, payload: { projects: remaining.map(toItem) } });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !plan) return;
    const ids = plan.projects.map((p) => p.id);
    const reordered = arrayMove(
      ids,
      ids.indexOf(active.id as string),
      ids.indexOf(over.id as string),
    ).map((id) => plan.projects.find((p) => p.id === id)!);
    patchCachedProjects(reordered);
    updatePlan({ id: plan.id, payload: { projects: reordered.map(toItem) } });
  }

  const isLoading =
    isAuthLoading || ownLoading || (ownPlan == null && publicLoading);
  const isError = isOwner ? ownError : publicError;

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
  const featuredIds = new Set(featuredProjects.map((p) => p.id));

  const featuredSection =
    featuredProjects.length > 0 ? (
      <div key="featured">
        <SubSectionHeader title="<strong>Featured</strong>" />
        <PageWrapper>
          <div className="flex flex-wrap gap-lg py-lg">
            {featuredProjects.map((project) => (
              <div key={project.id} className={cardClassNames}>
                <PlanProjectCard
                  project={project}
                  onStatusChange={
                    isOwner && project.project_exists && project.project_id
                      ? (status) =>
                          updateStatus({
                            planId: planId!,
                            app: project.app,
                            projectId: project.project_id!,
                            status,
                          })
                      : undefined
                  }
                  onDelete={isOwner ? () => handleProjectDeleted(project.id) : undefined}
                  onFeaturedChange={
                    isOwner ? (featured) => handleFeaturedToggle(project.id, featured) : undefined
                  }
                />
              </div>
            ))}
          </div>
        </PageWrapper>
      </div>
    ) : null;

  const sections = PLAN_SECTIONS.map((section) => {
    if (isLoading) {
      return (
        <div key={section.title}>
          <SubSectionHeader title={`<strong>${section.title}</strong>`} />
          <PageWrapper>
            <div className="flex flex-wrap gap-lg py-lg">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={cardClassNames}>
                  <CardSkeleton hasImage linesCount={2} />
                </div>
              ))}
            </div>
          </PageWrapper>
        </div>
      );
    }

    const sectionProjects = plan!.projects.filter(
      (p) => section.apps.includes(p.app) && !featuredIds.has(p.id),
    );
    if (!isOwner && sectionProjects.length === 0) return null;

    return (
      <div key={section.title}>
        <SubSectionHeader title={`<strong>${section.title}</strong>`} />
        <PageWrapper>
          <div className="flex flex-wrap gap-lg py-lg">
            {isOwner && (
              <div className={cardClassNames}>
                <CardAddProject
                  onButtonClick={() => setPickerSection(section.apps)}
                />
              </div>
            )}
            {isOwner ? (
              <SortableContext
                items={sectionProjects.map((p) => p.id)}
                strategy={rectSortingStrategy}
              >
                {sectionProjects.map((project) => (
                  <SortableViewProjectCard
                    key={project.id}
                    id={project.id}
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
      </div>
    );
  });

  return (
    <>
      <PlanSectionHeader
        breadcrumbs={
          isLoading
            ? undefined
            : [
                { label: m.plan_header(), href: `/${currentLanguage}/plan` },
                { label: plan!.name },
              ]
        }
        menu={
          isLoading ? undefined : isOwner ? (
            <div className="flex items-center gap-sm">
              {/* <Button
                type="button"
                appearance="outlined"
                size="small"
                onClick={() => refreshPlan()}
                disabled={isRefreshing}
              >
                {isRefreshing
                  ? m.plan_refreshing_button()
                  : m.plan_refresh_button()}
              </Button> */}
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
            {plan!.is_public && isOwner && (
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

      {featuredSection}

      {!isLoading && isOwner ? (
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

      {isOwner && pickerSection && (
        <ProjectPickerDialog
          open
          selected={
            new Set(
              plan!.projects
                .filter((p) => p.project_exists && p.project_id)
                .map((p) => projectKey(p.app, p.project_id as string)),
            )
          }
          extraProjects={[]}
          sources={sources.filter((s) => pickerSection.includes(s.app))}
          existingTasks={plan!.projects.filter(
            (p) => !p.project_exists && pickerSection.includes(p.app),
          )}
          onConfirm={handlePickerConfirm}
          onClose={() => setPickerSection(null)}
        />
      )}
    </>
  );
}

export default MyPlanPage;
