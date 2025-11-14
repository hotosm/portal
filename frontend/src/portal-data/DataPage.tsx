import GoToWesiteCTA from "../components/shared/GoToWesiteCTA";
import PageWrapper from "../components/shared/PageWrapper";
import DataCard from "./components/DataCard";
import { getDataProjects } from "./dataProjects";

function DataPage() {
  const projects = getDataProjects();
  const models = projects.filter((p) => p.section === "model");
  const sets = projects.filter((p) => p.section === "set");

  return (
    <PageWrapper>
      <div className="space-y-xl">
        <GoToWesiteCTA>
          <strong>fAIr</strong> AI-assisted Mapping
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
        </div>
      </div>
    </PageWrapper>
  );
}

export default DataPage;
