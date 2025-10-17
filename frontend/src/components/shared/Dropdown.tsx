import WaDropdown from "@awesome.me/webawesome/dist/react/dropdown/index.js";

export interface DropdownProps extends React.ComponentProps<typeof WaDropdown> {
  children?: React.ReactNode;
  onSelect?: (event: CustomEvent) => void;
}

function Dropdown({ children, onSelect, ...props }: DropdownProps) {
  const handleSelect = (event: any) => {
    if (onSelect) {
      onSelect(event);
    }
  };

  return (
    <WaDropdown onWaSelect={handleSelect} {...props}>
      {children}
    </WaDropdown>
  );
}

export default Dropdown;