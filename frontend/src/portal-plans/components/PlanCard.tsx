import CardProjectTitle from "../../components/shared/CardProjectTitle";
import { useLanguage } from "../../contexts/LanguageContext";
import { m } from "../../paraglide/messages";
import { APP_META } from "../../utils/appMeta";
import type { PlanRead } from "../types";

interface PlanCardProps {
  plan: PlanRead;
}

const PlanCard = ({ plan }: PlanCardProps) => {
  const { currentLanguage } = useLanguage();
  const apps = [...new Set(plan.projects.map((p) => p.app))];
  const projectCount = plan.projects.length;
  const detailPath = `/${currentLanguage}/plan/${plan.id}`;

  return (
    <div
      className="w-full h-full bg-white rounded-xl p-md flex flex-col gap-lg"
      style={{ boxShadow: "0 0 5px 0 rgba(0, 0, 0, 0.25)" }}
    >
      <div className="flex flex-col gap-sm">
        <CardProjectTitle href={detailPath} title={plan.name} />
      </div>
      <div className="flex flex-col gap-xs mt-auto">
        <p className="text-sm text-hot-gray-400">
          {projectCount}{" "}
          {projectCount === 1
            ? m.plan_card_projects_singular()
            : m.plan_card_projects_plural()}
        </p>
        <div className="flex flex-wrap gap-xs">
          {apps.map((app) => {
            const meta = APP_META[app];
            return (
              <div
                key={app}
                title={meta.label}
                className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-hot-gray-100"
              >
                <img src={meta.icon} alt={meta.label} className="w-5 h-5" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PlanCard;
