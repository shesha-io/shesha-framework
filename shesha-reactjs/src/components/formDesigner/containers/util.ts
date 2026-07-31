import { CSSProperties } from 'react';
import { ICommonContainerProps } from '@/interfaces';
import { isDefined } from '@/utils';

type AlignmentProps = Pick<
  ICommonContainerProps,
  | 'direction' |
  'justifyContent' |
  'alignItems' |
  'justifyItems' |
  'flexDirection' |
  'justifySelf' |
  'alignSelf' |
  'textJustify' |
  'gap' |
  'gridColumnsCount' |
  'display' |
  'flexWrap'
>;

export const getAlignmentStyle = ({
  direction = 'vertical',
  justifyContent,
  alignItems,
  justifyItems,
  gridColumnsCount,
  display,
  flexDirection,
  justifySelf: _justifySelf,
  alignSelf: _alignSelf,
  textJustify,
  gap,
  flexWrap,
}: AlignmentProps): CSSProperties => {
  const style: CSSProperties = {
    display,
  };

  if (direction === 'horizontal' || display !== 'block') {
    style['justifyContent'] = justifyContent;
    style['alignItems'] = alignItems;
    style['justifyItems'] = justifyItems;
    // Note: justifySelf and alignSelf should be applied to the wrapper element, not the inner container
    // They are handled in the wrapperStyle in containerComponent.tsx
    style['textJustify'] = textJustify;
    style['gap'] = gap;
  }

  if (display === 'flex') {
    style['flexDirection'] = flexDirection;
    style['flexWrap'] = flexWrap;
  }

  if (direction === 'horizontal' && justifyContent) {
    style['justifyContent'] = justifyContent;
    style['alignItems'] = alignItems;
    style['justifyItems'] = justifyItems;
  }

  if ((display === 'grid' || display === 'inline-grid') && isDefined(gridColumnsCount)) {
    style['gridTemplateColumns'] = `repeat(${gridColumnsCount}, minmax(0, 1fr))`;
  }
  return style;
};
