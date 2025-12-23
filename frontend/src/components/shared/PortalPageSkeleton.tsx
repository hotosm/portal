import PageWrapper from "./PageWrapper";

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
function GoToWesiteCTASkeleton() {
  return (
    <div className="bg-hot-gray-50 flex flex-col md:flex-row gap-sm w-full justify-between p-md items-start md:items-center rounded-lg">
      <div className="p-1 bg-hot-gray-300 rounded w-64 text-white h-[28px]"></div>
      <div className="h-[41px] bg-hot-gray-300 rounded w-40" />
    </div>
  );
}

// TODO adapt for each page by adding props / this is only for Data at the moment
function PortalPageSkeleton() {
  return (
    <PageWrapper>
      <div className="space-y-xl">
        <GoToWesiteCTASkeleton />
        <div className="bg-hot-gray-50 p-md items-center rounded-lg space-y-xl">
          <div>
            <p className="text-lg">
              Your <strong>models</strong>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-lg">
              {Array.from({ length: 4 }).map((_, index) => (
                <CardSkeleton key={index} hasImage={true} linesCount={1} />
              ))}
            </div>
          </div>

          <div>
            <p className="text-lg">
              Your <strong>datasets</strong>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-lg">
              {Array.from({ length: 4 }).map((_, index) => (
                <CardSkeleton key={index} hasImage={true} linesCount={1} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default PortalPageSkeleton;
