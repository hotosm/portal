import { useEffect, useState } from "react";
import Button from "../../components/shared/Button";
import Dialog from "../../components/shared/Dialog";
import { m } from "../../paraglide/messages";
import { APP_LABELS } from "../hooks";
import { useAddProjectByUrl } from "../hooks/useAddProjectByUrl";
import type {
  AppName,
  ProjectOption,
  ProjectPickerDialogProps,
  ProjectSource,
} from "../types";
import { AddByUrlSection } from "./AddByUrlSection";
import { AppSourceSection } from "./AppSourceSection";

function ProjectPickerDialog({
  open,
  selected,
  extraProjects,
  sources,
  onConfirm,
  onClose,
}: ProjectPickerDialogProps) {
  const [localSelected, setLocalSelected] = useState<Set<string>>(new Set());
  const [localExtraProjects, setLocalExtraProjects] = useState<ProjectOption[]>(
    [],
  );
  const [activeApp, setActiveApp] = useState<AppName | "all">("all");
  const {
    urlInput,
    setUrlInput,
    urlError,
    setUrlError,
    isPending,
    handleAddUrl,
  } = useAddProjectByUrl();

  // biome-ignore lint/correctness/useExhaustiveDependencies: only sync on open-transition, not on every selected change
  useEffect(() => {
    if (open) {
      setLocalSelected(new Set(selected));
      setLocalExtraProjects(extraProjects);
      setActiveApp("all");
      setUrlInput("");
      setUrlError(null);
    }
  }, [open]);

  function toggle(key: string) {
    setLocalSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function onProjectAdded(project: ProjectOption, key: string) {
    setLocalExtraProjects((prev) => [...prev, project]);
    setLocalSelected((prev) => new Set(prev).add(key));
  }

  const sourceApps = new Set(sources.map((s) => s.app));
  const allSources: ProjectSource[] = [
    ...sources,
    ...[
      ...new Set(
        localExtraProjects.map((p) => p.app).filter((a) => !sourceApps.has(a)),
      ),
    ].map((app) => ({
      app,
      label: APP_LABELS[app],
      projects: [],
      isLoading: false,
      isError: false,
    })),
  ];

  const visibleSources =
    activeApp === "all"
      ? allSources
      : allSources.filter((s) => s.app === activeApp);

  const allLoaded = allSources.every((s) => !s.isLoading);
  const allEmpty =
    allLoaded &&
    allSources.every((s) => s.projects.length === 0 && !s.isError) &&
    localExtraProjects.length === 0;

  const hasAnyContent = visibleSources.some(
    (s) =>
      s.isLoading ||
      s.isError ||
      s.projects.length > 0 ||
      localExtraProjects.some((p) => p.app === s.app),
  );

  return (
    <Dialog
      open={open}
      label={m.plan_picker_label()}
      onWaHide={onClose}
      style={{ "--width": "560px" } as React.CSSProperties}
    >
      <div className="flex flex-wrap gap-xs">
        <Button
          type="button"
          size="small"
          appearance={activeApp === "all" ? "filled" : "outlined"}
          onClick={() => setActiveApp("all")}
        >
          {m.plan_picker_all()}
        </Button>
        {allSources
          .filter(
            (s) =>
              s.isLoading ||
              s.projects.length > 0 ||
              localExtraProjects.some((p) => p.app === s.app),
          )
          .map((s) => (
            <Button
              key={s.app}
              type="button"
              size="small"
              appearance={activeApp === s.app ? "filled" : "outlined"}
              onClick={() => setActiveApp(s.app)}
            >
              {s.label}
            </Button>
          ))}
      </div>

      <div className="overflow-y-auto max-h-[50vh] flex flex-col gap-md mt-md">
        {allEmpty ? (
          <p className="text-sm text-hot-gray-400">
            {m.plan_picker_no_projects()}
          </p>
        ) : !hasAnyContent ? (
          <p className="text-sm text-hot-gray-400">
            {APP_LABELS[activeApp as AppName]} —{" "}
            {m.plan_picker_no_app_projects()}{" "}
            <button
              type="button"
              className="underline hover:text-hot-gray-600"
              onClick={() => setActiveApp("all")}
            >
              {m.plan_picker_all_apps()}
            </button>
          </p>
        ) : (
          allSources.map((source) => {
            const extras = localExtraProjects.filter(
              (p) => p.app === source.app,
            );
            if (
              !source.isLoading &&
              !source.isError &&
              source.projects.length === 0 &&
              extras.length === 0
            )
              return null;
            const hidden = activeApp !== "all" && source.app !== activeApp;
            return (
              <AppSourceSection
                key={source.app}
                source={source}
                extras={extras}
                localSelected={localSelected}
                toggle={toggle}
                hidden={hidden}
              />
            );
          })
        )}
      </div>

      <AddByUrlSection
        urlInput={urlInput}
        setUrlInput={setUrlInput}
        urlError={urlError}
        setUrlError={setUrlError}
        isPending={isPending}
        onAdd={() => handleAddUrl({ localSelected, onAdded: onProjectAdded })}
      />

      <div slot="footer" className="flex gap-sm justify-end">
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-hot-gray-500 hover:text-hot-gray-700 underline"
        >
          {m.plan_cancel()}
        </button>
        <Button
          type="button"
          onClick={() => {
            onConfirm(localSelected, localExtraProjects);
            onClose();
          }}
        >
          {m.plan_picker_done()}
          {localSelected.size > 0 ? ` (${localSelected.size})` : ""}
        </Button>
      </div>
    </Dialog>
  );
}

export default ProjectPickerDialog;
