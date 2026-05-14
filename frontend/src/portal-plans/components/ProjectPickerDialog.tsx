import { useEffect, useRef, useState } from "react";
import Button from "../../components/shared/Button";
import Dialog from "../../components/shared/Dialog";
import Dropdown from "../../components/shared/Dropdown";
import DropdownItem from "../../components/shared/DropdownItem";
import { m } from "../../paraglide/messages";
import { APP_LABELS } from "../hooks";
import { useAddProjectByUrl } from "../hooks/useAddProjectByUrl";
import { projectKey } from "../../utils/utils";
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
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [pendingApps, setPendingApps] = useState<Set<AppName>>(new Set());
  const [pendingTitles, setPendingTitles] = useState<Record<string, string>>(
    {},
  );
  const dropdownWrapperRef = useRef<HTMLDivElement>(null);
  const {
    urlInput,
    setUrlInput,
    urlError,
    setUrlError,
    isPending,
    handleAddUrl,
  } = useAddProjectByUrl();

  useEffect(() => {
    const el = dropdownWrapperRef.current;
    if (!el) return;
    const stop = (e: Event) => e.stopPropagation();
    el.addEventListener("wa-hide", stop);
    return () => el.removeEventListener("wa-hide", stop);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: only sync on open-transition, not on every selected change
  useEffect(() => {
    if (open) {
      setLocalSelected(new Set(selected));
      setLocalExtraProjects(extraProjects);
      setSelectedTool(sources[0]?.app ?? "");
      setPendingApps(new Set());
      setPendingTitles({});
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

  function togglePending(app: AppName) {
    setPendingApps((prev) => {
      const next = new Set(prev);
      next.has(app) ? next.delete(app) : next.add(app);
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

  return (
    <Dialog
      open={open}
      label={m.plan_picker_label()}
      onWaHide={onClose}
      style={{ "--width": "560px" } as React.CSSProperties}
    >
      <div ref={dropdownWrapperRef} className="mb-md w-full">
        <label className="text-xs font-semibold text-hot-gray-500 uppercase tracking-wide mb-xs">
          {m.plan_picker_tool_label()}
        </label>
        <Dropdown onSelect={(e) => setSelectedTool(e.detail.item.value)}>
          <button
            slot="trigger"
            type="button"
            className="w-full flex justify-between items-center border border-hot-gray-300 rounded-lg px-md py-sm text-base bg-white focus:border-hot-red-500 focus:outline-none"
          >
            <span>{allSources.find((s) => s.app === selectedTool)?.label}</span>
            <span className="text-hot-gray-400">&#x25BE;</span>
          </button>
          {allSources.map((s) => (
            <DropdownItem key={s.app} value={s.app}>
              {s.label}
            </DropdownItem>
          ))}
        </Dropdown>
      </div>

      <div className="overflow-y-auto max-h-[50vh] flex flex-col gap-md mt-md">
        {allSources.map((source) => {
          const extras = localExtraProjects.filter((p) => p.app === source.app);
          const hidden = selectedTool !== "" && source.app !== selectedTool;
          return (
            <AppSourceSection
              key={source.app}
              source={source}
              extras={extras}
              localSelected={localSelected}
              toggle={toggle}
              hidden={hidden}
              isPendingSelected={pendingApps.has(source.app)}
              pendingTitle={pendingTitles[source.app] ?? ""}
              onPendingToggle={() => togglePending(source.app)}
              onPendingTitleChange={(title) =>
                setPendingTitles((prev) => ({ ...prev, [source.app]: title }))
              }
            />
          );
        })}
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
            const pendingProjects: ProjectOption[] = [...pendingApps].map(
              (app) => ({
                app,
                project_id: "",
                title: pendingTitles[app] ?? "",
              }),
            );
            const finalSelected = new Set(localSelected);
            for (const app of pendingApps) {
              finalSelected.add(projectKey(app, ""));
            }
            onConfirm(finalSelected, [
              ...localExtraProjects,
              ...pendingProjects,
            ]);
            onClose();
          }}
        >
          {m.plan_picker_done()}
        </Button>
      </div>
    </Dialog>
  );
}

export default ProjectPickerDialog;
