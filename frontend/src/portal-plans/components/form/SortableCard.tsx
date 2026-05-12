import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Button from "../../../components/shared/Button";
import ButtonGroup from "../../../components/shared/ButtonGroup";
import { cardClassNames } from "../../../constants/classNames";
import { formatProjectStatus } from "../../../utils/utils";
import type { HydratedProjectItem, ProjectOption, ProjectStatus } from "../../types";
import PlanProjectCard from "../PlanProjectCard";

function toHydrated(p: ProjectOption, status: ProjectStatus): HydratedProjectItem {
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

function SortableCard({ id, project, status, onStatusChange, onRemove }: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`${cardClassNames} flex flex-col gap-xs`}>
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
        <div className="border border-hot-gray-200 rounded-lg">
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
        </div>
        <Button type="button" appearance="plain" size="small" onClick={onRemove}>
          ✕
        </Button>
      </div>
    </div>
  );
}

export default SortableCard;
