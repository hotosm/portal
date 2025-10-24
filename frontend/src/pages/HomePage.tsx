import { useEffect } from "react";
import ProductCard from "../components/shared/ProductCard";
import { getProductsData } from "../constants/productsData";
import { useLanguage } from "../contexts/LanguageContext";
import { ProjectsMap } from "../components/ProjectsMap";
import { sampleProjectsData } from "../constants/sampleProjectsData";
import Divider from "../components/shared/Divider";
import PrimaryCallToAction from "../components/shared/PrimaryCallToAction";
import SecondaryCallToAction from "../components/shared/SecondaryCallToAction";
import { getCTAData } from "../constants/ctaData";

function HomePage() {
  const { currentLanguage: _currentLanguage } = useLanguage(); // suscribe to force re-render on language change
  const productsData = getProductsData();
  const ctaData = getCTAData("mapping");

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
    <div className="space-y-11">
      {/* Map Section */}
      <div className="h-[83vh]">
        <ProjectsMap
          mapResults={sampleProjectsData}
          onProjectClick={handleProjectClick}
        />
      </div>

      {/* Products Grid */}
      <div className="py-3xl bg-hot-gray-50">
        <div className="gap-xl container">
          <h2>Explore our Tech Suite</h2>
          <h3>
            Our platform fosters open collaboration with intuitive products that
            integrate seamlessly, enabling you to manage complete mapping
            projects in one place.
          </h3>
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
          </div>{" "}
        </div>
      </div>

      {/*   example purpose */}
      <div className="container flex gap-xl">
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
