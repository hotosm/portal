import Button from "./Button";

interface GoToWesiteCTAProps {
  children: any;
  buttonLink?: string;
  buttonText?: string;
}

function GoToWesiteCTA({
  children,
  buttonLink = "#",
  buttonText = "Go to the website",
}: GoToWesiteCTAProps) {
  return (
    <div className="bg-hot-gray-50 flex w-full justify-between p-md items-center rounded-lg">
      <div className="text-lg ">{children}</div>
      <Button href={buttonLink} target="_blank">
        {buttonText}
      </Button>
    </div>
  );
}

export default GoToWesiteCTA;
