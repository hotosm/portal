import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useIsMobile } from "../hooks/useIsMobile";
import CardSkeleton from "../components/shared/CardSkeleton";
import { RichTextContent } from "../components/shared/RichTextEditor";
import PageWrapper from "../components/shared/PageWrapper";
import SubSectionHeader from "../components/shared/SubSectionHeader";
import PlanProjectCard from "./components/PlanProjectCard";
import PlanTaskCard from "./components/PlanTaskCard";
import SortableViewProjectCard from "./components/SortableViewProjectCard";
import CardAddProject from "./components/CardAddProject";
import ProjectPickerDialog from "./components/ProjectPickerDialog";
import Carousel from "../components/shared/Carousel";
import CarouselItem from "../components/shared/CarouselItem";
import PlanMenu from "./components/PlanMenu";
import PlanShareButton from "./components/PlanShareButton";
import Tag from "../components/shared/Tag";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import {
  usePlan,
  useSharedPlan,
  useUpdatePlan,
  useAllUserProjects,
  planQueryKeys,
} from "./hooks";
import { m } from "../paraglide/messages";
import type { AppName, ProjectOption, PlanReadHydrated } from "./types";
import PlanSectionHeader from "./components/PlanSectionHeader";
import { cardClassNames } from "../constants/classNames";
import { PLAN_SECTIONS } from "./contstants";

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

  const [projectOrder, setProjectOrder] = useState<string[]>([]);
  useEffect(() => {
    if (plan) {
      setProjectOrder(plan.projects.map((p) => `${p.app}:${p.project_id}`));
    }
  }, [plan?.id]);

  const [pickerSection, setPickerSection] = useState<AppName[] | null>(null);
  const { sources } = useAllUserProjects();

  const { mutate: updatePlan } = useUpdatePlan();
  const queryClient = useQueryClient();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handlePickerConfirm(next: Set<string>, nextExtra: ProjectOption[]) {
    const newOrder = [
      ...projectOrder.filter((k) => next.has(k)),
      ...[...next].filter((k) => !projectOrder.includes(k)),
    ];
    setProjectOrder(newOrder);
    const allOptions = new Map<string, ProjectOption>([
      ...sources.flatMap((s) => s.projects).map((p) => [`${p.app}:${p.project_id}`, p] as const),
      ...nextExtra.map((p) => [`${p.app}:${p.project_id}`, p] as const),
    ]);
    const projects = newOrder.map((k) => {
      const colonIdx = k.indexOf(":");
      const app = k.slice(0, colonIdx) as AppName;
      const project_id = k.slice(colonIdx + 1);
      const existing = plan!.projects.find(
        (p) => p.app === app && p.project_id === project_id,
      );
      if (existing) {
        return {
          app: existing.app,
          project_id: existing.project_id,
          status: existing.status,
          data: existing.data,
        };
      }
      const option = allOptions.get(k);
      return {
        app,
        project_id,
        ...(option?.upstream ? { data: option.upstream } : {}),
      };
    });
    updatePlan({ id: plan!.id, payload: { projects } });
    setPickerSection(null);
  }

  function handleProjectSelected(oldKey: string, newProject: ProjectOption) {
    const newKey = `${newProject.app}:${newProject.project_id}`;

    // Optimistically update the cached plan so the re-render triggered by
    // setProjectOrder below can find the new project via plan.projects.find().
    queryClient.setQueryData<PlanReadHydrated | null>(
      planQueryKeys.detail(planId!),
      (old) => {
        if (!old) return old;
        return {
          ...old,
          projects: old.projects.map((p) =>
            `${p.app}:${p.project_id}` === oldKey
              ? {
                  ...p,
                  project_id: newProject.project_id,
                  data: newProject.upstream ?? null,
                  upstream: newProject.upstream ?? null,
                }
              : p,
          ),
        };
      },
    );

    const newOrder = projectOrder.map((k) => (k === oldKey ? newKey : k));
    setProjectOrder(newOrder);

    const projects = newOrder.map((k) => {
      const colonIdx = k.indexOf(":");
      const app = k.slice(0, colonIdx) as AppName;
      const project_id = k.slice(colonIdx + 1);
      if (k === newKey) {
        return {
          app,
          project_id,
          ...(newProject.upstream ? { data: newProject.upstream } : {}),
        };
      }
      const existing = plan!.projects.find(
        (p) => p.app === app && p.project_id === project_id,
      );
      return existing
        ? {
            app: existing.app,
            project_id: existing.project_id,
            status: existing.status,
            data: existing.data,
          }
        : { app, project_id };
    });
    updatePlan({ id: plan!.id, payload: { projects } });
  }

  function handleProjectDeleted(key: string) {
    const newOrder = projectOrder.filter((k) => k !== key);
    const colonIdx = key.indexOf(":");
    const deletedApp = key.slice(0, colonIdx);
    const deletedId = key.slice(colonIdx + 1);
    queryClient.setQueryData<PlanReadHydrated | null>(
      planQueryKeys.detail(planId!),
      (old) => {
        if (!old) return old;
        return {
          ...old,
          projects: old.projects.filter(
            (p) => !(p.app === deletedApp && p.project_id === deletedId),
          ),
        };
      },
    );
    setProjectOrder(newOrder);
    const projects = newOrder.map((k) => {
      const ci = k.indexOf(":");
      const app = k.slice(0, ci) as AppName;
      const project_id = k.slice(ci + 1);
      const existing = plan!.projects.find(
        (p) => p.app === app && p.project_id === project_id,
      );
      return existing
        ? { app: existing.app, project_id: existing.project_id, status: existing.status, data: existing.data }
        : { app, project_id };
    });
    updatePlan({ id: plan!.id, payload: { projects } });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const newOrder = arrayMove(
      projectOrder,
      projectOrder.indexOf(active.id as string),
      projectOrder.indexOf(over.id as string),
    );
    setProjectOrder(newOrder);
    const projects = newOrder.map((k) => {
      const colonIdx = k.indexOf(":");
      const app = k.slice(0, colonIdx) as AppName;
      const project_id = k.slice(colonIdx + 1);
      const p = plan!.projects.find(
        (p) => p.app === app && p.project_id === project_id,
      )!;
      return {
        app: p.app,
        project_id: p.project_id,
        status: p.status,
        data: p.data,
      };
    });
    updatePlan({ id: plan!.id, payload: { projects } });
  }
  const isLoading =
    isAuthLoading || ownLoading || (ownPlan === null && publicLoading);
  const isError = isOwner ? ownError : publicError;

  if (isLoading) {
    return (
      <>
        <PlanSectionHeader>
          <strong>{m.plan_header()}</strong>
        </PlanSectionHeader>
        <PageWrapper>
          <div className="flex flex-wrap gap-lg py-lg">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={cardClassNames}>
                <CardSkeleton hasImage linesCount={2} />
              </div>
            ))}
          </div>
        </PageWrapper>
      </>
    );
  }

  if (isError) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center">
          <h3 className="py-xl">{m.plan_load_error()}</h3>
        </div>
      </PageWrapper>
    );
  }

  if (!plan) {
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

  return (
    <>
      <PlanSectionHeader
        breadcrumbs={[
          { label: m.plan_header(), href: `/${currentLanguage}/plan` },
          { label: plan.name },
        ]}
        menu={
          isOwner ? (
            <PlanMenu plan={plan} />
          ) : plan.is_public ? (
            <PlanShareButton plan={plan} />
          ) : undefined
        }
      >
        {plan.name}
      </PlanSectionHeader>

      <PageWrapper>
        {plan.is_public && isOwner && (
          <Tag variant="neutral" appearance="filled" size="large">
            {m.plan_public_tag()}
          </Tag>
        )}
        {plan.description && (
          <RichTextContent
            html={plan.description}
            className="py-md text-hot-gray-500"
          />
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
      </PageWrapper>

      {(() => {
        const sections = PLAN_SECTIONS.map((section) => {
          const sectionProjectKeys = projectOrder.filter((k) => {
            const app = k.slice(0, k.indexOf(":")) as AppName;
            return section.apps.includes(app);
          });
          const tasks = (plan.tasks ?? []).filter((t) =>
            section.apps.includes(t.tool),
          );
          if (!isOwner && sectionProjectKeys.length === 0 && tasks.length === 0)
            return null;

          const projectKeySet = new Set(sectionProjectKeys);

          return (
            <div key={section.title}>
              <SubSectionHeader
                title={`<strong>${section.title}</strong>`}
                toolName={section.toolName}
              />
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
                      items={sectionProjectKeys}
                      strategy={rectSortingStrategy}
                    >
                      {sectionProjectKeys.map((key) => {
                        const colonIdx = key.indexOf(":");
                        const app = key.slice(0, colonIdx) as AppName;
                        const project_id = key.slice(colonIdx + 1);
                        const project = plan.projects.find(
                          (p) => `${p.app}:${p.project_id}` === key,
                        ) ?? {
                          app,
                          project_id,
                          status: "in_progress" as const,
                          data: null,
                          upstream: null,
                          error: null,
                        };
                        return (
                          <SortableViewProjectCard
                            key={key}
                            id={key}
                            project={project}
                            planId={plan.id}
                            onProjectSelected={handleProjectSelected}
                            onProjectDeleted={handleProjectDeleted}
                          />
                        );
                      })}
                    </SortableContext>
                  ) : (
                    plan.projects
                      .filter((p) =>
                        projectKeySet.has(`${p.app}:${p.project_id}`),
                      )
                      .map((project) => (
                        <div
                          key={`${project.app}:${project.project_id}`}
                          className={cardClassNames}
                        >
                          <PlanProjectCard project={project} />
                        </div>
                      ))
                  )}
                  {tasks.map((task) => (
                    <div key={task.id} className={cardClassNames}>
                      <PlanTaskCard task={task} />
                    </div>
                  ))}
                </div>
              </PageWrapper>
            </div>
          );
        });

        if (!isOwner) return sections;

        return (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            {sections}
          </DndContext>
        );
      })()}
      {isOwner && pickerSection && (
        <ProjectPickerDialog
          open
          selected={new Set(projectOrder)}
          extraProjects={[]}
          sources={sources.filter((s) => pickerSection.includes(s.app))}
          onConfirm={handlePickerConfirm}
          onClose={() => setPickerSection(null)}
        />
      )}
    </>
  );
}

export default MyPlanPage;
