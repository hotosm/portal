import { useState } from "react";
import Button from "../../components/shared/Button";
import { m } from "../../paraglide/messages";
import { useAllUserProjects } from "../hooks";
import type {
  AppName,
  PlanImageRead,
  PlanTaskItem,
  ProjectOption,
  ProjectStatus,
} from "../types";
import { usePlanImageUpload } from "../hooks/usePlanImageUpload";
import PlanNameField from "./form/PlanNameField";
import PlanDescriptionField from "./form/PlanDescriptionField";
import PlanImagesField from "./form/PlanImagesField";

export interface PlanFormValues {
  name: string;
  description: string;
  selectedProjects: {
    app: AppName;
    project_id: string;
    status: ProjectStatus;
    data?: Record<string, unknown> | null;
  }[];
  tasks: PlanTaskItem[];
  pendingImages: File[];
}

interface PlanFormProps {
  initialName?: string;
  initialDescription?: string;
  initialProjectKeys?: Set<string>;
  initialProjectStatuses?: Record<string, ProjectStatus>;
  initialExtraProjects?: ProjectOption[];
  initialImages?: PlanImageRead[];
  initialTasks?: PlanTaskItem[];
  planId?: string;
  submitLabel: string;
  isPending: boolean;
  onSubmit: (values: PlanFormValues) => Promise<void>;
  onCancel: () => void;
}

function projectKey(p: ProjectOption) {
  return `${p.app}:${p.project_id}`;
}

function PlanForm({
  initialName = "",
  initialDescription = "",
  initialProjectKeys = new Set(),
  initialProjectStatuses = {},
  initialExtraProjects = [],
  initialImages = [],
  initialTasks = [],
  planId,
  submitLabel,
  isPending,
  onSubmit,
  onCancel,
}: PlanFormProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [selected] = useState<Set<string>>(initialProjectKeys);
  const [order] = useState<string[]>(() => [
    ...initialProjectKeys,
    ...initialTasks.map((t) => `task:${t.id}`),
  ]);
  const [statuses] = useState<Record<string, ProjectStatus>>(
    initialProjectStatuses,
  );
  const [tasks] = useState<PlanTaskItem[]>(initialTasks);
  const [extraProjects] = useState<ProjectOption[]>(initialExtraProjects);

  const { projects } = useAllUserProjects();
  const {
    displayImages,
    pendingImages,
    fileInputRef,
    isUploading,
    isDeleting,
    handleFileChange,
    handleRemoveImage,
  } = usePlanImageUpload({ planId, initialImages });

  const allProjects = [...extraProjects, ...projects];
  const projectMap = new Map(allProjects.map((p) => [projectKey(p), p]));
  const taskMap = new Map(tasks.map((t) => [`task:${t.id}`, t]));
  const busy = isPending || isUploading || isDeleting;

  /* function addTask(title: string, tool: AppName) {
    const id = crypto.randomUUID();
    setTasks((prev) => [...prev, { id, title, tool, status: "pending" }]);
    setOrder((prev) => [...prev, `task:${id}`]);
  }

  function removeTask(key: string) {
    const id = key.slice("task:".length);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setOrder((prev) => prev.filter((k) => k !== key));
  }

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

  function handleProjectPickerConfirm(
    next: Set<string>,
    nextExtra: ProjectOption[],
  ) {
    setSelected(next);
    setExtraProjects(nextExtra);
    setOrder((prev) => {
      const preserved = prev.filter(
        (k) => k.startsWith("task:") || next.has(k),
      );
      const added = [...next].filter((k) => !prev.includes(k));
      return [...preserved, ...added];
    });
    setStatuses((prev) => {
      const result: Record<string, ProjectStatus> = {};
      for (const k of next) {
        const project_id = k.slice(k.indexOf(":") + 1);
        result[k] = project_id === "" ? "task" : (prev[k] ?? "in_progress");
      }
      return result;
    });
  } */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProjects = order
      .filter((k) => !k.startsWith("task:") && selected.has(k))
      .map((k) => {
        const colonIdx = k.indexOf(":");
        const app = k.slice(0, colonIdx) as AppName;
        const project_id = k.slice(colonIdx + 1);
        const status = statuses[k] ?? ("in_progress" as ProjectStatus);
        const p = projectMap.get(k);
        const data =
          p?.upstream ??
          (project_id === "" && p?.title ? { name: p.title } : null);
        return {
          app,
          project_id,
          status,
          ...(data ? { data } : {}),
        };
      });
    const submittedTasks = order
      .filter((k) => k.startsWith("task:"))
      .map((k) => {
        const task = taskMap.get(k)!;
        return { ...task, display_order: order.indexOf(k) };
      });
    await onSubmit({
      name,
      description,
      selectedProjects,
      tasks: submittedTasks,
      pendingImages,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-lg px-0 lg:px-2xl py-lg"
    >
      <h3>Plan description</h3>
      <PlanNameField value={name} onChange={setName} />

      <PlanDescriptionField value={description} onChange={setDescription} />

      <PlanImagesField
        displayImages={displayImages}
        fileInputRef={fileInputRef}
        isUploading={isUploading}
        handleFileChange={handleFileChange}
        handleRemoveImage={handleRemoveImage}
      />
      {/* <Divider />
      <h3>Plan scoope</h3>
      <p className="max-w-2xl">{m.plan_form_projects_hint()}</p>

      <PlanProjectsField
        order={order}
        selected={selected}
        statuses={statuses}
        projectMap={projectMap}
        taskMap={taskMap}
        isLoading={isLoading}
        loadingCount={loadingCount}
        extraProjects={extraProjects}
        sources={sources}
        onDragEnd={handleDragEnd}
        onProjectRemove={removeProject}
        onStatusChange={(key, s) =>
          setStatuses((prev) => ({ ...prev, [key]: s }))
        }
        onTaskRemove={removeTask}
        onTaskAdded={addTask}
        onProjectPickerConfirm={handleProjectPickerConfirm}
      />
 */}
      <div className="flex items-center gap-md pt-2xl">
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
