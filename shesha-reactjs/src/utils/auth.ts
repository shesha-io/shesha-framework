import jseu from 'js-encoding-utils';
import { getLocalizationOrDefault } from './localization';
import { getLocalStorage } from './storage';

/**
 * Standard Authorization header name
 */
 export const AUTHORIZATION_HEADER_NAME = 'Authorization';

// Fields to remove from the AuthContext
interface IAccessToken {
  accessToken?: string | null;
  expireInSeconds?: number;
  expireOn?: string;
}

export const saveUserToken = ({ accessToken, expireInSeconds, expireOn }: IAccessToken, tokenName?: string) => {
  const token = {
    accessToken,
    expireInSeconds,
    expireOn,
  };

  const encodedToken = jseu.encoder.encodeBase64(JSON.stringify(token));

  getLocalStorage()?.setItem(tokenName, encodedToken);

  return token;
};

const parseToken = (token: string): IAccessToken => {
  try {
    return JSON.parse(jseu.encoder.decodeBase64(token) as string) as IAccessToken;      
  } catch (error) {
    console.error('failed to parse token', error);
    return null;
  }
}

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

export const removeAccessToken = (tokenName: string) => {
  try {
    getLocalStorage()?.removeItem(tokenName);
    getLocalStorage()?.clear();
    return true;
  } catch (error) {
    return false;
  }
};

export const hasTokenExpired = (date: string): boolean => {
  return new Date(date) < new Date();
};

export const getHttpHeaders = (token: string | null) => {
  const headers = {};
  if (token)
    headers[AUTHORIZATION_HEADER_NAME] = `Bearer ${token}`;

  headers['.AspNetCore.Culture'] = getLocalizationOrDefault();
    
  return headers;
}