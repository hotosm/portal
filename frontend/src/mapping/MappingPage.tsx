import GoToWesiteCTA from "../components/shared/GoToWesiteCTA";
import MappingProjectCard from "./components/MappingProjectCard";
import { mappingProjectsData } from "./mappingProjectsData";

function MappingPage() {
  const projects = mappingProjectsData;
  return (
    <div className="container space-y-xl">
      <GoToWesiteCTA
        titleBold="Tasking Manager"
        titleRegular="Remote Mapping"
      />
      <div className="bg-hot-gray-50 p-md md:p-lg rounded-lg space-y-lg">
        <div className="text-lg">
          <span className="font-barlow bold">Your </span>
          <span className="font-barlow-light">projects</span>
        </div>
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
  );
}

export default MappingPage;
