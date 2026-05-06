import WaBreadcrumb from "@awesome.me/webawesome/dist/react/breadcrumb/index.js";

export interface BreadcrumbProps
  extends React.ComponentProps<typeof WaBreadcrumb> {
  children?: React.ReactNode;
}

function Breadcrumb({ children, ...props }: BreadcrumbProps) {
  return <WaBreadcrumb {...props}>{children}</WaBreadcrumb>;
}

export default Breadcrumb;
