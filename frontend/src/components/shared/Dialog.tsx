import WaDialog from "@awesome.me/webawesome/dist/react/dialog/index.js";

// Use React's built-in ComponentProps to extract all WaDialog props
export interface DialogProps extends React.ComponentProps<typeof WaDialog> {
  children?: React.ReactNode;
}

function Dialog({ children, ...props }: DialogProps) {
  return <WaDialog {...props}>{children}</WaDialog>;
}

export default Dialog;