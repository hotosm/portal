import { useParams, useNavigate } from "react-router-dom";
import CardSkeleton from "../components/shared/CardSkeleton";
import PageWrapper from "../components/shared/PageWrapper";
import SectionHeader from "../components/shared/SectionHeader";
import SubSectionHeader from "../components/shared/SubSectionHeader";
import PlanProjectCard from "./components/PlanProjectCard";
import { useLanguage } from "../contexts/LanguageContext";
import { usePlan } from "./hooks";
import type { AppName } from "./types";

const CARD_CLASS =
  "w-full md:w-[calc(33.333%_-_var(--hot-spacing-large)*0.667)] lg:w-[calc(25%_-_var(--hot-spacing-large)*0.75)] shrink-0";

const PLAN_SECTIONS: {
  title: string;
  toolName: string;
  apps: AppName[];
}[] = [
  {
    title: "Imagery",
    toolName: "<em>Drone</em> Tasking Manager, <em>OpenAerialMap</em>",
    apps: ["drone-tasking-manager", "open-aerial-map"],
  },
  {
    title: "Mapping",
    toolName: "<em>Tasking Manager</em>, <em>fAIr</em>",
    apps: ["tasking-manager", "fair"],
  },
  {
    title: "Field",
    toolName: "<em>Field</em> Tasking Manager",
    apps: ["field-tm"],
  },
  {
    title: "Data",
    toolName: "<em>Export Tool</em>, <em>uMap</em>",
    apps: ["export-tool", "umap"],
  },
];

function MyPlanPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const { data: plan, isLoading } = usePlan(planId ?? "");
  const editPath = `/${currentLanguage}/plan/${planId}/edit`;

  if (isLoading) {
    return (
      <>
        <SectionHeader
          buttonText="Edit Plan"
          onButtonClick={() => navigate(editPath)}
        >
          <strong>Plan</strong>
        </SectionHeader>
        <PageWrapper>
          <div className="flex flex-wrap gap-lg py-lg">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={CARD_CLASS}>
                <CardSkeleton hasImage linesCount={2} />
              </div>
            ))}
          </div>
        </PageWrapper>
      </>
    );
  }

  if (!plan) {
    return (
      <PageWrapper>
        <p className="py-xl text-hot-gray-500">Plan not found.</p>
      </PageWrapper>
    );
  }

  return (
    <>
      <SectionHeader
        buttonText="Edit Plan"
        onButtonClick={() => navigate(editPath)}
      >
        Plan <strong>{plan.name}</strong>
      </SectionHeader>

      {PLAN_SECTIONS.map((section) => {
        const projects = plan.projects.filter((p) =>
          section.apps.includes(p.app),
        );
        if (projects.length === 0) return null;

        return (
          <div key={section.title}>
            <SubSectionHeader
              title={`<strong>${section.title}</strong>`}
              toolName={section.toolName}
            />
            <PageWrapper>
              <div className="flex flex-wrap gap-lg py-lg">
                {projects.map((project) => (
                  <div
                    key={`${project.app}:${project.project_id}`}
                    className={CARD_CLASS}
                  >
                    <PlanProjectCard project={project} />
                  </div>
                ))}
              </div>
            </PageWrapper>
          </div>
        );
      })}
    </>
  );
}

export default MyPlanPage;
