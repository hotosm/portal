import * as m from "../../paraglide/messages";
import playCircleFill from "../../assets/icons/play-circle-fill.svg?url";
import Button from "../../components/shared/Button";
import Icon from "../../components/shared/Icon";
import PageWrapper from "../../components/shared/PageWrapper";

interface PlanSectionHeaderProps {
  children?: any;
  buttonText?: string;
  buttonLink?: string;
  onButtonClick?: () => void;
  menu?: React.ReactNode;
}

function PlanSectionHeader({
  children,
  buttonText,
  buttonLink,
  onButtonClick,
  menu,
}: PlanSectionHeaderProps) {
  const label = buttonText ?? m.getting_started();
  const isDefault = !buttonText;

  return (
    <div
      style={{
        background: "linear-gradient(to right, #FFE6DE 0%, #E6F6F5 100%)",
      }}
    >
      <PageWrapper>
        <div className="flex flex-col md:flex-row gap-sm w-full justify-between pt-md pb-md items-start md:items-center">
          <div className="text-2xl">{children}</div>
          {menu ?? (
            <Button href={buttonLink} onClick={onButtonClick}>
              {label}
              {isDefault && <Icon className="ml-xs" src={playCircleFill} />}
            </Button>
          )}
        </div>
      </PageWrapper>
    </div>
  );
}

export default PlanSectionHeader;
