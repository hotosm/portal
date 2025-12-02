import Card from "./Card";
import Button from "./Button";
import { PrimaryCallToActionData } from "../../types/types";

interface PrimaryCallToActionProps {
  data: PrimaryCallToActionData;
}

function PrimaryCallToAction({ data }: PrimaryCallToActionProps) {
  return (
    <Card
      className="flex justify-between flex-grow card-basic h-full"
      appearance="filled"
    >
      <h2 slot="header">{data.title}</h2>
      <p className="text-3xl leading-tight">
        {data.description}{" "}
        <span className="font-bold">{data.descriptionHightlight}</span>
      </p>
      <div className="h-2xl"></div>
      <div className="flex gap-lg w-full">
        <Button href={data.link1.url} target="_blank">
          {data.link1.text}
        </Button>
        <Button appearance="outlined" href={data.link2.url} target="_blank">
          {data.link2.text}
        </Button>
      </div>

      <p slot="footer" className="font-thin  italic text-xl leading-tight">
        {data.footer}
      </p>
    </Card>
  );
}

export default PrimaryCallToAction;
