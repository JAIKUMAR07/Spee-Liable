const routePermissions = {
  "/map": "optimize_routes",
  "/qrpage": "scan_qr",
  "/delivery-management": "manage_deliveries",
  "/customer-dashboard": "view_notifications",
  "/user-management": "view_users",
};

const rolePermissions = {
  admin: ["view_users", "manage_users", "view_all_deliveries", "delete_records"],
  driver: [
    "view_deliveries",
    "manage_deliveries",
    "scan_qr",
    "optimize_routes",
    "delete_own_records",
    "assign_deliveries",
  ],
  customer: ["view_own_deliveries", "update_delivery_status", "view_notifications"],
};

const defaultRouteByRole = {
  admin: "/user-management",
  driver: "/map",
  customer: "/customer-dashboard",
};

const isAllowedForRole = (role, path) => {
  const requiredPermission = routePermissions[path];
  if (!requiredPermission) {
    return true;
  }

  return rolePermissions[role]?.includes(requiredPermission) || false;
};

export const getDefaultRouteForRole = (role) => {
  return defaultRouteByRole[role] || "/";
};

export const getPostAuthRoute = ({ role, fromPath }) => {
  if (!role) {
    return "/";
  }

  if (
    fromPath &&
    fromPath !== "/login" &&
    fromPath !== "/register" &&
    isAllowedForRole(role, fromPath)
  ) {
    return fromPath;
  }

  return getDefaultRouteForRole(role);
};
