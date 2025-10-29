import { useEffect, useState } from "react";
import ProductCard from "../components/shared/ProductCard";
import { getProductsData } from "../constants/productsData";
import { useLanguage } from "../contexts/LanguageContext";
import { ProjectsMap } from "../components/ProjectsMap";
import Divider from "../components/shared/Divider";
import PrimaryCallToAction from "../components/shared/PrimaryCallToAction";
import SecondaryCallToAction from "../components/shared/SecondaryCallToAction";
import { getCTAData } from "../constants/ctaData";
import { useProjects } from "../hooks/useProjects";
import { m } from "../paraglide/messages";

function HomePage() {
  const { currentLanguage: _currentLanguage } = useLanguage(); // suscribe to force re-render on language change
  const productsData = getProductsData();
  const ctaData = getCTAData("mapping");
  // TODO relocate when adding other APIs
  const { data: projectsData, isLoading, error } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );

  const handleProjectClick = (projectId: number) => {
    console.log("Project clicked:", projectId);
    setSelectedProjectId(projectId);
  };

  // Listen for popup button clicks
  useEffect(() => {
    const handleViewProject = (event: CustomEvent) => {
      const projectId = event.detail?.projectId;
      if (projectId) {
        console.log("View project details:", projectId);
        // TODO: Navigate to project details page
        // Example: navigate(`/projects/${projectId}`);
        alert(
          `Viewing project #${projectId}\n\nThis will navigate to the project details page.`
        );
      }
    };

    window.addEventListener("viewProject" as any, handleViewProject as any);
    return () => {
      window.removeEventListener(
        "viewProject" as any,
        handleViewProject as any
      );
    };
  }, []);

  return (
    <div className="space-y-11">
      {/* Map Section */}
      <div className="h-[83vh] relative">
        <ProjectsMap
          mapResults={projectsData || []}
          selectedProjectId={selectedProjectId}
          onProjectClick={handleProjectClick}
          onCloseDetails={() => setSelectedProjectId(null)}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-sm">
            <p>Loading projects...</p>
          </div>
        )}
        {/* TODO customize error message */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <p>Error loading projects. Please try again later.</p>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="py-3xl bg-hot-gray-50">
        <div className="gap-xl container">
          <h2>{m.product_grid_title()}</h2>
          <h3>{m.product_grid_description()}</h3>
          <Divider className="h-lg"></Divider>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-xl">
            {productsData.map((product) => (
              <ProductCard
                key={product.id}
                title={product.title}
                subtitle={product.subtitle}
                iconName={product.iconName}
                href={product.href}
              />
            ))}
          </div>
        </div>
      </div>

      {/*   example purpose */}
      <div className="container flex flex-col md:flex-row gap-xl">
        {ctaData && (
          <>
            <div className="w-full sm:w-2/3 flex">
              <PrimaryCallToAction data={ctaData.primary} />
            </div>
            <div className="w-full sm:w-1/3 flex">
              <SecondaryCallToAction data={ctaData.secondary} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default HomePage;
