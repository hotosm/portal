// Menu items for HOT Portal navigation
export interface MenuItem {
  id: string
  label: string
  href: string
  description?: string
  external?: boolean
  requiresAuth?: boolean
}

export const MAIN_MENU_ITEMS: MenuItem[] = [
  {
    id: 'mapping',
    label: 'Mapping',
    href: '/mapping',
    requiresAuth: false,
  },
  {
    id: 'imagery',
    label: 'Imagery',
    href: '/imagery',
    requiresAuth: false,
  },
  {
    id: 'field',
    label: 'Field',
    href: '/field',
    requiresAuth: false,
  },
  {
    id: 'data',
    label: 'Data',
    href: '/data',
    requiresAuth: false,
  },
]

export const USER_MENU_ITEMS: MenuItem[] = [
  {
    id: 'profile',
    label: 'My Profile',
    href: '/profile',
    requiresAuth: true,
  },
  {
    id: 'logout',
    label: 'Sign Out',
    href: '/logout',
    requiresAuth: true,
  },
]

export const getVisibleMenuItems = (items: MenuItem[], isAuthenticated = false): MenuItem[] => {
  return items.filter((item) => {
    if (item.requiresAuth && !isAuthenticated) return false
    return true
  })
}
