import CardAddNew from "../components/shared/CardAddNew";
import CardDataNotAvailable from "../components/shared/CardDataNotAvailable";
import CardTakeCourse from "../components/shared/CardTakeCourse";
import SectionCardGrid from "../components/shared/SectionCardGrid";
import SectionHeader from "../components/shared/SectionHeader";
import { cardClassNames } from "../constants/classNames";
import { m } from "../paraglide/messages";
import droneIcon from "../assets/icons/drone.svg";
import oamIcon from "../assets/icons/oam.svg";
import ImageryCard from "./components/ImageryCard";
import { useDroneProjects } from "./hooks";

function ImageryPage() {
  const { data: droneProjects = [], isLoading } = useDroneProjects();

  return (
    <>
      <SectionHeader>
        <span dangerouslySetInnerHTML={{ __html: m.section_imagery_header() }} />
      </SectionHeader>

      <SectionCardGrid
        icon={droneIcon}
        title={m.imagery_drone_capturing()}
        toolName="Drone Tasking Manager"
        isLoading={isLoading}
        staticCards={
          <div className={cardClassNames}>
            <CardTakeCourse
              title={m.imagery_take_course_title()}
              subtitle={m.imagery_take_course_subtitle()}
              href="https://learn.hotosm.org/course/drone-tasking-manager"
            />
          </div>
        }
      >
        <div className={cardClassNames}>
          <CardAddNew
            title={m.imagery_drone_card_title()}
            description={m.imagery_drone_card_description()}
            buttonLabel={m.imagery_drone_card_button()}
            icon="add"
            buttonHref="https://drone.hotosm.org/create-project"
          />
        </div>
        {droneProjects.map((project) => (
          <div key={project.id} className={cardClassNames}>
            <ImageryCard project={project} />
          </div>
        ))}
      </SectionCardGrid>

      <SectionCardGrid
        icon={oamIcon}
        title={m.imagery_image_publishing()}
        toolName="OpenAerialMap"
      >
        <div className={cardClassNames}>
          <CardAddNew
            title={m.imagery_oam_card_title()}
            description={m.imagery_oam_card_description()}
            buttonLabel={m.imagery_oam_card_button()}
            icon="explore"
            buttonHref="https://map.openaerialmap.org"
          />
        </div>
        <div className={cardClassNames}>
          <CardDataNotAvailable />
        </div>
      </SectionCardGrid>
    </>
  );
}

export default ImageryPage;
