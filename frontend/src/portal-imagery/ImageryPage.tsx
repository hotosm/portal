import GoToWesiteCTA from "../components/shared/GoToWesiteCTA";
import PageWrapper from "../components/shared/PageWrapper";
import ImageryCard from "./components/ImageryCard";
import { getImageryProjects } from "./imageryProjects";

function ImageryPage() {
  const projects = getImageryProjects();
  const droneProjects = projects.filter((p) => p.section === "drone");
  const oamProjects = projects.filter((p) => p.section === "oam");

  return (
    <PageWrapper>
      <div className="space-y-xl">
        <GoToWesiteCTA>
          <strong>Drone</strong> Tasking Manager and{" "}
          <strong>OpenAerialMap</strong>
        </GoToWesiteCTA>

        <div className="bg-hot-gray-50 p-md items-center rounded-lg space-y-xl">
          <div>
            <p className="text-lg ">
              Your <strong>projects</strong>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-lg">
              {droneProjects.map((project) => {
                return <ImageryCard project={project} />;
              })}
            </div>
          </div>

          <div>
            <p className="text-lg ">
              Your <strong>imagery</strong>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-lg">
              {oamProjects.map((project) => {
                return <ImageryCard project={project} />;
              })}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default ImageryPage;
