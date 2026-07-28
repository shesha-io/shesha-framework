import { nanoid } from '@/utils/uuid';
import { ReferenceListItemDto } from '@/apis/referenceList';
import { DataSourceType, ILabelValue } from '@/designer-components/dropdown/model';
import { isNullOrWhiteSpace } from '@/utils/nullables';
import { getFirstNonEmptyStringPropertyOrUndefined } from '@/utils/object';
import { IStyleValue } from '@/providers/form/models';

/**
 * Styles applied to a single radio option when nothing has been configured.
 * Dimensions describe the radio indicator, not the group.
 */
export const defaultStyles = (): IStyleValue => {
  return {
    background: { type: 'color', color: '#fff' },
    font: {
      weight: '400',
      size: 14,
      color: '#000',
      type: 'Segoe UI',
      align: 'left',
    },
    border: {
      border: {
        all: {
          width: 1,
          style: 'solid',
          color: '#d9d9d9',
        },
      },
      radius: { all: '50%' },
      borderType: 'all',
      radiusType: 'all',
    },
    dimensions: {
      width: '16px',
      height: '16px',
      minHeight: '0px',
      maxHeight: 'auto',
      minWidth: '0px',
      maxWidth: 'auto',
    },
    shadow: {
      spreadRadius: 0,
      blurRadius: 0,
      color: '#000',
      offsetX: 0,
      offsetY: 0,
    },
    stylingBoxJson: {
      _type: 'styleBox',
      marginBottom: "0",
      marginLeft: "0",
      marginRight: "0",
      marginTop: "0",
      paddingBottom: "0",
      paddingLeft: "0",
      paddingRight: "0",
      paddingTop: "0",
    },
  };
};

type UrlDataItem = ILabelValue<unknown> & { itemValue?: unknown; item?: string };

const isNonEmpty = (v: unknown): boolean => v != null && String(v).trim() !== '';

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
