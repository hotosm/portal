import { useState } from "react";
import CardAddNew from "../components/shared/CardAddNew";
import CardDataNotAvailable from "../components/shared/CardDataNotAvailable";
import CardTakeCourse from "../components/shared/CardTakeCourse";
import Pagination from "../components/shared/Pagination";
import SectionCardGrid from "../components/shared/SectionCardGrid";
import SectionHeader from "../components/shared/SectionHeader";
import { m } from "../paraglide/messages";
import ImageryCard from "./components/ImageryCard";
import { useDroneProjects } from "./hooks";
import droneIcon from "../assets/icons/drone.svg";
import oamIcon from "../assets/icons/oam.svg";
import { cardClassNames } from "../constants/classNames";

// Blocks with a "take the course" card fit one card less per page.
const DRONE_PROJECTS_PER_PAGE = 4;

function ImageryPage() {
  const [dronePage, setDronePage] = useState(1);
  const { data: droneProjects = [], isLoading } = useDroneProjects();

  const totalDronePages = Math.ceil(
    droneProjects.length / DRONE_PROJECTS_PER_PAGE,
  );
  const pagedDroneProjects = droneProjects.slice(
    (dronePage - 1) * DRONE_PROJECTS_PER_PAGE,
    dronePage * DRONE_PROJECTS_PER_PAGE,
  );

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
        items={pagedDroneProjects}
        renderItem={(project) => <ImageryCard project={project} />}
        trailingCards={
          <div className={cardClassNames}>
            <CardTakeCourse
              title={m.imagery_take_course_title()}
              subtitle={m.imagery_take_course_subtitle()}
              href={m.imagery_drone_take_course_href()}
            />
          </div>
        }
        footer={
          totalDronePages > 1 && (
            <div className="mt-lg">
              <Pagination
                currentPage={dronePage}
                totalPages={totalDronePages}
                onPageChange={setDronePage}
              />
            </div>
          )
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
