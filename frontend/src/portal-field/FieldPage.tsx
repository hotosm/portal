import { useState } from "react";
import chatIcon from "../assets/icons/chat.svg";
import fieldIcon from "../assets/icons/field.svg";
import CardAddNew from "../components/shared/CardAddNew";
import CardDataNotAvailable from "../components/shared/CardDataNotAvailable";
import Pagination from "../components/shared/Pagination";
import SectionCardGrid from "../components/shared/SectionCardGrid";
import SectionHeader from "../components/shared/SectionHeader";
import { m } from "../paraglide/messages";
import ChatMapCard from "./components/ChatMapCard";
import { useChatMapData } from "./hooks/useChatMapData";
import { cardClassNames } from "../constants/classNames";

const CHAT_MAPS_PER_PAGE = 5;

function FieldPage() {
  const [chatMapsPage, setChatMapsPage] = useState(1);
  const { data: chatMaps = [], isLoading: isChatMapLoading } = useChatMapData();

  const totalChatMapPages = Math.ceil(chatMaps.length / CHAT_MAPS_PER_PAGE);
  const pagedChatMaps = chatMaps.slice(
    (chatMapsPage - 1) * CHAT_MAPS_PER_PAGE,
    chatMapsPage * CHAT_MAPS_PER_PAGE,
  );

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
        items={pagedChatMaps}
        renderItem={(map) => <ChatMapCard project={map} />}
        footer={
          totalChatMapPages > 1 && (
            <div className="mt-lg">
              <Pagination
                currentPage={chatMapsPage}
                totalPages={totalChatMapPages}
                onPageChange={setChatMapsPage}
              />
            </div>
          )
        }
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
        /* trailingCards={
          <div className={cardClassNames}>
            <CardDataNotAvailable />
          </div>
        } */
      />
    </>
  );
}

export default FieldPage;
