import GoToWesiteCTA from "../components/shared/GoToWesiteCTA";
import PageWrapper from "../components/shared/PageWrapper";
import PortalPageSkeleton from "../components/shared/PortalPageSkeleton";
import UMapCard from "../portal-mapping/components/UMapCard";
import { getFairBaseUrl } from "../utils/envConfig";
import DataNoProjects from "./components/DataNoProjects";
import ExportCard from "./components/ExportCard";
import { useExportJobs, useUMapData } from "./hooks";

function DataPage() {
  const { maps, templates, isLoading: umapIsLoading, error } = useUMapData();
  const { data: exports = [], isLoading: exportsLoading } = useExportJobs();

  const isLoading = umapIsLoading || exportsLoading;

  // Combine maps and templates for display
  const allUMapItems = [...maps, ...templates];

  const hasAnyProjects =
    maps.length > 0 || templates.length > 0 || exports.length > 0;

  if (isLoading) {
    return <PortalPageSkeleton />;
  }

  if (!hasAnyProjects) {
    return (
      <PageWrapper>
        <DataNoProjects />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-xl">
        <GoToWesiteCTA
          buttonLink={getFairBaseUrl()}
          buttonText="fAIr"
          link2={{
            label: "Export Tool",
            url: "https://export.hotosm.org/",
          }}
        >
          <strong>fAIr</strong> and <strong>Export Tool</strong>
        </GoToWesiteCTA>
        <div className="bg-hot-gray-50 p-md items-center rounded-lg space-y-xl">
          {exports.length > 0 && (
            <div>
              <p className="text-lg ">
                Your <strong>exports</strong>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-lg">
                {exports.map((project) => {
                  return <ExportCard key={project.id} project={project} />;
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* umap */}
      <div>
        <p className="text-lg ">
          Your <strong>maps</strong>
        </p>
        {isLoading && (
          <p className="text-sm text-gray-500">Loading your uMap maps...</p>
        )}
        {error && <p className="text-sm text-red-500">Error loading maps</p>}
        {!isLoading && allUMapItems.length === 0 && (
          <p className="text-sm text-gray-500">
            No maps found. Create one in uMap!
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-lg">
          {allUMapItems.map((map) => {
            return <UMapCard key={map.id} project={map} />;
          })}
        </div>
      </div>
    </PageWrapper>
  );
}

export default DataPage;
