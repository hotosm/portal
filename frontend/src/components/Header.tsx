import { Link } from "react-router-dom";
import hotLogo from "../assets/images/hot-logo.svg";
import Navigation from "./Navigation";
import Dialog from "./shared/Dialog";
import Icon from "./shared/Icon";

function Header() {
  return (
    <>
      <div className="flex gap-xl py-md justify-between items-center">
        <div className="flex gap-xl">
          <Link to="/">
            <img
              src={hotLogo}
              alt="HOT Logo"
              style={{
                height: "40px",
                width: "158px",
              }}
            />
          </Link>

          <Navigation />
        </div>
        <div className="flex gap-md items-center">
          {/* Hanko Auth Component */}
          <hotosm-auth show-profile={false} />

          <Icon
            name="grip"
            onClick={() => {
              const dialog = document.getElementById("dialog-overview") as any;
              if (dialog) dialog.open = true;
            }}
            aria-label="Open shared menu"
            style={{ cursor: "pointer" }}
          />
        </div>
      </div>

      <Dialog label="Coming Soon" id="dialog-overview">
        Shared menu will be a web component.
      </Dialog>
    </>
  );
}

export default Header;
