import { ReferenceListItemDto } from '@/apis/referenceList';
import { DataSourceType, ILabelValue } from '@/designer-components/dropdown/model';
import { IStyleValue } from '@/providers/form/models';
import { IOptionStyleValue } from '../_common-migrations/migrateStylesToOption';

/**
 * Default Appearance styles. These describe a single radio option, so they sit under the `option`
 * set; the wrapper is left unstyled so the group takes its size from its content.
 */
export const defaultStyles = (): IOptionStyleValue => {
  return { option: defaultOptionStyles() };
};

const defaultOptionStyles = (): IStyleValue => {
  return {
    background: { type: 'color', color: '' },
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
      width: 'auto',
      height: 'auto',
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

export const getDataSourceList = (
  dataSource: DataSourceType,
  values: ILabelValue[],
  refList: ReferenceListItemDto[] | undefined,
): ILabelValue[] => {
  switch (dataSource) {
    case 'values':
      return values;
    case 'referenceList':
      return (refList ?? []).map(({ id, item, itemValue }) => ({ id, value: itemValue, label: item ?? "" }));
    default:
      return [];
  }
};
