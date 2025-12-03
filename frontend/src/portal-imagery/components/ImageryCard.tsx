import { IImageryProject } from "../imageryProjects";

interface ImageryCardProps {
  project: IImageryProject;
}

const ImageryCard = ({ project }: ImageryCardProps) => {
  return (
    <a
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block group no-underline hover:no-underline"
    >
      <div className="w-full h-full bg-white rounded-lg p-md flex flex-col gap-lg shadow-sm transition-all duration-200 group-hover:shadow-lg group-hover:scale-[1.01]">
        <img 
          src={project.image} 
          alt={project.title}
          className="w-full h-48 object-cover rounded"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
          }}
        />
        <p className="bold">{project.title}</p>
      </div>
    </a>
  );
};

export default ImageryCard;
