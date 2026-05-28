import { useEffect, useRef, useState } from "react";
import Button from "../../components/shared/Button";
import Dialog from "../../components/shared/Dialog";
import Dropdown from "../../components/shared/Dropdown";
import DropdownItem from "../../components/shared/DropdownItem";
import { m } from "../../paraglide/messages";
import { APP_LABELS } from "../hooks";
import { useAddProjectByUrl } from "../hooks/useAddProjectByUrl";
import type {
  AppName,
  PendingTaskInput,
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
  existingTasks,
  onConfirm,
  onClose,
}: ProjectPickerDialogProps) {
  const [localSelected, setLocalSelected] = useState<Set<string>>(new Set());
  const [localExtraProjects, setLocalExtraProjects] = useState<ProjectOption[]>(
    [],
  );
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [localTaskIds, setLocalTaskIds] = useState<Set<string>>(new Set());
  const [newTasks, setNewTasks] = useState<PendingTaskInput[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: only sync on open-transition
  useEffect(() => {
    if (open) {
      setLocalSelected(new Set(selected));
      setLocalExtraProjects(extraProjects);
      setSelectedTool(sources[0]?.app ?? "");
      setLocalTaskIds(new Set(existingTasks.map((t) => t.id)));
      setNewTasks([]);
      setNewTaskTitle("");
      setUrlInput("");
      setUrlError(null);
    }
  }, [open]);

  function toggle(key: string) {
    setLocalSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleTaskId(id: string) {
    setLocalTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function removeNewTask(idx: number) {
    setNewTasks((prev) => prev.filter((_, i) => i !== idx));
  }

  function addNewTask() {
    const title = newTaskTitle.trim();
    if (!title || !selectedTool) return;
    setNewTasks((prev) => [...prev, { app: selectedTool as AppName, title }]);
    setNewTaskTitle("");
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
          const tasks = existingTasks.filter((t) => t.app === source.app);
          const newForApp = newTasks
            .map((t, idx) => ({ title: t.title, app: t.app, idx }))
            .filter((t) => t.app === source.app);
          const hidden = selectedTool !== "" && source.app !== selectedTool;
          return (
            <AppSourceSection
              key={source.app}
              source={source}
              extras={extras}
              localSelected={localSelected}
              toggle={toggle}
              hidden={hidden}
              existingTasks={tasks}
              taskIds={localTaskIds}
              onToggleTask={toggleTaskId}
              newTasks={newForApp}
              onRemoveNewTask={removeNewTask}
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

      <div className="border-t border-hot-gray-200 pt-md mt-md flex flex-col gap-xs">
        <span className="text-xs font-semibold text-hot-gray-500 uppercase tracking-wide">
          No project yet?
        </span>
        <p className="text-xs text-hot-gray-400">
          Add a to-do now and connect it to a real project later.
        </p>
        <div className="flex gap-xs">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addNewTask();
              }
            }}
            placeholder="What needs to be done?"
            className="flex-1 border border-hot-gray-300 rounded-lg px-sm py-xs text-sm outline-none focus:border-hot-red-500"
          />
          <Button
            type="button"
            size="small"
            disabled={!newTaskTitle.trim() || !selectedTool}
            onClick={addNewTask}
          >
            Create
          </Button>
        </div>
      </div>

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
            onConfirm(localSelected, localExtraProjects, localTaskIds, newTasks);
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
