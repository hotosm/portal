import { useEffect, useState } from "react";
import GoToWesiteCTA from "../components/shared/GoToWesiteCTA";
import PageWrapper from "../components/shared/PageWrapper";
import ImageryNoProjects from "./components/ImageryNoProjects";
import ImageryCard from "./components/ImageryCard";
import { getImageryProjects, IImageryProject } from "./imageryProjects";
import { useHasProjects } from "../hooks/useHasProjects";
import Switch from "../components/shared/Switch";
import YourProjectsTitle from "../components/shared/YourProjectsTitle";
import { m } from "../paraglide/messages";

function ImageryPage() {
  const { hasProjects, toggleHasProjects } = useHasProjects();
  const [projects, setProjects] = useState<IImageryProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        setError(null);
        const data = await getImageryProjects();
        setProjects(data);
      } catch (err) {
        console.error('Error loading projects:', err);
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    }
    
    loadProjects();
  }, []);

  const droneProjects = projects.filter((p) => p.section === "drone");
  const oamProjects = projects.filter((p) => p.section === "oam");

  return (
    <PageWrapper>
      <div className="space-y-xl">
        {/* Dev Toggle */}
        <div className="flex items-center gap-md p-md bg-yellow-50 rounded-lg border border-yellow-100">
          <span className="text-sm font-semibold">Dev Mode:</span>
          <label className="flex items-center gap-sm cursor-pointer">
            <Switch checked={hasProjects} onChange={toggleHasProjects} />
            <span className="text-sm">
              Has Projects: {hasProjects ? "Yes" : "No"}
            </span>
          </label>
        </div>

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

        {loading ? (
          <div className="flex justify-center items-center py-xl">
            <div className="text-lg">Loading projects...</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-md">
            <p className="text-red-800">{error}</p>
          </div>
        ) : !hasProjects || projects.length === 0 ? (
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