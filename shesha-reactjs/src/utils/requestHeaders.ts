import { getAccessToken } from './auth';
import { getLocalizationOrDefault } from './localization';
import { getCustomHeaders, getTenantId } from './multitenancy';

interface IOptions {
  addCustomHeaders?: boolean;
}
/**
 * Retrieves the request headers for the application
 */
export const requestHeaders = (tokenName?: string, options: IOptions = {}): { [key: string]: string } => {
  const headers: { [key: string]: string } = {};

  const tokenResult = getAccessToken(tokenName);

  const token = tokenResult && tokenResult.accessToken;

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  headers['.AspNetCore.Culture'] = getLocalizationOrDefault();

  const tenantId = getTenantId();

  if (tenantId) {
    headers['Abp.TenantId'] = getTenantId().toString();
  }

  if (options?.addCustomHeaders) {
    const additionalHeaders = getCustomHeaders();

    additionalHeaders.forEach(([key, value]) => {
      if (key && value) {
        headers[key] = value?.toString();
      }
    });
  }

  return headers;
};
