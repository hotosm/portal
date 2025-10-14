import { useState } from "react";
import hotLogo from "../assets/images/hot-logo.svg";
import { MAIN_MENU_ITEMS } from "../constants/menu";
import Navigation from "./Navigation";

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLinkClick = (href: string, external?: boolean) => {
    if (external) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      // Handle internal navigation (you can integrate with React Router later)
      console.log("Navigate to:", href);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex gap-xl py-md">
      <a href="/">
        <img
          src={hotLogo}
          alt="HOT Logo"
          style={{
            height: "40px",
            width: "auto",
          }}
        />
      </a>

      <Navigation />

      {/* Desktop Navigation */}
      {/* <nav className="flex gap-lg">
        {MAIN_MENU_ITEMS.map((item) => (
          <a
            key={item.id}
            onClick={() => handleLinkClick(item.href, item.external)}
            className="font-barlow text-hot-primary text-lg cursor-pointer"
            title={item.description}
          >
            {item.label}
          </a>
        ))}
      </nav> */}
    </div>
  );
}

export default Header;
