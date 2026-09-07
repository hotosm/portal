import Accordion from '../../components/shared/Accordion'
import AccordionItem from '../../components/shared/AccordionItem'
import Icon from '../../components/shared/Icon'
import './PlanSubSectionAccordion.css'

interface PlanSubSectionAccordionProps {
  title: string
  description?: string
  expanded?: boolean
  children?: React.ReactNode
}

function PlanSubSectionAccordion({
  title,
  description,
  expanded = true,
  children,
}: PlanSubSectionAccordionProps) {
  return (
    <Accordion appearance="plain" className="plan-subsection-accordion">
      <AccordionItem expanded={expanded} className="border-t border-b border-gray-100">
        <div slot="label" className="container flex items-center justify-between gap-sm py-lg">
          <div className="flex items-center gap-sm min-w-0">
            <Icon name="chevron-down" label="" className="plan-subsection-accordion__chevron" />
            {/* Title and description share one text flow so the title always gets the
                space first and the description fills whatever is left: two lines on
                mobile, one from md up. */}
            <span className="text-lg md:text-xl min-w-0 line-clamp-2 md:line-clamp-1">
              <span className="font-semibold">{title}</span>
              {description ? <span className="text-hot-gray-500"> {description}</span> : null}
            </span>
          </div>
        </div>
        {children}
      </AccordionItem>
    </Accordion>
  )
}

export default PlanSubSectionAccordion
