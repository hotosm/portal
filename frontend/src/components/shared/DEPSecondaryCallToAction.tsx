import Card from "./Card";
import Button from "./Button";
import { SecondaryCallToActionData } from "../../types/types";

interface SecondaryCallToActionProps {
  data: SecondaryCallToActionData;
}

function SecondaryCallToAction({ data }: SecondaryCallToActionProps) {
  const cardStyle = {
    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8)), url(${data.image})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };

  return (
    <Card
      appearance="plain"
      className="flex justify-between h-full"
      style={cardStyle}
    >
      <h2 slot="header" className="leading-none">
        {data.title}
      </h2>
      <span className="flex flex-1 flex-grow">
        <p className=" font-thin italic text-2xl leading-tight">
          {data.description}
        </p>
      </span>

      <span slot="footer">
        <Button onClick={() => window.open(data.link, "_blank")}>
          Learn more
        </Button>
      </span>
    </Card>
  );
}

export default SecondaryCallToAction;
