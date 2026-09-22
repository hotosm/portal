import WaBadge from "@awesome.me/webawesome/dist/react/badge/index.js";

export interface BadgeProps extends React.ComponentProps<typeof WaBadge> {}

function Badge(props: BadgeProps) {
  return <WaBadge {...props} />;
}

export default Badge;
