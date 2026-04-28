import WaDialog from '@awesome.me/webawesome/dist/react/dialog/index.js'

// Use React's built-in ComponentProps to extract all WaDialog props.
// `open` is a valid Lit property on WaDialog but is not surfaced in the
// @lit/react wrapper types, so we add it explicitly here.
export interface DialogProps extends React.ComponentProps<typeof WaDialog> {
  children?: React.ReactNode
  open?: boolean
}

function Dialog({ children, ...props }: DialogProps) {
  // biome-ignore lint/suspicious/noExplicitAny: open and other Lit properties are valid at runtime
  return <WaDialog {...(props as any)}>{children}</WaDialog>
}

export default Dialog
