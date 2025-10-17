import WaDrawer from "@awesome.me/webawesome/dist/react/drawer/index.js";
import { USER_MENU_ITEMS } from "../constants/menu";
import NavigationMain from "./NavigationMain";
import Divider from "./shared/Divider";
import Icon from "./shared/Icon";

function DrawerMenuContent() {
  const closeDrawer = () => {
    const drawer = document.getElementById("mobile-drawer") as any;
    if (drawer) drawer.open = false;
  };

  const handleUserAction = (itemId: string, href: string) => {
    if (itemId === "logout") {
      // TODO handle logout
      console.log("Logging out...");
    } else {
      window.location.href = href;
    }
    closeDrawer();
  };

  return (
    <div className="flex flex-col gap-md">
      <NavigationMain onLinkClick={closeDrawer} />

      <Divider />
      <div className="flex flex-col gap-md">
        {/* TODO provisory styling */}
        {USER_MENU_ITEMS.map((item) => {
          return (
            <button
              key={item.id}
              className="text-left text-lg font-barlow py-2 flex items-center gap-2"
              onClick={() => handleUserAction(item.id, item.href)}
            >
              {item.id === "profile" && <Icon slot="icon" name="user" />}
              {item.id === "projects" && <Icon slot="icon" name="map" />}
              {item.id === "start" && <Icon slot="icon" name="map" />}
              {item.id === "imagery" && <Icon slot="icon" name="panorama" />}
              {item.id === "logout" && (
                <Icon slot="icon" name="right-from-bracket" />
              )}
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DrawerMenu() {
  return (
    <>
      <WaDrawer label="Menu" id="mobile-drawer">
        <DrawerMenuContent />
      </WaDrawer>

      <Icon
        name="bars"
        label="Menu"
        onClick={() => {
          const drawer = document.getElementById("mobile-drawer") as any;
          if (drawer) drawer.open = true;
        }}
      />
    </>
  );
}

export default DrawerMenu;
