import WaTooltip from "@awesome.me/webawesome/dist/react/tooltip/index.js";

export interface TooltipProps extends React.ComponentProps<typeof WaTooltip> {
  children?: React.ReactNode;
  htmlFor: string;
  placement?: 
    | "top" 
    | "top-start" 
    | "top-end" 
    | "right" 
    | "right-start" 
    | "right-end" 
    | "bottom" 
    | "bottom-start" 
    | "bottom-end" 
    | "left" 
    | "left-start" 
    | "left-end";
}

function Tooltip({ 
  children, 
  htmlFor,
  placement = "top",
  ...props 
}: TooltipProps) {
  return (
    <WaTooltip for={htmlFor} placement={placement} {...props}>
      {children}
    </WaTooltip>
  );
}

export default Tooltip;
