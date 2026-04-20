import GoToWesiteCTA from "../components/shared/GoToWesiteCTA";
import PageWrapper from "../components/shared/PageWrapper";
import YourProjectsTitle from "../components/shared/YourProjectsTitle";
import { m } from "../paraglide/messages";
import ImageryCard from "./components/ImageryCard";
import ImageryNoProjects from "./components/ImageryNoProjects";
import { useAllImageryData } from "./hooks/useImageryData";

function ImageryPage() {
  const {
    allProjects,
    droneProjects,
    oamProjects,
    isLoading,
    isError,
    error,
  } = useAllImageryData();

  return (
    <PageWrapper>
      <div className="space-y-xl">
        <GoToWesiteCTA
          buttonLink="https://dronetm.org"
          buttonText="Drone TM"
          link2={{
            label: "OpenAerialMap",
            url: "https://openaerialmap.org",
          }}
        >
          <strong>Drone</strong> Tasking Manager and{" "}
          <strong>OpenAerialMap</strong>
        </GoToWesiteCTA>

        {isLoading ? (
          <div className="flex justify-center items-center py-xl">
            <div className="text-lg">Loading projects...</div>
          </div>
        ) : isError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-md">
            <p className="text-red-800">{error?.message || "Failed to load projects"}</p>
          </div>
        ) : allProjects.length === 0 ? (
          <ImageryNoProjects />
        ) : (
          <div className="bg-hot-gray-50 p-md md:p-lg rounded-lg space-y-lg">
            <YourProjectsTitle projects={droneProjects} />
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-lg">
              {droneProjects.map((project) => {
                return <ImageryCard key={project.id} project={project} />;
              })}
            </div>

            {oamProjects.length > 0 && (
              <div>
                <p className="text-lg ">
                  {m.your_plural()} <strong>{m.imagery()}</strong>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-lg">
                  {oamProjects.map((project) => {
                    return <ImageryCard key={project.id} project={project} />;
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default ImageryPage;
