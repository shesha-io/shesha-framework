import { nanoid } from '@/utils/uuid';
import { ReferenceListItemDto } from '@/apis/referenceList';
import { DataSourceType, ILabelValue } from '@/designer-components/dropdown/model';

export const getDataSourceList = (
  dataSource: DataSourceType,
  values: ILabelValue[],
  refList: ReferenceListItemDto[],
  urlList: ILabelValue<any>[] = [],
): ILabelValue[] => {
  switch (dataSource) {
    case 'values':
      return values;

    case 'referenceList':
      return (refList || [])?.map(({ id, item, itemValue }) => ({ id, value: itemValue, label: item }));
    case 'url':
      return urlList
        ?.filter((props): props is ILabelValue & Partial<ReferenceListItemDto> => {
          if (!props || typeof props !== 'object') return false;
          const raw = props as unknown as Record<string, unknown>;
          const hasLabel = raw.label != null || raw.item != null;
          const hasValue = raw.value != null || raw.itemValue != null;
          return hasLabel && hasValue;
        })
        .map((props) => {
          const label = props.label ?? props.item;
          const value = props.value ?? props.itemValue;
          const id = props.id ?? nanoid();
          return { id, label, value };
        });
  }
};
