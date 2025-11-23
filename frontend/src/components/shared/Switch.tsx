import WaSwitch from "@awesome.me/webawesome/dist/react/switch/index.js";

export interface SwitchProps extends React.ComponentProps<typeof WaSwitch> {}

function Switch({ ...props }: SwitchProps) {
  return <WaSwitch {...props} />;
}

export default Switch;
