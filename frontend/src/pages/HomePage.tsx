import { ProjectsMap } from "../components/ProjectsMap";
import Carousel from "../components/shared/Carousel";
import CarouselItem from "../components/shared/CarouselItem";
import Button from "../components/shared/Button";
import { carouselItems } from "../constants/carouselItems";
import { useLanguage } from "../contexts/LanguageContext";
import { useProjects } from "../hooks/useProjects";
import { useProjectsMapCallout } from "../hooks/useProjectsMapCallout";
import { m } from "../paraglide/messages";

function HomePage() {
  const { currentLanguage: _currentLanguage } = useLanguage(); // subscribe to force re-render on language change
  const { data: projectsData, isLoading, error } = useProjects();
  const {
    selectedProjectId,
    selectedProjects,
    locationName,
    selectedProduct,
    handleProjectClick,
    handleCloseDetails,
  } = useProjectsMapCallout();

  return (
    <div
      style={{
        background:
          "linear-gradient(180.571deg, #ffffff 8.3%, #ffe6de 61.9%, #e6f6f5 83.6%, #e6f6f5b9 99.9%)",
      }}
    >
      {/* Map Section */}
      <div className="container flex flex-col gap-xl mb-3xl">
        <section className="h-[calc(100vh_-_68px_-_2rem)] relative pt-4">
          <ProjectsMap
            mapResults={projectsData}
            selectedProjectId={selectedProjectId}
            selectedProduct={selectedProduct}
            selectedProjects={selectedProjects}
            locationName={locationName}
            onProjectClick={handleProjectClick}
            onCloseDetails={handleCloseDetails}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-sm">
              <p>{m.loading_projects()}...</p>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
              <p>{m.loading_projects_error()}</p>
            </div>
          )}
        </section>

        <section className="container overflow-hidden px-md md:px-xl py-3xl  bg-white  flex flex-col gap-xl md:gap-3xl justify-center items-center rounded-xl text-center">
          <div className="flex flex-col gap-md md:gap-xl">
            <span className="text-2xl md:text-3xl leading-tight">
              {m.home_workflow_header()}{" "}
              <strong>{m.home_workflow_header_strong()}</strong>
            </span>
            <span>
              <span
                className="p-xs md:p-md leading-normal text-2xl md:text-3xl text-white rounded-md"
                style={{
                  background:
                    "linear-gradient(172.711deg, #d73f3f 8.4%, #459ba0 92.3%)",
                }}
              >
                <strong>{m.home_workflow_header_hightlight()}</strong>
              </span>
            </span>
            <span className="text-lg md:text-xl leading-tight text-center">
              {m.home_workflow_p1()}
              <br />
              {m.home_workflow_p2()}
            </span>
          </div>

          <Carousel
            loop
            autoplay
            autoplayInterval={4000}
            mouseDragging
            className="w-full max-w-4xl hero-carousel"
          >
            {carouselItems.map((item, index) => (
              <CarouselItem key={index}>
                <img
                  src={item.image}
                  srcSet={`${item.imageSm} 800w, ${item.image} 1674w`}
                  sizes="(max-width: 896px) 100vw, 896px"
                  alt={item.title}
                  className="w-full aspect-[1200/774] md:aspect-[1674/774] object-cover rounded-xl"
                />
              </CarouselItem>
            ))}
          </Carousel>

          <div className="flex flex-col justify-center items-center text-center gap-md md:gap-xl">
            <div className="text-2xl md:text-3xl leading-tight">
              Create & share geospatial data
            </div>
            <div className="text-lg md:text-xl leading-tight max-w-3xl">
              Fly <strong>drones</strong>, publish aerial{" "}
              <strong>imagery</strong> for free, organize{" "}
              <strong>mapping</strong> projects from home, go the{" "}
              <strong>field</strong> for easy mapping, <strong>free</strong> and
              open for everyone!
            </div>
            <Button size="large" onClick={() => (window.location.href = "#")}>
              Start a project
            </Button>
            <Button appearance="plain" className="accent-link-button">
              Take a course or specialize
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default HomePage;
