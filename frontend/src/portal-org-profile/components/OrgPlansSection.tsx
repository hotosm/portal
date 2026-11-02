import Spinner from '../../components/shared/Spinner'
import { m } from '../../paraglide/messages'
import PlanCard from '../../portal-plans/components/PlanCard'
import PlanSubSectionAccordion from '../../portal-plans/components/PlanSubSectionAccordion'
import type { OrgPlansSectionProps } from '../types'

/**
 * The plans an org is working on, as cards inside an accordion.
 */
function OrgPlansSection({ plans, loading, uiLang }: OrgPlansSectionProps) {
  // Shown (with a spinner) while plans load; an empty or failed list hides it.
  const showPlans = loading || (plans?.length ?? 0) > 0
  if (!showPlans) return null

  return (
    <section lang={uiLang} className="org-profile-plans mb-2xl">
      <PlanSubSectionAccordion
        title={m.org_profile_working_on_now()}
        description={m.org_profile_plans()}
        expanded
      >
        {loading ? (
          <div className="flex justify-center py-xl">
            <Spinner size="md" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg py-lg">
            {plans?.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}
      </PlanSubSectionAccordion>
    </section>
  )
}

export default OrgPlansSection
