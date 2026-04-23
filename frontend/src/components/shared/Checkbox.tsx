import WaCheckbox from "@awesome.me/webawesome/dist/react/checkbox/index.js";

export interface CheckboxProps extends React.ComponentProps<typeof WaCheckbox> {
  children?: React.ReactNode;
}

function Checkbox({ children, ...props }: CheckboxProps) {
  return <WaCheckbox {...props}>{children}</WaCheckbox>;
}

export default Checkbox;
