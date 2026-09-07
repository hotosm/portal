import WaAccordionItem from '@awesome.me/webawesome/dist/react/accordion-item/index.js'

// A single section inside an Accordion. Use the `label` attribute for plain text
// headers, or a child with `slot="label"` for markup. `appearance`,
// `iconPlacement` and `headingLevel` are set by the parent Accordion.
export interface AccordionItemProps extends React.ComponentProps<typeof WaAccordionItem> {
  children?: React.ReactNode
}

function AccordionItem({ children, ...props }: AccordionItemProps) {
  return <WaAccordionItem {...props}>{children}</WaAccordionItem>
}

export default AccordionItem
