import * as m from "../../paraglide/messages";
import playCircleFill from "../../assets/icons/play-circle-fill.svg?url";
import Button from "./Button";
import Icon from "./Icon";
import PageWrapper from "./PageWrapper";

interface SectionHeaderProps {
  children?: any;
  buttonLink?: string;
  buttonText?: string;
  link2?: {
    label: string;
    url: string;
  };
}

function SectionHeader({ children }: SectionHeaderProps) {
  return (
    <div
      style={{
        background: "linear-gradient(to right, #FFE6DE 0%, #E6F6F5 100%)",
      }}
    >
      <PageWrapper>
        <div className="flex flex-col md:flex-row gap-sm w-full justify-between p-md items-start md:items-center">
          <div className="text-2xl">{children}</div>
          <Button>
            {m.getting_started()}{" "}
            <Icon className="ml-xs" src={playCircleFill} />
          </Button>
        </div>
      </PageWrapper>
    </div>
  );
}

export default SectionHeader;
