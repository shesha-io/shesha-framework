import { ReferenceListItemDto } from '@/apis/referenceList';
import { DataSourceType, ILabelValue } from '@/designer-components/dropdown/model';
import { IStyleValue } from '@/providers/form/models';
import { INestedStyleValue } from '../_common-migrations/migrateStylesToNestedSet';

/**
 * Default Appearance styles: the wrapper's own values, plus the nested `radio` set describing a
 * single radio option.
 */
export const defaultStyles = (): INestedStyleValue<'radio'> => {
  return { ...defaultWrapperStyles(), radio: defaultRadioStyles() };
};

/**
 * The group container. It only lays the options out, so it draws nothing of its own: `border` and
 * `background` are omitted rather than set empty, because a zero border still emits
 * `border: 0px none` and would override a border inherited from the theme. The font lives here
 * because it is what the option labels inherit.
 */
const defaultWrapperStyles = (): IStyleValue => {
  return {
    font: {
      weight: '400',
      size: 14,
      color: '#000',
      type: 'Segoe UI',
      align: 'left',
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

/**
 * A single radio option. No font or shadow — the nested Appearance panel exposes neither, so the
 * label's font comes from the wrapper.
 */
const defaultRadioStyles = (): IStyleValue => {
  return {
    background: { type: 'color', color: '' },
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
