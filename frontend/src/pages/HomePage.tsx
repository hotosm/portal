import { useEffect, useState } from "react";
import { ProjectsMap } from "../components/ProjectsMap";
import Carousel from "../components/shared/Carousel";
import CarouselItem from "../components/shared/CarouselItem";
import { carouselItems } from "../constants/carouselItems";
import { useLanguage } from "../contexts/LanguageContext";
import { useProjects } from "../hooks/useProjects";
import { m } from "../paraglide/messages";

function HomePage() {
  const { currentLanguage: _currentLanguage } = useLanguage(); // suscribe to force re-render on language change
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
    <div>
      {/* Map Section */}
      <div className="h-[calc(100vh_-_100px)] flex flex-col">
        <div className="flex-1 relative">
          <ProjectsMap
            mapResults={projectsData}
            selectedProjectId={selectedProjectId}
            onProjectClick={handleProjectClick}
            onCloseDetails={() => setSelectedProjectId(null)}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-sm">
              <p>{m.loading_projects()}...</p>
            </div>
          )}
          {/* TODO customize error message */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
              <p>{m.loading_projects_error()}</p>
            </div>
          )}
        </div>

        <div className="container text-center relative py-lg lg:py-xl flex-shrink-0">
          {/* TODO replace with HOT resources */}
          {/* <svg
            className="absolute bottom-0 inset-0 w-full h-full -z-10"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="dot-pattern"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="6" cy="6" r="4" fill="#f1f0f0c3" />
                <circle cx="18" cy="18" r="4" fill="#f1f0f0c3" />
              </pattern>
              <linearGradient
                id="fade-gradient"
                x1="100%"
                y1="100%"
                x2="0%"
                y2="0%"
              >
                <stop offset="0%" stopColor="white" stopOpacity="1" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
              <mask id="fade-mask">
                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  fill="url(#fade-gradient)"
                />
              </mask>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="url(#dot-pattern)"
              mask="url(#fade-mask)"
            />
          </svg> */}
          <p className="text-xl lg:text-2xl leading-tight">
            {m.home_workflow_header()}{" "}
            <strong>{m.home_workflow_header_strong()}</strong>
            <br />
            <span className="text-2xl lg:text-3xl font-bold leading-tight bg-hot-red-600 text-white">
              {m.home_workflow_header_hightlight()}
            </span>
          </p>

          <p className="text-lg lg:text-xl leading-tight mb-0">
            {m.home_workflow_p1()}
            <br />
            {m.home_workflow_p2()}
          </p>
        </div>
      </div>

      {/* Carousel Section */}
      <div className="relative mb-xl">
        <Carousel
          pagination
          loop
          /* autoplay */
          autoplayInterval={5000}
          mouseDragging
          className="hero-carousel"
        >
          {carouselItems.map((item, index) => (
            <CarouselItem key={index}>
              <div
                className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full bg-cover bg-center grayscale"
                style={{ backgroundImage: `url(${item.image})` }}
              >
                {/* desktop block */}
                <div className="hidden md:block md:absolute left-md bottom-md bg-hot-gray-800 p-lg max-w-md text-center">
                  <h3 className="text-white uppercase font-bold text-xl mb-sm">
                    {item.title}
                  </h3>
                  <p className="text-white text-sm md:text-base leading-relaxed mb-0">
                    {item.description}
                  </p>
                </div>
                <div></div>
              </div>
              {/* mobile block */}
              <div className="md:hidden bg-hot-gray-800 p-lg w-full text-center h-[150px]">
                <h3 className="text-white uppercase font-bold text-xl">
                  {item.title}
                </h3>
                <p className="text-white text-sm md:text-base leading-relaxed mb-0">
                  {item.description}
                </p>
              </div>

              {/* <div
                className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full bg-cover bg-center grayscale"
                style={{ backgroundImage: `url(${item.image})` }}
              >
                <div className="absolute left-md bottom-md bg-hot-gray-800 p-lg max-w-md">
                  <h3 className="text-white uppercase font-bold text-xl mb-sm">
                    {item.title}
                  </h3>
                  <p className="text-white text-sm md:text-base leading-relaxed mb-0">
                    {item.description}
                  </p>
                 
                </div>
              </div> */}
            </CarouselItem>
          ))}
        </Carousel>
      </div>
      {/* 
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
      </div> */}
    </div>
  );
}

export default HomePage;
