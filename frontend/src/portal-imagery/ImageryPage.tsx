import CardAddNew from "../components/shared/CardAddNew";
import CardDataNotAvailable from "../components/shared/CardDataNotAvailable";
import CardTakeCourse from "../components/shared/CardTakeCourse";
import SectionCardGrid from "../components/shared/SectionCardGrid";
import SectionHeader from "../components/shared/SectionHeader";
import { m } from "../paraglide/messages";
import ImageryCard from "./components/ImageryCard";
import { useDroneProjects } from "./hooks";
import droneIcon from "../assets/icons/drone.svg";
import oamIcon from "../assets/icons/oam.svg";
import { cardClassNames } from "../constants/classNames";

function ImageryPage() {
  const { data: droneProjects = [], isLoading } = useDroneProjects();

  return (
    <>
      <SectionHeader>
        <span
          dangerouslySetInnerHTML={{ __html: m.section_imagery_header() }}
        />
      </SectionHeader>

      <SectionCardGrid
        icon={droneIcon}
        title={m.imagery_drone_capturing()}
        toolName="Drone Tasking Manager"
        isLoading={isLoading}
        addCard={
          <CardAddNew
            title={m.imagery_drone_card_title()}
            description={m.imagery_drone_card_description()}
            buttonLabel={m.imagery_drone_card_button()}
            icon="add"
            buttonHref="https://drone.hotosm.org/create-project"
          />
        }
        items={droneProjects}
        renderItem={(project) => <ImageryCard project={project} />}
        trailingCards={
          <div className={cardClassNames}>
            <CardTakeCourse
              title={m.imagery_take_course_title()}
              subtitle={m.imagery_take_course_subtitle()}
              href="https://learn.hotosm.org/course/drone-tasking-manager"
            />
          </div>
        }
      />

      <SectionCardGrid
        icon={oamIcon}
        title={m.imagery_image_publishing()}
        toolName="OpenAerialMap"
        addCard={
          <CardAddNew
            title={m.imagery_oam_card_title()}
            description={m.imagery_oam_card_description()}
            buttonLabel={m.imagery_oam_card_button()}
            icon="explore"
            buttonHref="https://map.openaerialmap.org"
          />
        }
        trailingCards={
          <div className={cardClassNames}>
            <CardDataNotAvailable />
          </div>
        }
      />
    </>
  );
}

export default ImageryPage;
