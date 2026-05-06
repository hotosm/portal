import WaBreadcrumbItem from "@awesome.me/webawesome/dist/react/breadcrumb-item/index.js";

export interface BreadcrumbItemProps
  extends React.ComponentProps<typeof WaBreadcrumbItem> {
  children?: React.ReactNode;
}

function BreadcrumbItem({ children, ...props }: BreadcrumbItemProps) {
  return <WaBreadcrumbItem {...props}>{children}</WaBreadcrumbItem>;
}

export default BreadcrumbItem;
