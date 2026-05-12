import { useState } from "react";
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
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Button from "../../components/shared/Button";
import ButtonGroup from "../../components/shared/ButtonGroup";
import RichTextEditor from "../../components/shared/RichTextEditor";
import { m } from "../../paraglide/messages";
import { formatProjectStatus } from "../../utils/utils";
import { useAllUserProjects } from "../hooks";
import type {
  AppName,
  HydratedProjectItem,
  PlanImageRead,
  ProjectOption,
  ProjectStatus,
} from "../types";
import PlanProjectCard from "./PlanProjectCard";
import ProjectPickerDialog from "./ProjectPickerDialog";
import { usePlanImageUpload } from "../hooks/usePlanImageUpload";

export interface PlanFormValues {
  name: string;
  description: string;
  selectedProjects: {
    app: AppName;
    project_id: string;
    status: ProjectStatus;
    data?: Record<string, unknown> | null;
  }[];
  pendingImages: File[];
}

interface PlanFormProps {
  initialName?: string;
  initialDescription?: string;
  initialProjectKeys?: Set<string>;
  initialProjectStatuses?: Record<string, ProjectStatus>;
  initialExtraProjects?: ProjectOption[];
  initialImages?: PlanImageRead[];
  planId?: string;
  submitLabel: string;
  isPending: boolean;
  onSubmit: (values: PlanFormValues) => Promise<void>;
  onCancel: () => void;
}

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

const CARD_CLASS =
  "w-full md:w-[calc(33.333%_-_var(--hot-spacing-large)*0.667)] lg:w-[calc(25%_-_var(--hot-spacing-large)*0.75)] shrink-0";

function projectKey(p: ProjectOption) {
  return `${p.app}:${p.project_id}`;
}

function appFromKey(key: string): AppName {
  return key.slice(0, key.indexOf(":")) as AppName;
}

function toHydrated(
  p: ProjectOption,
  status: ProjectStatus,
): HydratedProjectItem {
  return {
    app: p.app,
    project_id: p.project_id,
    status,
    data: p.upstream ?? (p.title ? { name: p.title } : null),
    upstream: p.upstream ?? null,
    error: null,
  };
}

interface SortableCardProps {
  id: string;
  project: ProjectOption;
  status: ProjectStatus;
  onStatusChange: (s: ProjectStatus) => void;
  onRemove: () => void;
}

function SortableCard({
  id,
  project,
  status,
  onStatusChange,
  onRemove,
}: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${CARD_CLASS} flex flex-col gap-xs`}
    >
      <div className="relative">
        <div
          {...attributes}
          {...listeners}
          className="absolute top-1 left-1 z-20 cursor-grab active:cursor-grabbing bg-black/30 text-white rounded px-1 leading-none select-none text-base"
        >
          ⠿
        </div>
        <PlanProjectCard project={toHydrated(project, status)} />
      </div>
      <div className="w-full flex justify-between gap-xs">
        <ButtonGroup label="Project status">
          <Button
            pill
            size="small"
            variant="neutral"
            appearance={status === "done" ? "plain" : "filled"}
            onClick={() => onStatusChange("in_progress")}
          >
            {formatProjectStatus("in_progress")}
          </Button>
          <Button
            pill
            size="small"
            variant={status === "done" ? "success" : "neutral"}
            appearance={status === "done" ? "filled" : "plain"}
            onClick={() => onStatusChange("done")}
          >
            {formatProjectStatus("done")}
          </Button>
        </ButtonGroup>
        <Button
          type="button"
          appearance="plain"
          size="small"
          onClick={onRemove}
        >
          ✕
        </Button>
      </div>
    </div>
  );
}

function PlanForm({
  initialName = "",
  initialDescription = "",
  initialProjectKeys = new Set(),
  initialProjectStatuses = {},
  initialExtraProjects = [],
  initialImages = [],
  planId,
  submitLabel,
  isPending,
  onSubmit,
  onCancel,
}: PlanFormProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [selected, setSelected] = useState<Set<string>>(initialProjectKeys);
  const [order, setOrder] = useState<string[]>(() => [...initialProjectKeys]);
  const [statuses, setStatuses] = useState<Record<string, ProjectStatus>>(
    initialProjectStatuses,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [extraProjects, setExtraProjects] =
    useState<ProjectOption[]>(initialExtraProjects);
  const { sources, projects, isLoading } = useAllUserProjects();
  const {
    displayImages,
    pendingImages,
    fileInputRef,
    isUploading,
    isDeleting,
    handleFileChange,
    handleRemoveImage,
  } = usePlanImageUpload({ planId, initialImages });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const allProjects = [...extraProjects, ...projects];
  const projectMap = new Map(allProjects.map((p) => [projectKey(p), p]));
  const loadingCount = [...selected].filter((k) => !projectMap.has(k)).length;
  const busy = isPending || isUploading || isDeleting;

  function removeProject(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    setOrder((prev) => prev.filter((k) => k !== key));
    setStatuses((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrder((prev) =>
      arrayMove(
        prev,
        prev.indexOf(active.id as string),
        prev.indexOf(over.id as string),
      ),
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProjects = order
      .filter((k) => selected.has(k))
      .map((k) => {
        const colonIdx = k.indexOf(":");
        const app = k.slice(0, colonIdx) as AppName;
        const project_id = k.slice(colonIdx + 1);
        const status = statuses[k] ?? ("in_progress" as ProjectStatus);
        const p = projectMap.get(k);
        return {
          app,
          project_id,
          status,
          ...(p?.upstream ? { data: p.upstream } : {}),
        };
      });
    await onSubmit({ name, description, selectedProjects, pendingImages });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-lg px-0 lg:px-2xl py-lg"
    >
      <div className="flex flex-col gap-xs">
        <label
          htmlFor="plan-name"
          className="text-sm font-medium text-hot-gray-700"
        >
          {m.plan_form_name_label()} <span className="text-hot-red-600">*</span>
        </label>
        <input
          id="plan-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder={m.plan_form_name_placeholder()}
          className="border border-hot-gray-300 rounded-lg px-md py-sm text-base outline-none focus:border-hot-red-500"
        />
      </div>

      <div className="flex flex-col gap-xs">
        <label
          htmlFor="plan-description"
          className="text-sm font-medium text-hot-gray-700"
        >
          {m.plan_form_description_label()}
        </label>
        <RichTextEditor
          id="plan-description"
          value={description}
          onChange={setDescription}
          placeholder={m.plan_form_description_placeholder()}
        />
      </div>

      <div className="flex flex-col gap-sm">
        <span>
          <p className="text-sm font-medium text-hot-gray-700">Images</p>

          <div className="flex flex-col">
            <input
              ref={fileInputRef}
              id="plan-images"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              appearance="outlined"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? m.plan_form_uploading() : m.plan_form_add_images()}
            </Button>
          </div>
        </span>
        {displayImages.length > 0 && (
          <div className="flex flex-wrap gap-sm">
            {displayImages.map((img) => (
              <div
                key={img.id}
                className="relative w-24 h-24 rounded-lg overflow-hidden group"
              >
                <img
                  src={img.url}
                  alt={`Image ${img.id}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(img.id)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs"
                  aria-label="Remove image"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-sm">
        <span className="text-sm font-medium text-hot-gray-700">
          {m.plan_form_projects_label()}
        </span>
        <Button
          type="button"
          appearance="outlined"
          onClick={() => setDialogOpen(true)}
        >
          {m.plan_form_add_projects()}
        </Button>

        {isLoading && loadingCount > 0 && (
          <span className="text-sm text-hot-gray-400">
            +{loadingCount} {m.plan_form_loading()}
          </span>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {PLAN_SECTIONS.map((section) => {
            const sectionKeys = order.filter(
              (k) =>
                selected.has(k) &&
                section.apps.includes(appFromKey(k)) &&
                projectMap.has(k),
            );
            if (sectionKeys.length === 0) return null;
            return (
              <div key={section.titleKey} className="flex flex-col gap-sm">
                <p className="text-sm font-semibold text-hot-gray-600 border-b border-hot-gray-100 pb-xs">
                  {SECTION_TITLE[section.titleKey]?.()}
                </p>
                <SortableContext
                  items={sectionKeys}
                  strategy={rectSortingStrategy}
                >
                  <div className="flex flex-wrap gap-lg">
                    {sectionKeys.map((key) => (
                      <SortableCard
                        key={key}
                        id={key}
                        project={projectMap.get(key)!}
                        status={statuses[key] ?? "in_progress"}
                        onStatusChange={(s) =>
                          setStatuses((prev) => ({ ...prev, [key]: s }))
                        }
                        onRemove={() => removeProject(key)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </DndContext>
      </div>

      <ProjectPickerDialog
        open={dialogOpen}
        selected={selected}
        extraProjects={extraProjects}
        sources={sources}
        onConfirm={(next, nextExtra) => {
          setSelected(next);
          setExtraProjects(nextExtra);
          setOrder((prev) => {
            const preserved = prev.filter((k) => next.has(k));
            const added = [...next].filter((k) => !prev.includes(k));
            return [...preserved, ...added];
          });
          setStatuses((prev) => {
            const result: Record<string, ProjectStatus> = {};
            for (const k of next) result[k] = prev[k] ?? "in_progress";
            return result;
          });
        }}
        onClose={() => setDialogOpen(false)}
      />

      <div className="flex items-center gap-md">
        <Button type="submit" disabled={busy || !name.trim()}>
          {isPending ? m.plan_form_saving() : submitLabel}
        </Button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-hot-gray-500 hover:text-hot-gray-700 underline"
        >
          {m.plan_cancel()}
        </button>
      </div>
    </form>
  );
}

export default PlanForm;
