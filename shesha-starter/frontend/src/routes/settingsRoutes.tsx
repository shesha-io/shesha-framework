import { ISidebarMenuItem } from "@shesha-io/reactjs";

export const PERM_APP_CONFIGURATOR = "app:Configurator";

export const URL_SETTINGS_LOGON = "/settings/logon";
export const URL_SETTINGS_SECURITY = "/settings/security";
export const URL_SETTINGS_OTP = "/settings/otp";
export const URL_SETTINGS_MOBILE_DEVICES = "/settings/mobile-devices";
export const URL_SETTINGS_EMAIL = "/settings/email";
export const URL_SETTINGS_SMS = "/settings/sms";
export const URL_SETTINGS_PUSH = "/settings/push-notifications";
export const URL_SETTINGS_NOTIFICATIONS = "/settings/notifications";
export const URL_SETTINGS_SCHEDULED_JOBS = "/settings/scheduled-jobs";
export const URL_SETTINGS_REFERENCE_LISTS = "/settings/reference-lists";
export const URL_SETTINGS_CHECK_LISTS = "/settings/check-lists";
export const URL_SETTINGS_FORMS = "/settings/forms";
export const URL_SETTINGS_LOGON_AUDIT = "/settings/logon-audit";
export const URL_SETTINGS_OTP_AUDIT = "/settings/otp-audit";
export const URL_SETTINGS_NOTIFICATIONS_AUDIT =
  "/settings/notification-messages";

export const URL_SETTINGS_NOTIFICATION_TEMPLATES =
  "/settings/notification-templates";
export const URL_SETTINGS_SCHEDULED_JOB_EXECUTIONS =
  "/settings/scheduled-job-execution";

export const SETTINGS_MENU_ITEMS: ISidebarMenuItem[] = [
  {
    id: "settingsGroup",
    title: "Settings",
    icon: "SettingOutlined",
    itemType: "group",
    childItems: [
      {
        id: "Logon",
        itemType: "button",
        buttonAction: "navigate",
        title: "Logon",
        target: URL_SETTINGS_LOGON,
        icon: "LoginOutlined",
        requiredPermissions: [PERM_APP_CONFIGURATOR],
      },
      {
        id: "security",
        itemType: "button",
        buttonAction: "navigate",
        title: "Security",
        target: URL_SETTINGS_SECURITY,
        icon: "SafetyOutlined",
        requiredPermissions: [PERM_APP_CONFIGURATOR],
      },
      {
        id: "otp",
        itemType: "button",
        buttonAction: "navigate",
        title: "One-Time-Pins",
        target: URL_SETTINGS_OTP,
        icon: "ClockCircleOutlined",
        requiredPermissions: [PERM_APP_CONFIGURATOR],
      },
      {
        id: "otp2",
        itemType: "button",
        buttonAction: "navigate",
        title: "One-Time-Pins",
        target: URL_SETTINGS_OTP,
        icon: "ClockCircleOutlined",
        requiredPermissions: [PERM_APP_CONFIGURATOR],
      },
      {
        id: "mobileDevices",
        itemType: "button",
        buttonAction: "navigate",
        title: "Mobile Devices",
        target: URL_SETTINGS_MOBILE_DEVICES,
        icon: "MobileOutlined",
        requiredPermissions: [PERM_APP_CONFIGURATOR],
      },
      {
        id: "email",
        itemType: "button",
        buttonAction: "navigate",
        title: "Email",
        target: URL_SETTINGS_EMAIL,
        icon: "MailOutlined",
        requiredPermissions: [PERM_APP_CONFIGURATOR],
      },
      {
        id: "sms",
        itemType: "button",
        buttonAction: "navigate",
        title: "SMS",
        target: URL_SETTINGS_SMS,
        icon: "MessageOutlined",
        requiredPermissions: [PERM_APP_CONFIGURATOR],
      },
      {
        id: "push",
        itemType: "button",
        buttonAction: "navigate",
        title: "Push",
        target: URL_SETTINGS_PUSH,
        icon: "NotificationOutlined",
        requiredPermissions: [PERM_APP_CONFIGURATOR],
      },
    ],
  },
  {
    id: "auditGroup",
    title: "Audit",
    icon: "AuditOutlined",
    itemType: "group",
    childItems: [
      {
        id: "logon-audit",
        itemType: "button",
        buttonAction: "navigate",
        title: "Logon",
        target: URL_SETTINGS_LOGON_AUDIT,
        icon: "LoginOutlined",
        requiredPermissions: [PERM_APP_CONFIGURATOR],
      },
      {
        id: "otp-audit",
        itemType: "button",
        buttonAction: "navigate",
        title: "One-Time-Pins",
        target: URL_SETTINGS_OTP_AUDIT,
        icon: "ClockCircleOutlined",
        requiredPermissions: [PERM_APP_CONFIGURATOR],
      },
      {
        id: "notifications-audit",
        itemType: "button",
        buttonAction: "navigate",
        title: "Notifications",
        target: URL_SETTINGS_NOTIFICATIONS_AUDIT,
        icon: "BulbOutlined",
        requiredPermissions: [PERM_APP_CONFIGURATOR],
      },
    ],
  },
  {
    id: "notifications",
    itemType: "button",
    buttonAction: "navigate",
    title: "Notifications",
    target: URL_SETTINGS_NOTIFICATIONS,
    icon: "BulbOutlined",
    requiredPermissions: [PERM_APP_CONFIGURATOR],
  },
  {
    id: "scheduledJobs",
    itemType: "button",
    buttonAction: "navigate",
    title: "Scheduled Jobs",
    target: URL_SETTINGS_SCHEDULED_JOBS,
    icon: "ScheduleOutlined",
    requiredPermissions: [PERM_APP_CONFIGURATOR],
  },
  {
    id: "scheduledJobExecutions",
    itemType: "button",
    buttonAction: "navigate",
    title: "Scheduled Job Execution",
    target: URL_SETTINGS_SCHEDULED_JOB_EXECUTIONS,
    icon: "ScheduleOutlined",
    requiredPermissions: [PERM_APP_CONFIGURATOR],
  },
  {
    id: "referenceLists",
    itemType: "button",
    buttonAction: "navigate",
    title: "Reference Lists",
    target: URL_SETTINGS_REFERENCE_LISTS,
    icon: "UnorderedListOutlined",
    requiredPermissions: [PERM_APP_CONFIGURATOR],
  },
  {
    id: "check-lists",
    itemType: "button",
    buttonAction: "navigate",
    title: "Check Lists",
    target: URL_SETTINGS_CHECK_LISTS,
    icon: "ProfileOutlined",
    requiredPermissions: [PERM_APP_CONFIGURATOR],
  },
  {
    id: "Forms",
    itemType: "button",
    buttonAction: "navigate",
    title: "Forms",
    target: URL_SETTINGS_FORMS,
    icon: "BlockOutlined",
    requiredPermissions: [PERM_APP_CONFIGURATOR],
  },
];
