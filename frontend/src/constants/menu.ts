import * as m from "../paraglide/messages";

// Menu items for HOT Portal navigation
export interface MenuItem {
  id: string;
  label: () => string;
  href: string;
  description?: string;
  external?: boolean;
  requiresAuth?: boolean;
  icon?: string;
}

export const MAIN_MENU_ITEMS: MenuItem[] = [
  {
    id: "imagery",
    label: m.section_imagery,
    href: "/imagery",
    requiresAuth: false,
  },
  {
    id: "mapping",
    label: m.section_mapping,
    href: "/mapping",
    requiresAuth: false,
  },
  {
    id: "field",
    label: m.section_field,
    href: "/field",
    requiresAuth: false,
  },
  {
    id: "data",
    label: m.section_data,
    href: "/data",
    requiresAuth: false,
  },
  {
    id: "plan",
    label: m.section_plan,
    href: "/plan",
    requiresAuth: false,
  },
  {
    id: "learn",
    label: () => "Learn",
    href: "/learn",
    requiresAuth: false,
    icon: "patch-check",
  },
];

export const getVisibleMenuItems = (
  items: MenuItem[],
  isAuthenticated = false,
): MenuItem[] => {
  return items.filter((item) => {
    if (item.requiresAuth && !isAuthenticated) return false;
    return true;
  });
};
