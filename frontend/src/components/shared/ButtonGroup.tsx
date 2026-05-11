import WaButtonGroup from "@awesome.me/webawesome/dist/react/button-group/index.js";

export interface ButtonGroupProps extends React.ComponentProps<typeof WaButtonGroup> {
  children?: React.ReactNode;
}

function ButtonGroup({ children, ...props }: ButtonGroupProps) {
  return <WaButtonGroup {...props}>{children}</WaButtonGroup>;
}

export default ButtonGroup;
