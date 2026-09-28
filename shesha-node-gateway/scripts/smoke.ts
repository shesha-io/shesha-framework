/**
 * Smoke test: boots the gateway on an ephemeral port with an in-memory DB and
 * exercises the native bootstrap operations end-to-end. Run: `npm run smoke`.
 */
import { AddressInfo } from 'net';
import fs from 'fs';
import path from 'path';
import { config } from '../src/config';
import { migrate } from '../src/db';
import { seed } from '../src/db/seed';
import { buildApp } from '../src/server/app';

let passed = 0;
let failed = 0;

const check = (name: string, cond: boolean, extra?: unknown): void => {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.error(`  ✗ ${name}`, extra !== undefined ? JSON.stringify(extra) : '');
  }
};

const main = async (): Promise<void> => {
  migrate();
  await seed();
  const { app } = buildApp();
  const server = app.listen(0);
  await new Promise<void>((r) => server.once('listening', () => r()));
  const { port } = server.address() as AddressInfo;
  const base = `http://127.0.0.1:${port}`;

  const json = async (method: string, path: string, opts: { body?: unknown; token?: string; headers?: Record<string, string> } = {}) => {
    const res = await fetch(base + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
        ...(opts.headers ?? {}),
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const text = await res.text();
    let data: unknown = text;
    try { data = JSON.parse(text); } catch { /* keep text */ }
    return { status: res.status, data: data as Record<string, any> };
  };

  console.log(`\nShesha Node Gateway smoke test @ ${base}\n`);

  // Health + status
  const health = await json('GET', '/health');
  check('GET /health -> ok', health.status === 200 && health.data.status === 'ok', health.data);

  const status = await json('GET', '/api/gateway/status');
  check('GET /api/gateway/status -> operations listed', status.status === 200 && Array.isArray(status.data.operations) && status.data.operations.length > 0, status.data);

  // Auth
  const login = await json('POST', '/api/TokenAuth/Authenticate', { body: { userNameOrEmailAddress: 'admin', password: '123qwe' } });
  check('POST Authenticate -> success', login.status === 200 && login.data.success === true, login.data);
  const token = login.data?.result?.accessToken as string | undefined;
  check('Authenticate returns accessToken', Boolean(token));

  const badLogin = await json('POST', '/api/TokenAuth/Authenticate', { body: { userNameOrEmailAddress: 'admin', password: 'wrong' } });
  check('POST Authenticate (bad password) -> 403 success:false', badLogin.status === 403 && badLogin.data.success === false, badLogin.data);

  // Session
  const session = await json('GET', '/api/services/app/Session/GetCurrentLoginInfo', { token });
  check('GetCurrentLoginInfo -> user admin', session.status === 200 && session.data.result?.user?.userName === 'admin', session.data);

  const anonSession = await json('GET', '/api/services/app/Session/GetCurrentLoginInfo');
  check('GetCurrentLoginInfo anonymous -> application info, no user', anonSession.status === 200 && anonSession.data.result?.application && !anonSession.data.result?.user, anonSession.data);

  // Modules
  const modules = await json('GET', '/api/services/app/ConfigurationStudio/GetModules');
  check('GetModules -> Shesha present', modules.status === 200 && Array.isArray(modules.data.result?.modules) && modules.data.result.modules.some((m: any) => m.name === 'Shesha'), modules.data);

  // Reference list via ConfigurationItem/GetCurrent
  const reflist = await json('GET', '/api/services/app/ConfigurationItem/GetCurrent?itemType=ReferenceList&module=Shesha&name=Priority');
  check('ConfigurationItem/GetCurrent -> 3 items', reflist.status === 200 && reflist.data.result?.configuration?.items?.length === 3, reflist.data);

  // Forms (served from config/forms, not the DB) — these are what the React shell renders.
  const parseMarkup = (data: any): any => {
    try { return JSON.parse(data?.result?.configuration?.markup ?? 'null'); } catch { return null; }
  };
  const findComponent = (nodes: any[], predicate: (n: any) => boolean): any => {
    for (const node of nodes ?? []) {
      if (predicate(node)) return node;
      const hit = findComponent(node.components ?? [], predicate);
      if (hit) return hit;
    }
    return undefined;
  };

  for (const formName of ['login', 'header', 'forgot-password', 'users']) {
    const form = await json('GET', `/api/services/app/ConfigurationItem/GetCurrent?itemType=form&module=Shesha&name=${formName}`);
    const markup = parseMarkup(form.data);
    check(`form '${formName}' -> served with parseable markup`, form.status === 200 && Array.isArray(markup?.components) && markup.components.length > 0, form.data?.error ?? form.status);
  }

  const loginMarkup = parseMarkup((await json('GET', '/api/services/app/ConfigurationItem/GetCurrent?itemType=form&module=Shesha&name=login')).data);
  const passwordField = findComponent(loginMarkup?.components, (n) => n.type === 'textField' && n.propertyName === 'password');
  check('login form -> password field is typeable (not readOnly)', Boolean(passwordField) && passwordField.editMode !== 'readOnly', passwordField);
  const beforeLoad = loginMarkup?.formSettings?.onBeforeDataLoad;
  check('login form -> onBeforeDataLoad reads userManagementSettings', typeof beforeLoad === 'string' && beforeLoad.includes('userManagementSettings'), beforeLoad);

  // Metadata
  const meta = await json('GET', '/api/services/app/Metadata/Get?entityType=Shesha.Core.Person');
  check('Metadata/Get -> 3 properties', meta.status === 200 && Array.isArray(meta.data.result?.properties) && meta.data.result.properties.length === 3, meta.data);

  // Settings
  const setting = await json('GET', '/api/services/app/Settings/GetValue?name=ApplicationName');
  check('Settings/GetValue -> gateway name', setting.status === 200 && setting.data.result === 'Shesha Node Gateway', setting.data);

  // Setting metadata powers the typed `application.settings` API the login form script calls:
  // module.accessor -> category.accessor -> setting.accessor, then GetValue(module.name, name).
  const configurations = await json('GET', '/api/services/app/Settings/GetConfigurations');
  const userManagement = (Array.isArray(configurations.data.result) ? configurations.data.result : [])
    .find((c: any) => c.accessor === 'userManagementSettings');
  check(
    'Settings/GetConfigurations -> shesha.userManagement.userManagementSettings',
    Boolean(userManagement?.module?.accessor === 'shesha' && userManagement?.category?.accessor === 'userManagement'),
    configurations.data,
  );

  const userManagementValue = await json(
    'GET',
    `/api/services/app/Settings/GetValue?module=${encodeURIComponent(userManagement?.module?.name ?? '')}&name=${encodeURIComponent(userManagement?.name ?? '')}`,
  );
  check(
    'Settings/GetValue (resolved accessor) -> supportedRegistrationMethods',
    typeof userManagementValue.data.result?.supportedRegistrationMethods === 'number',
    userManagementValue.data,
  );

  // The main menu configurator writes `Shesha.MainMenuSettings` with `appKey: 'default-app'` in the
  // body, while `MainMenuProvider` reads it back with `?name=&module=` only — core bridges the two
  // through the `sha-frontend-application` header every request carries. Without that fallback the
  // save succeeds and the menu silently reverts to empty on the refetch.
  const mainMenu = { version: 2, items: [{ id: 'smokeItem', itemType: 'button', title: 'Smoke item' }] };
  const mainMenuSave = await json('POST', '/api/services/app/Settings/UpdateValue', {
    token,
    body: { name: 'Shesha.MainMenuSettings', module: 'Shesha', appKey: 'default-app', value: mainMenu },
  });
  const mainMenuRead = await json('GET', '/api/services/app/Settings/GetValue?module=Shesha&name=Shesha.MainMenuSettings', {
    token,
    headers: { 'sha-frontend-application': 'default-app' },
  });
  check(
    'Settings/UpdateValue + GetValue -> a client-specific value is read back via the front-end app header',
    mainMenuSave.status === 200 &&
      mainMenuRead.status === 200 &&
      JSON.stringify(mainMenuRead.data.result) === JSON.stringify(mainMenu),
    mainMenuRead.data,
  );

  // A different front end must not see it: that isolation is the whole point of the app key.
  const otherAppMenu = await json('GET', '/api/services/app/Settings/GetValue?module=Shesha&name=Shesha.MainMenuSettings', {
    token,
    headers: { 'sha-frontend-application': 'public-portal' },
  });
  check(
    'Settings/GetValue (other front end) -> the value is not shared across app keys',
    otherAppMenu.status === 200 && otherAppMenu.data.result === null,
    otherAppMenu.data,
  );

  // The seeded framework settings are stored app-key-less (core's `Application == null`), so they
  // stay readable from any front end rather than being claimed by whichever one asks first.
  const themeFromOtherApp = await json('GET', '/api/services/app/Settings/GetValue?module=Shesha&name=Shesha.ThemeSettings', {
    headers: { 'sha-frontend-application': 'public-portal' },
  });
  check(
    'Settings/GetValue (app-key-less seed) -> falls back to the shared value',
    themeFromOtherApp.status === 200 && themeFromOtherApp.data.result?.sidebar === 'light',
    themeFromOtherApp.data,
  );

  // Permissions
  const perm = await json('GET', '/api/services/app/Permission/IsPermissionGranted?permissionName=Anything', { token });
  check('IsPermissionGranted (admin wildcard) -> true', perm.status === 200 && perm.data.result === true, perm.data);

  const permConfigurator = await json('GET', `/api/services/app/Permission/IsPermissionGranted?permissionName=${encodeURIComponent('app:Configurator')}`, { token });
  check('IsPermissionGranted (app:Configurator) -> true', permConfigurator.status === 200 && permConfigurator.data.result === true, permConfigurator.data);

  const permAnon = await json('GET', '/api/services/app/Permission/IsPermissionGranted?permissionName=Anything');
  check('IsPermissionGranted without token -> 401', permAnon.status === 401 && permAnon.data.success === false, permAnon.data);

  // --- Form Designer access -------------------------------------------------------
  // `Authenticator.anyOfPermissionsGranted` matches permission strings literally, so the seeded
  // `'*'` admin marker has to arrive expanded or the Configuration Mode toggle never renders.
  const granted = ((session.data.result?.user?.grantedPermissions ?? []) as any[]).map((p) => p.permission);
  check('GetCurrentLoginInfo -> app:Configurator granted (Form Designer visible)', granted.includes('app:Configurator'), granted);
  check('GetCurrentLoginInfo -> wildcard expanded, not passed through', !granted.includes('*'), granted);

  const sheshaModule = (modules.data.result?.modules ?? []).find((m: any) => m.name === 'Shesha');
  check('GetModules -> Shesha isEditable (forms load writable, EnsureEditable passes)', sheshaModule?.isEditable === true, sheshaModule);
  check('GetModules -> module exposes the id the flat tree uses', Boolean(sheshaModule?.id), sheshaModule);

  const tree = await json('GET', '/api/services/app/ConfigurationStudio/GetFlatTree', { token });
  const nodes = Array.isArray(tree.data.result) ? tree.data.result : [];
  const itemNodes = nodes.filter((n: any) => n.nodeType === 2);
  check('GetFlatTree -> module + item nodes', nodes.some((n: any) => n.nodeType === 1) && itemNodes.length >= 77, nodes.length);
  check(
    'GetFlatTree -> every item node has itemType and discriminator (flatNode2TreeNode throws without them)',
    itemNodes.every((n: any) => Boolean(n.itemType) && Boolean(n.discriminator)),
    itemNodes.find((n: any) => !n.itemType || !n.discriminator),
  );

  const treeAnon = await json('GET', '/api/services/app/ConfigurationStudio/GetFlatTree');
  check('GetFlatTree without token -> 401', treeAnon.status === 401 && treeAnon.data.unAuthorizedRequest === true, treeAnon.data);

  const itemTypes = await json('GET', '/api/services/app/ConfigurationStudio/GetAvailableItemTypes', { token });
  const types = Array.isArray(itemTypes.data.result) ? itemTypes.data.result : [];
  const formType = types.find((t: any) => t.itemType === 'form');
  check(
    'GetAvailableItemTypes -> form/entity/reference-list with their cs-* create forms',
    types.length === 8 && formType?.createFormId?.name === 'cs-form-create' && formType?.renameFormId?.name === 'cs-item-rename',
    types.map((t: any) => t.itemType),
  );

  const checkPerms = await json('POST', '/api/services/Shesha/FormConfiguration/CheckPermissions', {
    token,
    body: [{ module: 'Shesha', name: 'login' }],
  });
  check('CheckPermissions -> array (main-menu provider unblocks)', checkPerms.status === 200 && Array.isArray(checkPerms.data.result), checkPerms.data);

  // --- Designer save round-trip (writes to config/forms, cleaned up below) --------
  const formsDir = path.join(config.configDir, 'forms');
  const formsBefore = fs.readdirSync(formsDir).length;
  const scratch = 'smoke-designer-form';
  try {
    const created = await json('POST', '/api/services/Shesha/FormConfiguration/Create', {
      token,
      body: { module: 'Shesha', name: scratch, label: 'Smoke', markup: JSON.stringify({ components: [], formSettings: {} }) },
    });
    const scratchId = created.data.result?.id as string | undefined;
    check('FormConfiguration/Create -> new form id', Boolean(scratchId), created.data);

    const markup = JSON.stringify({ components: [{ id: 'c1', type: 'textField', propertyName: 'savedByDesigner' }], formSettings: {} });
    const saved = await json('PUT', '/api/services/Shesha/FormConfiguration/UpdateMarkup', {
      token,
      body: { id: scratchId, markup, access: 0, permissions: [], modelType: null },
    });
    check('FormConfiguration/UpdateMarkup (designer Save) -> success', saved.status === 200 && saved.data.success === true, saved.data);

    const reloaded = await json('GET', `/api/services/app/ConfigurationItem/GetCurrent?itemType=form&module=Shesha&name=${scratch}`);
    check('saved markup is served back without a restart', reloaded.data.result?.configuration?.markup === markup, reloaded.data.result?.configuration?.markup);

    const byId = await json('GET', `/api/services/app/ConfigurationItem/Get?itemType=form&id=${scratchId}`);
    check('ConfigurationItem/Get resolves by raw id', byId.data.result?.configuration?.id === scratchId, byId.data);

    const revisions = await json('GET', `/api/services/app/ConfigurationStudio/GetItemRevisions?itemId=${scratchId}`, { token });
    check('saving recorded a revision', (revisions.data.result?.revisions ?? []).length >= 1, revisions.data);

    const badSave = await json('PUT', '/api/services/Shesha/FormConfiguration/UpdateMarkup', {
      body: { id: scratchId, markup },
    });
    check('UpdateMarkup without token -> 401', badSave.status === 401, badSave.status);
  } finally {
    await json('DELETE', `/api/services/app/ConfigurationStudio/DeleteItem?itemId=${(await json('GET', `/api/services/app/ConfigurationItem/GetCurrent?itemType=form&module=Shesha&name=${scratch}`)).data.result?.configuration?.id}`, { token });
    fs.rmSync(path.join(formsDir, `${scratch}.json`), { force: true });
    check('designer round-trip left config/forms unchanged', fs.readdirSync(formsDir).length === formsBefore, {
      before: formsBefore,
      after: fs.readdirSync(formsDir).length,
    });
  }

  // ============================================================================================
  // The generic routes.
  //
  // Everything below is served by four wildcard operations — `/api/services/:serviceModule/
  // :service/:action`, `/api/:service/:action`, `/api/:service` and `/api/dynamic/:module/:entity/
  // Crud/:action` — resolved against `config/resources.json`, not by one operation per endpoint.
  // These are the calls the admin portal actually makes; together they cover every route shape the
  // registry can express.
  // ============================================================================================

  const resultOf = (res: { status: number; data: any }): any => res.data?.result;
  const succeeded = (res: { status: number; data: any }): boolean =>
    res.status === 200 && res.data?.success === true;
  const functionalModule = (modules.data.result?.modules ?? []).find(
    (m: any) => m.name === 'Boxfusion.SheshaFunctionalTests.Common',
  );

  // --- Designer metadata pickers -------------------------------------------------------------
  const entityTypeAutocomplete = await json('GET', '/api/services/app/Metadata/EntityTypeAutocomplete?term=Per', { token });
  const autocompleteItems = Array.isArray(resultOf(entityTypeAutocomplete)) ? resultOf(entityTypeAutocomplete) : [];
  check(
    'Metadata/EntityTypeAutocomplete -> AutocompleteItemDto[] matching the term',
    entityTypeAutocomplete.status === 200 &&
      autocompleteItems.length > 0 &&
      autocompleteItems.every((i: any) => 'value' in i && 'displayText' in i) &&
      autocompleteItems.some((i: any) => String(i.value).includes('Person')),
    autocompleteItems,
  );

  const nonFramework = await json(
    'GET',
    `/api/services/app/Metadata/GetNonFrameworkRelatedProperties?container=${encodeURIComponent('Shesha:Person')}`,
    { token },
  );
  check(
    'Metadata/GetNonFrameworkRelatedProperties -> the non-framework properties of the container',
    nonFramework.status === 200 && (resultOf(nonFramework) ?? []).length === 3,
    nonFramework.data,
  );

  // --- Routes outside /api/services/... (why the short wildcards exist) -----------------------
  const gateways = await json('GET', '/api/Sms/Gateways');
  const gatewayList = Array.isArray(resultOf(gateways)) ? resultOf(gateways) : [];
  check(
    "GET /api/Sms/Gateways (anonymous) -> core's two gateways with their real uids",
    gateways.status === 200 &&
      gatewayList.some((g: any) => g.uid === 'fb8e8757-d831-41a3-925f-fd5c5088ef9b' && g.alias === 'Clickatell') &&
      gatewayList.some((g: any) => g.uid === '648fa648-0673-4bf1-a3ca-ecdd454e3afc' && g.alias === 'Disabled'),
    gatewayList,
  );

  const modelConfig = await json('POST', '/api/ModelConfigurations', {
    token,
    body: {
      className: 'Smoke.Widget',
      module: 'Shesha',
      label: 'Smoke widget',
      properties: [{ id: 'p1', path: 'name', label: 'Name', dataType: 'string' }],
    },
  });
  const modelConfigId = resultOf(modelConfig)?.id as string | undefined;
  check(
    'POST /api/ModelConfigurations -> ModelConfigurationDto (verb is the action)',
    modelConfig.status === 200 &&
      Boolean(modelConfigId) &&
      resultOf(modelConfig)?.source === 2 &&
      resultOf(modelConfig)?.entityConfigType === 1,
    modelConfig.data,
  );

  const modelConfigById = await json('GET', `/api/ModelConfigurations/${modelConfigId}`, { token });
  check(
    'GET /api/ModelConfigurations/{id} -> the same configuration',
    modelConfigById.status === 200 &&
      resultOf(modelConfigById)?.id === modelConfigId &&
      (resultOf(modelConfigById)?.properties ?? []).length === 1,
    modelConfigById.data,
  );

  const modelConfigByName = await json('GET', '/api/ModelConfigurations?className=Smoke.Widget', { token });
  check(
    'GET /api/ModelConfigurations?className= -> resolves the `entity` config item by name',
    modelConfigByName.status === 200 && resultOf(modelConfigByName)?.id === modelConfigId,
    modelConfigByName.data,
  );

  // A CLR entity has no `entity` config item, but core still lists it in the Entity Designer with
  // `Source = Application` — the designer would otherwise show only user-defined models.
  const codeBasedModel = await json('GET', '/api/ModelConfigurations?className=Shesha.Core.Person', { token });
  check(
    'GET /api/ModelConfigurations?className= -> a code-based entity resolves as Source=Application',
    codeBasedModel.status === 200 &&
      resultOf(codeBasedModel)?.source === 1 &&
      (resultOf(codeBasedModel)?.properties ?? []).length === 3,
    codeBasedModel.data,
  );

  // `GetAll` needs an exact operation: `/api/ModelConfigurations/:id` would otherwise read the
  // action name as a GUID and 404.
  const modelConfigList = await json('GET', '/api/ModelConfigurations/GetAll?maxResultCount=50', { token });
  check(
    'GET /api/ModelConfigurations/GetAll -> PagedResultDto of both user-defined and code-based models',
    modelConfigList.status === 200 &&
      (resultOf(modelConfigList)?.items ?? []).some((m: any) => m.name === 'Widget' && m.source === 2) &&
      (resultOf(modelConfigList)?.items ?? []).some((m: any) => m.className === 'Shesha.Core.Person' && m.source === 1),
    resultOf(modelConfigList),
  );

  const modelConfigUpdate = await json('PUT', '/api/ModelConfigurations', {
    token,
    body: { id: modelConfigId, className: 'Smoke.Widget', label: 'Smoke widget renamed', properties: [] },
  });
  check(
    'PUT /api/ModelConfigurations -> edits the same item the Configuration Studio lists',
    modelConfigUpdate.status === 200 && resultOf(modelConfigUpdate)?.label === 'Smoke widget renamed',
    modelConfigUpdate.data,
  );

  // --- /api/dynamic/{module}/{entity}/Crud/{action}: one route for every entity ---------------
  const notificationType = await json('POST', '/api/dynamic/Shesha/NotificationTypeConfig/Crud/Create', {
    token,
    body: { name: 'SmokeNotification', label: 'Smoke notification', category: 'Smoke', canOptOut: true, defaultPriority: 2 },
  });
  const notificationTypeId = resultOf(notificationType)?.id as string | undefined;
  check(
    'dynamic NotificationTypeConfig/Crud/Create -> writes the `notification-type` config item',
    notificationType.status === 200 && Boolean(notificationTypeId),
    notificationType.data,
  );

  const notificationTypeUpdate = await json('PUT', '/api/dynamic/Shesha/NotificationTypeConfig/Crud/Update', {
    token,
    body: { id: notificationTypeId, label: 'Smoke notification renamed' },
  });
  check(
    'dynamic NotificationTypeConfig/Crud/Update -> label changed',
    notificationTypeUpdate.status === 200 && resultOf(notificationTypeUpdate)?.label === 'Smoke notification renamed',
    notificationTypeUpdate.data,
  );

  // The same document the Configuration Studio serves — one store, two route shapes.
  const notificationTypeItem = await json(
    'GET',
    '/api/services/app/ConfigurationItem/GetCurrent?itemType=notification-type&module=Shesha&name=SmokeNotification',
  );
  check(
    'dynamic CRUD and ConfigurationItem/GetCurrent read the same notification type',
    notificationTypeItem.status === 200 &&
      notificationTypeItem.data.result?.configuration?.label === 'Smoke notification renamed',
    notificationTypeItem.data?.error ?? notificationTypeItem.status,
  );

  const notificationTypes = await json('GET', '/api/dynamic/Shesha/NotificationTypeConfig/Crud/GetAll?maxResultCount=50', { token });
  check(
    'dynamic NotificationTypeConfig/Crud/GetAll -> PagedResultDto with the seeded and the new type',
    notificationTypes.status === 200 &&
      resultOf(notificationTypes)?.totalCount >= 2 &&
      (resultOf(notificationTypes)?.items ?? []).some((i: any) => i.name === 'PasswordReset'),
    resultOf(notificationTypes),
  );

  const moduleGetAll = await json('GET', '/api/dynamic/Shesha/Module/Crud/GetAll', { token });
  check(
    'dynamic Module/Crud/GetAll -> the authoritative `modules` table',
    moduleGetAll.status === 200 &&
      (resultOf(moduleGetAll)?.items ?? []).some((m: any) => m.name === 'Shesha'),
    resultOf(moduleGetAll),
  );

  const moduleGet = await json('GET', `/api/dynamic/Shesha/Module/Crud/Get?id=${sheshaModule?.id}`, { token });
  check(
    'dynamic Module/Crud/Get -> the module the flat tree reports, not a parallel copy',
    moduleGet.status === 200 && resultOf(moduleGet)?.name === 'Shesha' && resultOf(moduleGet)?.isEditable === true,
    moduleGet.data,
  );

  const frontEndApps = await json('GET', '/api/dynamic/Shesha/FrontEndApp/Crud/GetAll', { token });
  const appRows = resultOf(frontEndApps)?.items ?? [];
  check(
    'dynamic FrontEndApp/Crud/GetAll -> the seeded front-end applications',
    frontEndApps.status === 200 && appRows.some((a: any) => a.appKey === 'default-app'),
    appRows,
  );

  const swaggerApp = appRows.find((a: any) => a.appKey === 'shesha-swagger-app');
  const frontEndAppDelete = await json('DELETE', `/api/dynamic/Shesha/FrontEndApp/Crud/Delete?id=${swaggerApp?.id}`, { token });
  check('dynamic FrontEndApp/Crud/Delete -> soft delete', succeeded(frontEndAppDelete), frontEndAppDelete.data);

  const template = await json('POST', '/api/dynamic/Shesha/NotificationTemplate/Crud/Create', {
    token,
    body: { name: 'Smoke template', notificationTypeId, channel: 'email', subject: 'Smoke', body: 'Smoke body' },
  });
  const templateId = resultOf(template)?.id as string | undefined;
  const templateDelete = await json('DELETE', `/api/dynamic/Shesha/NotificationTemplate/Crud/Delete?id=${templateId}`, { token });
  check(
    'dynamic NotificationTemplate/Crud/Create + Delete -> an unregistered entity works with no config',
    template.status === 200 && Boolean(templateId) && succeeded(templateDelete),
    { create: template.data, delete: templateDelete.data },
  );

  const history = await json(
    'GET',
    `/api/services/app/EntityHistory/GetAuditTrail?entityId=${templateId}&entityTypeId%5Bname%5D=NotificationTemplate`,
    { token },
  );
  check(
    'EntityHistory/GetAuditTrail -> the Created and Deleted entries the CRUD engine wrote',
    history.status === 200 &&
      (resultOf(history)?.items ?? []).some((h: any) => h.historyItemType === 0) &&
      (resultOf(history)?.items ?? []).some((h: any) => h.historyItemType === 2),
    resultOf(history),
  );

  // --- Permissioned objects and permissions -------------------------------------------------
  const permissionedTree = await json('GET', '/api/services/app/PermissionedObject/GetAllTree', { token });
  const permissionedRoots = Array.isArray(resultOf(permissionedTree)) ? resultOf(permissionedTree) : [];
  check(
    'PermissionedObject/GetAllTree -> a node per registered resource, derived from resources.json',
    permissionedTree.status === 200 &&
      permissionedRoots.length >= 15 &&
      permissionedRoots.every((n: any) => Array.isArray(n.children) && n.children.length > 0),
    { roots: permissionedRoots.length },
  );

  const smsNode = permissionedRoots.find((n: any) => n.object === 'Shesha.SmsAppService');
  check(
    'PermissionedObject/GetAllTree -> access mirrors the auth the router enforces (Sms is anonymous)',
    smsNode?.access === 5 && smsNode?.children?.some((c: any) => c.object === 'Shesha.SmsAppService@Gateways'),
    smsNode,
  );

  const permissionedObject = await json('POST', '/api/services/app/PermissionedObject/Create', {
    token,
    body: { object: 'Smoke.Page', type: 'Shesha.WebApi', name: 'Smoke page', parent: '', permissions: ['app:Configurator'], access: 4 },
  });
  const permissionedObjectId = resultOf(permissionedObject)?.id as string | undefined;
  const permissionedObjectGet = await json('GET', `/api/services/app/PermissionedObject/Get?id=${permissionedObjectId}`, { token });
  check(
    'PermissionedObject/Create + Get -> generic CRUD over the row store',
    permissionedObject.status === 200 && resultOf(permissionedObjectGet)?.object === 'Smoke.Page',
    { create: permissionedObject.data, get: permissionedObjectGet.data },
  );

  const permissionedObjectUpdate = await json('PUT', '/api/services/app/PermissionedObject/Update', {
    token,
    body: { id: permissionedObjectId, name: 'Smoke page renamed' },
  });
  check(
    'PermissionedObject/Update -> field merged, siblings untouched',
    permissionedObjectUpdate.status === 200 &&
      resultOf(permissionedObjectUpdate)?.name === 'Smoke page renamed' &&
      resultOf(permissionedObjectUpdate)?.object === 'Smoke.Page',
    permissionedObjectUpdate.data,
  );

  const permissionedObjectDelete = await json('DELETE', `/api/services/app/PermissionedObject/Delete?id=${permissionedObjectId}`, { token });
  check('PermissionedObject/Delete -> success', succeeded(permissionedObjectDelete), permissionedObjectDelete.data);

  const permissionTree = await json('GET', '/api/services/app/Permission/GetAllTree', { token });
  const permissionRoots = Array.isArray(resultOf(permissionTree)) ? resultOf(permissionTree) : [];
  check(
    'Permission/GetAllTree -> the framework permissions, with id == name',
    permissionTree.status === 200 &&
      permissionRoots.some((p: any) => p.id === 'app:Configurator' && p.displayName === 'Application Configurator'),
    { count: permissionRoots.length },
  );

  const permissionGet = await json('GET', `/api/services/app/Permission/Get?id=${encodeURIComponent('app:Configurator')}`, { token });
  check(
    'Permission/Get?id=<name> -> PermissionDto (core keys permissions by name, not GUID)',
    permissionGet.status === 200 && resultOf(permissionGet)?.name === 'app:Configurator',
    permissionGet.data,
  );

  const permissionCreate = await json('POST', '/api/services/app/Permission/Create', {
    token,
    body: { name: 'smoke:test', displayName: 'Smoke test', description: 'Smoke permission', module: { name: 'Shesha' } },
  });
  check(
    'Permission/Create -> PermissionDto',
    permissionCreate.status === 200 && resultOf(permissionCreate)?.id === 'smoke:test',
    permissionCreate.data,
  );

  // A permission IS a `permission-definition` configuration item, so the studio sees it too.
  const permissionItem = await json(
    'GET',
    `/api/services/app/ConfigurationItem/GetCurrent?itemType=permission-definition&module=Shesha&name=${encodeURIComponent('smoke:test')}`,
  );
  check(
    'Permission/Create writes the same item the Configuration Studio serves',
    permissionItem.status === 200 && permissionItem.data.result?.configuration?.label === 'Smoke test',
    permissionItem.data?.error ?? permissionItem.status,
  );

  const permissionUpdate = await json('PUT', '/api/services/app/Permission/Update', {
    token,
    body: { id: 'smoke:test', name: 'smoke:test', displayName: 'Smoke test renamed' },
  });
  check(
    'Permission/Update -> displayName changed',
    permissionUpdate.status === 200 && resultOf(permissionUpdate)?.displayName === 'Smoke test renamed',
    permissionUpdate.data,
  );

  const permissionDelete = await json('DELETE', `/api/services/app/Permission/Delete?name=${encodeURIComponent('smoke:test')}`, { token });
  check('Permission/Delete?name= -> success', succeeded(permissionDelete), permissionDelete.data);

  // --- Roles and appointments ---------------------------------------------------------------
  const roles = await json('GET', '/api/services/app/ShaRole/GetAll?maxResultCount=50', { token });
  const systemAdministrator = (resultOf(roles)?.items ?? []).find((r: any) => r.name === 'System Administrator');
  check(
    'ShaRole/GetAll -> the seeded System Administrator holds every framework permission',
    roles.status === 200 && (systemAdministrator?.permissions ?? []).includes('app:Configurator'),
    systemAdministrator,
  );

  const roleCreate = await json('POST', '/api/services/app/ShaRole/Create', {
    token,
    body: { module: 'Shesha', name: 'SmokeRole', label: 'Smoke role', description: 'Smoke', permissions: ['Pages.Users'] },
  });
  const smokeRoleId = resultOf(roleCreate)?.id as string | undefined;
  check('ShaRole/Create -> role config item id', roleCreate.status === 200 && Boolean(smokeRoleId), roleCreate.data);

  const roleGet = await json('GET', `/api/services/app/ShaRole/Get?id=${smokeRoleId}`, { token });
  check(
    'ShaRole/Get -> permissions round-trip',
    roleGet.status === 200 && (resultOf(roleGet)?.permissions ?? []).includes('Pages.Users'),
    roleGet.data,
  );

  const roleUpdate = await json('PUT', '/api/services/app/ShaRole/Update', {
    token,
    body: { id: smokeRoleId, label: 'Smoke role renamed', permissions: ['Pages.Users', 'pages:maintenance'] },
  });
  check(
    'ShaRole/Update -> label and permissions replaced',
    roleUpdate.status === 200 &&
      resultOf(roleUpdate)?.label === 'Smoke role renamed' &&
      (resultOf(roleUpdate)?.permissions ?? []).length === 2,
    roleUpdate.data,
  );

  const appointment = await json('POST', '/api/dynamic/Shesha/ShaRoleAppointedPerson/Crud/Create', {
    token,
    body: { roleId: smokeRoleId, person: { id: '00000000-0000-0000-0000-000000000001', name: 'System Administrator', _className: 'Shesha.Core.Person', _displayName: 'System Administrator' } },
  });
  const appointmentId = resultOf(appointment)?.id as string | undefined;
  check(
    'dynamic ShaRoleAppointedPerson/Crud/Create -> unwraps the DynamicDto person reference',
    appointment.status === 200 && resultOf(appointment)?.person?.name === 'System Administrator',
    appointment.data,
  );

  const appointmentAction = await json('POST', '/api/dynamic/Shesha/ShaRoleAppointedPersonActions/Crud/Create', {
    token,
    body: { shaRoleAppointedPersonId: appointmentId, action: 'Smoke action' },
  });
  const appointmentActionDelete = await json(
    'DELETE',
    `/api/services/app/ShaRoleAppointedPersonActions/Delete?id=${resultOf(appointmentAction)?.id}`,
    { token },
  );
  check(
    'ShaRoleAppointedPersonActions/Delete -> same rows the dynamic route wrote',
    appointmentAction.status === 200 && succeeded(appointmentActionDelete),
    { create: appointmentAction.data, delete: appointmentActionDelete.data },
  );

  const appointmentDelete = await json('DELETE', `/api/services/app/ShaRoleAppointedPerson/Delete?id=${appointmentId}`, { token });
  check('ShaRoleAppointedPerson/Delete -> success', succeeded(appointmentDelete), appointmentDelete.data);

  // --- Reference lists: the list and its items are one document ------------------------------
  const referenceListCreate = await json('POST', '/api/services/app/ReferenceList/Create', {
    token,
    body: { module: 'Shesha', name: 'smoke-reflist', label: 'Smoke list', items: [] },
  });
  const referenceListId = resultOf(referenceListCreate)?.id as string | undefined;
  check('ReferenceList/Create -> config item id', referenceListCreate.status === 200 && Boolean(referenceListId), referenceListCreate.data);

  const referenceListItem = await json('POST', '/api/services/app/ReferenceListItem/Create', {
    token,
    body: { referenceListId, item: 'One', itemValue: 1 },
  });
  check(
    'ReferenceListItem/Create -> appended to the owning list rather than a second store',
    referenceListItem.status === 200 && resultOf(referenceListItem)?.itemValue === 1,
    referenceListItem.data,
  );

  const referenceListItemDelete = await json(
    'DELETE',
    `/api/services/app/ReferenceListItem/Delete?referenceListId=${referenceListId}&id=${resultOf(referenceListItem)?.id}`,
    { token },
  );
  const referenceListGet = await json('GET', `/api/services/app/ReferenceList/Get?id=${referenceListId}`, { token });
  check(
    'ReferenceListItem/Delete + ReferenceList/Get -> the list is empty again',
    succeeded(referenceListItemDelete) && (resultOf(referenceListGet)?.items ?? []).length === 0,
    resultOf(referenceListGet),
  );

  const referenceListUpdate = await json('PUT', '/api/services/app/ReferenceList/Update', {
    token,
    body: { id: referenceListId, label: 'Smoke list renamed' },
  });
  check(
    'ReferenceList/Update -> label changed',
    referenceListUpdate.status === 200 && resultOf(referenceListUpdate)?.label === 'Smoke list renamed',
    referenceListUpdate.data,
  );

  // --- Configuration Studio: folder, item, revisions, rename, expose -------------------------
  const folder = await json('POST', '/api/services/app/ConfigurationStudio/CreateFolder', {
    token,
    body: { moduleId: sheshaModule?.id, name: 'Smoke Folder' },
  });
  const folderIdValue = resultOf(folder)?.id as string | undefined;
  check(
    'ConfigurationStudio/CreateFolder -> FolderTreeNode',
    folder.status === 200 && Boolean(folderIdValue) && resultOf(folder)?.noteType === 3,
    resultOf(folder),
  );

  const folderRename = await json('PUT', '/api/services/app/ConfigurationStudio/RenameFolder', {
    token,
    body: { folderId: folderIdValue, name: 'Smoke Folder Renamed' },
  });
  check('ConfigurationStudio/RenameFolder -> success', succeeded(folderRename), folderRename.data);

  const studioItem = await json('POST', '/api/services/app/ConfigurationStudio/CreateItem', {
    token,
    body: { moduleId: sheshaModule?.id, itemType: 'reference-list', name: 'smoke-studio-item', label: 'Smoke studio item', folderId: folderIdValue },
  });
  const studioItemId = resultOf(studioItem)?.configuration?.id as string | undefined;
  check(
    'ConfigurationStudio/CreateItem -> { cacheMd5, configuration } with a usable default document',
    studioItem.status === 200 && Boolean(studioItemId) && Boolean(resultOf(studioItem)?.cacheMd5) && Array.isArray(resultOf(studioItem)?.configuration?.items),
    resultOf(studioItem),
  );

  const studioItemUpdate = await json('PUT', '/api/services/app/ConfigurationStudio/UpdateItem', {
    token,
    body: {
      id: studioItemId,
      _jObject: { 'Shesha.Domain.ReferenceList': { label: 'Smoke studio item edited', items: [{ id: 'i1', item: 'One', itemValue: 1, orderIndex: 1 }] } },
    },
  });
  check(
    'ConfigurationStudio/UpdateItem -> _jObject merged into the stored document',
    studioItemUpdate.status === 200 &&
      resultOf(studioItemUpdate)?.configuration?.label === 'Smoke studio item edited' &&
      (resultOf(studioItemUpdate)?.configuration?.items ?? []).length === 1,
    resultOf(studioItemUpdate)?.configuration,
  );

  const studioRevisions = await json('GET', `/api/services/app/ConfigurationStudio/GetItemRevisions?itemId=${studioItemId}`, { token });
  const studioRevisionId = resultOf(studioRevisions)?.revisions?.[0]?.id as string | undefined;
  const revisionRename = await json('PUT', '/api/services/app/ConfigurationStudio/RenameRevision', {
    token,
    body: { revisionId: studioRevisionId, versionName: 'smoke-v1' },
  });
  check(
    'ConfigurationStudio/RenameRevision -> success',
    Boolean(studioRevisionId) && succeeded(revisionRename),
    revisionRename.data,
  );

  const studioItemRename = await json('PUT', '/api/services/app/ConfigurationStudio/RenameItem', {
    token,
    body: { itemId: studioItemId, name: 'smoke-studio-item-renamed' },
  });
  // Non-form ids are derived from the natural key, so a rename re-keys the item.
  const renamedStudioItemId = (await json(
    'GET',
    '/api/services/app/ConfigurationStudio/GetItem?itemType=reference-list&module=Shesha&name=smoke-studio-item-renamed',
    { token },
  )).data?.result?.configuration?.id as string | undefined;
  check(
    'ConfigurationStudio/RenameItem -> item resolves under its new name',
    succeeded(studioItemRename) && Boolean(renamedStudioItemId),
    { rename: studioItemRename.data, renamedStudioItemId },
  );

  const expose = await json('POST', '/api/services/app/ConfigurationStudio/Expose', {
    token,
    body: { moduleId: functionalModule?.id, folderId: null, itemIds: [renamedStudioItemId] },
  });
  const exposedItem = await json(
    'GET',
    `/api/services/app/ConfigurationItem/GetCurrent?itemType=reference-list&module=${encodeURIComponent('Boxfusion.SheshaFunctionalTests.Common')}&name=smoke-studio-item-renamed`,
  );
  check(
    'ConfigurationStudio/Expose -> the item is copied into the destination module',
    succeeded(expose) && exposedItem.status === 200 && Boolean(exposedItem.data.result?.configuration),
    { expose: expose.data, exposed: exposedItem.data?.error ?? exposedItem.status },
  );

  const exposeTwice = await json('POST', '/api/services/app/ConfigurationStudio/Expose', {
    token,
    body: { moduleId: functionalModule?.id, folderId: null, itemIds: [renamedStudioItemId] },
  });
  check('ConfigurationStudio/Expose twice -> refused (core will not overwrite a same-named item)', exposeTwice.status === 400, exposeTwice.status);

  const exposable = await json('GET', '/api/services/app/ConfigurationItemToExpose/GetAll?maxResultCount=1000', { token });
  check(
    'ConfigurationItemToExpose/GetAll -> PagedResultDto of everything that can be exposed',
    exposable.status === 200 &&
      typeof resultOf(exposable)?.totalCount === 'number' &&
      (resultOf(exposable)?.items ?? []).some((i: any) => i.name === 'smoke-studio-item-renamed' && i.originModuleName === 'Shesha'),
    { totalCount: resultOf(exposable)?.totalCount },
  );

  // --- One-time pins and the password-reset flows they share a store with --------------------
  const sendPin = await json('POST', '/api/services/app/Otp/SendPin', {
    body: { sendTo: 'admin', sendType: 1, username: 'admin', actionType: 'password restore' },
  });
  const pinOperationId = String(resultOf(sendPin)?.operationId ?? '');
  const pin = String(resultOf(sendPin)?.pin ?? '');
  check(
    'Otp/SendPin (anonymous) -> operationId, with the pin echoed outside production',
    sendPin.status === 200 && Boolean(pinOperationId) && /^\d{6}$/.test(pin),
    resultOf(sendPin),
  );

  const wrongPin = await json('POST', '/api/services/app/Otp/VerifyPin', {
    body: { operationId: pinOperationId, pin: pin === '000000' ? '000001' : '000000' },
  });
  check(
    'Otp/VerifyPin (wrong pin) -> isSuccess:false without consuming the operation',
    wrongPin.status === 200 && resultOf(wrongPin)?.isSuccess === false,
    resultOf(wrongPin),
  );

  const verifyPin = await json('POST', '/api/services/app/Otp/VerifyPin', { body: { operationId: pinOperationId, pin } });
  check('Otp/VerifyPin -> isSuccess:true', resultOf(verifyPin)?.isSuccess === true, resultOf(verifyPin));

  const resetOptions = await json('GET', '/api/services/app/User/GetUserPasswordResetOptions?username=admin');
  const resetOptionList = Array.isArray(resultOf(resetOptions)) ? resultOf(resetOptions) : [];
  check(
    'User/GetUserPasswordResetOptions -> a masked email link and an SMS OTP',
    resetOptions.status === 200 &&
      resetOptionList.some((o: any) => o.method === 2 && String(o.maskedIdentifier).includes('*')) &&
      resetOptionList.some((o: any) => o.method === 4),
    resetOptionList,
  );

  const emailLink = await json('POST', '/api/services/app/User/SendEmailLink?username=admin');
  const smsOtp = await json('POST', '/api/services/app/User/SendSMSOTP?username=admin');
  check(
    'User/SendEmailLink + User/SendSMSOTP -> true (both issue through the same pin engine)',
    emailLink.data?.result === true && smsOtp.data?.result === true,
    { emailLink: emailLink.data, smsOtp: smsOtp.data },
  );

  // The reset wizard only carries the username, so it resolves the pin the OTP engine last issued
  // for that user: the bridge between `Otp/*` and `User/*` is the shared store, not a second API.
  const bridgePin = await json('POST', '/api/services/app/Otp/SendPin', {
    body: { sendTo: 'admin', sendType: 1, username: 'admin', actionType: 'password restore' },
  });
  const bridgePinValue = String(resultOf(bridgePin)?.pin ?? '');
  const validateResetCode = await json('POST', '/api/services/app/User/ValidateResetCode', {
    body: { username: 'admin', code: bridgePinValue, method: 4 },
  });
  check(
    'User/ValidateResetCode -> verifies the pin Otp/SendPin issued and hands back a token',
    validateResetCode.status === 200 && resultOf(validateResetCode)?.isSuccess === true && Boolean(resultOf(validateResetCode)?.token),
    resultOf(validateResetCode),
  );

  const resetToken = resultOf(validateResetCode)?.token as string | undefined;
  const resetUsingToken = await json('POST', '/api/services/app/User/ResetPasswordUsingToken', {
    body: { username: 'admin', token: resetToken, newPassword: '123qwe' },
  });
  check('User/ResetPasswordUsingToken -> true', resetUsingToken.data?.result === true, resetUsingToken.data);

  const tokenReuse = await json('POST', '/api/services/app/User/ResetPasswordUsingToken', {
    body: { username: 'admin', token: resetToken, newPassword: '123qwe' },
  });
  check('User/ResetPasswordUsingToken -> the token is single-use', tokenReuse.status === 400, tokenReuse.status);

  const securityQuestions = await json('POST', '/api/services/app/User/ValidateSecurityQuestions', {
    body: { username: 'admin', submittedQuestions: [] },
  });
  check(
    'User/ValidateSecurityQuestions -> refused while the method is disabled in settings',
    securityQuestions.status === 400,
    securityQuestions.data,
  );

  // --- Accounts ------------------------------------------------------------------------------
  const person = await json('POST', '/api/services/app/UserManagement/Create', {
    token,
    body: {
      firstName: 'Smoke',
      lastName: 'Tester',
      emailAddress: 'smoke@shesha.local',
      userName: 'smoketester',
      password: 'Sm0ke!pass',
      passwordConfirmation: 'Sm0ke!pass',
    },
  });
  const smokeUserId = resultOf(person)?.userId as number | undefined;
  check(
    'UserManagement/Create -> PersonAccountDto',
    person.status === 200 && resultOf(person)?.userName === 'smoketester' && Boolean(smokeUserId),
    resultOf(person),
  );

  const mismatched = await json('POST', '/api/services/app/UserManagement/Create', {
    token,
    body: { firstName: 'A', lastName: 'B', emailAddress: 'b@shesha.local', userName: 'smoketester2', password: 'x', passwordConfirmation: 'y' },
  });
  check('UserManagement/Create (mismatched confirmation) -> 400', mismatched.status === 400, mismatched.data);

  const inactivated = await json('POST', `/api/services/app/User/InactivateUser?userId=${smokeUserId}`, { token });
  const activated = await json('POST', `/api/services/app/User/ActivateUser?userId=${smokeUserId}`, { token });
  check(
    'User/InactivateUser + User/ActivateUser -> true',
    inactivated.data?.result === true && activated.data?.result === true,
    { inactivated: inactivated.data, activated: activated.data },
  );

  const alreadyActive = await json('POST', `/api/services/app/User/ActivateUser?userId=${smokeUserId}`, { token });
  check('User/ActivateUser on an active user -> 400', alreadyActive.status === 400, alreadyActive.data);

  const adminReset = await json('POST', '/api/services/app/User/ResetPassword', {
    token,
    body: { userId: smokeUserId, newPassword: 'Sm0ke!pass2', requireChangePassword: false },
  });
  check('User/ResetPassword (administrator path) -> true', adminReset.data?.result === true, adminReset.data);

  const changePassword = await json('POST', '/api/services/app/User/ChangePassword', {
    token,
    body: { currentPassword: '123qwe', newPassword: '123qwe' },
  });
  check('User/ChangePassword -> true', changePassword.data?.result === true, changePassword.data);

  const wrongCurrentPassword = await json('POST', '/api/services/app/User/ChangePassword', {
    token,
    body: { currentPassword: 'not-it', newPassword: '123qwe' },
  });
  check('User/ChangePassword (wrong current password) -> 403', wrongCurrentPassword.status === 403, wrongCurrentPassword.data);

  // --- Form configuration through the service module Shesha ----------------------------------
  const formCreated = await json('POST', '/api/services/Shesha/FormConfiguration/Create', {
    token,
    body: { module: 'Shesha', name: 'smoke-generic-form', label: 'Smoke', markup: JSON.stringify({ components: [], formSettings: {} }) },
  });
  const formId = resultOf(formCreated)?.id as string | undefined;
  const formFetched = await json('GET', `/api/services/Shesha/FormConfiguration/Get?id=${formId}`, { token });
  const formUpdated = await json('PUT', '/api/services/Shesha/FormConfiguration/Update', {
    token,
    body: { id: formId, label: 'Smoke renamed', markup: JSON.stringify({ components: [], formSettings: {} }) },
  });
  check(
    'FormConfiguration/Create + Get + Update -> round-trip through the service-module route',
    formCreated.status === 200 &&
      resultOf(formFetched)?.name === 'smoke-generic-form' &&
      resultOf(formUpdated)?.label === 'Smoke renamed',
    { create: formCreated.data, get: formFetched.data, update: formUpdated.data },
  );

  // --- The registry is authoritative: unknown services still reach the upstream ---------------
  const unknownService = await json('GET', '/api/services/app/NotARealService/GetAll', { token });
  check('unregistered service -> proxy fallback, not a 404 from the gateway', unknownService.status >= 400, unknownService.status);

  const unknownAction = await json('GET', '/api/services/app/ShaRole/NotARealAction', { token });
  check('registered service, unknown action -> proxy fallback', unknownAction.status >= 400, unknownAction.status);

  const anonymousConfigurator = await json('GET', '/api/services/app/ShaRole/GetAll');
  check('protected resource without a token -> 401 from the resource router', anonymousConfigurator.status === 401, anonymousConfigurator.status);

  // Cleanup: everything the generic routes wrote, so a second run starts from the same state.
  for (const id of [modelConfigId, notificationTypeId, referenceListId, renamedStudioItemId, formId]) {
    if (id) await json('DELETE', `/api/services/app/ConfigurationStudio/DeleteItem?itemId=${id}`, { token });
  }
  await json('DELETE', `/api/services/app/ConfigurationStudio/DeleteFolder?folderId=${folderIdValue}`, { token });
  fs.rmSync(path.join(formsDir, 'smoke-generic-form.json'), { force: true });

  // Unmapped path -> default proxy mode; upstream is down so expect a non-2xx gateway/proxy error (not a crash).
  const unmapped = await json('GET', '/api/services/app/DoesNotExist/Foo');
  check('Unmapped path handled gracefully (no crash)', unmapped.status >= 400, unmapped.status);

  server.close();
  console.log(`\nResult: ${passed} passed, ${failed} failed\n`);
  process.exit(failed === 0 ? 0 : 1);
};

main().catch((err) => {
  console.error('Smoke test crashed:', err);
  process.exit(1);
});
