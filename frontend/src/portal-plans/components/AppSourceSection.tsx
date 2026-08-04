import Checkbox from "../../components/shared/Checkbox";
import Spinner from "../../components/shared/Spinner";
import { m } from "../../paraglide/messages";
import { projectKey } from "../../utils/utils";
import type {
  HydratedProjectItem,
  ProjectOption,
  ProjectSource,
} from "../types";

function CheckboxSkeleton() {
  return (
    <div className="flex items-center gap-sm py-xs animate-pulse">
      <div className="w-4 h-4 bg-hot-gray-200 rounded flex-shrink-0" />
      <div className="h-4 bg-hot-gray-200 rounded w-3/5" />
    </div>
  );
}

interface AppSourceSectionProps {
  source: ProjectSource;
  extras: ProjectOption[];
  localSelected: Set<string>;
  toggle: (key: string) => void;
  hidden: boolean;
  existingTasks: HydratedProjectItem[];
  taskIds: Set<string>;
  onToggleTask: (id: string) => void;
  newTasks: { title: string; idx: number }[];
  onRemoveNewTask: (idx: number) => void;
}

function taskTitle(task: HydratedProjectItem): string {
  const t = (task.data as { title?: unknown } | null)?.title;
  return typeof t === "string" && t ? t : "Untitled task";
}

export function AppSourceSection({
  source,
  extras,
  localSelected,
  toggle,
  hidden,
  existingTasks,
  taskIds,
  onToggleTask,
  newTasks,
  onRemoveNewTask,
}: AppSourceSectionProps) {
  return (
    <div className={hidden ? "hidden" : undefined}>
      {(() => {
        const seenKeys = new Set(
          source.projects.map((p) => projectKey(p.app, p.project_id)),
        );
        const uniqueExtras = extras.filter(
          (e) => !seenKeys.has(projectKey(e.app, e.project_id)),
        );
        const allItems = [...source.projects, ...uniqueExtras];
        const hasTasks = existingTasks.length > 0 || newTasks.length > 0;
        const hasProjects = allItems.length > 0;

        if (source.isLoading && !hasProjects && !hasTasks) {
          return (
            <div className="flex flex-col gap-xs">
              <CheckboxSkeleton />
              <CheckboxSkeleton />
              <CheckboxSkeleton />
            </div>
          );
        }
        return (
          <div className="flex flex-col gap-xs">
            {source.isError && !hasProjects && (
              <p className="text-sm text-hot-gray-400">
                {source.label} — {m.plan_picker_error()}
              </p>
            )}
            {hasTasks && (
              <span className="text-xs font-semibold text-hot-gray-400 uppercase tracking-wide">
                Tasks
              </span>
            )}
            {existingTasks.map((task) => {
              const isChecked = taskIds.has(task.id);
              return (
                <Checkbox
                  key={`task:${task.id}`}
                  checked={isChecked}
                  defaultChecked={isChecked}
                  onChange={() => onToggleTask(task.id)}
                >
                  <span className="italic text-hot-gray-600">
                    {taskTitle(task)}
                  </span>
                </Checkbox>
              );
            })}
            {newTasks.map((t) => (
              <Checkbox
                key={`new:${t.idx}`}
                checked
                defaultChecked
                onChange={() => onRemoveNewTask(t.idx)}
              >
                <span className="italic text-hot-gray-600">{t.title}</span>
              </Checkbox>
            ))}
            {hasProjects && (
              <span
                className={`text-xs font-semibold text-hot-gray-400 uppercase tracking-wide${
                  hasTasks ? " mt-sm" : ""
                }`}
              >
                Projects
              </span>
            )}
            {allItems.map((p) => {
              const key = projectKey(p.app, p.project_id);
              const isChecked = localSelected.has(key);
              return (
                <Checkbox
                  key={key}
                  checked={isChecked}
                  defaultChecked={isChecked}
                  onChange={() => toggle(key)}
                >
                  {p.isResolving ? (
                    <span className="inline-flex items-center gap-xs">
                      <Spinner label={m.plan_picker_url_oam_tms_pending()} />
                      {source.label}
                    </span>
                  ) : (
                    p.title
                  )}
                </Checkbox>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}
