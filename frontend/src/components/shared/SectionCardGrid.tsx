import { ReactNode } from "react";
import { cardClassNames } from "../../constants/classNames";
import CardSkeleton from "./CardSkeleton";
import PageWrapper from "./PageWrapper";
import SubSectionHeader from "./SubSectionHeader";

interface SectionCardGridProps<T> {
  /** SubSectionHeader icon (optional). */
  icon?: string;
  /** SubSectionHeader title (may contain HTML, rendered by SubSectionHeader). */
  title: string;
  /** SubSectionHeader "by <tool>" label (optional). */
  toolName?: string;
  /** When true, render `skeletonCount` skeletons in place of the add card and items. */
  isLoading?: boolean;
  /** Number of skeleton cards shown while loading. */
  skeletonCount?: number;
  /** The "add new" card content. Wrapped in a card cell here; hidden while loading. */
  addCard?: ReactNode;
  /** Data items rendered after the add card via `renderItem`. */
  items?: T[];
  /** Renders a single item's card content; wrapped in a card cell with `item.id` as key. */
  renderItem?: (item: T) => ReactNode;
  /** Cards rendered after the items, regardless of loading state (e.g. "take a course", "not available"). */
  trailingCards?: ReactNode;
  /** Content rendered above the card grid (e.g. an error message). */
  header?: ReactNode;
  /** Content rendered below the card grid (e.g. pagination). */
  footer?: ReactNode;
}

function SectionCardGrid<T extends { id: string | number } = { id: string }>({
  icon,
  title,
  toolName,
  isLoading = false,
  skeletonCount = 1,
  addCard,
  items,
  renderItem,
  trailingCards,
  header,
  footer,
}: SectionCardGridProps<T>) {
  return (
    <>
      <SubSectionHeader icon={icon} title={title} toolName={toolName} />
      <PageWrapper>
        <div className="flex flex-col gap-sm py-lg">
          {header}
          <div className="flex flex-wrap gap-lg">
            {isLoading ? (
              Array.from({ length: skeletonCount }).map((_, i) => (
                <div key={i} className={cardClassNames}>
                  <CardSkeleton linesCount={3} />
                </div>
              ))
            ) : (
              <>
                {addCard && <div className={cardClassNames}>{addCard}</div>}
                {items && renderItem
                  ? items.map((item) => (
                      <div key={item.id} className={cardClassNames}>
                        {renderItem(item)}
                      </div>
                    ))
                  : null}
              </>
            )}
            {trailingCards}
          </div>
          {footer}
        </div>
      </PageWrapper>
    </>
  );
}

export default SectionCardGrid;
