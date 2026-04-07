import Button from "./Button";
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
        background: "radial-gradient(circle, #FFE6DE 0%, #E6F6F5 100%)",
      }}
    >
      <PageWrapper>
        <div className="flex flex-col md:flex-row gap-sm w-full justify-between p-md items-start md:items-center">
          <div className="text-2xl ">{children}</div>
          <Button appearance="plain">Getting started</Button>
        </div>
      </PageWrapper>
    </div>
  );
}

export default SectionHeader;
