import { IStyleValue } from '@/providers/form/models';
import { ICommonContainerProps } from '../container/interfaces';
import { ICustomLayoutComponentProps } from './interfaces';

export const defaultStyles = (prev?: ICustomLayoutComponentProps): IStyleValue & ICommonContainerProps => {
  const {
    display,
    direction,
    alignItems,
    alignSelf,
    flexWrap,
    flexDirection,
    justifySelf,
    justifyItems,
    justifyContent,
    textJustify,
    noDefaultStyling,
    gridColumnsCount,
    gap,
  } = prev || {};

  return {
    background: { type: 'color', color: '' },
    dimensions: {
      width: 'auto',
      height: 'auto',
      minHeight: '32px',
      maxHeight: 'none',
      minWidth: '0px',
      maxWidth: 'none',
    },
    border: {
      radiusType: 'all',
      borderType: 'all',
      border: {
        all: { width: '1px', color: '#d9d9d9', style: 'none' },
      },
      radius: { all: '8' },
    },
    shadow: { blurRadius: 0, color: '#000000', offsetX: 0, offsetY: 0, spreadRadius: 0 },
    display: display ?? 'block',
    direction: direction ?? 'horizontal',
    flexWrap: flexWrap ?? 'nowrap',
    flexDirection: flexDirection ?? 'row',
    justifyContent: justifyContent ?? 'left',
    alignItems: alignItems ?? 'normal',
    alignSelf: alignSelf ?? 'normal',
    justifyItems: justifyItems ?? 'normal',
    textJustify: textJustify ?? 'auto',
    justifySelf: justifySelf ?? 'normal',
    noDefaultStyling: noDefaultStyling ?? false,
    gridColumnsCount: gridColumnsCount ?? undefined,
    gap: gap,
  };
};
