import WaCallout from "@awesome.me/webawesome/dist/react/callout/index.js";

export interface CalloutProps extends React.ComponentProps<typeof WaCallout> {
  children?: React.ReactNode;
}

function Callout({ children, ...props }: CalloutProps) {
  return <WaCallout {...props}>{children}</WaCallout>;
}

export default Callout;
