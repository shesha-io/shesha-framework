import { CSSProperties } from 'react';
import { IComponentsContainerProps } from './componentsContainer';

type AlignmentProps = Pick<
  IComponentsContainerProps,
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
  justifySelf,
  alignSelf,
  textJustify,
  gap,
  flexWrap,
}: AlignmentProps): CSSProperties => {
  const style: CSSProperties = {
    display,
  };

  const gridTemplateColumns = Array(gridColumnsCount).fill('auto')?.join(' ');

  if (direction === 'horizontal' || display !== 'block') {
    style['justifyContent'] = justifyContent;
    style['alignItems'] = alignItems;
    style['justifyItems'] = justifyItems;
    style['justifySelf'] = justifySelf;
    style['alignSelf'] = alignSelf;
    style['textJustify'] = textJustify as any;
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

  if (display === 'grid' || display === 'inline-grid') {
    style['gridTemplateColumns'] = gridTemplateColumns;
  }
  return style;
};
