import { Link } from "react-router-dom";
import hotLogo from "../assets/images/hot-logo.svg";
import NavigationMain from "./NavigationMain";
import NavigationUser from "./NavigationUser";
import Dialog from "./shared/Dialog";
import Icon from "./shared/Icon";
import DrawerMenu from "./DrawerMenu";

function Header() {
  return (
    <>
      <div className="flex gap-xl py-md justify-between items-center">
        <div className="flex gap-xl items-center">
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
          {/* mobile navigation */}
          <div className="block sm:hidden">
            <DrawerMenu />
          </div>

          {/* desktop navigation */}
          <div className="hidden sm:block">
            <NavigationMain />
          </div>
        </div>

        <div className="flex gap-md items-center">
          <Link
            to="#"
            onClick={() => {
              const dialog = document.getElementById("dialog-login") as any;
              if (dialog) dialog.open = true;
            }}
            className="text-primary hover:underline"
          >
            Log In
          </Link>

          {/* Desktop User Menu */}
          <div className="hidden sm:block">
            <NavigationUser />
          </div>

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

      <Dialog label="Log In" id="dialog-login">
        <hotosm-auth show-profile={false} />
      </Dialog>
    </>
  );
}

export default Header;
