import { nanoid } from '@/utils/uuid';
import { ReferenceListItemDto } from '@/apis/referenceList';
import { DataSourceType, ILabelValue } from '@/designer-components/dropdown/model';
import { isNullOrWhiteSpace } from '@/utils/nullables';
import { getFirstNonEmptyStringPropertyOrUndefined } from '@/utils/object';

export const getDataSourceList = (
  dataSource: DataSourceType,
  values: ILabelValue[],
  refList: ReferenceListItemDto[] | undefined,
  urlList: ILabelValue[] | undefined = [],
): ILabelValue[] => {
  switch (dataSource) {
    case 'values':
      return values;
    case 'referenceList':
      return (refList ?? []).map(({ id, item, itemValue }) => ({ id, value: itemValue, label: item ?? "" }));
    case 'url':{
      const items: ILabelValue[] = [];
      urlList.forEach((item) => {
        const label = getFirstNonEmptyStringPropertyOrUndefined(item, ['label', 'item']);
        const value = getFirstNonEmptyStringPropertyOrUndefined(item, ['value', 'itemValue']);
        if (!isNullOrWhiteSpace(label) && !isNullOrWhiteSpace(value)) {
          const id = getFirstNonEmptyStringPropertyOrUndefined(item, ['id']) ?? nanoid();
          items.push({ label, value, id });
        }
      });
      return items;
    }
  }
};
