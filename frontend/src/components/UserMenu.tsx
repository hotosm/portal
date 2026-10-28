import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { m } from "../paraglide/messages";
import { useMyPortalProfile } from "../portal-user-profile/hooks/useMyPortalProfile";
import Button from "./shared/Button";
import Dialog from "./shared/Dialog";
import Dropdown from "./shared/Dropdown";
import DropdownItem from "./shared/DropdownItem";
import { getNameFromEmail } from "../utils/utils";

const LEARN_URL = "https://learn.hotosm.org";

function UserMenu() {
  const { isLogin, user } = useAuth();
  const { data: me, isLoading } = useMyPortalProfile();
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const [isNoProfileOpen, setIsNoProfileOpen] = useState(false);

  if (!isLogin) return null;

  const label =
    me?.first_name?.trim() || user?.username || getNameFromEmail(user?.email);

  const handleSelect = (event: CustomEvent) => {
    const value = event.detail.item.value;
    if (value === "profile") {
      if (me?.is_public && me.slug) {
        navigate(`/${currentLanguage}/people/${encodeURIComponent(me.slug)}`);
      } else {
        setIsNoProfileOpen(true);
      }
    } else if (value === "learn") {
      window.open(LEARN_URL, "_blank", "noopener,noreferrer");
    }
  };

  // Read the current URL on click: the header doesn't re-render on every route.
  const handleCreateProfile = () => {
    window.location.href = `${window.HANKO_URL}/app/profile?return_to=${encodeURIComponent(window.location.href)}`;
  };

  return (
    <>
      <Dropdown onSelect={handleSelect}>
        <Button slot="trigger" appearance="plain" withCaret>
          {label}
        </Button>
        <DropdownItem value="profile" disabled={isLoading}>
          {m.nav_profile()}
        </DropdownItem>
        <DropdownItem value="learn">
          Learn
        </DropdownItem>
      </Dropdown>

      <Dialog
        open={isNoProfileOpen}
        label={m.user_menu_no_profile_title()}
        onWaHide={() => setIsNoProfileOpen(false)}
      >
        <p>{m.user_menu_no_profile_message()}</p>
        <div slot="footer" className="flex gap-sm justify-end">
          <button
            type="button"
            onClick={() => setIsNoProfileOpen(false)}
            className="text-sm text-hot-gray-500 hover:text-hot-gray-700 underline"
          >
            {m.user_menu_close()}
          </button>
          <Button type="button" onClick={handleCreateProfile}>
            {m.user_menu_create_profile()}
          </Button>
        </div>
      </Dialog>
    </>
  );
}

export default UserMenu;
