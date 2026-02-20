import GoToWesiteCTA from "../components/shared/GoToWesiteCTA";
import PageWrapper from "../components/shared/PageWrapper";
import YourProjectsTitle from "../components/shared/YourProjectsTitle";
import ImageryCard from "./components/FieldCard";
import { getFieldProjects } from "./fieldProjects";
import { useChatMapData } from "./hooks/useChatMapData";

function FieldPage() {
  const projects = getFieldProjects();
  const { data: chatmap, isLoading: chatmapLoading } = useChatMapData();

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

        {chatmapLoading && (
          <p className="text-hot-gray-500">Loading ChatMap data...</p>
        )}

        {chatmap && (
          <div className="bg-hot-gray-50 p-md md:p-lg rounded-lg space-y-lg">
            <h3>Your ChatMap</h3>
            <a
              href={chatmap.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block group no-underline hover:no-underline"
            >
              <div className="w-full bg-white rounded-lg p-md flex flex-col gap-sm shadow-sm transition-all duration-200 group-hover:shadow-lg group-hover:scale-[1.01]">
                <h4>{chatmap.title}</h4>
                <span className="text-hot-gray-500">
                  {chatmap.sharing === "public" ? "Public" : "Private"}
                </span>
              </div>
            </a>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default FieldPage;
