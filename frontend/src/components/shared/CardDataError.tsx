import * as m from "../../paraglide/messages";
import Icon from "./Icon";

function CardDataError() {
  return (
    <div className="w-full h-full bg-white rounded-xl border border-dashed border-hot-red-300 p-md flex flex-col gap-md">
      <Icon name="triangle-exclamation" label="Error" className="text-hot-red-600 text-xl" />
      <div>
        <p className="font-bold text-base leading-tight">
          {m.card_data_error_title()}
        </p>
        <p className="text-hot-gray-500 text-sm mt-1">
          {m.card_data_error_description()}
        </p>
      </div>
    </div>
  );
}

export default CardDataError;
