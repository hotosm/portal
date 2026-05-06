import PageWrapper from "./PageWrapper";

interface SectionHeaderProps {
  children?: any;
  buttonText?: string;
  buttonLink?: string;
  onButtonClick?: () => void;
}

function SectionHeader({ children }: SectionHeaderProps) {
  return (
    <div
      style={{
        background: "linear-gradient(to right, #FFE6DE 0%, #E6F6F5 100%)",
      }}
    >
      <PageWrapper>
        <div className="flex flex-col md:flex-row gap-sm w-full justify-between pt-md pb-md items-start md:items-center">
          <div className="text-2xl">{children}</div>
        </div>
      </PageWrapper>
    </div>
  );
}

export default SectionHeader;
