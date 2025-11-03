import vector from "../../assets/images/vector.png";

interface ITechSuiteItemProps {
  title: string;
  description: string;
  alignment?: "vertical" | "horizontal";
}

function TechSuiteItem({
  title,
  description,
  alignment = "vertical",
}: ITechSuiteItemProps) {
  return (
    <div
      className={`flex ${
        alignment === "vertical"
          ? "flex-col justify-center align-middle max-w-[250px] "
          : "flex-row-reverse justify-end align-bottom max-w-[450px] "
      }`}
    >
      <img
        src={vector}
        alt="Product vector icon"
        style={{
          height: "140px",
          width: "140px",
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
