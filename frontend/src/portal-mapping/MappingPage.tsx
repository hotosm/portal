import GoToWesiteCTA from "../components/shared/GoToWesiteCTA";
import PageWrapper from "../components/shared/PageWrapper";
import PortalPageSkeleton from "../components/shared/PortalPageSkeleton";
import YourProjectsTitle from "../components/shared/YourProjectsTitle";
import DataCard from "../portal-data/components/DataCard";
import { getFairBaseUrl } from "../utils/envConfig";
import MappingProjectCard from "./components/MappingProjectCard";
import { useMyDatasets, useMyModels } from "./hooks";
import { mappingProjectsData } from "./mappingProjectsData";

function MappingPage() {
  const projects = mappingProjectsData;

  const { data: models = [], isLoading: modelsLoading } = useMyModels();
  const { data: sets = [], isLoading: datasetsLoading } = useMyDatasets();

  const isLoading = modelsLoading || datasetsLoading;

  if (isLoading) {
    return <PortalPageSkeleton />;
  }

  return (
    <PageWrapper>
      <div className="space-y-xl">
        <GoToWesiteCTA
          buttonLink="https://tasks.hotosm.org/"
          buttonText="Tasking Manager"
          link2={{
            label: "fAIr",
            url: getFairBaseUrl(),
          }}
        >
          <strong>Tasking Manager</strong> and <strong>fAIr</strong>
        </GoToWesiteCTA>
        <div className="bg-hot-gray-50 p-md md:p-lg rounded-lg space-y-lg">
          <YourProjectsTitle projects={projects} />
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-lg">
            {projects.map((project) => {
              return (
                <MappingProjectCard
                  title={project.title}
                  contributors={project.contributors}
                  id={project.id}
                  difficulty={project.difficulty}
                  percentMapped={project.percentMapped}
                  percentValidated={project.percentValidated}
                />
              );
            })}
          </div>

          {/* fair */}

          <div>
            <p className="text-lg ">
              AI-assisted mapping <br />
              Powered by fAIr
            </p>
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
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default MappingPage;
