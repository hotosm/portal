<<<<<<< HEAD
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
=======
import type { IDataProject } from "../types";
import placeholder from "../../assets/images/placeholder.png";
import CardProjectTitle from "../../components/shared/CardProjectTitle";

const ExportCard = ({ project }: { project: IDataProject }) => {
  return (
    <div className="w-full h-full bg-white rounded-xl shadow-[0_0_14px_rgba(0,0,0,0.2)] p-md flex flex-col gap-lg">
      <div className="flex flex-col gap-sm">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-48 object-cover rounded"
          onError={(e) => {
            e.currentTarget.src = placeholder;
          }}
        />
        <CardProjectTitle href={project.href} title={project.title} />
>>>>>>> develop
      </div>
    </div>
  );
};

export default ExportCard;
