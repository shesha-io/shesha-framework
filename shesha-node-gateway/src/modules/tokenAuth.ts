import { GatewayError } from '../abp/ajaxResponse';
import { issueTokens, verifyAccessToken, verifyRefreshToken } from '../auth/jwt';
import { verifyPassword } from '../auth/password';
import { usersRepo } from '../db/repositories';
import { NativeHandler } from '../gateway/native';

/** POST /api/TokenAuth/Authenticate */
export const authenticate: NativeHandler = async (ctx) => {
  const userNameOrEmailAddress = ctx.body.userNameOrEmailAddress as string | undefined;
  const password = ctx.body.password as string | undefined;
  if (!userNameOrEmailAddress || !password) {
    throw new GatewayError(400, 'userNameOrEmailAddress and password are required');
  }

  const user = usersRepo.findByLogin(String(userNameOrEmailAddress));
  if (!user || !user.isActive) {
    throw new GatewayError(403, 'Invalid user name or password');
  }
  const ok = await verifyPassword(String(password), user.passwordHash);
  if (!ok) {
    throw new GatewayError(403, 'Invalid user name or password');
  }

  const tokens = issueTokens({
    id: user.id,
    userName: user.userName,
    personId: user.personId,
    tenantId: user.tenantId,
    permissions: usersRepo.permissionsOf(user),
  });

  return {
    accessToken: tokens.accessToken,
    encryptedAccessToken: tokens.encryptedAccessToken,
    expireInSeconds: tokens.expireInSeconds,
    expireOn: tokens.expireOn,
    userId: user.id,
    personId: user.personId,
    deviceName: null,
    resultType: 0,
    requireChangePassword: false,
    refreshToken: tokens.refreshToken,
    refreshTokenExpiration: tokens.refreshExpireOn,
  };
};

/** POST /api/TokenAuth/RefreshToken */
export const refreshToken: NativeHandler = (ctx) => {
  const supplied =
    (ctx.body.refreshToken as string | undefined) ??
    (ctx.query.refreshToken as string | undefined) ??
    ctx.token ??
    undefined;
  if (!supplied) throw new GatewayError(400, 'refreshToken is required');

  const subject = verifyRefreshToken(supplied) ?? verifyAccessToken(supplied)?.sub ?? null;
  if (!subject) throw new GatewayError(401, 'Invalid or expired refresh token');

  const user = usersRepo.findById(Number(subject));
  if (!user || !user.isActive) throw new GatewayError(401, 'User no longer active');

  const tokens = issueTokens({
    id: user.id,
    userName: user.userName,
    personId: user.personId,
    tenantId: user.tenantId,
    permissions: usersRepo.permissionsOf(user),
  });

  return {
    accessToken: tokens.accessToken,
    expireInSeconds: tokens.expireInSeconds,
    expireOn: tokens.expireOn,
    refreshToken: tokens.refreshToken,
  };
};

/** POST /api/TokenAuth/SignOff */
export const signOff: NativeHandler = () => null;

export const tokenAuthHandlers: Record<string, NativeHandler> = {
  'tokenAuth.authenticate': authenticate,
  'tokenAuth.refreshToken': refreshToken,
  'tokenAuth.signOff': signOff,
};
