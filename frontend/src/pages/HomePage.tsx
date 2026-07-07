import { useNavigate } from "react-router-dom";
import Button from "../components/shared/Button";
import Carousel from "../components/shared/Carousel";
import CarouselItem from "../components/shared/CarouselItem";
import { carouselItems } from "../constants/carouselItems";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { m } from "../paraglide/messages";

function HomePage() {
  const { currentLanguage } = useLanguage();
  const { isLogin } = useAuth();
  const navigate = useNavigate();

  const planPath = `/${currentLanguage}/plan`;

  function handlePlanClick() {
    if (isLogin) {
      navigate(planPath);
      return;
    }
    const returnTo = `${window.location.origin}${planPath}`;
    const hankoUrl = window.HANKO_URL || "https://login.hotosm.org";
    window.location.href = `${hankoUrl}/app?return_to=${encodeURIComponent(returnTo)}&lang=${currentLanguage}`;
  }

  return (
    <div
      style={{
        background:
          "linear-gradient(180deg, var(--hot-color-neutral-0) 0.5%, var(--hot-color-cyan-50) 5%, var(--hot-color-rose-50) 30%, var(--hot-color-neutral-0) 50%)",
      }}
    >
      <div className="container flex flex-col gap-xl mb-3xl mt-xl">
        <section className="container overflow-hidden px-md md:px-xl py-3xl  bg-white  flex flex-col gap-xl md:gap-3xl justify-center items-center rounded-xl text-center">
          <div className="flex flex-col gap-md md:gap-xl">
            <span className="text-2xl md:text-3xl leading-tight">
              <strong>{m.home_workflow_header()}</strong>
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
            <Button size="large" onClick={handlePlanClick}>
              {m.home_create_cta()}
            </Button>
            <Button appearance="plain" className="accent-link-button" href="https://learn.hotosm.org" target="_blank">
              {m.home_create_cta_secondary()}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default HomePage;
