import hotLogo from "../assets/images/hot-logo.svg";
import Navigation from "./Navigation";
import Dialog from "./shared/Dialog";
import Icon from "./shared/Icon";

function Header() {
  return (
    <>
      <div className="flex gap-xl py-md justify-between items-center">
        <div className="flex gap-xl">
          <a href="/">
            <img
              src={hotLogo}
              alt="HOT Logo"
              style={{
                height: "40px",
                width: "158px",
              }}
            />
          </a>

          <Navigation />
        </div>
        <div className="flex gap-md items-center">
          <a
            href="/"
            className="text-lg font-barlow text-hot-primary"
            aria-label="Log in to your account"
          >
            Log in
          </a>
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
