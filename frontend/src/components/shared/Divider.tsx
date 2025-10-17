import WaDivider from "@awesome.me/webawesome/dist/react/divider/index.js";

export interface DividerProps extends React.ComponentProps<typeof WaDivider> {
  vertical?: boolean;
}

function Divider({ ...props }: DividerProps) {
  return (
    <WaDivider {...props} />
  );
}

export default Divider;