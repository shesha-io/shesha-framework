import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';

export interface TokenUser {
  id: number;
  userName: string;
  personId?: string | null;
  tenantId?: number | null;
  permissions?: string[];
}

export interface TokenPair {
  accessToken: string;
  encryptedAccessToken: string;
  expireInSeconds: number;
  expireOn: string;
  refreshToken: string;
  refreshExpireOn: string;
}

interface AccessClaims extends jwt.JwtPayload {
  sub: string;
  userName: string;
  personId?: string | null;
  tenantId?: number | null;
  permissions?: string[];
  typ: 'access';
}

interface RefreshClaims extends jwt.JwtPayload {
  sub: string;
  typ: 'refresh';
}

const baseOptions = (): SignOptions => ({
  issuer: config.jwt.issuer,
  audience: config.jwt.audience,
  algorithm: 'HS256',
});

/** Issue an access + refresh token pair for a user. */
export const issueTokens = (user: TokenUser): TokenPair => {
  const now = Date.now();
  const accessExpireOn = new Date(now + config.jwt.accessTokenTtlSeconds * 1000).toISOString();
  const refreshExpireOn = new Date(now + config.jwt.refreshTokenTtlSeconds * 1000).toISOString();

  const accessToken = jwt.sign(
    {
      sub: String(user.id),
      userName: user.userName,
      personId: user.personId ?? null,
      tenantId: user.tenantId ?? null,
      permissions: user.permissions ?? [],
      typ: 'access',
    } satisfies AccessClaims,
    config.jwt.secret,
    { ...baseOptions(), expiresIn: config.jwt.accessTokenTtlSeconds },
  );

  const refreshToken = jwt.sign(
    { sub: String(user.id), typ: 'refresh' } satisfies RefreshClaims,
    config.jwt.secret,
    { ...baseOptions(), expiresIn: config.jwt.refreshTokenTtlSeconds },
  );

  return {
    accessToken,
    // Shesha stores/sends `accessToken`; `encryptedAccessToken` mirrors ABP's field.
    encryptedAccessToken: accessToken,
    expireInSeconds: config.jwt.accessTokenTtlSeconds,
    expireOn: accessExpireOn,
    refreshToken,
    refreshExpireOn,
  };
};

/** Verify an access token and return its claims, or null when invalid/expired. */
export const verifyAccessToken = (token: string): AccessClaims | null => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret, {
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    }) as AccessClaims;
    return decoded.typ === 'access' ? decoded : null;
  } catch {
    return null;
  }
};

/** Verify a refresh token and return the subject (user id), or null. */
export const verifyRefreshToken = (token: string): string | null => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret, {
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    }) as RefreshClaims;
    return decoded.typ === 'refresh' ? decoded.sub : null;
  } catch {
    return null;
  }
};

export type { AccessClaims };
