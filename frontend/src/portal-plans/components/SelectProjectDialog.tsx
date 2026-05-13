import { useState, useEffect } from "react";
import Button from "../../components/shared/Button";
import Dialog from "../../components/shared/Dialog";
import { APP_LABELS } from "../hooks";
import { useAddProjectByUrl } from "../hooks/useAddProjectByUrl";
import { useAllUserProjects } from "../hooks/useAllUserProjects";
import { AddByUrlSection } from "./AddByUrlSection";
import type { AppName, ProjectOption } from "../types";

interface SelectProjectDialogProps {
  open: boolean;
  app: AppName;
  onClose: () => void;
  onConfirm: (project: ProjectOption) => void;
}

function SelectProjectDialog({ open, app, onClose, onConfirm }: SelectProjectDialogProps) {
  const { sources } = useAllUserProjects();
  const source = sources.find((s) => s.app === app);
  const [selected, setSelected] = useState<ProjectOption | null>(null);
  const [extraProjects, setExtraProjects] = useState<ProjectOption[]>([]);
  const { urlInput, setUrlInput, urlError, setUrlError, isPending, handleAddUrl } =
    useAddProjectByUrl();

  // biome-ignore lint/correctness/useExhaustiveDependencies: only reset on open transition
  useEffect(() => {
    if (open) {
      setSelected(null);
      setExtraProjects([]);
      setUrlInput("");
      setUrlError(null);
    }
  }, [open]);

  function handleProjectAdded(project: ProjectOption, _key: string) {
    if (project.app !== app) {
      setUrlError("This URL belongs to a different tool.");
      return;
    }
    setExtraProjects((prev) => {
      if (prev.some((p) => p.project_id === project.project_id)) return prev;
      return [...prev, project];
    });
    setSelected(project);
  }

  const sourceProjects = source?.projects ?? [];
  const seenIds = new Set(sourceProjects.map((p) => p.project_id));
  const allProjects = [
    ...sourceProjects,
    ...extraProjects.filter((e) => !seenIds.has(e.project_id)),
  ];

  return (
    <Dialog
      open={open}
      label={`Select ${APP_LABELS[app]} project`}
      onWaHide={onClose}
      style={{ "--width": "480px" } as React.CSSProperties}
    >
      <div className="overflow-y-auto max-h-[50vh] flex flex-col gap-xs">
        {source?.isLoading && allProjects.length === 0 ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-hot-gray-100 rounded-lg animate-pulse" />
            ))}
          </>
        ) : source?.isError && allProjects.length === 0 ? (
          <p className="text-sm text-hot-gray-400">Failed to load projects.</p>
        ) : allProjects.length === 0 ? (
          <p className="text-sm text-hot-gray-400">
            No projects found. Add one by URL below.
          </p>
        ) : (
          allProjects.map((p) => (
            <button
              key={p.project_id}
              type="button"
              onClick={() => setSelected(p)}
              className={`text-left px-md py-sm rounded-lg border text-sm transition-colors ${
                selected?.project_id === p.project_id
                  ? "border-hot-red-500 bg-hot-red-50 text-hot-red-700"
                  : "border-hot-gray-200 hover:border-hot-gray-400"
              }`}
            >
              {p.title}
            </button>
          ))
        )}
      </div>

      <AddByUrlSection
        urlInput={urlInput}
        setUrlInput={setUrlInput}
        urlError={urlError}
        setUrlError={setUrlError}
        isPending={isPending}
        onAdd={() =>
          handleAddUrl({
            localSelected: new Set(
              selected ? [`${selected.app}:${selected.project_id}`] : [],
            ),
            onAdded: handleProjectAdded,
          })
        }
      />

      <div slot="footer" className="flex gap-sm justify-end">
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-hot-gray-500 hover:text-hot-gray-700 underline"
        >
          Cancel
        </button>
        <Button
          type="button"
          disabled={!selected}
          onClick={() => {
            if (selected) {
              onConfirm(selected);
              onClose();
            }
          }}
        >
          Select
        </Button>
      </div>
    </Dialog>
  );
}

export default SelectProjectDialog;
