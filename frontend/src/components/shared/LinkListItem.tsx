import Icon from "./Icon";

interface ILinkListItemProps {
  label: string;
  link: string;
  icon: string;
}
function LinkListItem({ label, link, icon }: ILinkListItemProps) {
  return (
    <div className="py-xs">
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex gap-xs items-center cursor-pointer"
      >
        <Icon name={icon}></Icon>
        <span>{label}</span>
      </a>
    </div>
  );
}

export default LinkListItem;
