import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import Button from "../../../components/shared/Button";
import { m } from "../../../paraglide/messages";
import type {
  AppName,
  PlanTaskItem,
  ProjectOption,
  ProjectSource,
  ProjectStatus,
} from "../../types";
import ProjectPickerDialog from "../ProjectPickerDialog";
import AddTaskDialog from "./AddTaskDialog";
import SortableCard from "./SortableCard";
import SortableTaskCard from "./SortableTaskCard";

const PLAN_SECTIONS: { titleKey: string; apps: AppName[] }[] = [
  { titleKey: "imagery", apps: ["drone-tasking-manager", "open-aerial-map"] },
  { titleKey: "mapping", apps: ["tasking-manager", "fair"] },
  { titleKey: "field", apps: ["field-tm", "chatmap"] },
  { titleKey: "data", apps: ["export-tool", "umap"] },
];

const SECTION_TITLE: Record<string, () => string> = {
  imagery: m.section_imagery,
  mapping: m.section_mapping,
  field: m.section_field,
  data: m.section_data,
};

function appFromKey(key: string): AppName {
  return key.slice(0, key.indexOf(":")) as AppName;
}

type ActiveDialog =
  | { sectionKey: string; type: "project"; apps: AppName[] }
  | { sectionKey: string; type: "task"; apps: AppName[] }
  | null;

interface PlanProjectsFieldProps {
  order: string[];
  selected: Set<string>;
  statuses: Record<string, ProjectStatus>;
  projectMap: Map<string, ProjectOption>;
  taskMap: Map<string, PlanTaskItem>;
  isLoading: boolean;
  loadingCount: number;
  extraProjects: ProjectOption[];
  sources: ProjectSource[];
  onDragEnd: (event: DragEndEvent) => void;
  onProjectRemove: (key: string) => void;
  onStatusChange: (key: string, status: ProjectStatus) => void;
  onTaskRemove: (key: string) => void;
  onTaskAdded: (title: string, tool: AppName) => void;
  onProjectPickerConfirm: (
    next: Set<string>,
    nextExtra: ProjectOption[],
  ) => void;
}

function PlanProjectsField({
  order,
  selected,
  statuses,
  projectMap,
  taskMap,
  isLoading,
  loadingCount,
  extraProjects,
  sources,
  onDragEnd,
  onProjectRemove,
  onStatusChange,
  onTaskRemove,
  onTaskAdded,
  onProjectPickerConfirm,
}: PlanProjectsFieldProps) {
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const sectionApps = activeDialog
    ? new Set(activeDialog.apps)
    : new Set<AppName>();
  const filteredSources = sources.filter((s) => sectionApps.has(s.app));
  const filteredExtras = extraProjects.filter((p) => sectionApps.has(p.app));
  const otherExtras = extraProjects.filter((p) => !sectionApps.has(p.app));

  function handleSectionProjectConfirm(
    next: Set<string>,
    nextSectionExtras: ProjectOption[],
  ) {
    onProjectPickerConfirm(next, [...otherExtras, ...nextSectionExtras]);
    setActiveDialog(null);
  }

  return (
    <div className="flex flex-col gap-xl">
      <div className="flex items-center justify-between gap-md">
        {isLoading && loadingCount > 0 && (
          <span className="text-sm text-hot-gray-400">
            +{loadingCount} {m.plan_form_loading()}
          </span>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        {PLAN_SECTIONS.map((section) => {
          const sectionKeys = order.filter((k) => {
            if (k.startsWith("task:")) {
              const task = taskMap.get(k);
              return task != null && section.apps.includes(task.tool);
            }
            return (
              selected.has(k) &&
              section.apps.includes(appFromKey(k)) &&
              projectMap.has(k)
            );
          });

          return (
            <div key={section.titleKey} className="flex flex-col gap-sm">
              <div className="flex items-center justify-between border-b border-hot-gray-100 pb-xs">
                <h5>{SECTION_TITLE[section.titleKey]?.()}</h5>
                <div className="flex items-center gap-xs">
                  <Button
                    type="button"
                    size="small"
                    appearance="filled"
                    onClick={() =>
                      setActiveDialog({
                        sectionKey: section.titleKey,
                        type: "project",
                        apps: section.apps,
                      })
                    }
                  >
                    {m.plan_form_add_projects()}
                  </Button>
                  <Button
                    type="button"
                    size="small"
                    appearance="outlined"
                    onClick={() =>
                      setActiveDialog({
                        sectionKey: section.titleKey,
                        type: "task",
                        apps: section.apps,
                      })
                    }
                  >
                    {m.plan_form_add_task()}
                  </Button>
                </div>
              </div>
              {sectionKeys.length > 0 && (
                <SortableContext
                  items={sectionKeys}
                  strategy={rectSortingStrategy}
                >
                  <div className="flex flex-wrap gap-lg">
                    {sectionKeys.map((key) => {
                      if (key.startsWith("task:")) {
                        const task = taskMap.get(key)!;
                        return (
                          <SortableTaskCard
                            key={key}
                            id={key}
                            task={task}
                            onRemove={() => onTaskRemove(key)}
                          />
                        );
                      }
                      return (
                        <SortableCard
                          key={key}
                          id={key}
                          project={projectMap.get(key)!}
                          status={statuses[key] ?? "in_progress"}
                          onStatusChange={(s) => onStatusChange(key, s)}
                          onRemove={() => onProjectRemove(key)}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              )}
            </div>
          );
        })}
      </DndContext>

      <ProjectPickerDialog
        open={activeDialog?.type === "project"}
        selected={selected}
        extraProjects={filteredExtras}
        sources={filteredSources}
        onConfirm={handleSectionProjectConfirm}
        onClose={() => setActiveDialog(null)}
      />

      <AddTaskDialog
        open={activeDialog?.type === "task"}
        allowedApps={activeDialog?.apps}
        onConfirm={(title, tool) => {
          onTaskAdded(title, tool);
          setActiveDialog(null);
        }}
        onClose={() => setActiveDialog(null)}
      />
    </div>
  );
}

export default PlanProjectsField;
