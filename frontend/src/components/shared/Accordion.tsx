import WaAccordion from '@awesome.me/webawesome/dist/react/accordion/index.js'

// Group of AccordionItem children. Props of note: `appearance`, `mode`
// ('multiple' | 'single' | 'single-collapsible'), `iconPlacement`, `headingLevel`.
// Events: onWaExpand / onWaCollapse (both cancelable) and onWaAfterExpand /
// onWaAfterCollapse. Ref exposes expandAll() and collapseAll().
export interface AccordionProps extends React.ComponentProps<typeof WaAccordion> {
  children?: React.ReactNode
}

function Accordion({ children, ...props }: AccordionProps) {
  return <WaAccordion {...props}>{children}</WaAccordion>
}

export default Accordion
