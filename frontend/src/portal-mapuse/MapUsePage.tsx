import { useEffect, useState } from "react";
import GoToWesiteCTA from "../components/shared/GoToWesiteCTA";
import PortalPageSkeleton from "../components/shared/PortalPageSkeleton";
import PageWrapper from "../components/shared/PageWrapper";
import UMapCard from "./components/UMapCard";
import { getUMapProjects } from "./umapProjects";

function MapUsePage() {
  const projects = getUMapProjects();

  return (
    <PageWrapper>
      <div className="space-y-xl">
        <GoToWesiteCTA
          buttonLink="https://umap.hotosm.org/"
          buttonText="uMap"
          link2={{
            label: "Export Tool",
            url: "https://export.hotosm.org/",
          }}
        >
          <strong>uMap</strong> and <strong>Export Tool</strong>
        </GoToWesiteCTA>
        <div className="bg-hot-gray-50 p-md items-center rounded-lg space-y-xl">
          <div>
            <p className="text-lg ">
              Your <strong>maps</strong>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-lg">
              {projects.map((project) => {
                return <UMapCard project={project} />;
              })}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default MapUsePage;
