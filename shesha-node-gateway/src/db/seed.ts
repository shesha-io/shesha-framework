import { createHash } from 'crypto';
import { hashPassword } from '../auth/password';
import { loadResources } from '../config';
import { ResourceAuth, ResourceDefinition } from '../config/types';
import { configItemId, guidFrom, moduleId as toModuleId } from '../utils/guid';
import { putRow } from '../modules/entityStore';
import {
  configItemsRepo,
  configNodesRepo,
  metadataRepo,
  modulesRepo,
  settingConfigurationsRepo,
  settingsRepo,
  usersRepo,
} from './repositories';

const md5 = (value: unknown): string =>
  createHash('md5').update(JSON.stringify(value)).digest('hex');

/** The person the seeded admin account belongs to; role appointments point at it. */
const ADMIN_PERSON_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Writes a `reference-list` configuration item. Reference lists are the one piece of reference
 * data both the runtime (`ReferenceList/GetByName`) and the Configuration Studio read, so they go
 * through the same store the CRUD surfaces write to.
 */
const putReferenceList = (
  moduleName: string,
  name: string,
  label: string,
  description: string | null,
  items: { item: string; itemValue: number; description?: string | null }[],
): void => {
  const configuration = {
    id: guidFrom(`shesha:config-item:reference-list:${moduleName}:${name}`),
    module: moduleName,
    name,
    label,
    description,
    hardLinkToApplication: false,
    namespace: moduleName,
    noSelectionValue: null,
    suppress: false,
    items: items.map((entry, index) => ({
      id: guidFrom(`shesha:reflist-item:${moduleName}:${name}:${entry.itemValue}`),
      item: entry.item,
      itemValue: entry.itemValue,
      description: entry.description ?? null,
      orderIndex: index + 1,
      color: null,
      icon: null,
      shortAlias: null,
    })),
  };
  configItemsRepo.upsert({
    itemType: 'reference-list',
    module: moduleName,
    name,
    label,
    description,
    json: configuration,
    md5: md5(configuration),
  });
};

/** Writes a row into the generic entity store without emitting an audit entry. */
const putEntityRow = (entity: string, id: string, data: Record<string, unknown>): void =>
  putRow({ module: 'Shesha', entity }, id, data);

/**
 * Writes a Configuration Studio item *and* its tree node, so anything seeded here is visible and
 * editable in the studio exactly as if it had been created there.
 */
const putConfigItem = (
  itemType: string,
  moduleName: string,
  name: string,
  label: string,
  description: string | null,
  content: Record<string, unknown>,
): string => {
  const id = configItemId(itemType, moduleName, name);
  const json = { id, itemType, module: moduleName, name, label, description, ...content };
  configItemsRepo.upsert({ itemType, module: moduleName, name, label, description, json, md5: md5(json) });
  configNodesRepo.upsert({
    id,
    nodeKind: 'item',
    itemType,
    discriminator: itemType,
    module: moduleName,
    name,
    label,
    description,
  });
  return id;
};

/**
 * `ShaPermissionNames` + `PermissionNames` — every permission shesha-core declares in code.
 *
 * Seeded as `permission-definition` items because that is what `PermissionAppService` reads, so the
 * Permission Configurator lists the framework's real permissions instead of an empty tree, and a
 * permission granted to a role by name resolves against something that exists.
 */
const FRAMEWORK_PERMISSIONS: { name: string; displayName: string; description: string }[] = [
  { name: 'app:Configurator', displayName: 'Application Configurator', description: 'Full access to the Configuration Studio and everything it manages' },
  { name: 'pages:maintenance', displayName: 'Maintenance', description: 'Maintenance pages: settings, OTP audit, scheduled jobs' },
  { name: 'pages:applicationSettings', displayName: 'Application Settings', description: 'Application settings pages' },
  { name: 'pages:shaRoles', displayName: 'Security Roles', description: 'Security role maintenance' },
  { name: 'pages:persons', displayName: 'Persons', description: 'Person maintenance' },
  { name: 'pages:logonAudit', displayName: 'Logon Audit', description: 'Logon attempt audit trail' },
  { name: 'pages:otpAudit', displayName: 'OTP Audit', description: 'One time pin audit trail' },
  { name: 'pages:notificationsAudit', displayName: 'Notifications Audit', description: 'Notification message audit trail' },
  { name: 'pages:dataAudit', displayName: 'Data Audit', description: 'Entity change audit trail' },
  { name: 'users:resetPassword', displayName: 'Reset User Password', description: 'Reset another user\'s password' },
  { name: 'Pages.Users', displayName: 'Users', description: 'User maintenance' },
  { name: 'Pages.Roles', displayName: 'Roles', description: 'Role maintenance' },
  { name: 'Pages.Tenants', displayName: 'Tenants', description: 'Tenant maintenance' },
  { name: 'Pages.Hangfire', displayName: 'Hangfire', description: 'Background job dashboard' },
];

const putPermissions = (): void => {
  for (const permission of FRAMEWORK_PERMISSIONS) {
    putConfigItem('permission-definition', 'Shesha', permission.name, permission.displayName, permission.description, {
      // `PermissionDefinition.Parent` — framework permissions are declared flat.
      parent: null,
      suppress: false,
      hardLinkToApplication: true,
    });
  }
};

/** `RefListPermissionedAccess`. */
const ACCESS = { anyAuthenticated: 3, requiresPermissions: 4, allowAnonymous: 5 } as const;

/**
 * `ShaPermissionedObjectsTypes`. Only these two are ever emitted: `Shesha.WebCrudApi` exists in the
 * enum, but `ApiPermissionedObjectProvider.GetAllAsync` hardcodes `WebApi` for the service and
 * `WebApi.Action` for each of its methods.
 */
const OBJECT_TYPE = { webApi: 'Shesha.WebApi', webApiAction: 'Shesha.WebApi.Action' } as const;

/** The actions the generic engine derives from a resource's storage. */
const GENERIC_CRUD_ACTIONS = ['Get', 'GetAll', 'Create', 'Update', 'Delete'];

/** Everything a resource serves: the derived CRUD plus its named behaviours. */
const actionsOf = (resource: ResourceDefinition): string[] => {
  const named = Object.keys(resource.actions ?? {});
  return resource.storage.kind === 'behaviour' ? named : [...GENERIC_CRUD_ACTIONS, ...named];
};

/**
 * The access level an action has, derived from the same `auth` block the router enforces. A child
 * inherits its service's level unless the resource says otherwise, which is exactly core's
 * `Inherited` semantics collapsed to a concrete value.
 */
const accessOf = (
  auth: ResourceAuth | undefined,
  action: string | undefined,
): { access: number; permissions: string[] } => {
  if (!auth || auth.requiresAuth === false) return { access: ACCESS.allowAnonymous, permissions: [] };
  if (action && (auth.anonymousActions ?? []).some((name) => name.toLowerCase() === action.toLowerCase())) {
    return { access: ACCESS.allowAnonymous, permissions: [] };
  }
  const permission = (action && auth.actions ? auth.actions[action] : undefined) ?? auth.permission;
  return permission ? { access: ACCESS.requiresPermissions, permissions: [permission] } : { access: ACCESS.anyAuthenticated, permissions: [] };
};

const putPermissionedObject = (
  object: string,
  type: string,
  name: string,
  description: string | null,
  parent: string,
  access: { access: number; permissions: string[] },
): void =>
  putEntityRow('PermissionedObject', guidFrom(`shesha:permissioned-object:${object}`), {
    object,
    type,
    name,
    description,
    module: 'Shesha',
    moduleId: toModuleId('Shesha'),
    category: 'api',
    parent,
    permissions: access.permissions,
    actualPermissions: access.permissions,
    inheritedPermissions: [],
    access: access.access,
    actualAccess: access.access,
    inheritedAccess: ACCESS.anyAuthenticated,
    hidden: false,
    // True because these come from the gateway's own route table, not from user configuration.
    hardcoded: true,
    additionalParameters: {},
  });

/**
 * Permissioned objects for the API surface the gateway actually serves.
 *
 * Derived from `config/resources.json` rather than hand-listed: shesha-core builds these from its
 * controller metadata at startup (`ApiPermissionedObjectProvider`), and the resource registry is
 * this gateway's equivalent of that metadata. Registering a resource therefore registers its
 * permissioned objects too, so the Permission Configurator can never disagree with the routes.
 */
const putPermissionedObjects = (): void => {
  for (const resource of loadResources().resources) {
    const object = `Shesha.${resource.service}AppService`;
    putPermissionedObject(
      object,
      OBJECT_TYPE.webApi,
      `${resource.service} API`,
      resource.description ?? null,
      '',
      accessOf(resource.auth, undefined),
    );
    for (const action of actionsOf(resource)) {
      putPermissionedObject(
        `${object}@${action}`,
        OBJECT_TYPE.webApiAction,
        action,
        null,
        object,
        accessOf(resource.auth, action),
      );
    }
  }
};

/** The conventional administrative role (`RoleNames.SystemAdministrator`), holding every permission. */
const putRoles = (): string => {
  const roleId = putConfigItem(
    'role',
    'Shesha',
    'System Administrator',
    'System Administrator',
    'Full access to every page and API',
    {
      nameSpace: 'Shesha',
      permissions: FRAMEWORK_PERMISSIONS.map((permission) => permission.name),
      hardLinkToApplication: true,
      suppress: false,
      canAssignToMultiple: true,
      canAssignToPerson: true,
      canAssignToRole: false,
      canAssignToOrganisationRoleLevel: false,
      canAssignToUnit: false,
    },
  );

  // The seeded admin holds it, so `ShaRole/IsRoleGranted` and the role-assignment screens resolve.
  putEntityRow('ShaRoleAppointedPerson', guidFrom('shesha:role-appointment:admin:system-administrator'), {
    roleId,
    person: {
      id: ADMIN_PERSON_ID,
      name: 'System Administrator',
      _className: 'Shesha.Core.Person',
      _displayName: 'System Administrator',
    },
  });
  return roleId;
};

/**
 * `FrontEndAppKeyConsts`. `default-app` is the row `M20240807181900` inserts verbatim; the swagger
 * key is the other constant core declares.
 */
const putFrontEndApps = (): void => {
  putEntityRow('FrontEndApp', guidFrom('shesha:front-end-app:default-app'), {
    appKey: 'default-app',
    name: 'Default UI',
    description: 'Default frontend application',
  });
  putEntityRow('FrontEndApp', guidFrom('shesha:front-end-app:shesha-swagger-app'), {
    appKey: 'shesha-swagger-app',
    name: 'Swagger UI',
    description: 'Shesha swagger frontend application',
  });
};

/**
 * An example rather than framework data: shesha-core ships no notification types of its own (each
 * module declares the ones it sends), but the notification screens need a row to render against and
 * the `notification-type` item type needs one to prove the Configuration Studio editor round-trips.
 */
const putNotificationTypes = (): void => {
  putConfigItem(
    'notification-type',
    'Shesha',
    'PasswordReset',
    'Password reset',
    'Sent when a user asks for a password reset link',
    {
      category: 'Security',
      disable: false,
      canOptOut: false,
      // `RefListNotificationPriority.High` — a reset link should not wait in a queue.
      defaultPriority: 1,
      isTimeSensitive: true,
      allowAttachments: false,
      overrideChannels: [],
      suppress: false,
    },
  );
};

/** Seed minimal bootstrap data so `native` mode serves a working app shell. */
export const seed = async (): Promise<void> => {
  // Default admin (matches Shesha's conventional dev credentials).
  usersRepo.upsert({
    userName: 'admin',
    email: 'admin@shesha.local',
    firstName: 'System',
    lastName: 'Administrator',
    passwordHash: await hashPassword('123qwe'),
    personId: ADMIN_PERSON_ID,
    permissions: ['*'],
  });

  // `SheshaModuleInfo.IsEditable` defaults to true and `SheshaFrameworkModule` only turns it
  // off in release builds (`#if !DEBUG IsEditable = false`). The gateway is a development
  // backend, so the framework module stays editable — otherwise every form loads read-only
  // (`configurationLoader.getFormAsync` passes `!isEditable`) and all Configuration Studio
  // writes fail on `module.EnsureEditable()`.
  modulesRepo.upsert({ name: 'Shesha', accessor: 'Shesha', description: 'Shesha framework module', isEditable: true });
  modulesRepo.upsert({ name: 'Boxfusion.SheshaFunctionalTests.Common', accessor: 'FunctionalTests', description: 'Sample app module', isEditable: true });

  // A sample reference list served through ConfigurationItem/GetCurrent.
  putReferenceList('Shesha', 'Priority', 'Priority', 'Sample priority reference list', [
    { item: 'Low', itemValue: 1, description: 'Low priority' },
    { item: 'Medium', itemValue: 2, description: 'Medium priority' },
    { item: 'High', itemValue: 3, description: 'High priority' },
  ]);

  // The security and configuration data the management screens list. Order matters only in that
  // roles reference permissions, and both reference the modules seeded above.
  putPermissions();
  putPermissionedObjects();
  putRoles();
  putFrontEndApps();
  putNotificationTypes();

  // Forms are NOT seeded here: they are served straight from config/forms/*.json at
  // request time (see modules/formsStore.ts) so markup edits need no restart.

  // A sample entity metadata document.
  const personMetadata = {
    id: 'Shesha.Core.Person',
    dataType: 'entity',
    typeAccessor: 'entity',
    moduleAccessor: 'Shesha',
    fullClassName: 'Shesha.Core.Person',
    label: 'Person',
    description: 'Sample person entity',
    properties: [
      { path: 'firstName', label: 'First Name', dataType: 'string', isVisible: true, required: true, orderIndex: 1, source: 1, isFrameworkRelated: false },
      { path: 'lastName', label: 'Last Name', dataType: 'string', isVisible: true, required: true, orderIndex: 2, source: 1, isFrameworkRelated: false },
      { path: 'email', label: 'Email', dataType: 'string', dataFormat: 'email', isVisible: true, orderIndex: 3, source: 1, isFrameworkRelated: false },
    ],
    specifications: [],
    apiEndpoints: {
      create: { url: '/api/services/app/DynamicEntity/Create', httpVerb: 'POST' },
      read: { url: '/api/services/app/DynamicEntity/Get', httpVerb: 'GET' },
      update: { url: '/api/services/app/DynamicEntity/Update', httpVerb: 'PUT' },
      delete: { url: '/api/services/app/DynamicEntity/Delete', httpVerb: 'DELETE' },
    },
  };
  metadataRepo.upsert({
    id: 'Shesha.Core.Person',
    entityType: 'Shesha.Core.Person',
    module: 'Shesha',
    json: personMetadata,
    md5: md5(personMetadata),
  });

  // A couple of settings.
  settingsRepo.set('ApplicationName', '', '', 'Shesha Node Gateway', 'string');
  settingsRepo.set('DefaultTheme', '', '', 'light', 'string');

  // Theme settings are dereferenced by the frontend on boot (`loaded.sidebar`),
  // so this must be an object — returning null would crash the theme provider.
  settingsRepo.set(
    'Shesha.ThemeSettings',
    'Shesha',
    '',
    {
      application: {
        primaryColor: '#1890ff',
        errorColor: '#ff4d4f',
        warningColor: '#faad14',
        successColor: '#52c41a',
        infoColor: '#1890ff',
      },
      sidebar: 'light',
      layoutBackground: '#f0f2f5',
    },
    'object',
  );

  // Setting metadata + value behind the login form's onBeforeDataLoad, which calls
  // application.settings.shesha.userManagement.userManagementSettings.getValueAsync().
  // Mirrors shesha-core: [Category("User Management")] IUserManagementSettings.UserManagementSettings,
  // setting name "Shesha.UserManagement" (UserManagementSettingNames.UserManagement).
  settingConfigurationsRepo.upsert({
    name: 'Shesha.UserManagement',
    description: 'User Management Settings',
    accessor: 'userManagementSettings',
    dataType: { dataType: 'object' },
    module: { name: 'Shesha', accessor: 'shesha' },
    category: { name: 'User Management', accessor: 'userManagement' },
  });

  settingsRepo.set(
    'Shesha.UserManagement',
    'Shesha',
    '',
    {
      // 1 = SupportedRegistrationMethods.None → hides the register link
      // (the gateway exposes no registration endpoint).
      supportedRegistrationMethods: 1,
      requireEmailVerification: false,
      goToUrlAfterRegistration: '/',
      userEmailAsUsername: false,
      additionalRegistrationInfo: false,
    },
    'object',
  );
};
