import WaIcon from "@awesome.me/webawesome/dist/react/icon/index.js";

export interface IconProps extends React.ComponentProps<typeof WaIcon> {}

function Icon({ ...props }: IconProps) {
  return <WaIcon {...props} />;
}

export default Icon;
