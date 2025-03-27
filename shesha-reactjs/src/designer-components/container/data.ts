import { ICommonContainerProps, IContainerComponentProps, IStyleType } from '@/index';
import { nanoid } from '@/utils/uuid';

export const JUSTIFY_ITEMS = [
  { id: nanoid(), label: 'center', value: 'center' },
  { id: nanoid(), label: 'start', value: 'start' },
  { id: nanoid(), label: 'end', value: 'end' },
  { id: nanoid(), label: 'flex-start', value: 'flex-start' },
  { id: nanoid(), label: 'flex-end', value: 'flex-end' },
  { id: nanoid(), label: 'left', value: 'left' },
  { id: nanoid(), label: 'right', value: 'right' },
  { id: nanoid(), label: 'normal', value: 'normal' },
  { id: nanoid(), label: 'space-between', value: 'space-between' },
  { id: nanoid(), label: 'space-around', value: 'space-around' },
  { id: nanoid(), label: 'space-evenly', value: 'space-evenly' },
  { id: nanoid(), label: 'stretch', value: 'stretch' },
  { id: nanoid(), label: 'safe center', value: 'safe center' },
  { id: nanoid(), label: 'unsafe center', value: 'unsafe center' },
  { id: nanoid(), label: 'inherit', value: 'inherit' },
  { id: nanoid(), label: 'initial', value: 'initial' },
  { id: nanoid(), label: 'revert', value: 'revert' },
  { id: nanoid(), label: 'revert-layer', value: 'revert-layer' },
  { id: nanoid(), label: 'unset', value: 'unset' },
];
export const FLEX_DIRECTION = [
  { id: nanoid(), label: 'row', value: 'row' },
  { id: nanoid(), label: 'row-reverse', value: 'row-reverse' },
  { id: nanoid(), label: 'column', value: 'column' },
  { id: nanoid(), label: 'column-reverse', value: 'column-reverse' },
  { id: nanoid(), label: 'inherit', value: 'inherit' },
  { id: nanoid(), label: 'initial', value: 'initial' },
  { id: nanoid(), label: 'revert', value: 'revert' },
  { id: nanoid(), label: 'revert-layer', value: 'revert-layer' },
  { id: nanoid(), label: 'unset', value: 'unset' },
];

export const FLEX_WRAP = [
  { id: nanoid(), label: 'nowrap', value: 'nowrap' },
  { id: nanoid(), label: 'wrap', value: 'wrap' },
  { id: nanoid(), label: 'wrap-reverse', value: 'wrap-reverse' },
  { id: nanoid(), label: 'inherit', value: 'inherit' },
  { id: nanoid(), label: 'initial', value: 'initial' },
  { id: nanoid(), label: 'revert', value: 'revert' },
  { id: nanoid(), label: 'revert-layer', value: 'revert-layer' },
  { id: nanoid(), label: 'unset', value: 'unset' },
];

export const JUSTIFY_CONTENT = [
  { id: nanoid(), label: 'center', value: 'center' },
  { id: nanoid(), label: 'start', value: 'start' },
  { id: nanoid(), label: 'end', value: 'end' },
  { id: nanoid(), label: 'flex-start', value: 'flex-start' },
  { id: nanoid(), label: 'flex-end', value: 'flex-end' },
  { id: nanoid(), label: 'left', value: 'left' },
  { id: nanoid(), label: 'right', value: 'right' },
  { id: nanoid(), label: 'normal', value: 'normal' },
  { id: nanoid(), label: 'space-between', value: 'space-between' },
  { id: nanoid(), label: 'space-around', value: 'space-around' },
  { id: nanoid(), label: 'space-evenly', value: 'space-evenly' },
  { id: nanoid(), label: 'stretch', value: 'stretch' },
  { id: nanoid(), label: 'safe center', value: 'safe center' },
  { id: nanoid(), label: 'unsafe center', value: 'unsafe center' },
  { id: nanoid(), label: 'inherit', value: 'inherit' },
  { id: nanoid(), label: 'initial', value: 'initial' },
  { id: nanoid(), label: 'revert', value: 'revert' },
  { id: nanoid(), label: 'revert-layer', value: 'revert-layer' },
  { id: nanoid(), label: 'unset', value: 'unset' },
];

export const JUSTIFY_SELF = [
  { id: nanoid(), label: 'auto', value: 'auto' },
  { id: nanoid(), label: 'normal', value: 'normal' },
  { id: nanoid(), label: 'stretch', value: 'stretch' },
  { id: nanoid(), label: 'center', value: 'center' },
  { id: nanoid(), label: 'start', value: 'start' },
  { id: nanoid(), label: 'end', value: 'end' },
  { id: nanoid(), label: 'flex-start', value: 'flex-start' },
  { id: nanoid(), label: 'flex-end', value: 'flex-end' },
  { id: nanoid(), label: 'self-start', value: 'self-start' },
  { id: nanoid(), label: 'self-end', value: 'self-end' },
  { id: nanoid(), label: 'left', value: 'left' },
  { id: nanoid(), label: 'right', value: 'right' },
  { id: nanoid(), label: 'baseline', value: 'baseline' },
  { id: nanoid(), label: 'first baseline', value: 'first baseline' },
  { id: nanoid(), label: 'last baseline', value: 'last baseline' },
  { id: nanoid(), label: 'safe center', value: 'safe center' },
  { id: nanoid(), label: 'unsafe center', value: 'unsafe center' },
  { id: nanoid(), label: 'inherit', value: 'inherit' },
  { id: nanoid(), label: 'initial', value: 'initial' },
  { id: nanoid(), label: 'revert', value: 'revert' },
  { id: nanoid(), label: 'revert-layer', value: 'revert-layer' },
  { id: nanoid(), label: 'unset', value: 'unset' },
];

export const TEXT_JUSTIFY = [
  { id: nanoid(), label: 'none', value: 'none' },
  { id: nanoid(), label: 'auto', value: 'auto' },
  { id: nanoid(), label: 'inter-word', value: 'inter-word' },
  { id: nanoid(), label: 'inter-character', value: 'inter-character' },
  { id: nanoid(), label: 'distribute', value: 'distribute' },
  { id: nanoid(), label: 'inherit', value: 'inherit' },
  { id: nanoid(), label: 'initial', value: 'initial' },
  { id: nanoid(), label: 'revert', value: 'revert' },
  { id: nanoid(), label: 'revert-layer', value: 'revert-layer' },
  { id: nanoid(), label: 'unset', value: 'unset' },
];

export const ALIGN_ITEMS = [
  { id: nanoid(), label: 'normal', value: 'normal' },
  { id: nanoid(), label: 'stretch', value: 'stretch' },
  { id: nanoid(), label: 'center', value: 'center' },
  { id: nanoid(), label: 'start', value: 'start' },
  { id: nanoid(), label: 'end', value: 'end' },
  { id: nanoid(), label: 'flex-start', value: 'flex-start' },
  { id: nanoid(), label: 'flex-end', value: 'flex-end' },
  { id: nanoid(), label: 'baseline', value: 'baseline' },
  { id: nanoid(), label: 'first baseline', value: 'first baseline' },
  { id: nanoid(), label: 'last baseline', value: 'last baseline' },
  { id: nanoid(), label: 'safe center', value: 'safe center' },
  { id: nanoid(), label: 'unsafe center', value: 'unsafe center' },
  { id: nanoid(), label: 'inherit', value: 'inherit' },
  { id: nanoid(), label: 'initial', value: 'initial' },
  { id: nanoid(), label: 'revert', value: 'revert' },
  { id: nanoid(), label: 'revert-layer', value: 'revert-layer' },
  { id: nanoid(), label: 'unset', value: 'unset' },
];

export const ALIGN_SELF = [
  { id: nanoid(), label: 'auto', value: 'auto' },
  { id: nanoid(), label: 'normal', value: 'normal' },
  { id: nanoid(), label: 'center', value: 'center' },
  { id: nanoid(), label: 'start', value: 'start' },
  { id: nanoid(), label: 'end', value: 'end' },
  { id: nanoid(), label: 'self-start', value: 'self-start' },
  { id: nanoid(), label: 'self-end', value: 'self-end' },
  { id: nanoid(), label: 'flex-start', value: 'flex-start' },
  { id: nanoid(), label: 'flex-end', value: 'flex-end' },
  { id: nanoid(), label: 'baseline', value: 'baseline' },
  { id: nanoid(), label: 'first baseline', value: 'first baseline' },
  { id: nanoid(), label: 'last baseline', value: 'last baseline' },
  { id: nanoid(), label: 'stretch', value: 'stretch' },
  { id: nanoid(), label: 'safe center', value: 'safe center' },
  { id: nanoid(), label: 'unsafe center', value: 'unsafe center' },
  { id: nanoid(), label: 'inherit', value: 'inherit' },
  { id: nanoid(), label: 'initial', value: 'initial' },
  { id: nanoid(), label: 'revert', value: 'revert' },
  { id: nanoid(), label: 'revert-layer', value: 'revert-layer' },
  { id: nanoid(), label: 'unset', value: 'unset' },
];


export const defaultStyles = (prev?: IContainerComponentProps): IStyleType & ICommonContainerProps => {
  const {
    width = 'auto',
    height = 'auto',
    maxHeight = 'auto',
    maxWidth = 'auto',
    minHeight = 'auto',
    minWidth = '0px',
    borderColor = '#d9d9d9',
    borderRadius = '8',
    borderStyle = 'solid',
    borderWidth = '0px',
    shadowStyle,
  } = prev || {};


  const isBelow = shadowStyle === 'below';
  const isAbove = shadowStyle === 'above';

  return {
    dimensions: {
      width,
      height,
      minHeight,
      maxHeight,
      minWidth,
      maxWidth
    },
    border: {
      radiusType: 'all',
      borderType: 'all',
      border: {
        all: { width: borderWidth, color: borderColor, style: borderStyle as any },
      },
      radius: { all: borderRadius }
    },
    shadow: {
      blurRadius: isBelow || isAbove ? 4 : 0,
      color: 'rgba(0, 0, 0, 0.15)',
      offsetX: 0,
      offsetY: isAbove ? -2 : isBelow ? 2 : 0,
      spreadRadius: 0
    },
    position: { value: 'relative', top: 0, right: 0, bottom: 0, left: 0, offset: 'top' },
    display: prev?.display,
    direction: prev?.direction ?? "horizontal",
    flexWrap: prev?.flexWrap ?? "wrap",
    flexDirection: prev?.flexDirection ?? "row",
    justifyContent: prev?.justifyContent ?? "left",
    alignItems: prev?.alignItems ?? "normal",
    alignSelf: prev?.alignSelf ?? "normal",
    justifyItems: prev?.justifyItems ?? "normal",
    textJustify: prev?.textJustify ?? "auto",
    justifySelf: prev?.justifySelf ?? "normal",
    noDefaultStyling: prev?.noDefaultStyling ?? false,
    gridColumnsCount: prev?.gridColumnsCount ?? null,
    gap: prev?.gap ?? '8px',
    overflow: prev?.overflow ?? 'auto'
  };
};
