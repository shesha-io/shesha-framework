/**
 * Permission handling for the gateway.
 *
 * shesha-core grants everything to the admin role server-side, so a seeded user only needs a
 * `'*'` marker. The React frontend does NOT work that way: `Authenticator.anyOfPermissionsGranted`
 * compares `loginInfo.grantedPermissions[].permission === permission` literally, with no wildcard
 * support (shesha-reactjs/src/providers/auth/authenticator.ts). A `'*'` entry therefore never
 * satisfies the `app:Configurator` check and the Form Designer / Configuration Mode stays hidden.
 *
 * So the marker is expanded here into the concrete permission names the UI actually tests for.
 */

/** `PERM_APP_CONFIGURATOR` — gates Configuration Mode, the Form Designer and Configuration Studio. */
export const PERM_APP_CONFIGURATOR = 'app:Configurator';

/** `PERM_PAGES_APP_SETTINGS` — gates the application settings page. */
export const PERM_PAGES_APP_SETTINGS = 'pages:applicationSettings';

/**
 * Every permission name referenced by shesha-core (`ShaPermissionNames`, `PermissionNames`) and
 * the Shesha React app. Order is irrelevant; this is the expansion target for a `'*'` marker.
 */
export const SHESHA_PERMISSIONS: readonly string[] = [
  'app:Configurator',
  'pages:applicationSettings',
  'pages:dataAudit',
  'pages:generalDashboard',
  'pages:logonAudit',
  'pages:maintenance',
  'pages:notificationsAudit',
  'pages:otpAudit',
  'pages:persons',
  'pages:shaRoles',
  'users:resetPassword',
  // ABP-style page permissions from Shesha.Authorization.PermissionNames
  'Pages.Hangfire',
  'Pages.Roles',
  'Pages.Tenants',
  'Pages.Users',
];

/** `'*'` grants everything; `'app:*'` grants everything under the `app:` prefix. */
const isWildcard = (permission: string): boolean => permission.endsWith('*');

const expandWildcard = (pattern: string): string[] => {
  const prefix = pattern.slice(0, -1);
  return SHESHA_PERMISSIONS.filter((p) => p.startsWith(prefix));
};

/**
 * Turns a user's stored permission list into the explicit list the frontend expects.
 * Explicit names pass through untouched, wildcards expand against the catalogue, and the
 * result is de-duplicated while preserving order.
 */
export const expandPermissions = (permissions: string[]): string[] => {
  const result = new Set<string>();
  for (const raw of permissions ?? []) {
    const permission = String(raw ?? '').trim();
    if (!permission) continue;
    if (isWildcard(permission)) {
      for (const expanded of expandWildcard(permission)) result.add(expanded);
      // `'*'` alone must still grant the configurator even if the catalogue changes.
      if (permission === '*') result.add(PERM_APP_CONFIGURATOR);
    } else {
      result.add(permission);
    }
  }
  return [...result];
};

/**
 * True when the stored list grants `permission`.
 *
 * Unlike `expandPermissions` — which has to produce literal names because the React
 * `Authenticator` compares strings — this keeps wildcard semantics: shesha-core grants the admin
 * role everything, so `'*'` answers `IsPermissionGranted` true for names outside the catalogue too.
 */
export const hasPermission = (permissions: string[], permission: string): boolean => {
  const list = permissions ?? [];
  const target = String(permission ?? '');
  if (!target) return false;
  if (list.includes(target)) return true;
  return list.some((raw) => {
    const entry = String(raw ?? '').trim();
    return isWildcard(entry) && target.startsWith(entry.slice(0, -1));
  });
};
