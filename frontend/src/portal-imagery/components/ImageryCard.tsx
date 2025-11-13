const ImageryCard = ({ project }: any) => {
  return (
    <a
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block group no-underline hover:no-underline"
    >
      <div className="w-full h-full bg-white rounded-lg p-lg flex flex-col gap-lg shadow-sm transition-all duration-200 group-hover:shadow-lg group-hover:scale-[1.01]">
        <img src={project.image} />
        <p className="bold">{project.title}</p>
      </div>
    </a>
  );
};

export default ImageryCard;
