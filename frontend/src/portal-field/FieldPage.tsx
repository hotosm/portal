import CardAddNew from "../components/shared/CardAddNew";
import CardSkeleton from "../components/shared/CardSkeleton";
import PageWrapper from "../components/shared/PageWrapper";
import SectionHeader from "../components/shared/SectionHeader";
import ChatMapCard from "./components/ChatMapCard";
import { useChatMapData } from "./hooks/useChatMapData";
import { m } from "../paraglide/messages";
import SubSectionHeader from "../components/shared/SubSectionHeader";
import chatIcon from "../assets/icons/chat.svg";
import fieldIcon from "../assets/icons/field.svg";
import { useFieldTMProjects } from "./hooks/useFieldTMProjects";
import CardTakeCourse from "../components/shared/CardTakeCourse";
import FieldTMCard from "./components/FieldTMCard";

const CARD_CLASS =
  "w-full md:w-[calc(33.333%_-_var(--hot-spacing-large)*0.667)] lg:w-[calc(25%_-_var(--hot-spacing-large)*0.75)] shrink-0";

function FieldPage() {
  const { data: chatMaps = [], isLoading: isChatMapLoading } = useChatMapData();
  const { data: fieldMaps = [], isLoading: isFieldLoading } =
    useFieldTMProjects();

  return (
    <>
      <SectionHeader>
        <strong>{m.section_field()}</strong>
      </SectionHeader>
      <SubSectionHeader
        icon={chatIcon}
        title={m.field_chat_mapping()}
        toolName="ChatMap"
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
              <CardAddNew
                title={m.field_tm_card_title()}
                description={m.field_tm_card_description()}
                buttonLabel={m.field_tm_card_button()}
                icon="add"
              />
            </div>
            {isChatMapLoading
              ? Array.from({ length: 1 }).map((_, i) => (
                  <div key={i} className={CARD_CLASS}>
                    <CardSkeleton linesCount={3} />
                  </div>
                ))
              : chatMaps.map((map) => (
                  <div key={map.id} className={CARD_CLASS}>
                    <ChatMapCard project={map} />
                  </div>
                ))}
          </div>
        </div>
      </PageWrapper>

      <SubSectionHeader
        icon={fieldIcon}
        title={m.field_organized_mapping()}
        toolName="Field Tasking Manager"
      />

      <PageWrapper>
        <div className="flex flex-col gap-sm py-lg">
          <div className="flex flex-wrap gap-lg">
            {isFieldLoading ? (
              Array.from({ length: 1 }).map((_, i) => (
                <div key={i} className={CARD_CLASS}>
                  <CardSkeleton linesCount={3} />
                </div>
              ))
            ) : (
              <>
                {fieldMaps.map((project) => (
                  <div key={project.id} className={CARD_CLASS}>
                    <FieldTMCard project={project} />
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
          {/* {totalPages > 1 && (
            <div className="mt-lg">
              <Pagination
                currentPage={projectsPage}
                totalPages={totalPages}
                onPageChange={setProjectsPage}
              />
            </div>
          )} */}
        </div>
      </PageWrapper>
    </>
  );
}

export default FieldPage;
