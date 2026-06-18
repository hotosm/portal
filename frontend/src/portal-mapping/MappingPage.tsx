import { useState } from "react";
import aiIcon from "../assets/icons/ai.svg";
import tmIcon from "../assets/icons/tm.svg";
import CardAddNew from "../components/shared/CardAddNew";
import CardDataNotAvailable from "../components/shared/CardDataNotAvailable";
import Pagination from "../components/shared/Pagination";
import SectionCardGrid from "../components/shared/SectionCardGrid";
import SectionHeader from "../components/shared/SectionHeader";
import { cardClassNames } from "../constants/classNames";
import { m } from "../paraglide/messages";
import FairProjectCard from "./components/FairProjectCard";
import { useMyModels } from "./hooks";

const PROJECTS_PER_PAGE = 6;

function MappingPage() {
  const [projectsPage, setProjectsPage] = useState(1);
  const { data: modelsData, isLoading } = useMyModels(projectsPage, PROJECTS_PER_PAGE);

  const models = modelsData?.items ?? [];
  const totalPages = Math.ceil((modelsData?.total ?? 0) / PROJECTS_PER_PAGE);

  return (
    <>
      <SectionHeader>
        <strong>{m.section_mapping()}</strong>
      </SectionHeader>

      <SectionCardGrid
        icon={tmIcon}
        title={m.mapping_collaborative()}
        toolName="Tasking Manager"
      >
        <div className={cardClassNames}>
          <CardAddNew
            title={m.mapping_tm_card_title()}
            description={m.mapping_tm_card_description()}
            buttonLabel={m.mapping_tm_card_button()}
            icon="map"
            buttonHref="https://tasks.hotosm.org"
          />
        </div>
        <div className={cardClassNames}>
          <CardDataNotAvailable />
        </div>
      </SectionCardGrid>

      <SectionCardGrid
        icon={aiIcon}
        title={m.mapping_ai_assisted()}
        toolName="fAIr"
        isLoading={isLoading}
        staticCards={
          <div className={cardClassNames}>
            <CardDataNotAvailable />
          </div>
        }
        pagination={
          totalPages > 1 && (
            <Pagination
              currentPage={projectsPage}
              totalPages={totalPages}
              onPageChange={setProjectsPage}
            />
          )
        }
      >
        <div className={cardClassNames}>
          <CardAddNew
            title={m.mapping_fair_card_title()}
            description={m.mapping_tm_card_description()}
            buttonLabel={m.mapping_tm_card_button()}
            icon="map"
            buttonHref="https://fair.hotosm.org"
          />
        </div>
        {models.map((project) => (
          <div key={project.id} className={cardClassNames}>
            <FairProjectCard project={project} />
          </div>
        ))}
      </SectionCardGrid>
    </>
  );
}

export default MappingPage;
