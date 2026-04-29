import { useParams, useNavigate } from "react-router-dom";
import CardSkeleton from "../components/shared/CardSkeleton";
import PageWrapper from "../components/shared/PageWrapper";
import SectionHeader from "../components/shared/SectionHeader";
import { useLanguage } from "../contexts/LanguageContext";
import PlanForm from "./components/PlanForm";
import { useMyPlans, useUpdatePlan } from "./hooks";

function EditPlanPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const { data: plans = [], isLoading } = useMyPlans();
  const { mutateAsync: updatePlan, isPending } = useUpdatePlan();

  const plan = plans.find((p) => p.id === planId);
  const detailPath = `/${currentLanguage}/plan/${planId}`;

  const initialProjectKeys = new Set(
    (plan?.projects ?? []).map((p) => `${p.app}:${p.project_id}`),
  );

  return (
    <>
      <SectionHeader buttonText="Cancel" onButtonClick={() => navigate(detailPath)}>
        Plan <strong>{plan?.name ?? "…"}</strong>
      </SectionHeader>
      <PageWrapper>
        {isLoading ? (
          <div className="flex flex-col gap-sm py-lg max-w-lg">
            {Array.from({ length: 5 }).map((_, i) => (
              <CardSkeleton key={i} linesCount={1} />
            ))}
          </div>
        ) : !plan ? (
          <p className="py-xl text-hot-gray-500">Plan not found.</p>
        ) : (
          <PlanForm
            initialName={plan.name}
            initialDescription={plan.description ?? ""}
            initialProjectKeys={initialProjectKeys}
            initialImages={plan.images ?? []}
            planId={planId}
            submitLabel="Save Changes"
            isPending={isPending}
            onSubmit={async ({ name, description, selectedProjects }) => {
              await updatePlan({
                id: planId!,
                payload: {
                  name,
                  description: description || undefined,
                  projects: selectedProjects,
                },
              });
              navigate(detailPath);
            }}
            onCancel={() => navigate(detailPath)}
          />
        )}
      </PageWrapper>
    </>
  );
}

export default EditPlanPage;
