import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/shared/PageWrapper";
import { useLanguage } from "../contexts/LanguageContext";
import { m } from "../paraglide/messages";
import PlanForm from "./components/PlanForm";
import { useCreatePlan } from "./hooks";
import PlanSectionHeader from "./components/PlanSectionHeader";

async function uploadImages(planId: string, files: File[]): Promise<void> {
  await Promise.all(
    files.map((f) => {
      const form = new FormData();
      form.append("file", f);
      return fetch(`/api/plans/${planId}/images`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
    }),
  );
}

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
          onSubmit={async ({ name, description, selectedProjects, pendingImages }) => {
            const plan = await createPlan({
              name,
              description: description || undefined,
              projects: selectedProjects,
            });
            if (pendingImages.length > 0) {
              await uploadImages(plan.id, pendingImages);
            }
            navigate(planListPath);
          }}
          onCancel={() => navigate(planListPath)}
        />
      </PageWrapper>
    </>
  );
}

export default AddPlanPage;
