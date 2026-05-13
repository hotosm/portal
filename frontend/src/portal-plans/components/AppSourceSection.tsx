import Checkbox from "../../components/shared/Checkbox";
import { m } from "../../paraglide/messages";
import { projectKey } from "../../utils/utils";
import type { ProjectOption, ProjectSource } from "../types";

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
  isPendingSelected: boolean;
  pendingTitle: string;
  onPendingToggle: () => void;
  onPendingTitleChange: (title: string) => void;
}

export function AppSourceSection({
  source,
  extras,
  localSelected,
  toggle,
  hidden,
  isPendingSelected,
  pendingTitle,
  onPendingToggle,
  onPendingTitleChange,
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

        if (source.isLoading && allItems.length === 0) {
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
            {source.isError && allItems.length === 0 && (
              <p className="text-sm text-hot-gray-400">
                {source.label} — {m.plan_picker_error()}
              </p>
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
                  {p.title}
                </Checkbox>
              );
            })}
            <Checkbox checked={isPendingSelected} onChange={onPendingToggle}>
              {m.plan_picker_pending_option()}
            </Checkbox>
            <div className="min-h-3xl">
              {isPendingSelected && (
                <input
                  type="text"
                  value={pendingTitle}
                  onChange={(e) => onPendingTitleChange(e.target.value)}
                  placeholder={m.plan_picker_pending_title()}
                  className="border border-hot-gray-300 rounded-lg px-md py-xs text-sm bg-white focus:border-hot-red-500 focus:outline-none max-w-full"
                />
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
