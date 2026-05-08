import Checkbox from "../../components/shared/Checkbox";
import { m } from "../../paraglide/messages";
import { projectKey } from "../../utils/utils";
import { ProjectOption, ProjectSource } from "../types";

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
}

export function AppSourceSection({
  source,
  extras,
  localSelected,
  toggle,
  hidden,
}: AppSourceSectionProps) {
  return (
    <div className={hidden ? "hidden" : undefined}>
      <p className="text-xs font-semibold text-hot-gray-500 uppercase tracking-wide mb-xs">
        {source.label}
        {source.isLoading && (
          <span className="ml-xs font-normal normal-case tracking-normal text-hot-gray-400">
            {" "}
            {m.plan_picker_loading()}
          </span>
        )}
      </p>
      {source.isError ? (
        <p className="text-sm text-hot-gray-400">
          {source.label} — {m.plan_picker_error()}
        </p>
      ) : source.isLoading ? (
        <div className="flex flex-col gap-xs">
          <CheckboxSkeleton />
          <CheckboxSkeleton />
          <CheckboxSkeleton />
        </div>
      ) : (
        <div className="flex flex-col gap-xs">
          {[...source.projects, ...extras].map((p) => {
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
        </div>
      )}
    </div>
  );
}
