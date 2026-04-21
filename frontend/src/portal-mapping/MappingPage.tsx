import { useState } from "react";
import aiIcon from "../assets/icons/ai.svg";
import tmIcon from "../assets/icons/tm.svg";
import CardAddNew from "../components/shared/CardAddNew";
import CardDataNotAvailable from "../components/shared/CardDataNotAvailable";
import CardSkeleton from "../components/shared/CardSkeleton";
import CardTakeCourse from "../components/shared/CardTakeCourse";
import PageWrapper from "../components/shared/PageWrapper";
import Pagination from "../components/shared/Pagination";
import SectionHeader from "../components/shared/SectionHeader";
import SubSectionHeader from "../components/shared/SubSectionHeader";
import { m } from "../paraglide/messages";
import FairProjectCard from "./components/FairProjectCard";
import { useMyModels } from "./hooks";

const CARD_CLASS =
  "w-full md:w-[calc(33.333%_-_var(--hot-spacing-large)*0.667)] lg:w-[calc(25%_-_var(--hot-spacing-large)*0.75)] shrink-0";

const PROJECTS_PER_PAGE = 6;

function MappingPage() {
  const [projectsPage, setProjectsPage] = useState(1);
  const { data: modelsData, isLoading } = useMyModels(
    projectsPage,
    PROJECTS_PER_PAGE,
  );

  const models = modelsData?.items ?? [];
  const totalPages = Math.ceil((modelsData?.total ?? 0) / PROJECTS_PER_PAGE);

  return (
    <>
      <SectionHeader>
        <strong>{m.section_mapping()}</strong>
      </SectionHeader>
      <SubSectionHeader
        icon={tmIcon}
        title={m.mapping_collaborative()}
        toolName="Tasking Manager"
      />
      <PageWrapper>
        <div className="flex flex-col gap-sm py-lg">
          <div className="flex flex-wrap gap-lg">
            <div className={CARD_CLASS}>
              <CardAddNew
                title={m.mapping_tm_card_title()}
                description={m.mapping_tm_card_description()}
                buttonLabel={m.mapping_tm_card_button()}
                icon="map"
              />
            </div>
            <div className={CARD_CLASS}>
              <CardDataNotAvailable />
            </div>
          </div>
        </div>
      </PageWrapper>

      <SubSectionHeader
        icon={aiIcon}
        title={m.mapping_ai_assisted()}
        toolName="fAIr"
      />

      <PageWrapper>
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
                    title={m.mapping_fair_card_title()}
                    description={m.mapping_fair_card_description()}
                    buttonLabel={m.mapping_tm_card_button()}
                    icon="map"
                  />
                </div>
                {/* we only show models for the moment, no datasets */}
                {models.map((project) => (
                  <div key={project.id} className={CARD_CLASS}>
                    <FairProjectCard project={project} />
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
          {totalPages > 1 && (
            <div className="mt-lg">
              <Pagination
                currentPage={projectsPage}
                totalPages={totalPages}
                onPageChange={setProjectsPage}
              />
            </div>
          )}
        </div>
      </PageWrapper>
    </>
  );
}

export default MappingPage;
