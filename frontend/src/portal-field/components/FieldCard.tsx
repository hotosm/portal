const FieldCard = ({ project }: any) => {
  return (
    <a
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block group no-underline hover:no-underline"
    >
      <div className="w-full h-full bg-white rounded-lg p-lg flex flex-col gap-lg shadow-sm transition-all duration-200 group-hover:shadow-lg group-hover:scale-[1.01] justify-between">
        <h4>{project.title}</h4>
        <img className="max-h-[50px] max-w-max grayscale" src={project.logo} />
      </div>
    </a>
  );
};

export default FieldCard;
