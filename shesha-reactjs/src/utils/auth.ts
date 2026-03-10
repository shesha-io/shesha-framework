import jseu from 'js-encoding-utils';
import { getLocalStorage } from './storage';
import { IAccessToken } from '@/interfaces';

/**
 * Standard Authorization header name
 */
export const AUTHORIZATION_HEADER_NAME = 'Authorization';

export const saveUserToken = ({ accessToken, expireInSeconds, expireOn }: IAccessToken, tokenName?: string): void => {
  const token = {
    accessToken,
    expireInSeconds,
    expireOn,
  };

  const encodedToken = jseu.encoder.encodeBase64(JSON.stringify(token));

  getLocalStorage()?.setItem(tokenName, encodedToken);
};

const parseToken = (token: string): IAccessToken => {
  try {
    return JSON.parse(jseu.encoder.decodeBase64(token) as string) as IAccessToken;
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
    getLocalStorage()?.clear();
    return true;
  } catch {
    return false;
  }
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
