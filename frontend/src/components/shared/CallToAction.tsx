import Button from "./Button";

function CallToAction({
  title,
  description,
  buttonText,
  buttonLink,
}: {
  title?: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}) {
  return (
    <div className="flex flex-col justify-center items-center text-center space-y-sm md:space-y-lg">
      {title && <div className="text-xl md:text-2xl">{title}</div>}
      <div className="text-md md:text-lg leading-tight max-w-3xl">
        {description}
      </div>
      <Button onClick={() => (window.location.href = buttonLink)}>
        {buttonText}
      </Button>
    </div>
  );
}

export default CallToAction;
