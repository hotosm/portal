import Button from "./Button";
import Icon from "./Icon";
import exploreIcon from "../../assets/icons/search.svg?url";
import plusIcon from "../../assets/icons/plus-circle-fill.svg?url";
import mapIcon from "../../assets/icons/star-fill.svg?url";

const ICONS = {
  add: plusIcon,
  explore: exploreIcon,
  map: mapIcon,
};

type CardIcon = keyof typeof ICONS | null;

interface CardAddNewProps {
  title: string;
  description: string;
  buttonLabel: string;
  icon: CardIcon;
  onButtonClick?: () => void;
}

function CardAddNew({
  title,
  description,
  buttonLabel,
  icon,
  onButtonClick,
}: CardAddNewProps) {
  return (
    <div className="w-full h-full bg-white rounded-xl shadow-[0_0_14px_rgba(0,0,0,0.2)] p-md flex flex-col justify-between gap-xl">
      <div>
        <h3 className="font-bold text-xl leading-tight mb-1">{title}</h3>
        <p className="text-lg">{description}</p>
      </div>
      <Button className="self-start" onClick={onButtonClick}>
        {icon && <Icon slot="start" src={ICONS[icon]} label="" />}
        {buttonLabel}
      </Button>
    </div>
  );
}

export default CardAddNew;
