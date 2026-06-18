import type { ReactNode } from "react";
import { cardClassNames } from "../../constants/classNames";
import CardSkeleton from "./CardSkeleton";
import PageWrapper from "./PageWrapper";
import SubSectionHeader from "./SubSectionHeader";

interface SectionCardGridProps {
  icon?: string;
  title: string;
  toolName?: string;
  isLoading?: boolean;
  skeletonCount?: number;
  error?: ReactNode;
  pagination?: ReactNode;
  staticCards?: ReactNode;
  children: ReactNode;
}

function SectionCardGrid({
  icon,
  title,
  toolName,
  isLoading = false,
  skeletonCount = 1,
  error,
  pagination,
  staticCards,
  children,
}: SectionCardGridProps) {
  return (
    <>
      <SubSectionHeader icon={icon} title={title} toolName={toolName} />
      <PageWrapper>
        <div className="flex flex-col gap-sm py-lg">
          {error}
          <div className="flex flex-wrap gap-lg">
            {isLoading
              ? Array.from({ length: skeletonCount }).map((_, i) => (
                  <div key={i} className={cardClassNames}>
                    <CardSkeleton linesCount={3} />
                  </div>
                ))
              : children}
            {staticCards}
          </div>
          {pagination}
        </div>
      </PageWrapper>
    </>
  );
}

export default SectionCardGrid;
