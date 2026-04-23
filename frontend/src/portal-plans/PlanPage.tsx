import { useNavigate } from "react-router-dom";
import CardAddNew from "../components/shared/CardAddNew";
import CardSkeleton from "../components/shared/CardSkeleton";
import PageWrapper from "../components/shared/PageWrapper";
import SectionHeader from "../components/shared/SectionHeader";
import SubSectionHeader from "../components/shared/SubSectionHeader";
import { useLanguage } from "../contexts/LanguageContext";
import PlanCard from "./components/PlanCard";
import { useMyPlans } from "./hooks";

const CARD_CLASS =
  "w-full md:w-[calc(33.333%_-_var(--hot-spacing-large)*0.667)] lg:w-[calc(25%_-_var(--hot-spacing-large)*0.75)] shrink-0";

function PlanPage() {
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const { data: plans = [], isLoading } = useMyPlans();

  return (
    <>
      <SectionHeader>
        <strong>Plan</strong>
      </SectionHeader>
      <SubSectionHeader
        title="<strong>Create</strong> a mapping plan"
        toolName="HOT Tech Suite"
      />
      <PageWrapper>
        <div className="flex flex-col gap-sm py-lg">
          <div className="flex flex-wrap gap-lg">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={CARD_CLASS}>
                  <CardSkeleton linesCount={3} />
                </div>
              ))
            ) : (
              <>
                <div className={CARD_CLASS}>
                  <CardAddNew
                    title="Create"
                    description="a mapping plan"
                    buttonLabel="New Plan"
                    icon="add"
                    onButtonClick={() => navigate(`/${currentLanguage}/plan/new`)}
                  />
                </div>
                {plans.map((plan) => (
                  <div key={plan.id} className={CARD_CLASS}>
                    <PlanCard plan={plan} />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </PageWrapper>
    </>
  );
}

export default PlanPage;
