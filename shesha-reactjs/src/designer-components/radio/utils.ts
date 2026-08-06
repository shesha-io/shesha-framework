import { ReferenceListItemDto } from '@/apis/referenceList';
import { DataSourceType, ILabelValue } from '@/designer-components/dropdown/model';
import { INestedStyleValue, IStyleValue } from '@/providers/form/models';

/**
 * Default Appearance styles: the wrapper's own values, plus the nested `radio` set describing a
 * single radio option.
 */
export const defaultStyles = (): INestedStyleValue<'radio'> => {
  return { ...defaultWrapperStyles(), radio: defaultRadioStyles() };
};

/**
 * The group container. The font lives here because it is what the option labels inherit; the
 * border, background and shadow give the group its own frame.
 */
const defaultWrapperStyles = (): IStyleValue => {
  return {
    font: {
      weight: '400',
      size: 14,
      color: '#000',
      type: 'Segoe UI',
    },
    dimensions: {
      width: 'auto',
      height: 'auto',
      minHeight: '0px',
      maxHeight: 'auto',
      minWidth: '0px',
      maxWidth: 'auto',
    },
    border: {
      border: {
        all: {
          width: 1,
          style: 'none',
          color: '#d9d9d9',
        },
      },
      radius: { all: 0 },
      borderType: 'all',
      radiusType: 'all',
    },
    background: { type: 'color', color: '' },
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
      width: '14px',
      height: '14px',
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
