import Button from "../../components/shared/Button";
import Breadcrumb from "../../components/shared/Breadcrumb";
import BreadcrumbItem from "../../components/shared/BreadcrumbItem";
import PageWrapper from "../../components/shared/PageWrapper";

export interface BreadcrumbItemDef {
  label: string;
  href?: string;
}

interface PlanSectionHeaderProps {
  children?: any;
  buttonText?: string;
  buttonLink?: string;
  onButtonClick?: () => void;
  menu?: React.ReactNode;
  breadcrumbs?: BreadcrumbItemDef[];
}

function PlanSectionHeader({
  children,
  buttonText,
  buttonLink,
  onButtonClick,
  menu,
  breadcrumbs,
}: PlanSectionHeaderProps) {

  const label = buttonText;

  return (
    <div
      style={{
        background: "linear-gradient(to right, #FFE6DE 0%, #E6F6F5 100%)",
      }}
    >
      <PageWrapper>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb className="pt-sm">
            {breadcrumbs.map((item) => (
              <BreadcrumbItem key={item.label} href={item.href}>
                {item.label}
              </BreadcrumbItem>
            ))}
          </Breadcrumb>
        )}
        <div className={`flex flex-col md:flex-row gap-sm w-full justify-between pb-md items-start md:items-center ${breadcrumbs && breadcrumbs.length > 0 ? "" : "pt-md"}`}>
          <div className="text-2xl break-words min-w-0 w-full md:w-auto">{children}</div>
          {menu ?? (
              <Button href={buttonLink} onClick={onButtonClick}>
                {label}
              </Button>
            )}
        </div>
      </PageWrapper>
    </div>
  );
}

export default PlanSectionHeader;
