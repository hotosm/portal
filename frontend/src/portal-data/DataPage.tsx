import GoToWesiteCTA from "../components/shared/GoToWesiteCTA";
import PageWrapper from "../components/shared/PageWrapper";
import PortalPageSkeleton from "../components/shared/PortalPageSkeleton";
import DataCard from "./components/DataCard";
import ExportCard from "./components/ExportCard";
import { mapModelsToDataProjects, mapDatasetsToDataProjects } from "./dataProjects";
import { useMyModels, useMyDatasets } from "../hooks/useFairData";

function DataPage() {
  const { data: modelsData, isLoading: modelsLoading } = useMyModels();
  const { data: datasetsData, isLoading: datasetsLoading } = useMyDatasets();

  const isLoading = modelsLoading || datasetsLoading;
  const models = mapModelsToDataProjects(modelsData || []);
  const sets = mapDatasetsToDataProjects(datasetsData || []);

  if (isLoading) {
    return <PortalPageSkeleton />;
  }

  return (
    <PageWrapper>
      <div className="space-y-xl">
        <GoToWesiteCTA
          buttonLink="https://fair.hotosm.org/"
          buttonText="fAIr"
          link2={{
            label: "Export Tool",
            url: "https://export.hotosm.org/",
          }}
        >
          <strong>fAIr</strong> and <strong>Export Tool</strong>
        </GoToWesiteCTA>
        <div className="bg-hot-gray-50 p-md items-center rounded-lg space-y-xl">
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
        </div>
      </div>
    </PageWrapper>
  );
}

export default DataPage;
