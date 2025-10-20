import { USER_MENU_ITEMS } from "../constants/menu";
import Button from "./shared/Button";
import Dropdown from "./shared/Dropdown";
import DropdownItem from "./shared/DropdownItem";
import Icon from "./shared/Icon";
function UserMenuContent() {
  const handleMenuSelect = (event: CustomEvent) => {
    const selectedValue = event.detail.item.value;
    const selectedItem = USER_MENU_ITEMS.find(
      (item) => item.id === selectedValue
    );

    if (selectedItem) {
      // TODO handle logout
      if (selectedItem.id === "logout") {
        console.log("Logging out...");
      } else {
        window.location.href = selectedItem.href;
      }
    }
  };

  return (
    <Dropdown onSelect={handleMenuSelect}>
      <Button slot="trigger" appearance="outlined" size="small">
        <Icon slot="start" name="user"></Icon>
        UserName
      </Button>

      {USER_MENU_ITEMS.map((item) => {
        const isLogout = item.id === "logout";
        return (
          <DropdownItem
            key={item.id}
            value={item.id}
            variant={isLogout ? "danger" : "default"}
          >
            {item.id === "profile" && <Icon slot="icon" name="user" />}
            {item.id === "projects" && <Icon slot="icon" name="map" />}
            {item.id === "start" && <Icon slot="icon" name="map" />}
            {item.id === "imagery" && <Icon slot="icon" name="panorama" />}
            {item.id === "logout" && (
              <Icon slot="icon" name="right-from-bracket" />
            )}
            {item.label}
          </DropdownItem>
        );
      })}
    </Dropdown>
  );
}

function NavigationUser() {
  return <UserMenuContent />;
}

export default NavigationUser;
