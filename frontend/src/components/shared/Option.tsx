import WaOption from "@awesome.me/webawesome/dist/react/option/index.js";

export interface OptionProps extends React.ComponentProps<typeof WaOption> {
  children?: React.ReactNode;
  value?: string;
}

function Option({ children, ...props }: OptionProps) {
  return <WaOption {...props}>{children}</WaOption>;
}

export default Option;
