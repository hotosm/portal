import WaDrawer from "@awesome.me/webawesome/dist/react/drawer/index.js";
import { Link } from "react-router-dom";
import { MAIN_MENU_ITEMS } from "../constants/menu";
import Icon from "./shared/Icon";
function MainMenuContent() {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-md">
        {MAIN_MENU_ITEMS.map((item) => (
          <Link
            key={item.id}
            className="text-lg font-barlow text-hot-primary"
            to={item.href}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </>
  );
}

function Navigation() {
  return (
    <>
      {/* mobile menu */}
      <div className="block sm:hidden">
        <WaDrawer label="Menu" id="mobile-drawer">
          <MainMenuContent />
        </WaDrawer>

        <Icon
          name="bars"
          label="Menu"
          onClick={() => {
            const drawer = document.getElementById("mobile-drawer") as any;
            if (drawer) drawer.open = true;
          }}
        ></Icon>
      </div>

      {/* desktop menu */}
      <div className="hidden sm:block">
        <MainMenuContent />
      </div>
    </>
  );
}

export default Navigation;
