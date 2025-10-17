import WaDropdownItem from "@awesome.me/webawesome/dist/react/dropdown-item/index.js";

export interface DropdownItemProps extends React.ComponentProps<typeof WaDropdownItem> {
  children?: React.ReactNode;
  value?: string;
  type?: "normal" | "checkbox";
  checked?: boolean;
  variant?: "default" | "danger";
  disabled?: boolean;
}

function DropdownItem({ children, ...props }: DropdownItemProps) {
  return (
    <WaDropdownItem {...props}>
      {children}
    </WaDropdownItem>
  );
}

export default DropdownItem;