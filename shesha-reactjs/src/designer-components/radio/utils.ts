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
      return urlList?.map((props) => {
        const raw = props as ILabelValue & Partial<ReferenceListItemDto>;
        const label = raw.label ?? raw.item;
        const value = raw.value ?? raw.itemValue;
        const id = raw.id ?? nanoid();
        return { id, label, value };
      });
  }
};
