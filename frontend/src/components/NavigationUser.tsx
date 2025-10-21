import { USER_MENU_ITEMS } from "../constants/menu";
import { useAuth } from "../contexts/AuthContext";
import Button from "./shared/Button";
import Dropdown from "./shared/Dropdown";
import DropdownItem from "./shared/DropdownItem";
import Icon from "./shared/Icon";

function UserMenuContent() {
  const { user, osmConnection } = useAuth();

  const handleMenuSelect = (event: CustomEvent) => {
    const selectedValue = event.detail.item.value;

    // Handle OSM connection (not in USER_MENU_ITEMS)
    if (selectedValue === "connect-osm") {
      const currentUrl = window.location.href;
      window.location.href = `/login?return_to=${encodeURIComponent(currentUrl)}&osm_required=true`;
      return;
    }

    // Handle items from USER_MENU_ITEMS
    const selectedItem = USER_MENU_ITEMS.find(
      (item) => item.id === selectedValue
    );

    if (selectedItem) {
      if (selectedItem.id === "logout") {
        // Handle logout: clear cookies and reload
        console.log("Logout clicked, clearing session...");

        // Clear Hanko cookie
        document.cookie = 'hanko=; path=/; max-age=0';
        document.cookie = 'hanko=; path=/; domain=localhost; max-age=0';

        // Clear OSM cookie
        document.cookie = 'osm_connection=; path=/; max-age=0';
        document.cookie = 'osm_connection=; path=/; domain=localhost; max-age=0';

        // Reload page to clear all state
        window.location.href = '/';
      } else {
        window.location.href = selectedItem.href;
      }
    }
  };

  const displayName = user?.username || user?.email || "User";

  // Separate logout from other items
  const menuItemsWithoutLogout = USER_MENU_ITEMS.filter(
    (item) => item.id !== "logout"
  );
  const logoutItem = USER_MENU_ITEMS.find((item) => item.id === "logout");

  return (
    <Dropdown onSelect={handleMenuSelect}>
      <Button slot="trigger" appearance="outlined" size="small" style={{ position: 'relative' }}>
        <Icon slot="start" name="user"></Icon>
        {displayName}
        {/* OSM Connection Status Badge */}
        {osmConnection && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            border: '2px solid white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '8px',
            color: 'white',
            fontWeight: 'bold'
          }} title={`Connected to OSM as @${osmConnection.osm_username}`}>
            ✓
          </span>
        )}
      </Button>

      {/* Regular menu items (without logout) */}
      {menuItemsWithoutLogout.map((item) => (
        <DropdownItem key={item.id} value={item.id}>
          {item.id === "profile" && <Icon slot="icon" name="user" />}
          {item.id === "projects" && <Icon slot="icon" name="map" />}
          {item.id === "start" && <Icon slot="icon" name="map" />}
          {item.id === "imagery" && <Icon slot="icon" name="panorama" />}
          {item.label}
        </DropdownItem>
      ))}

      {/* OSM Connection Status */}
      {osmConnection ? (
        <DropdownItem value="osm-connected" disabled>
          <Icon slot="icon" name="check" />✓ Connected to OSM (@
          {osmConnection.osm_username})
        </DropdownItem>
      ) : (
        <DropdownItem value="connect-osm">
          <Icon slot="icon" name="map" />
          Connect OSM
        </DropdownItem>
      )}

      {/* Logout at the end */}
      {logoutItem && (
        <DropdownItem value={logoutItem.id} variant="danger">
          <Icon slot="icon" name="right-from-bracket" />
          {logoutItem.label}
        </DropdownItem>
      )}
    </Dropdown>
  );
}

function NavigationUser() {
  return <UserMenuContent />;
}

export default NavigationUser;
