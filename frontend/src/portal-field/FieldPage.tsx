import chatIcon from "../assets/icons/chat.svg";
import fieldIcon from "../assets/icons/field.svg";
import CardAddNew from "../components/shared/CardAddNew";
import CardDataNotAvailable from "../components/shared/CardDataNotAvailable";
import CardSkeleton from "../components/shared/CardSkeleton";
import PageWrapper from "../components/shared/PageWrapper";
import SectionHeader from "../components/shared/SectionHeader";
import SubSectionHeader from "../components/shared/SubSectionHeader";
import { m } from "../paraglide/messages";
import ChatMapCard from "./components/ChatMapCard";
import { useChatMapData } from "./hooks/useChatMapData";
import { cardClassNames } from "../constants/classNames";

function FieldPage() {
  const { data: chatMaps = [], isLoading: isChatMapLoading } = useChatMapData();

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
            <div className={cardClassNames}>
              <CardAddNew
                title={m.field_tm_card_title()}
                description={m.field_tm_card_description()}
                buttonLabel={m.field_tm_card_button()}
                icon="add"
                buttonHref="https://chatmap.hotosm.org"
              />
            </div>
            {isChatMapLoading
              ? Array.from({ length: 1 }).map((_, i) => (
                  <div key={i} className={cardClassNames}>
                    <CardSkeleton linesCount={3} />
                  </div>
                ))
              : chatMaps.map((map) => (
                  <div key={map.id} className={cardClassNames}>
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
            <div className={cardClassNames}>
              <CardDataNotAvailable />
            </div>
            <div className={cardClassNames}>
              <CardAddNew
                title={m.field_tm_card_title()}
                description={m.field_tm_card_description()}
                buttonLabel={m.field_tm_card_button()}
                icon="add"
                buttonHref="https://field.hotosm.org"
              />
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
}

export default FieldPage;
