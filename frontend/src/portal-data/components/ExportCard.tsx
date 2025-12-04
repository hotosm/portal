import Tag from "../../components/shared/Tag";

const ExportCard = ({ project }: any) => {
  return (
    <a
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block group no-underline hover:no-underline"
    >
      <div className="w-full h-full bg-white rounded-lg p-md flex flex-col gap-lg shadow-sm transition-all duration-200 group-hover:shadow-lg group-hover:scale-[1.01]">
        <div>
          <p className="bold line-clamp-2">{project.title}</p>
        </div>
      </div>
    </a>
  );
};

export default ExportCard;
