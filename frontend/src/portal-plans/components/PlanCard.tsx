import { Link } from 'react-router-dom'
import CardProjectTitle from '../../components/shared/CardProjectTitle'
import { useLanguage } from '../../contexts/LanguageContext'
import { APP_META } from '../../utils/appMeta'
import type { PlanRead } from '../types'

interface PlanCardProps {
  plan: PlanRead
}

const PlanCard = ({ plan }: PlanCardProps) => {
  const { currentLanguage } = useLanguage()
  const apps = [...new Set(plan.projects.map((p) => p.app))]
  const projectCount = plan.projects.length
  const detailPath = `/${currentLanguage}/plan/${plan.id}`

  return (
    <Link to={detailPath} className="block w-full h-full no-underline">
      <div className="w-full h-full bg-white rounded-xl shadow-[0_0_14px_rgba(0,0,0,0.2)] p-md flex flex-col gap-md hover:shadow-lg transition-shadow">
        <div className="flex flex-col gap-sm">
          <CardProjectTitle href={detailPath} title={plan.name} />
          {plan.description && (
            <p className="text-base text-hot-gray-500 line-clamp-2">
              {plan.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-xs mt-auto">
          <p className="text-sm text-hot-gray-400">
            {projectCount} project{projectCount !== 1 ? 's' : ''}
          </p>
          <div className="flex flex-wrap gap-xs">
            {apps.map((app) => {
              const meta = APP_META[app]
              return (
                <div
                  key={app}
                  title={meta.label}
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-hot-gray-100"
                >
                  <img src={meta.icon} alt={meta.label} className="w-5 h-5" />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default PlanCard
