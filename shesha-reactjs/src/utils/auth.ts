import jseu from 'js-encoding-utils';
import { getLocalStorage } from './storage';
import { IAccessToken } from '@/interfaces';
import { IStoredToken } from '@/interfaces/accessToken';
import { DEFAULT_ACCESS_TOKEN_NAME } from '@/providers/sheshaApplication/contexts';
import { isDefined, isNullOrWhiteSpace } from './nullables';

/**
 * Standard Authorization header name
 */
export const AUTHORIZATION_HEADER_NAME = 'Authorization';

export const saveUserToken = ({ accessToken, expireInSeconds, expireOn }: IAccessToken, tokenName: string = DEFAULT_ACCESS_TOKEN_NAME): IAccessToken => {
  const nonce = crypto.randomUUID();

  // Create stored token with nonce for storage uniqueness
  const storedToken: IStoredToken = {
    accessToken,
    expireInSeconds,
    expireOn,
    nonce, // Ensures unique encoded value every time
  };

  const encodedToken = jseu.encoder.encodeBase64(JSON.stringify(storedToken));

  getLocalStorage()?.setItem(tokenName, encodedToken);

  // Return clean token without nonce (nonce is only for storage uniqueness)
  const publicToken: IAccessToken = {
    accessToken,
    expireInSeconds,
    expireOn,
  };

  return publicToken;
};

const isIAccessToken = (value: unknown): value is IAccessToken =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseToken = (token: string): IAccessToken | null => {
  try {
    // Parse as stored token (may contain nonce)
    const storedToken = JSON.parse(jseu.encoder.decodeBase64(token) as string) as IStoredToken;

    // Remove client-side nonce field before returning
    // The nonce is only for encoding uniqueness, not part of the actual token data
    const { nonce, ...publicToken } = storedToken;
    void nonce; // nonce is intentionally discarded - it is only for storage uniqueness

    if (!isIAccessToken(publicToken)) {
      console.error('parsed token does not match IAccessToken shape');
      return null;
    }

    return publicToken;
  } catch (error) {
    console.error('failed to parse token', error);
    return null;
  }
};

export const hasTokenExpired = (date: string): boolean => {
  return new Date(date) < new Date();
};

export const removeAccessToken = (tokenName: string): boolean => {
  try {
    getLocalStorage()?.removeItem(tokenName);
    return true;
  } catch {
    return false;
  }
};

export const isTokenAboutToExpire = (tokenName: string, bufferSeconds = 60): boolean => {
  const token = getLocalStorage()?.getItem(tokenName);
  if (isNullOrWhiteSpace(token)) return true;
  const deserializedToken = parseToken(token);

  if (!isDefined(deserializedToken?.expireOn)) return true;

  const expiresInSeconds = Math.floor(
    (new Date(deserializedToken.expireOn).getTime() - Date.now()) / 1000,
  );

  return expiresInSeconds <= bufferSeconds;
};

export const getAccessToken = (tokenName: string): IAccessToken | null => {
  const token = getLocalStorage()?.getItem(tokenName);

  if (!isNullOrWhiteSpace(token)) {
    const deserializedToken = parseToken(token);

    if (!deserializedToken || hasTokenExpired(deserializedToken.expireOn ?? '')) {
      removeAccessToken(tokenName);

      return null;
    }
    return deserializedToken;
  }

  return null;
};
