import { useState } from "react";
import Button from "../../components/shared/Button";
import RichTextEditor from "../../components/shared/RichTextEditor";
import Tag from "../../components/shared/Tag";
import { m } from "../../paraglide/messages";
import { APP_LABELS, useAllUserProjects } from "../hooks";
import type { ProjectOption } from "../hooks";
import type { AppName, PlanImageRead } from "../types";
import ProjectPickerDialog from "./ProjectPickerDialog";
import { usePlanImageUpload } from "../hooks/usePlanImageUpload";

export interface PlanFormValues {
  name: string;
  description: string;
  selectedProjects: {
    app: AppName;
    project_id: string;
    data?: Record<string, unknown> | null;
  }[];
  pendingImages: File[];
}

interface PlanFormProps {
  initialName?: string;
  initialDescription?: string;
  initialProjectKeys?: Set<string>;
  initialImages?: PlanImageRead[];
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [extraProjects, setExtraProjects] = useState<ProjectOption[]>([]);
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

  function toggleProject(project: ProjectOption, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      checked
        ? next.add(projectKey(project))
        : next.delete(projectKey(project));
      return next;
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allProjects = [...projects, ...extraProjects];
    const matched = allProjects
      .filter((p) => selected.has(projectKey(p)))
      .map(({ app, project_id, upstream }) => ({
        app,
        project_id,
        ...(upstream ? { data: upstream } : {}),
      }));
    const matchedKeys = new Set(matched.map((p) => `${p.app}:${p.project_id}`));
    // Preserve selected projects not present in allProjects (e.g. URL-added apps like ChatMap)
    const orphans = [...selected]
      .filter((k) => !matchedKeys.has(k))
      .map((k) => {
        const colonIdx = k.indexOf(":");
        return {
          app: k.slice(0, colonIdx) as AppName,
          project_id: k.slice(colonIdx + 1),
        };
      });
    await onSubmit({
      name,
      description,
      selectedProjects: [...matched, ...orphans],
      pendingImages,
    });
  };

  const allProjects = [...projects, ...extraProjects];
  const selectedTags = allProjects.filter((p) => selected.has(projectKey(p)));
  const loadingCount = selected.size - selectedTags.length;
  const busy = isPending || isUploading || isDeleting;

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
        <p className="text-sm font-medium text-hot-gray-700">Images</p>
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
        <div>
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
            {isUploading ? "Uploading…" : "Add images"}
          </Button>
          {displayImages.length > 0 && (
            <span className="ml-sm text-sm text-hot-gray-400">
              {displayImages.length} image
              {displayImages.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-xs">
        <span className="text-sm font-medium text-hot-gray-700">
          {m.plan_form_projects_label()}
        </span>
        <Button
          type="button"
          appearance="outlined"
          onClick={() => setDialogOpen(true)}
        >
          {selected.size === 0
            ? m.plan_form_select_projects()
            : `${selected.size} ${selected.size === 1 ? m.plan_form_projects_selected_singular() : m.plan_form_projects_selected_plural()}`}
        </Button>

        {selected.size > 0 && (
          <div className="flex flex-wrap gap-xs">
            {selectedTags.map((p) => (
              <Tag
                key={projectKey(p)}
                size="small"
                withRemove
                onWaRemove={() => toggleProject(p, false)}
              >
                {p.title}
                <span className="text-hot-gray-400 ml-1">
                  — {APP_LABELS[p.app]}
                </span>
              </Tag>
            ))}
            {isLoading && loadingCount > 0 && (
              <span className="text-sm text-hot-gray-400 self-center">
                +{loadingCount} {m.plan_form_loading()}
              </span>
            )}
          </div>
        )}
      </div>

      <ProjectPickerDialog
        open={dialogOpen}
        selected={selected}
        extraProjects={extraProjects}
        sources={sources}
        onConfirm={(next, nextExtra) => {
          setSelected(next);
          setExtraProjects(nextExtra);
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
