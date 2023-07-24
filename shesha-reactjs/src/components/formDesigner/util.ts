import { SIDEBAR_COLLAPSE } from 'components/mainLayout/constant';
import { isJsonParseable } from 'utils/multitenancy';
import { getLocalStorage } from 'utils/storage';

export const getInitIsExpanded = () => {
  try {
    const value = getLocalStorage()?.getItem(SIDEBAR_COLLAPSE);
    const result = isJsonParseable(value) ? JSON.parse(value) : true;
    return !result;
  } catch (_e) {
    return false;
  }
};
