import WaButton from "@awesome.me/webawesome/dist/react/button/index.js";

export interface ButtonProps extends React.ComponentProps<typeof WaButton> {
  children?: React.ReactNode;
}

function Button({ children, onClick, ...props }: ButtonProps) {
  return (
    <WaButton onClick={onClick} {...props}>
      {children}
    </WaButton>
  );
}

export default Button;
