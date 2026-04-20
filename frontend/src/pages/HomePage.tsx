import Button from "../components/shared/Button";
import Carousel from "../components/shared/Carousel";
import CarouselItem from "../components/shared/CarouselItem";
import { carouselItems } from "../constants/carouselItems";
import { useLanguage } from "../contexts/LanguageContext";
import { m } from "../paraglide/messages";

function HomePage() {
  const { currentLanguage: _currentLanguage } = useLanguage(); // subscribe to force re-render on language change

  return (
    <div
      style={{
        background:
          "linear-gradient(180deg, var(--hot-color-neutral-0) 0.5%, var(--hot-color-cyan-50) 5%, var(--hot-color-rose-50) 30%, var(--hot-color-neutral-0) 50%)",
      }}
    >
      <div className="container flex flex-col gap-xl mb-3xl mt-xl">
        {/* <section className="h-[calc(100vh_-_68px_-_2rem)] relative pt-4">
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
        </section> */}

        <section className="container overflow-hidden px-md md:px-xl py-3xl  bg-white  flex flex-col gap-xl md:gap-3xl justify-center items-center rounded-xl text-center">
          <div className="flex flex-col gap-md md:gap-xl">
            <span className="text-2xl md:text-3xl leading-tight">
              <strong>{m.home_workflow_header()}</strong>
            </span>
            <span>
              <span
                className="p-xs md:p-md leading-normal text-2xl md:text-2xl text-white rounded-md"
                style={{
                  background:
                    "linear-gradient(172.711deg, #d73f3f 8.4%, #459ba0 92.3%)",
                }}
              >
                <strong>{m.home_workflow_header_hightlight()}</strong>
              </span>
            </span>
            <span className="text-lg md:text-xl leading-tight text-center">
              <span
                dangerouslySetInnerHTML={{ __html: m.home_workflow_p1() }}
              />
              <br />
              <span
                dangerouslySetInnerHTML={{ __html: m.home_workflow_p2() }}
              />
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
              <strong>{m.home_create_header()}</strong>
            </div>
            <div
              className="text-lg md:text-xl leading-tight max-w-3xl"
              dangerouslySetInnerHTML={{ __html: m.home_create_p() }}
            />
            <Button size="large" onClick={() => (window.location.href = "#")}>
              {m.home_create_cta()}
            </Button>
            <Button appearance="plain" className="accent-link-button">
              {m.home_create_cta_secondary()}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default HomePage;
