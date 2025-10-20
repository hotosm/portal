import { Link } from "react-router-dom";
import hotLogo from "../assets/images/hot-logo.svg";
import NavigationMain from "./NavigationMain";
import NavigationUser from "./NavigationUser";
import Dialog from "./shared/Dialog";
import Icon from "./shared/Icon";
import DrawerMenu from "./DrawerMenu";
import { useAuth } from "../contexts/AuthContext";
import Button from "./shared/Button";

function Header() {
  const { isLogin, logout, toggleAuth } = useAuth();

  const handleLogin = () => {
    const dialog = document.getElementById("dialog-login") as any;
    if (dialog) dialog.open = true;
  };

  const handleLogout = () => {
    logout();
  };

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
          {!isLogin ? (
            <Link
              to="#"
              onClick={handleLogin}
              className="text-primary hover:underline"
            >
              Log In
            </Link>
          ) : (
            <div className="hidden sm:block">
              <NavigationUser />
            </div>
          )}
          {/* Auth Toggle Switch for Testing */}
          <div className="min-w-[120px]">
            <Button
              appearance="plain"
              onClick={toggleAuth}
              className={`rounded text-xs font-medium transition-colors ${
                isLogin ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {isLogin ? "Logged In" : "Logged Out"}
            </Button>
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
