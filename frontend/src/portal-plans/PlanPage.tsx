import { useNavigate } from "react-router-dom";
import CardAddNew from "../components/shared/CardAddNew";
import CardSkeleton from "../components/shared/CardSkeleton";
import PageWrapper from "../components/shared/PageWrapper";
import SubSectionHeader from "../components/shared/SubSectionHeader";
import { useLanguage } from "../contexts/LanguageContext";
import { m } from "../paraglide/messages";
import PlanCard from "./components/PlanCard";
import PlanSectionHeader from "./components/PlanSectionHeader";
import { useMyPlans } from "./hooks";
import { cardClassNames } from "../constants/classNames";

function PlanPage() {
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const { data: plans = [], isLoading, isError } = useMyPlans();

  return (
    <>
      <PlanSectionHeader>
        <strong>{m.plan_header()}</strong>
      </PlanSectionHeader>
      <SubSectionHeader
        title={`<strong>${m.plan_page_create_title()}</strong> ${m.plan_page_create_description()}`}
        toolName="HOT Tech Suite"
      />
      <PageWrapper>
        <div className="flex flex-col gap-sm py-lg">
          {isError && (
            <p className="text-sm text-hot-red-600">{m.plan_list_error()}</p>
          )}
          <div className="flex flex-wrap gap-lg">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={cardClassNames}>
                  <CardSkeleton linesCount={3} />
                </div>
              ))
            ) : (
              <>
                <div className={cardClassNames}>
                  <CardAddNew
                    title={m.plan_page_create_title()}
                    description={m.plan_page_create_description()}
                    buttonLabel={m.plan_page_new_button()}
                    icon="add"
                    onButtonClick={() =>
                      navigate(`/${currentLanguage}/plan/new`)
                    }
                  />
                </div>
                {plans.map((plan) => (
                  <div key={plan.id} className={cardClassNames}>
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
