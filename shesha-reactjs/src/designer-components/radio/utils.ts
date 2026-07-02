import { nanoid } from '@/utils/uuid';
import { ReferenceListItemDto } from '@/apis/referenceList';
import { DataSourceType, ILabelValue } from '@/designer-components/dropdown/model';
import { isNullOrWhiteSpace } from '@/utils/nullables';
import { getFirstNonEmptyStringPropertyOrUndefined } from '@/utils/object';

type UrlDataItem = ILabelValue<unknown> & { itemValue?: unknown; item?: string };

const isNonEmpty = (v: unknown): v is string | number => v != null && String(v).trim() !== '';

export const getDataSourceList = (
  dataSource: DataSourceType,
  values: ILabelValue[],
  refList: ReferenceListItemDto[] | undefined,
  urlList: UrlDataItem[] | undefined = [],
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
        const rawValue = isNonEmpty(item.value) ? item.value : item.itemValue;
        const value = rawValue != null ? String(rawValue) : undefined;
        if (!isNullOrWhiteSpace(label) && !isNullOrWhiteSpace(value)) {
          const id = getFirstNonEmptyStringPropertyOrUndefined(item, ['id']) ?? nanoid();
          items.push({ label, value, id });
        }
      });
      return items;
    }
  }
};
