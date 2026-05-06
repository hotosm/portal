import { useParams } from "react-router-dom";
import CardSkeleton from "../components/shared/CardSkeleton";
import { RichTextContent } from "../components/shared/RichTextEditor";
import PageWrapper from "../components/shared/PageWrapper";
import SubSectionHeader from "../components/shared/SubSectionHeader";
import PlanProjectCard from "./components/PlanProjectCard";
import PlanMenu from "./components/PlanMenu";
import PlanShareButton from "./components/PlanShareButton";
import Tag from "../components/shared/Tag";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { usePlan, useSharedPlan } from "./hooks";
import { m } from "../paraglide/messages";
import type { AppName } from "./types";
import PlanSectionHeader from "./components/PlanSectionHeader";

const CARD_CLASS =
  "w-full md:w-[calc(33.333%_-_var(--hot-spacing-large)*0.667)] lg:w-[calc(25%_-_var(--hot-spacing-large)*0.75)] shrink-0";

function MyPlanPage() {
  const { planId } = useParams<{ planId: string }>();
  const { isLogin, isAuthLoading } = useAuth();
  const { currentLanguage } = useLanguage();

  const {
    data: ownPlan,
    isLoading: ownLoading,
    isError: ownError,
  } = usePlan(planId ?? "");

  const {
    data: publicPlan,
    isLoading: publicLoading,
    isError: publicError,
  } = useSharedPlan(planId ?? "");

  const isOwner = isLogin && ownPlan != null;
  const plan = ownPlan ?? publicPlan;
  const isLoading =
    isAuthLoading || ownLoading || (ownPlan === null && publicLoading);
  const isError = isOwner ? ownError : publicError;

  const PLAN_SECTIONS: { title: string; toolName: string; apps: AppName[] }[] =
    [
      {
        title: m.section_imagery(),
        toolName: "<em>Drone</em> Tasking Manager, <em>OpenAerialMap</em>",
        apps: ["drone-tasking-manager", "open-aerial-map"],
      },
      {
        title: m.section_mapping(),
        toolName: "<em>Tasking Manager</em>, <em>fAIr</em>",
        apps: ["tasking-manager", "fair"],
      },
      {
        title: m.section_field(),
        toolName: "<em>Field</em> Tasking Manager",
        apps: ["field-tm"],
      },
      {
        title: m.section_data(),
        toolName: "<em>Export Tool</em>, <em>uMap</em>",
        apps: ["export-tool", "umap"],
      },
    ];

  if (isLoading) {
    return (
      <>
        <PlanSectionHeader>
          <strong>{m.plan_header()}</strong>
        </PlanSectionHeader>
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

  if (isError) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center">
          <h3 className="py-xl">{m.plan_load_error()}</h3>
        </div>
      </PageWrapper>
    );
  }

  if (!plan) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center">
          <h3 className="py-xl">
            {isLogin ? m.plan_not_found() : m.plan_private()}
          </h3>
        </div>
      </PageWrapper>
    );
  }

  return (
    <>
      <PlanSectionHeader
        breadcrumbs={[
          { label: m.plan_header(), href: `/${currentLanguage}/plan` },
          { label: plan.name },
        ]}
        menu={
          isOwner ? (
            <PlanMenu plan={plan} />
          ) : plan.is_public ? (
            <PlanShareButton plan={plan} />
          ) : undefined
        }
      >
        {m.plan_header()} <strong>{plan.name}</strong>
      </PlanSectionHeader>

      <PageWrapper>
        {plan.is_public && isOwner && (
          <Tag variant="neutral" appearance="filled" size="large">
            {m.plan_public_tag()}
          </Tag>
        )}
        {plan.description && (
          <RichTextContent
            html={plan.description}
            className="py-md text-hot-gray-500"
          />
        )}
      </PageWrapper>

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
