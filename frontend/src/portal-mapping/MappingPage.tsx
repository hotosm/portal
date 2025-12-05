import GoToWesiteCTA from "../components/shared/GoToWesiteCTA";
import PageWrapper from "../components/shared/PageWrapper";
import YourProjectsTitle from "../components/shared/YourProjectsTitle";
import MappingProjectCard from "./components/MappingProjectCard";
import UMapCard from "./components/UMapCard";
import { mappingProjectsData } from "./mappingProjectsData";
import { getUMapProjects } from "./umapProjects";

function MappingPage() {
  const projects = mappingProjectsData;
  const maps = getUMapProjects();

  return (
    <PageWrapper>
      <div className="space-y-xl">
        <GoToWesiteCTA
          buttonLink="https://tasks.hotosm.org/"
          buttonText="Tasking Manager"
          link2={{
            label: "uMap",
            url: "https://umap.hotosm.org/",
          }}
        >
          <strong>Tasking Manager</strong> and <strong>uMap</strong>
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
          <div>
            <p className="text-lg ">
              Your <strong>maps</strong>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-lg">
              {maps.map((map) => {
                return <UMapCard project={map} />;
              })}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default MappingPage;
