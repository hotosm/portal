import plusIcon from "../../assets/icons/plus-circle-fill.svg?url";

interface CardAddProjectProps {
  onButtonClick?: () => void;
}

function CardAddProject({ onButtonClick }: CardAddProjectProps) {
  return (
    <button
      type="button"
      onClick={onButtonClick}
      className="w-full h-full min-h-40 rounded-xl border-2 border-dashed border-hot-gray-300 flex flex-col items-center justify-center gap-sm text-hot-gray-400 hover:border-hot-red hover:text-hot-red transition-colors cursor-pointer bg-transparent"
    >
      <img src={plusIcon} alt="" className="w-10 h-10 opacity-60" />
      <span className="text-sm font-medium">Manage projects</span>
    </button>
  );
}

export default CardAddProject;
