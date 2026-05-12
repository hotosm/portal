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
  onProjectPickerConfirm: (next: Set<string>, nextExtra: ProjectOption[]) => void;
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
  onProjectPickerConfirm,
}: PlanProjectsFieldProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  return (
    <div className="flex flex-col gap-sm">
      <div className="flex items-center justify-between gap-md">
        <span className="text-sm font-medium text-hot-gray-700">
          {m.plan_form_projects_label()}
        </span>
        {isLoading && loadingCount > 0 && (
          <span className="text-sm text-hot-gray-400">
            +{loadingCount} {m.plan_form_loading()}
          </span>
        )}
      </div>
      <Button
        type="button"
        appearance="outlined"
        onClick={() => setDialogOpen(true)}
      >
        {m.plan_form_add_projects()}
      </Button>

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
          if (sectionKeys.length === 0) return null;

          return (
            <div key={section.titleKey} className="flex flex-col gap-sm">
              <p className="text-sm font-semibold text-hot-gray-600 border-b border-hot-gray-100 pb-xs">
                {SECTION_TITLE[section.titleKey]?.()}
              </p>
              <SortableContext items={sectionKeys} strategy={rectSortingStrategy}>
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
            </div>
          );
        })}
      </DndContext>

      <ProjectPickerDialog
        open={dialogOpen}
        selected={selected}
        extraProjects={extraProjects}
        sources={sources}
        onConfirm={(next, nextExtra) => {
          onProjectPickerConfirm(next, nextExtra);
          setDialogOpen(false);
        }}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}

export default PlanProjectsField;
