import Carousel from "../components/shared/Carousel";
import CarouselItem from "../components/shared/CarouselItem";
import PageWrapper from "../components/shared/PageWrapper";
import { RichTextContent } from "../components/shared/RichTextEditor";
import SubSectionHeader from "../components/shared/SubSectionHeader";
import { cardClassNames } from "../constants/classNames";
import { useLanguage } from "../contexts/LanguageContext";
import { useIsMobile } from "../hooks/useIsMobile";
import { m } from "../paraglide/messages";
import PlanProjectCard from "./components/PlanProjectCard";
import PlanSectionHeader from "./components/PlanSectionHeader";
import PlanShareButton from "./components/PlanShareButton";
import { PLAN_SECTIONS } from "./contstants";
import type { PlanReadHydrated } from "./types";

interface Props {
  plan: PlanReadHydrated;
}

export function SharedPlanView({ plan }: Props) {
  const { currentLanguage } = useLanguage();
  const isMobile = useIsMobile();

  return (
    <>
      <PlanSectionHeader
        breadcrumbs={[
          { label: m.plan_header(), href: `/${currentLanguage}/plan` },
          { label: plan.name },
        ]}
        menu={plan.is_public ? <PlanShareButton plan={plan} /> : undefined}
      >
        {plan.name}
      </PlanSectionHeader>

      <PageWrapper>
        <>
          {plan.description && (
            <RichTextContent html={plan.description} className="py-md" />
          )}
          {plan.images.length > 0 && (
            <Carousel
              loop
              mouseDragging
              navigation
              pagination
              slidesPerPage={isMobile ? 1 : 2}
              slidesPerMove={isMobile ? 1 : 2}
              className="w-full"
            >
              {plan.images.map((img) => (
                <CarouselItem key={img.id}>
                  <div
                    className={`overflow-hidden aspect-[16/9] ${plan.images.length === 1 ? "max-w-2xl mx-auto w-full" : "w-full"}`}
                  >
                    <img
                      src={img.url}
                      alt={`Image ${img.id}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </Carousel>
          )}
        </>
      </PageWrapper>

      {PLAN_SECTIONS.map((section) => {
        const sectionProjects = plan.projects.filter((p) =>
          section.apps.includes(p.app),
        );
        if (sectionProjects.length === 0) return null;
        return (
          <div key={section.title}>
            <SubSectionHeader title={`<strong>${section.title}</strong>`} />
            <PageWrapper>
              <div className="flex flex-wrap gap-lg py-lg">
                {sectionProjects.map((project) => (
                  <div key={project.id} className={cardClassNames}>
                    <PlanProjectCard project={project} />
                  </div>
                ))}
              </div>
            </PageWrapper>
          </div>
        );
      })}
    </>
  );
}
