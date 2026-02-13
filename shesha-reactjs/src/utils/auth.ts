import jseu from 'js-encoding-utils';
import { getLocalizationOrDefault } from './localization';
import { getLocalStorage } from './storage';
import { IAccessToken } from '@/interfaces';

/**
 * Standard Authorization header name
 */
export const AUTHORIZATION_HEADER_NAME = 'Authorization';

export const saveUserToken = ({ accessToken, expireInSeconds, expireOn }: IAccessToken, tokenName?: string) => {
  // Add client-side nonce for absolute uniqueness guarantee
  // Use crypto.randomUUID() if available (modern browsers), fallback to timestamp + random
  const nonce = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

  const tokenWithNonce = {
    accessToken,
    expireInSeconds,
    expireOn,
    nonce, // Ensures unique encoded value every time
  };

  const encodedToken = jseu.encoder.encodeBase64(JSON.stringify(tokenWithNonce));

  getLocalStorage()?.setItem(tokenName, encodedToken);

  // Return clean token without nonce (nonce is only for storage uniqueness)
  return {
    accessToken,
    expireInSeconds,
    expireOn,
  };
};

const parseToken = (token: string): IAccessToken => {
  try {
    const parsed = JSON.parse(jseu.encoder.decodeBase64(token) as string) as IAccessToken;

    // Remove client-side nonce field before returning
    // The nonce is only for encoding uniqueness, not part of the actual token data
    const { nonce, ...tokenWithoutNonce } = parsed;

    return tokenWithoutNonce as IAccessToken;
  } catch (error) {
    console.error('failed to parse token', error);
    return null;
  }
};

export const hasTokenExpired = (date: string): boolean => {
  return new Date(date) < new Date();
};

export const removeAccessToken = (tokenName: string) => {
  try {
    getLocalStorage()?.removeItem(tokenName);
    getLocalStorage()?.clear();
    return true;
  } catch {
    return false;
  }
};

export const isTokenAboutToExpire = (tokenName: string, bufferSeconds = 60): boolean => {
  const token = getLocalStorage()?.getItem(tokenName);
  const deserializedToken = parseToken(token);

  if (!deserializedToken?.expireOn) return true;

  const expiresInSeconds = Math.floor(
    (new Date(deserializedToken.expireOn).getTime() - Date.now()) / 1000
  );

  return expiresInSeconds <= bufferSeconds;
};

export const getAccessToken = (tokenName: string): IAccessToken | null => {
  const token = getLocalStorage()?.getItem(tokenName);

  if (token) {
    const deserializedToken = parseToken(token);

    if (!deserializedToken || hasTokenExpired(deserializedToken.expireOn || '')) {
      removeAccessToken(tokenName);

      return null;
    }
    return deserializedToken;
  }

  return null;
};

export const getHttpHeaders = (token: string | null) => {
  const headers = {};
  if (token) headers[AUTHORIZATION_HEADER_NAME] = `Bearer ${token}`;

  headers['.AspNetCore.Culture'] = getLocalizationOrDefault();

  return headers;
};
