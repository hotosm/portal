import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import CardSkeleton from '../components/shared/CardSkeleton'
import PageWrapper from '../components/shared/PageWrapper'
import { useLanguage } from '../contexts/LanguageContext'
import { m } from '../paraglide/messages'
import PlanForm from './components/PlanForm'
import PlanSectionHeader from './components/PlanSectionHeader'
import { usePlan, useSetPlanAttribution, useUpdatePlan } from './hooks'

function EditPlanPage() {
  const { planId } = useParams<{ planId: string }>()
  const navigate = useNavigate()
  const { currentLanguage } = useLanguage()
  const { data: plan, isLoading, isError } = usePlan(planId ?? '')
  const { mutateAsync: updatePlan, isPending } = useUpdatePlan()
  const { mutateAsync: setAttribution } = useSetPlanAttribution()

  const detailPath = `/${currentLanguage}/plan/${planId}`

  return (
    <>
      <PlanSectionHeader
        breadcrumbs={[
          { label: m.plan_header(), href: `/${currentLanguage}/plan` },
          { label: plan?.name ?? '…', href: detailPath },
          { label: m.plan_menu_edit() },
        ]}
        buttonText={m.plan_cancel()}
        onButtonClick={() => navigate(detailPath)}
      >
        {plan?.name ?? '…'}
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
            initialDescription={plan.description ?? ''}
            initialImages={plan.images ?? []}
            initialPublishedBy={plan.group_id ?? ''}
            initialPublishedByName={plan.group_name}
            showPublishedBy={plan.is_owner}
            planId={planId}
            submitLabel={m.plan_edit_submit()}
            isPending={isPending}
            onSubmit={async ({ name, description, publishedBy }) => {
              await updatePlan({
                id: planId!,
                payload: {
                  name,
                  description: description || undefined,
                },
              })
              if (plan.is_owner && publishedBy !== (plan.group_id ?? '')) {
                try {
                  await setAttribution({ id: planId!, organizationId: publishedBy || null })
                } catch {
                  toast.error(m.plan_toast_attribution_error())
                }
              }
              navigate(detailPath)
            }}
            onCancel={() => navigate(detailPath)}
          />
        )}
      </PageWrapper>
    </>
  )
}

export default EditPlanPage
