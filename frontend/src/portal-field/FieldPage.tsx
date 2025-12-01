import GoToWesiteCTA from "../components/shared/GoToWesiteCTA";
import PageWrapper from "../components/shared/PageWrapper";
import YourProjectsTitle from "../components/shared/YourProjectsTitle";
import ImageryCard from "./components/FieldCard";
import { getFieldProjects } from "./fieldProjects";

function FieldPage() {
  const projects = getFieldProjects();

  return (
    <PageWrapper>
      <div className="space-y-xl">
        <GoToWesiteCTA
          buttonLink="https://fmtm.hotosm.org/"
          buttonText="Field TM"
          link2={{
            label: "ChatMap",
            url: "https://www.hotosm.org/tech-suite/chatmap/",
          }}
        >
          <strong>Field</strong> Tasking Manager and <strong>ChatMap</strong>
        </GoToWesiteCTA>

        <div className="bg-hot-gray-50 p-md md:p-lg rounded-lg space-y-lg">
          <YourProjectsTitle projects={projects} />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-lg">
            {projects.map((project) => {
              return <ImageryCard project={project} />;
            })}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default FieldPage;
