import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Button from "../../../components/shared/Button";
import { cardClassNames } from "../../../constants/classNames";
import type { PlanTaskItem } from "../../types";
import PlanTaskCard from "../PlanTaskCard";

interface SortableTaskCardProps {
  id: string;
  task: PlanTaskItem;
  onRemove: () => void;
}

function SortableTaskCard({ id, task, onRemove }: SortableTaskCardProps) {
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
          className="absolute top-1 left-1 z-20 cursor-grab active:cursor-grabbing bg-black/20 text-white rounded px-1 leading-none select-none text-base"
        >
          ⠿
        </div>
        <PlanTaskCard task={task} />
      </div>
      <div className="w-full flex justify-end">
        <Button type="button" appearance="plain" size="small" onClick={onRemove}>
          ✕
        </Button>
      </div>
    </div>
  );
}

export default SortableTaskCard;
