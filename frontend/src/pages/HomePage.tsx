import { useEffect } from "react";
import ProductCard from "../components/shared/ProductCard";
import { getProductsData } from "../constants/productsData";
import { useLanguage } from "../contexts/LanguageContext";
import { ProjectsMap } from "../components/ProjectsMap";
import { sampleProjectsData } from "../constants/sampleProjectsData";

function HomePage() {
  const { currentLanguage: _currentLanguage } = useLanguage(); // suscribe to force re-render on language change
  const productsData = getProductsData();

  const handleProjectClick = (projectId: number) => {
    console.log("Project clicked:", projectId);
    // TODO: Navigate to project details or show modal
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
    <div className="space-y-6">
      {/* Map Section */}
      <div className="h-[90vh]">
        <ProjectsMap
          mapResults={sampleProjectsData}
          onProjectClick={handleProjectClick}
        />
      </div>

      {/* Products Grid */}
      <div className="p-xl bg-hot-gray-50 rounded-xl container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
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
  );
}

export default HomePage;
