import { getLocalStorage } from './storage';

const TENANT_KEY = 'TENANT';
const CUSTOM_HEADERS_KEY = 'f5b34b63-d808-40d5-8b3b-01a16520ac9e';

/**
 * Sets the tenant id
 * @param tenantId - the tenant id
 */
export const setTenantId = (tenantId: string) => {
  if (tenantId) {
    getLocalStorage()?.setItem(TENANT_KEY, tenantId);
  } else {
    getLocalStorage()?.removeItem(TENANT_KEY);
  }
};

/**
 * Gets the tenant id
 * @returns tenantId
 */
export const getTenantId = () => {
  const value = getLocalStorage()?.getItem(TENANT_KEY);
  if (!value) {
    return null;
  }

  return parseInt(value);
};

export const getCustomHeaders = () => {
  const value = getLocalStorage()?.getItem(CUSTOM_HEADERS_KEY);

  if (value) {
    const result = isJsonParseable(value) ? JSON.parse(value) : value;

    if (typeof result === 'object' && Object.getOwnPropertyNames(result || {})?.length) {
      return Object.entries(result);
    }
  }

  return [];
};

export const isJsonParseable = (value: any): boolean => {
  try {
    JSON.parse(value);
    return true;
  } catch (error) {
    return false;
  }
};
