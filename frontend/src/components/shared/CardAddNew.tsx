import Button from "./Button";
import Icon from "./Icon";

interface CardAddNewProps {
  title: string;
  description: string;
  buttonLabel: string;
  onButtonClick?: () => void;
}

function CardAddNew({
  title,
  description,
  buttonLabel,
  onButtonClick,
}: CardAddNewProps) {
  return (
    <div className="w-full h-full bg-white rounded-xl border border-hot-gray-200 p-md flex flex-col justify-between gap-xl">
      <div>
        <h3 className="font-bold text-xl leading-tight mb-1">{title}</h3>
        <p className="text-lg">{description}</p>
      </div>
      <Button
        appearance="filled"
        size="large"
        onClick={onButtonClick}
        className="self-start"
      >
        <Icon slot="prefix" name="plus-circle" label="" />
        {buttonLabel}
      </Button>
    </div>
  );
}

export default CardAddNew;
