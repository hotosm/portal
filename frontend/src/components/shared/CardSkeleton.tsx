interface CardSkeletonProps {
  hasImage?: boolean;
  linesCount?: number;
}

function CardSkeleton({ hasImage = false, linesCount = 3 }: CardSkeletonProps) {
  return (
    <div className="w-full h-full bg-white rounded-lg p-md flex flex-col gap-lg shadow-sm animate-pulse">
      {hasImage && <div className="w-full h-32 bg-hot-gray-300 rounded" />}
      <div className="space-y-sm">
        {Array.from({ length: linesCount }).map((_, index) => (
          <div
            key={index}
            className="h-2xl bg-hot-gray-300 rounded"
            style={{
              width: index === linesCount - 1 ? "60%" : "100%",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default CardSkeleton;
