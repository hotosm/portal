import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/shared/PageWrapper";
import SectionHeader from "../components/shared/SectionHeader";
import { useLanguage } from "../contexts/LanguageContext";
import PlanForm from "./components/PlanForm";
import { useCreatePlan } from "./hooks";

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
      <SectionHeader buttonText="Cancel" onButtonClick={() => navigate(planListPath)}>
        <strong>New Plan</strong>
      </SectionHeader>
      <PageWrapper>
        <PlanForm
          submitLabel="Create Plan"
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
