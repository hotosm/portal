import * as m from "../../paraglide/messages";
import playCircleFill from "../../assets/icons/play-circle-fill.svg?url";
import Button from "./Button";
import Icon from "./Icon";
import PageWrapper from "./PageWrapper";

interface SectionHeaderProps {
  children?: any;
  buttonText?: string;
  buttonLink?: string;
  onButtonClick?: () => void;
}

function SectionHeader({
  children,
  buttonText,
  buttonLink,
  onButtonClick,
}: SectionHeaderProps) {
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
          <Button href={buttonLink} onClick={onButtonClick}>
            {label}
            {isDefault && <Icon className="ml-xs" src={playCircleFill} />}
          </Button>
        </div>
      </PageWrapper>
    </div>
  );
}

export default SectionHeader;
