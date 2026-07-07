import { useNavigate } from "react-router-dom";
import CardAddNew from "../components/shared/CardAddNew";
import SectionCardGrid from "../components/shared/SectionCardGrid";
import { useLanguage } from "../contexts/LanguageContext";
import { m } from "../paraglide/messages";
import PlanCard from "./components/PlanCard";
import PlanSectionHeader from "./components/PlanSectionHeader";
import { useMyPlans } from "./hooks";

function PlanPage() {
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const { data: plans = [], isLoading, isError } = useMyPlans();

  return (
    <>
      <PlanSectionHeader>
        <strong>{m.plan_header()}</strong>
      </PlanSectionHeader>

      <SectionCardGrid
        title={`<strong>${m.plan_page_create_title()}</strong> ${m.plan_page_create_description()}`}
        isLoading={isLoading}
        skeletonCount={3}
        header={
          isError && (
            <p className="text-sm text-hot-red-600">{m.plan_list_error()}</p>
          )
        }
        addCard={
          <CardAddNew
            title={m.plan_page_create_title()}
            description={m.plan_page_create_description()}
            buttonLabel={m.plan_page_new_button()}
            icon="add"
            onButtonClick={() => navigate(`/${currentLanguage}/plan/new`)}
          />
        }
        items={plans}
        renderItem={(plan) => <PlanCard plan={plan} />}
      />
    </>
  );
}

export default PlanPage;
