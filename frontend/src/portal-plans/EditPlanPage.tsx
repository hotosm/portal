import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CardSkeleton from "../components/shared/CardSkeleton";
import PageWrapper from "../components/shared/PageWrapper";
import { useLanguage } from "../contexts/LanguageContext";
import { m } from "../paraglide/messages";
import PlanForm from "./components/PlanForm";
import { usePlan, useUpdatePlan } from "./hooks";
import PlanSectionHeader from "./components/PlanSectionHeader";

function EditPlanPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const { data: plan, isLoading, isError } = usePlan(planId ?? "");
  const { mutateAsync: updatePlan, isPending } = useUpdatePlan();

  const detailPath = `/${currentLanguage}/plan/${planId}`;

  const initialProjectKeys = useMemo(
    () =>
      new Set((plan?.projects ?? []).map((p) => `${p.app}:${p.project_id}`)),
    [plan?.projects],
  );

  return (
    <>
      <PlanSectionHeader
        breadcrumbs={[
          { label: m.plan_header(), href: `/${currentLanguage}/plan` },
          { label: plan?.name ?? "…", href: detailPath },
          { label: m.plan_menu_edit() },
        ]}
        buttonText={m.plan_cancel()}
        onButtonClick={() => navigate(detailPath)}
      >
        {m.plan_header()} <strong>{plan?.name ?? "…"}</strong>
      </PlanSectionHeader>
      <PageWrapper>
        {isLoading ? (
          <div className="flex flex-col gap-sm py-lg max-w-lg">
            {Array.from({ length: 5 }).map((_, i) => (
              <CardSkeleton key={i} linesCount={1} />
            ))}
          </div>
        ) : isError ? (
          <p className="py-xl text-hot-gray-500">{m.plan_load_error()}</p>
        ) : !plan ? (
          <p className="py-xl text-hot-gray-500">{m.plan_not_found()}</p>
        ) : (
          <PlanForm
            initialName={plan.name}
            initialDescription={plan.description ?? ""}
            initialProjectKeys={initialProjectKeys}
            initialImages={plan.images ?? []}
            planId={planId}
            submitLabel={m.plan_edit_submit()}
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
