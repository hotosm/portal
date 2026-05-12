import Tag from "../../components/shared/Tag";
import { APP_META } from "../../utils/appMeta";
import type { PlanTaskItem } from "../types";

interface PlanTaskCardProps {
  task: PlanTaskItem;
}

function PlanTaskCard({ task }: PlanTaskCardProps) {
  const meta = APP_META[task.tool];

  return (
    <div className="w-full h-full rounded-xl bg-hot-gray-50 p-md flex flex-col gap-lg">
      <div className="flex flex-col gap-sm">
        <div className="relative">
          <div className="w-full h-36 bg-hot-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                <img src={meta.icon} alt={meta.label} className="w-6 h-6" />
              </div>
            </div>
            <Tag variant="neutral" className="absolute top-1 right-1 z-10">
              Pending
            </Tag>
          </div>
        </div>
        <span className="text-base font-bold">
          {task.title || (
            <span className="text-base font-bold hover:text-black hover:no-underline">
              Untitled task
            </span>
          )}
        </span>
        <span className="text-sm text-hot-gray-400">{meta.label}</span>
      </div>
    </div>
  );
}

export default PlanTaskCard;
