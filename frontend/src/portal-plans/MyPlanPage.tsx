import { useParams } from "react-router-dom";
import CardSkeleton from "../components/shared/CardSkeleton";
import PageWrapper from "../components/shared/PageWrapper";
import SubSectionHeader from "../components/shared/SubSectionHeader";
import { cardClassNames } from "../constants/classNames";
import { useAuth } from "../contexts/AuthContext";
import { m } from "../paraglide/messages";
import PlanSectionHeader from "./components/PlanSectionHeader";
import { PLAN_SECTIONS } from "./constants";
import { usePlan, useSharedPlan } from "./hooks";
import { OwnedPlanView } from "./OwnedPlanView";
import { SharedPlanView } from "./SharedPlanView";

function MyPlanPage() {
  const { planId } = useParams<{ planId: string }>();
  const { isLogin, isAuthLoading } = useAuth();

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
    isAuthLoading || ownLoading || (ownPlan == null && publicLoading);
  const isError = isOwner ? ownError : publicError;

  if (!isLoading && isError) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center">
          <h3 className="py-xl">{m.plan_load_error()}</h3>
        </div>
      </PageWrapper>
    );
  }

  if (!isLoading && !plan) {
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

  if (isLoading) {
    return (
      <>
        <PlanSectionHeader>
          <div className="animate-pulse bg-hot-gray-300 rounded h-6 w-48" />
        </PlanSectionHeader>
        <PageWrapper>
          <div className="animate-pulse space-y-sm py-md">
            <div className="h-4 bg-hot-gray-300 rounded w-3/4" />
            <div className="h-4 bg-hot-gray-300 rounded w-full" />
            <div className="h-4 bg-hot-gray-300 rounded w-1/2" />
          </div>
        </PageWrapper>
        {PLAN_SECTIONS.map((section) => (
          <div key={section.title}>
            <SubSectionHeader title={`<strong>${section.title}</strong>`} />
            <PageWrapper>
              <div className="flex flex-wrap gap-lg py-lg">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={cardClassNames}>
                    <CardSkeleton hasImage linesCount={2} />
                  </div>
                ))}
              </div>
            </PageWrapper>
          </div>
        ))}
      </>
    );
  }

  if (isOwner) return <OwnedPlanView plan={plan!} planId={planId!} />;
  return <SharedPlanView plan={plan!} />;
}

export default MyPlanPage;
