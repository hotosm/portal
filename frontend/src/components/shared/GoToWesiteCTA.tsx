import Button from "./Button";

interface GoToWesiteCTAProps {
  titleBold: string;
  titleRegular: string;
  buttonLink?: string;
  buttonText?: string;
}

function GoToWesiteCTA({
  titleBold,
  titleRegular,
  buttonLink = "#",
  buttonText = "Go to the website",
}: GoToWesiteCTAProps) {
  return (
    <div className="bg-hot-gray-50 flex w-full justify-between p-md md:p-lg items-center rounded-lg">
      <div className="text-lg">
        <span className="font-barlow bold">{titleBold} </span>
        <span className="font-barlow-light">{titleRegular}</span>
      </div>
      <Button href={buttonLink} target="_blank">
        {buttonText}
      </Button>
    </div>
  );
}

export default GoToWesiteCTA;
