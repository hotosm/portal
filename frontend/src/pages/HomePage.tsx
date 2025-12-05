import { useEffect, useState } from "react";
import { ProjectsMap } from "../components/ProjectsMap";
import Carousel from "../components/shared/Carousel";
import CarouselItem from "../components/shared/CarouselItem";
import { carouselItems } from "../constants/carouselItems";
import { useLanguage } from "../contexts/LanguageContext";
import { useProjects } from "../hooks/useProjects";
import { m } from "../paraglide/messages";
import CallToAction from "../components/shared/CallToAction";

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

        <section className="text-center relative py-lg md:py-2xl flex-shrink-0 space-y-sm md:space-y-lg">
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
          <div className="container text-xl md:text-2xl leading-tight ">
            {m.home_workflow_header()}{" "}
            <strong>{m.home_workflow_header_strong()}</strong>
          </div>
          <div className="bg-hot-red-600 md:bg-transparent md:container leading-tight text-xl md:text-2xl font-bold text-white">
            <span className="bg-hot-red-600 ">
              {m.home_workflow_header_hightlight()}
            </span>
          </div>

          <div className="container text-md md:text-lg leading-tight">
            {m.home_workflow_p1()}
            <br />
            {m.home_workflow_p2()}
          </div>
        </section>
      </div>
      {/* Carousel Section */}
      <section className="relative">
        <Carousel
          pagination
          loop
          /* autoplay */
          autoplayInterval={5000}
          mouseDragging
          className="md:container hero-carousel"
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
                  <p className="text-white text-md md:text-lg leading-tight mb-0">
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
                <p className="text-white text-lg leading-tight mb-0 line-clamp-3">
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
      </section>

      {/* Call to action */}
      <section className="container py-xl md:py-2xl">
        <CallToAction
          title="Start mapping, today"
          description="Fly drones, publish aerial imagery for free, organize mapping projects from home, go the field for easy mapping, free and open for everyone!"
          buttonText="Start a mapping project"
          buttonLink="#"
        />
      </section>

    </div>
  );
}

export default HomePage;
