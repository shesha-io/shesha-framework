import { IStyleType } from '@/index';
import { addPx } from '../_settings/utils';
import { IDimensionsValue } from '../_settings/utils/dimensions/interfaces';

export const defaultStyles = (): IStyleType => {
  return {
    background: { type: 'color', color: '#fff' },
    font: {
      weight: '400',
      size: 14,
      color: '#000',
      type: 'Segoe UI',
    },
    border: {
      border: {
        all: {
          width: 1,
          style: 'solid',
          color: '#d9d9d9',
        },
      },
      radius: { all: 8 },
      borderType: 'all',
      radiusType: 'all',
    },
    dimensions: {
      width: '100%',
      height: '32px',
      minHeight: '0px',
      maxHeight: 'auto',
      minWidth: '0px',
      maxWidth: 'auto',
    },
  };
};

export const dimensionStyles = (dimensions: IDimensionsValue, additionalStyles: React.CSSProperties) => {
  return {
    width: dimensions?.width
      ? `calc(${addPx(dimensions.width)} - ${additionalStyles?.marginLeft || '0px'} - ${additionalStyles?.marginRight || '0px'})`
      : undefined,
    height: dimensions?.height
      ? `calc(${addPx(dimensions.height)} - ${additionalStyles?.marginTop || '0px'} - ${additionalStyles?.marginBottom || '0px'})`
      : undefined,

    minWidth: dimensions?.minWidth
      ? `calc(${addPx(dimensions.minWidth)} - ${additionalStyles?.marginLeft || '0px'} - ${additionalStyles?.marginRight || '0px'})`
      : undefined,
    minHeight: dimensions?.minHeight
      ? `calc(${addPx(dimensions.minHeight)} - ${additionalStyles?.marginTop || '0px'} - ${additionalStyles?.marginBottom || '0px'})`
      : undefined,
    maxWidth: dimensions?.maxWidth
      ? `calc(${addPx(dimensions.maxWidth)} - ${additionalStyles?.marginLeft || '0px'} - ${additionalStyles?.marginRight || '0px'})`
      : undefined,
    maxHeight: dimensions?.maxHeight
      ? `calc(${addPx(dimensions.maxHeight)} - ${additionalStyles?.marginTop || '0px'} - ${additionalStyles?.marginBottom || '0px'})`
      : undefined,
  };
};

export const MAX_SAFE_INTEGER = 9007199254740991;
