import chatIcon from "../assets/icons/chat.svg";
import fieldIcon from "../assets/icons/field.svg";
import CardAddNew from "../components/shared/CardAddNew";
import CardDataNotAvailable from "../components/shared/CardDataNotAvailable";
import CardSkeleton from "../components/shared/CardSkeleton";
import SectionCardGrid from "../components/shared/SectionCardGrid";
import SectionHeader from "../components/shared/SectionHeader";
import { cardClassNames } from "../constants/classNames";
import { m } from "../paraglide/messages";
import ChatMapCard from "./components/ChatMapCard";
import { useChatMapData } from "./hooks/useChatMapData";

function FieldPage() {
  const { data: chatMaps = [], isLoading: isChatMapLoading } = useChatMapData();

  return (
    <>
      <SectionHeader>
        <strong>{m.section_field()}</strong>
      </SectionHeader>

      {/* ChatMap: AddNew is always visible; only data cards have a loading state */}
      <SectionCardGrid
        icon={chatIcon}
        title={m.field_chat_mapping()}
        toolName="ChatMap"
      >
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
      </SectionCardGrid>

      <SectionCardGrid
        icon={fieldIcon}
        title={m.field_organized_mapping()}
        toolName="Field Tasking Manager"
      >
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
      </SectionCardGrid>
    </>
  );
}

export default FieldPage;
