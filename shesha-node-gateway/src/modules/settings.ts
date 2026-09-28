import { hasPermission } from '../auth/permissions';
import { SettingRow, settingConfigurationsRepo, settingsRepo } from '../db/repositories';
import { GatewayRequestContext, NativeHandler } from '../gateway/native';

const str = (v: unknown, fallback = ''): string => (v === undefined || v === null ? fallback : String(v));

/** `ConfigurationItems.ConfigurationFrameworkMiddleware.FrontEndApplicationHeader`. */
const FRONT_END_APP_HEADER = 'sha-frontend-application';

/** `FrontEndAppKeyConsts`: the app key a scoped-but-unidentified request resolves to... */
const DEFAULT_FRONT_END_APP = 'default-app';
/** ...and the one an entirely unscoped request resolves to (`ConfigurationFrameworkRuntime._defaultState`). */
const SWAGGER_FRONT_END_APP = 'shesha-swagger-app';

/**
 * Resolves the front-end application a client-specific setting value belongs to.
 *
 * The React settings client sends `appKey` when it writes (`SettingsClient.setSetting` passes the
 * application key) but not when it reads (`getSetting` builds `?name=&module=` only), so shesha-core
 * falls back to the `sha-frontend-application` header every request carries —
 * `SettingStore.GetSettingValueAsync` uses `context.AppKey ?? _cfRuntime.FrontEndApplication`, and
 * `GetSettingValueInput.AppKey` is documented as "optional with fallback to the header". Keying the
 * read off the argument alone looks the value up under `''` and misses the row the write just made,
 * which is how a saved main menu reports success and then reverts to empty.
 */
const resolveAppKey = (explicit: unknown, ctx: GatewayRequestContext): string => {
  const requested = str(explicit);
  if (requested) return requested;

  const header = ctx.headers[FRONT_END_APP_HEADER];
  return header === undefined ? SWAGGER_FRONT_END_APP : str(header) || DEFAULT_FRONT_END_APP;
};

/**
 * Reads a setting value, preferring the caller's front-end application.
 *
 * A row stored under `''` is core's `SettingValue.Application == null`: a setting that is not
 * client-specific, which `GetSettingValueAsync` never filters by app key at all. The gateway keeps no
 * `isClientSpecific` column, so that row is the fallback instead of the filter being switched off —
 * the seeded framework settings live there and have to stay readable from any front end.
 */
const findSetting = (name: string, module: string, appKey: string): SettingRow | undefined =>
  settingsRepo.get(name, module, appKey) ?? (appKey ? settingsRepo.get(name, module, '') : undefined);

/**
 * GET /api/services/app/Settings/GetConfigurations
 * Setting metadata the client turns into the typed `application.settings` API
 * (module accessor → category accessor → setting accessor). Without it, forms whose
 * onBeforeDataLoad reads a setting (e.g. the framework login form) fail to initialise.
 */
export const getConfigurations: NativeHandler = () => settingConfigurationsRepo.all();

/** GET /api/services/app/Settings/GetValue */
export const getValue: NativeHandler = (ctx) => {
  const row = findSetting(str(ctx.query.name), str(ctx.query.module), resolveAppKey(ctx.query.appKey, ctx));
  return settingsRepo.parseValue(row);
};

/** POST /api/services/app/Settings/UpdateValue */
export const updateValue: NativeHandler = (ctx) => {
  const { name, module, value } = ctx.body;
  settingsRepo.set(str(name), str(module), resolveAppKey(ctx.body.appKey, ctx), value);
  return null;
};

/** POST /api/services/app/Settings/GetUserValue */
export const getUserValue: NativeHandler = (ctx) => {
  const userKey = ctx.user ? `user:${ctx.user.sub}` : '';
  const { name, module, defaultValue } = ctx.body;
  const row = settingsRepo.get(str(name), str(module), userKey);
  const value = settingsRepo.parseValue(row);
  return value === null || value === undefined ? defaultValue ?? null : value;
};

/** POST /api/services/app/Settings/UpdateUserValue */
export const updateUserValue: NativeHandler = (ctx) => {
  const userKey = ctx.user ? `user:${ctx.user.sub}` : '';
  const { name, module, value, dataType } = ctx.body;
  settingsRepo.set(str(name), str(module), userKey, value, str(dataType) || undefined);
  return null;
};

/** GET /api/services/app/Permission/IsPermissionGranted */
export const isPermissionGranted: NativeHandler = (ctx) => {
  if (!ctx.user) return false;
  return hasPermission(ctx.user.permissions ?? [], str(ctx.query.permissionName));
};

/** GET /api/services/app/ShaRole/IsRoleGranted */
export const isRoleGranted: NativeHandler = (ctx) => {
  if (!ctx.user) return false;
  const permissions = ctx.user.permissions ?? [];
  return permissions.includes('*') || hasPermission(permissions, `role:${str(ctx.query.roleName)}`);
};

export const settingsHandlers: Record<string, NativeHandler> = {
  'settings.getConfigurations': getConfigurations,
  'settings.getValue': getValue,
  'settings.updateValue': updateValue,
  'settings.getUserValue': getUserValue,
  'settings.updateUserValue': updateUserValue,
  'permission.isPermissionGranted': isPermissionGranted,
  'permission.isRoleGranted': isRoleGranted,
};
