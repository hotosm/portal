import GoToWesiteCTA from "../components/shared/GoToWesiteCTA";
import PageWrapper from "../components/shared/PageWrapper";
import PortalPageSkeleton from "../components/shared/PortalPageSkeleton";
import DataCard from "./components/DataCard";
import ExportCard from "./components/ExportCard";
import { useMyModels, useMyDatasets } from "./hooks/useFairData";
import DataNoProjects from "./components/DataNoProjects";
import { getFairBaseUrl } from "../utils/envConfig";

function DataPage() {
  const { data: models = [], isLoading: modelsLoading } = useMyModels();
  const { data: sets = [], isLoading: datasetsLoading } = useMyDatasets();

  const isLoading = modelsLoading || datasetsLoading;
  // TODO replace with real data
  const exports = [];

  const hasAnyProjects =
    models.length > 0 || sets.length > 0 || exports.length > 0;

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
          {models.length > 0 && (
            <div>
              <p className="text-lg ">
                Your <strong>models</strong>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-lg">
                {models.map((project) => {
                  return <DataCard project={project} />;
                })}
              </div>
            </div>
          )}

          {sets.length > 0 && (
            <div>
              <p className="text-lg ">
                Your <strong>datasets</strong>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-lg">
                {sets.map((project) => {
                  return <DataCard project={project} />;
                })}
              </div>
            </div>
          )}
          {exports.length > 0 && (
            <div>
              <p className="text-lg ">
                Your <strong>exports</strong>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-lg">
                {sets.map((project) => {
                  return <ExportCard project={project} />;
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

export default DataPage;
