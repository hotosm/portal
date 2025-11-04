import vector from "../../assets/images/vector.png";

interface ITechSuiteItemProps {
  title: string;
  description: string;
  className?: string;
}

function TechSuiteItem({ title, description, className }: ITechSuiteItemProps) {
  return (
    <div className={`max-w-[400px] ${className}`}>
      <img
        src={vector}
        alt="Product vector icon"
        style={{
          height: "100px",
          width: "100px",
          margin: "0 auto",
        }}
      />
      <div className="flex flex-col">
        <p className="mb-xs">
          <span className="text-white text-lg font-barlow uppercase px-sm bg-hot-red-900 rounded-sm">
            {title}
          </span>
        </p>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default TechSuiteItem;
