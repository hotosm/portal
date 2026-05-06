import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/shared/PageWrapper";
import { useLanguage } from "../contexts/LanguageContext";
import { m } from "../paraglide/messages";
import PlanForm from "./components/PlanForm";
import { useCreatePlan } from "./hooks";
import PlanSectionHeader from "./components/PlanSectionHeader";

function AddPlanPage() {
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const { mutateAsync: createPlan, isPending } = useCreatePlan();
  const planListPath = `/${currentLanguage}/plan`;

  return (
    <>
      <PlanSectionHeader
        buttonText={m.plan_cancel()}
        onButtonClick={() => navigate(planListPath)}
      >
        <strong>{m.plan_add_header()}</strong>
      </PlanSectionHeader>
      <PageWrapper>
        <PlanForm
          submitLabel={m.plan_add_submit()}
          isPending={isPending}
          onSubmit={async ({ name, description, selectedProjects }) => {
            await createPlan({
              name,
              description: description || undefined,
              projects: selectedProjects,
            });
            navigate(planListPath);
          }}
          onCancel={() => navigate(planListPath)}
        />
      </PageWrapper>
    </>
  );
}

export default AddPlanPage;
