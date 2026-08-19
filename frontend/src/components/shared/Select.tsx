import WaSelect from "@awesome.me/webawesome/dist/react/select/index.js";

export interface SelectProps extends React.ComponentProps<typeof WaSelect> {
  children?: React.ReactNode;
}

function Select({ children, ...props }: SelectProps) {
  return <WaSelect {...props}>{children}</WaSelect>;
}

export default Select;
