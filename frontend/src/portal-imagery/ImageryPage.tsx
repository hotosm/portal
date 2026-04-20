import CardAddNew from "../components/shared/CardAddNew";
import CardDataNotAvailable from "../components/shared/CardDataNotAvailable";
import CardSkeleton from "../components/shared/CardSkeleton";
import CardTakeCourse from "../components/shared/CardTakeCourse";
import PageWrapper from "../components/shared/PageWrapper";
import SectionHeader from "../components/shared/SectionHeader";
import SubSectionHeader from "../components/shared/SubSectionHeader";
import { m } from "../paraglide/messages";
import ImageryCard from "./components/ImageryCard";
import { useDroneProjects } from "./hooks";
import droneIcon from "../assets/icons/drone.svg";
import oamIcon from "../assets/icons/oam.svg";

const CARD_CLASS =
  "w-full md:w-[calc(33.333%_-_var(--hot-spacing-large)*0.667)] lg:w-[calc(25%_-_var(--hot-spacing-large)*0.75)] shrink-0";

function ImageryPage() {
  const { data: droneProjects = [], isLoading } = useDroneProjects();

  return (
    <>
      <SectionHeader>
        <span
          dangerouslySetInnerHTML={{ __html: m.section_imagery_header() }}
        />
      </SectionHeader>
      <SubSectionHeader
        icon={droneIcon}
        title={m.imagery_drone_capturing()}
        toolName="Drone Tasking Manager"
      />
      <PageWrapper>
        {/* Drone image capturing section */}
        <div className="flex flex-col gap-sm py-lg">
          <div className="flex flex-wrap gap-lg">
            {isLoading ? (
              Array.from({ length: 1 }).map((_, i) => (
                <div key={i} className={CARD_CLASS}>
                  <CardSkeleton linesCount={3} />
                </div>
              ))
            ) : (
              <>
                <div className={CARD_CLASS}>
                  <CardAddNew
                    title={m.imagery_drone_card_title()}
                    description={m.imagery_drone_card_description()}
                    buttonLabel={m.imagery_drone_card_button()}
                    icon="add"
                  />
                </div>
                {droneProjects.map((project) => (
                  <div key={project.id} className={CARD_CLASS}>
                    <ImageryCard project={project} />
                  </div>
                ))}
              </>
            )}
            <div className={CARD_CLASS}>
              <CardTakeCourse
                title={m.imagery_take_course_title()}
                subtitle={m.imagery_take_course_subtitle()}
                href="#"
              />
            </div>
          </div>
        </div>
      </PageWrapper>

      <SubSectionHeader
        icon={oamIcon}
        title={m.imagery_image_publishing()}
        toolName="OpenAerialMap"
      />
      <PageWrapper>
        <div className="flex flex-col gap-sm py-lg">
          <div className="flex flex-wrap gap-lg">
            <div className={CARD_CLASS}>
              <CardAddNew
                title={m.imagery_oam_card_title()}
                description={m.imagery_oam_card_description()}
                buttonLabel={m.imagery_oam_card_button()}
                icon="explore"
              />
            </div>
            <div className={CARD_CLASS}>
              <CardDataNotAvailable />
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
}

export default ImageryPage;
