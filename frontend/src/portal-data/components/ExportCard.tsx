import type { IDataProject } from "../types";

const ExportCard = ({ project }: { project: IDataProject }) => {
  return (
    <a
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full group no-underline hover:no-underline"
    >
      <div className="w-full h-full bg-white rounded-xl p-md flex flex-col gap-lg transition-all duration-200 group-hover:scale-[1.01]" style={{ boxShadow: "0 0 5px 0 rgba(0, 0, 0, 0.25)" }}>
        <div>
          <p className="bold line-clamp-2">{project.title}</p>
        </div>
      </div>
    </a>
  );
};

export default ExportCard;
