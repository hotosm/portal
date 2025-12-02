import GoToWesiteCTA from "../components/shared/GoToWesiteCTA";
import PageWrapper from "../components/shared/PageWrapper";
import YourProjectsTitle from "../components/shared/YourProjectsTitle";
import MappingProjectCard from "./components/MappingProjectCard";
import { mappingProjectsData } from "./mappingProjectsData";

function MappingPage() {
  const projects = mappingProjectsData;

  return (
    <PageWrapper>
      <div className="space-y-xl">
        <GoToWesiteCTA buttonLink="https://tasks.hotosm.org/">
          <strong>Tasking Manager</strong> Remote Mapping
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
        </div>
      </div>
    </PageWrapper>
  );
}

export default MappingPage;
