import WaDivider from '@awesome.me/webawesome/dist/react/divider/index.js'

export interface SeparatorProps extends React.ComponentProps<typeof WaDivider> {}

// Web Awesome's <wa-divider>. Unlike Divider (a spaced page-section rule), it
// adds no padding, so it also fits inside dropdowns and dialogs.
function Separator(props: SeparatorProps) {
  return <WaDivider {...props} />
}

export default Separator
