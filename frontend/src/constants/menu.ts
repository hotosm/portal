// Menu items for HOT Portal navigation
export interface MenuItem {
  id: string;
  label: string;
  href: string;
  description?: string;
  external?: boolean;
  requiresAuth?: boolean;
  icon?: string;
}

export const MAIN_MENU_ITEMS: MenuItem[] = [
  {
    id: "imagery",
    label: "Imagery",
    href: "/imagery",
    requiresAuth: false,
  },
  {
    id: "mapping",
    label: "Mapping",
    href: "/mapping",
    requiresAuth: false,
  },
  {
    id: "field",
    label: "Field",
    href: "/field",
    requiresAuth: false,
  },
  {
    id: "data",
    label: "Data",
    href: "/data",
    requiresAuth: false,
  },
  {
    id: "learn",
    label: "Learn",
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
