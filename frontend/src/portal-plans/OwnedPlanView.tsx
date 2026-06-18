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
import Carousel from "../components/shared/Carousel";
import CarouselItem from "../components/shared/CarouselItem";
import PageWrapper from "../components/shared/PageWrapper";
import { RichTextContent } from "../components/shared/RichTextEditor";
import SubSectionHeader from "../components/shared/SubSectionHeader";
import Tag from "../components/shared/Tag";
import { cardClassNames } from "../constants/classNames";
import { useLanguage } from "../contexts/LanguageContext";
import { useIsMobile } from "../hooks/useIsMobile";
import { m } from "../paraglide/messages";
import { projectKey } from "../utils/utils";
import CardAddProject from "./components/CardAddProject";
import PlanMenu from "./components/PlanMenu";
import PlanSectionHeader from "./components/PlanSectionHeader";
import ProjectPickerDialog from "./components/ProjectPickerDialog";
import SortableViewProjectCard from "./components/SortableViewProjectCard";
import { PLAN_SECTIONS } from "./constants";
import {
  planQueryKeys,
  useAllUserProjects,
  useCompleteTask,
  useUpdatePlan,
} from "./hooks";
import type {
  AppName,
  HydratedProjectItem,
  PendingTaskInput,
  PlanProjectItem,
  PlanReadHydrated,
  ProjectOption,
} from "./types";

function toItem(p: HydratedProjectItem): PlanProjectItem {
  if (p.project_exists) {
    return {
      app: p.app,
      project_id: p.project_id,
      project_exists: true,
      status: p.status,
      data: p.data,
    };
  }
  return {
    app: p.app,
    project_exists: false,
    status: p.status,
    data: p.data,
  };
}

interface Props {
  plan: PlanReadHydrated;
  planId: string;
}

export function OwnedPlanView({ plan, planId }: Props) {
  const { currentLanguage } = useLanguage();
  const isMobile = useIsMobile();
  const [pickerSection, setPickerSection] = useState<AppName[] | null>(null);
  const { sources } = useAllUserProjects();
  const { mutate: updatePlan } = useUpdatePlan();
  const { mutate: completeTask } = useCompleteTask(planId);
  const queryClient = useQueryClient();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function patchCachedProjects(projects: HydratedProjectItem[]) {
    queryClient.setQueryData<PlanReadHydrated | null>(
      planQueryKeys.detail(planId),
      (old) => (old ? { ...old, projects } : old),
    );
  }

  function handlePickerConfirm(
    next: Set<string>,
    nextExtra: ProjectOption[],
    keptTaskIds: Set<string>,
    newTasks: PendingTaskInput[],
  ) {
    const apps = new Set(pickerSection ?? []);
    const options = new Map<string, ProjectOption>([
      ...sources
        .flatMap((s) => s.projects)
        .map((p) => [projectKey(p.app, p.project_id), p] as const),
      ...nextExtra.map((p) => [projectKey(p.app, p.project_id), p] as const),
    ]);

    const projects: PlanProjectItem[] = [];
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
    const remaining = plan.projects.filter((p) => p.id !== id);
    patchCachedProjects(remaining);
    updatePlan({ id: plan.id, payload: { projects: remaining.map(toItem) } });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = plan.projects.map((p) => p.id);
    const reordered = arrayMove(
      ids,
      ids.indexOf(active.id as string),
      ids.indexOf(over.id as string),
    ).map((id) => plan.projects.find((p) => p.id === id)!);
    patchCachedProjects(reordered);
    updatePlan({ id: plan.id, payload: { projects: reordered.map(toItem) } });
  }

  return (
    <>
      <PlanSectionHeader
        breadcrumbs={[
          { label: m.plan_header(), href: `/${currentLanguage}/plan` },
          { label: plan.name },
        ]}
        menu={
          <div className="flex items-center gap-sm">
            <PlanMenu plan={plan} />
          </div>
        }
      >
        {plan.name}
      </PlanSectionHeader>

      <PageWrapper>
        <>
          {plan.is_public && (
            <Tag
              variant="neutral"
              appearance="filled"
              size="large"
              className="mb-[10px]"
            >
              {m.plan_public_tag()}
            </Tag>
          )}
          {plan.description && (
            <RichTextContent html={plan.description} className="py-md" />
          )}
          {plan.images.length > 0 && (
            <Carousel
              loop
              mouseDragging
              navigation
              pagination
              slidesPerPage={isMobile ? 1 : 2}
              slidesPerMove={isMobile ? 1 : 2}
              className="w-full"
            >
              {plan.images.map((img) => (
                <CarouselItem key={img.id}>
                  <div
                    className={`overflow-hidden aspect-[16/9] ${plan.images.length === 1 ? "max-w-2xl mx-auto w-full" : "w-full"}`}
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
      </PageWrapper>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {PLAN_SECTIONS.map((section) => {
          const sectionProjects = plan.projects.filter((p) =>
            section.apps.includes(p.app),
          );
          return (
            <div key={section.title}>
              <SubSectionHeader title={`<strong>${section.title}</strong>`} />
              <PageWrapper>
                <div className="flex flex-wrap gap-lg py-lg">
                  <div className={cardClassNames}>
                    <CardAddProject
                      onButtonClick={() => setPickerSection(section.apps)}
                    />
                  </div>
                  <SortableContext
                    items={sectionProjects.map((p) => p.id)}
                    strategy={rectSortingStrategy}
                  >
                    {sectionProjects.map((project) => (
                      <SortableViewProjectCard
                        key={project.id}
                        id={project.id}
                        project={project}
                        planId={plan.id}
                        onProjectSelected={handleTaskCompleted}
                        onProjectDeleted={handleProjectDeleted}
                      />
                    ))}
                  </SortableContext>
                </div>
              </PageWrapper>
            </div>
          );
        })}
      </DndContext>

      {pickerSection && (
        <ProjectPickerDialog
          open
          selected={
            new Set(
              plan.projects
                .filter((p) => p.project_exists && p.project_id)
                .map((p) => projectKey(p.app, p.project_id as string)),
            )
          }
          extraProjects={[]}
          sources={sources.filter((s) => pickerSection.includes(s.app))}
          existingTasks={plan.projects.filter(
            (p) => !p.project_exists && pickerSection.includes(p.app),
          )}
          onConfirm={handlePickerConfirm}
          onClose={() => setPickerSection(null)}
        />
      )}
    </>
  );
}
