import { expandPermissions } from '../auth/permissions';
import { usersRepo } from '../db/repositories';
import { NativeHandler } from '../gateway/native';

const APP_VERSION = '0.1.0';

/** GET /api/services/app/Session/GetCurrentLoginInfo */
export const getCurrentLoginInfo: NativeHandler = (ctx) => {
  const result: Record<string, unknown> = {
    application: {
      version: APP_VERSION,
      releaseDate: new Date().toISOString(),
      features: {},
    },
    initializationErrors: {
      lastInitialization: new Date().toISOString(),
      errors: [],
    },
  };

  if (ctx.user) {
    const user = usersRepo.findById(Number(ctx.user.sub));
    if (user) {
      // `Authenticator.anyOfPermissionsGranted` matches permission strings literally, so the
      // stored `'*'` admin marker has to be expanded into real names here — otherwise
      // `app:Configurator` is never granted and the Form Designer stays hidden.
      const permissions = expandPermissions(usersRepo.permissionsOf(user));
      result.user = {
        id: user.id,
        accountFound: true,
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: [user.firstName, user.lastName].filter(Boolean).join(' '),
        picture: null,
        email: user.email,
        mobileNumber: null,
        hasRegistered: true,
        personId: user.personId,
        homeUrl: null,
        isSelfServiceUser: false,
        requireChangePassword: false,
        grantedPermissions: permissions.map((permission) => ({ permission })),
      };
      if (user.tenantId) {
        result.tenant = { id: user.tenantId };
      }
    }
  }

  return result;
};

export const sessionHandlers: Record<string, NativeHandler> = {
  'session.getCurrentLoginInfo': getCurrentLoginInfo,
};
