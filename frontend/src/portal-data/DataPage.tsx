import { useEffect, useState } from "react";
import GoToWesiteCTA from "../components/shared/GoToWesiteCTA";
import PortalPageSkeleton from "../components/shared/PortalPageSkeleton";
import PageWrapper from "../components/shared/PageWrapper";
import DataCard from "./components/DataCard";
import { getDataProjects } from "./dataProjects";

function DataPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      // Replace this with actual API call
      const data = getDataProjects();
      // Add timeout to see skeleton loading state
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setProjects(data);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const models = projects.filter((p) => p.section === "model");
  const sets = projects.filter((p) => p.section === "set");

  if (isLoading) {
    return <PortalPageSkeleton />;
  }

  return (
    <PageWrapper>
      <div className="space-y-xl">
        <GoToWesiteCTA buttonLink="https://fair.hotosm.org/">
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
