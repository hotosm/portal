import Accordion from '../../components/shared/Accordion'
import AccordionItem from '../../components/shared/AccordionItem'
import Icon from '../../components/shared/Icon'
import * as m from '../../paraglide/messages'
import './PlanSubSectionAccordion.css'

interface PlanSubSectionAccordionProps {
  /**
   * Section title. A node rather than SubSectionHeader's HTML string, because
   * section names now come from user-created project groups.
   */
  title: React.ReactNode
  /** Optional tool logo shown before the title. */
  icon?: string
  /** Renders the "by <tool>" attribution at the end of the header. */
  toolName?: React.ReactNode
  /** Whether the section starts open. Sections are visible by default. */
  expanded?: boolean
  /** The section body, revealed when the header is expanded. */
  children?: React.ReactNode
}

/**
 * A collapsible version of SubSectionHeader for the plan pages: same full-bleed
 * rules and container-aligned title, with the section body as the panel. Pass the
 * body exactly as it sits after a SubSectionHeader today, PageWrapper included.
 */
function PlanSubSectionAccordion({
  title,
  icon,
  toolName,
  expanded = true,
  children,
}: PlanSubSectionAccordionProps) {
  return (
    <Accordion appearance="plain" className="plan-subsection-accordion">
      <AccordionItem expanded={expanded} className="border-t border-b border-gray-100">
        <div slot="label" className="container flex items-center justify-between gap-sm py-lg">
          <div className="flex items-center gap-sm">
            {icon && <img src={icon} alt="" className="w-8 h-8" />}
            <span className="text-xl font-semibold">{title}</span>
          </div>
          <div className="flex items-center gap-md">
            {toolName && (
              <span
                className="text-sm italic"
                style={{ color: 'var(--hot-color-neutral-400, #9ca3af)' }}
              >
                {m.by()} <strong>{toolName}</strong>
              </span>
            )}
            {/* Own chevron rather than the built-in one, which sits at the far
                edge of the full-width trigger instead of the container's. */}
            <Icon name="chevron-down" label="" className="plan-subsection-accordion__chevron" />
          </div>
        </div>
        {children}
      </AccordionItem>
    </Accordion>
  )
}

export default PlanSubSectionAccordion
