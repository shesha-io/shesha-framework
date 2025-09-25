import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { getLocalStorage } from './storage';

const TENANT_KEY = 'TENANT';
const CUSTOM_HEADERS_KEY = 'f5b34b63-d808-40d5-8b3b-01a16520ac9e';

/**
 * Sets the tenant id
 *
 * @param tenantId - the tenant id
 */
export const setTenantId = (tenantId: string): void => {
  if (tenantId) {
    getLocalStorage()?.setItem(TENANT_KEY, tenantId);
  } else {
    getLocalStorage()?.removeItem(TENANT_KEY);
  }
};

/**
 * Gets the tenant id
 *
 * @returns tenantId
 */
export const getTenantId = (): number | null => {
  const value = getLocalStorage()?.getItem(TENANT_KEY);
  if (!value) {
    return null;
  }

  return parseInt(value, 10);
};

export const isJsonParseable = (value: string): boolean => {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};

export const getCustomHeaders = (): Array<[string, unknown]> => {
  const value = getLocalStorage()?.getItem(CUSTOM_HEADERS_KEY);

  if (value && !isNullOrWhiteSpace(value) && isJsonParseable(value)) {
    const result = JSON.parse(value) as object;

    if (isDefined(result) && typeof result === 'object') {
      return Object.entries(result);
    }
  }

  return [];
};
