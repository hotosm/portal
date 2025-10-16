import WaIcon from "@awesome.me/webawesome/dist/react/icon/index.js";

export interface IconProps extends React.ComponentProps<typeof WaIcon> {}

// defaul label for screenreaders
function Icon({ label = "Icon", ...props }: IconProps) {
  return <WaIcon label={label} {...props} />;
}

export default Icon;
