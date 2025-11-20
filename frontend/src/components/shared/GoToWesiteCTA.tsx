import Button from "./Button";
import Dropdown from "./Dropdown";
import DropdownItem from "./DropdownItem";
import { m } from "../../paraglide/messages";

interface GoToWesiteCTAProps {
  children: any;
  buttonLink?: string;
  buttonText?: string;
  link2?: {
    label: string;
    url: string;
  };
}

function GoToWesiteCTA({
  children,
  buttonLink = "#",
  buttonText = m.go_to_the_website(),
  link2,
}: GoToWesiteCTAProps) {
  const handleDropdownSelect = (event: CustomEvent) => {
    const item = event.detail.item as HTMLElement;
    const url = item.getAttribute("data-url");
    if (url) {
      window.open(url, "_blank");
    }
  };

  return (
    <div className="bg-hot-gray-50 flex flex-col md:flex-row gap-sm w-full justify-between p-md items-start md:items-center rounded-lg">
      <div className="text-lg ">{children}</div>
      {link2 ? (
        <Dropdown onSelect={handleDropdownSelect}>
          <Button with-caret slot="trigger">
            {m.go_to_the_website()}
          </Button>
          <DropdownItem data-url={buttonLink}>{buttonText}</DropdownItem>
          <DropdownItem data-url={link2.url}>{link2.label}</DropdownItem>
        </Dropdown>
      ) : (
        <Button href={buttonLink} target="_blank">
          {buttonText}
        </Button>
      )}
    </div>
  );
}

export default GoToWesiteCTA;
