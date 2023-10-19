import { ISidebarMenuItem } from "@shesha-io/reactjs";
import { SETTINGS_MENU_ITEMS } from "./settingsRoutes";

export const URL_GENERAL_DASHBOARD_PAGE = "/";
export const URL_LOGIN_PAGE = "/login";

export const URL_RESET_PASSWORD = "/account/reset-password";
export const URL_FORGOT_PASSWORD = "/account/forgot-password";

export const URL_SETTINGS_CHECK_LISTS = "/settings/check-lists";

export const URL_ADMINISTRATION_USER_MANAGEMENT_PAGE =
  "/administration/user-management";
export const URL_MAINTENANCE_PAGE = "/maintenance";

export const PERM_PAGES_PERSON = "pages:persons";

/* end of new permissions */

/**
 * Sidebar menu items. Note: will be converted to configurable with the same data model
 */
export const SIDEBAR_MENU_ITEMS: ISidebarMenuItem[] = [
  {
    id: "generalDashboard",
    itemType: "button",
    buttonAction: "navigate",
    title: "General Dashboard",
    target: URL_GENERAL_DASHBOARD_PAGE,
    icon: "PieChartOutlined",
  },
  {
    id: "configuratyionGroup",
    title: "Configuration",
    icon: "DeploymentUnitOutlined",
    isHidden: true,
    itemType: "group",
    childItems: [
      {
        id: "users",
        itemType: "button",
        buttonAction: "navigate",
        title: "User Management",
        target: URL_ADMINISTRATION_USER_MANAGEMENT_PAGE,
        icon: "UserOutlined",
        requiredPermissions: [PERM_PAGES_PERSON],
      },
    ],
  },
  {
    id: "configurationGroup",
    title: "Configuration",
    icon: "SettingOutlined",
    itemType: "group",
    childItems: [...SETTINGS_MENU_ITEMS],
  },
];
