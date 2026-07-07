import chatIcon from "../assets/icons/chat.svg";
import fieldIcon from "../assets/icons/field.svg";
import CardAddNew from "../components/shared/CardAddNew";
import CardDataNotAvailable from "../components/shared/CardDataNotAvailable";
import SectionCardGrid from "../components/shared/SectionCardGrid";
import SectionHeader from "../components/shared/SectionHeader";
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

      <SectionCardGrid
        icon={chatIcon}
        title={m.field_chat_mapping()}
        toolName="ChatMap"
        isLoading={isChatMapLoading}
        addCard={
            <CardAddNew
              title={m.field_tm_card_title()}
              description={m.field_tm_card_description()}
              buttonLabel={m.field_tm_card_button()}
              icon="add"
              buttonHref="https://chatmap.hotosm.org"
            />
        }
        items={chatMaps}
        renderItem={(map) => <ChatMapCard project={map} />}
        
      />

      <SectionCardGrid
        icon={fieldIcon}
        title={m.field_organized_mapping()}
        toolName="Field Tasking Manager"
        addCard={
          <CardAddNew
            title={m.field_tm_card_title()}
            description={m.field_tm_card_description()}
            buttonLabel={m.field_tm_card_button()}
            icon="add"
            buttonHref="https://field.hotosm.org"
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

export default FieldPage;
