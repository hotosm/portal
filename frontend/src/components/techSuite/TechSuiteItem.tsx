interface ITechSuiteItemProps {
  title: string;
  description: string;
  icon: any;
  link: string;
}

function TechSuiteItem({
  title,
  description,
  icon,
  link,
}: ITechSuiteItemProps) {
  return (
    <div className="group flex flex-col justify-center items-center text-center hover:cursor-pointer">
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:no-underline"
      >
        <img
          src={icon}
          alt="Product vector icon"
          className="h-[100px] w-[100px] mx-auto transition-transform duration-300 ease-in-out group-hover:scale-110"
        />
        <p className="m-xs">
          <span className="text-white text-lg uppercase px-sm bg-hot-red-600 group-hover:bg-hot-red-400 transition-all duration-300 ease-in-out rounded-sm pb-[2px] inline-block group-hover:scale-105 group-hover:translate-y-1 leading-none">
            {title}
          </span>
        </p>
        <p className="max-w-[300px]">{description}</p>
      </a>
    </div>
  );
}

export default TechSuiteItem;
