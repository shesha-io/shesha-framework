import { ICommonContainerProps, IContainerComponentProps, IStyleType } from '@/index';
import { nanoid } from '@/utils/uuid';

export const JUSTIFY_ITEMS = [
  { id: nanoid(), label: 'Center', value: 'center' },
  { id: nanoid(), label: 'Start', value: 'start' },
  { id: nanoid(), label: 'End', value: 'end' },
  { id: nanoid(), label: 'Flex start', value: 'flex-start' },
  { id: nanoid(), label: 'Flex end', value: 'flex-end' },
  { id: nanoid(), label: 'Left', value: 'left' },
  { id: nanoid(), label: 'Right', value: 'right' },
  { id: nanoid(), label: 'Normal', value: 'normal' },
  { id: nanoid(), label: 'Space between', value: 'space-between' },
  { id: nanoid(), label: 'Space around', value: 'space-around' },
  { id: nanoid(), label: 'Space evenly', value: 'space-evenly' },
  { id: nanoid(), label: 'Stretch', value: 'stretch' },
  { id: nanoid(), label: 'Safe center', value: 'safe center' },
  { id: nanoid(), label: 'Unsafe center', value: 'unsafe center' },
  { id: nanoid(), label: 'Inherit', value: 'inherit' },
  { id: nanoid(), label: 'Initial', value: 'initial' },
  { id: nanoid(), label: 'Revert', value: 'revert' },
  { id: nanoid(), label: 'Revert layer', value: 'revert-layer' },
  { id: nanoid(), label: 'Unset', value: 'unset' },
];
export const FLEX_DIRECTION = [
  { id: nanoid(), label: 'Row', value: 'row' },
  { id: nanoid(), label: 'Row reverse', value: 'row-reverse' },
  { id: nanoid(), label: 'Column', value: 'column' },
  { id: nanoid(), label: 'Column reverse', value: 'column-reverse' },
  { id: nanoid(), label: 'Inherit', value: 'inherit' },
  { id: nanoid(), label: 'Initial', value: 'initial' },
  { id: nanoid(), label: 'Revert', value: 'revert' },
  { id: nanoid(), label: 'Revert layer', value: 'revert-layer' },
  { id: nanoid(), label: 'Unset', value: 'unset' },
];

export const FLEX_WRAP = [
  { id: nanoid(), label: 'No wrap', value: 'nowrap' },
  { id: nanoid(), label: 'Wrap', value: 'wrap' },
  { id: nanoid(), label: 'Wrap reverse', value: 'wrap-reverse' },
  { id: nanoid(), label: 'Inherit', value: 'inherit' },
  { id: nanoid(), label: 'Initial', value: 'initial' },
  { id: nanoid(), label: 'Revert', value: 'revert' },
  { id: nanoid(), label: 'Revert layer', value: 'revert-layer' },
  { id: nanoid(), label: 'Unset', value: 'unset' },
];

export const JUSTIFY_CONTENT = [
  { id: nanoid(), label: 'Center', value: 'center' },
  { id: nanoid(), label: 'Start', value: 'start' },
  { id: nanoid(), label: 'End', value: 'end' },
  { id: nanoid(), label: 'Flex start', value: 'flex-start' },
  { id: nanoid(), label: 'Flex end', value: 'flex-end' },
  { id: nanoid(), label: 'Left', value: 'left' },
  { id: nanoid(), label: 'Right', value: 'right' },
  { id: nanoid(), label: 'Normal', value: 'normal' },
  { id: nanoid(), label: 'Space between', value: 'space-between' },
  { id: nanoid(), label: 'Space around', value: 'space-around' },
  { id: nanoid(), label: 'Space evenly', value: 'space-evenly' },
  { id: nanoid(), label: 'Stretch', value: 'stretch' },
  { id: nanoid(), label: 'Safe center', value: 'safe center' },
  { id: nanoid(), label: 'Unsafe center', value: 'unsafe center' },
  { id: nanoid(), label: 'inherit', value: 'inherit' },
  { id: nanoid(), label: 'Initial', value: 'initial' },
  { id: nanoid(), label: 'Revert', value: 'revert' },
  { id: nanoid(), label: 'Revert layer', value: 'revert-layer' },
  { id: nanoid(), label: 'Unset', value: 'unset' },
];

export const JUSTIFY_SELF = [
  { id: nanoid(), label: 'Auto', value: 'auto' },
  { id: nanoid(), label: 'Normal', value: 'normal' },
  { id: nanoid(), label: 'Stretch', value: 'stretch' },
  { id: nanoid(), label: 'Center', value: 'center' },
  { id: nanoid(), label: 'Start', value: 'start' },
  { id: nanoid(), label: 'End', value: 'end' },
  { id: nanoid(), label: 'Flex start', value: 'flex-start' },
  { id: nanoid(), label: 'Flex end', value: 'flex-end' },
  { id: nanoid(), label: 'Self start', value: 'self-start' },
  { id: nanoid(), label: 'Self end', value: 'self-end' },
  { id: nanoid(), label: 'Left', value: 'left' },
  { id: nanoid(), label: 'Right', value: 'right' },
  { id: nanoid(), label: 'Baseline', value: 'baseline' },
  { id: nanoid(), label: 'First baseline', value: 'first baseline' },
  { id: nanoid(), label: 'Last baseline', value: 'last baseline' },
  { id: nanoid(), label: 'Safe center', value: 'safe center' },
  { id: nanoid(), label: 'Unsafe center', value: 'unsafe center' },
  { id: nanoid(), label: 'Inherit', value: 'inherit' },
  { id: nanoid(), label: 'Initial', value: 'initial' },
  { id: nanoid(), label: 'Revert', value: 'revert' },
  { id: nanoid(), label: 'Revert layer', value: 'revert-layer' },
  { id: nanoid(), label: 'Unset', value: 'unset' },
];

export const TEXT_JUSTIFY = [
  { id: nanoid(), label: 'None', value: 'none' },
  { id: nanoid(), label: 'Auto', value: 'auto' },
  { id: nanoid(), label: 'Inter word', value: 'inter-word' },
  { id: nanoid(), label: 'Inter character', value: 'inter-character' },
  { id: nanoid(), label: 'Distribute', value: 'distribute' },
  { id: nanoid(), label: 'Inherit', value: 'inherit' },
  { id: nanoid(), label: 'Initial', value: 'initial' },
  { id: nanoid(), label: 'Revert', value: 'revert' },
  { id: nanoid(), label: 'Revert layer', value: 'revert-layer' },
  { id: nanoid(), label: 'Unset', value: 'unset' },
];

export const ALIGN_ITEMS = [
  { id: nanoid(), label: 'Normal', value: 'normal' },
  { id: nanoid(), label: 'Center', value: 'center' },
  { id: nanoid(), label: 'Baseline', value: 'baseline' },
  { id: nanoid(), label: 'Inherit', value: 'inherit' },
  { id: nanoid(), label: 'Initial', value: 'initial' },
  { id: nanoid(), label: 'Revert', value: 'revert' },
  { id: nanoid(), label: 'Revert layer', value: 'revert-layer' },
  { id: nanoid(), label: 'Unset', value: 'unset' },
];

export const ALIGN_ITEMS_GRID = [
  { id: nanoid(), label: 'Stretch', value: 'stretch' },
  { id: nanoid(), label: 'Start', value: 'start' },
  { id: nanoid(), label: 'End', value: 'end' },
  { id: nanoid(), label: 'First baseline', value: 'first baseline' },
  { id: nanoid(), label: 'Last baseline', value: 'last baseline' },
];

export const ALIGN_ITEMS_FLEX = [
  { id: nanoid(), label: 'Flex start', value: 'flex-start' },
  { id: nanoid(), label: 'Flex end', value: 'flex-end' },
];

export const ALIGN_SELF = [
  { id: nanoid(), label: 'Auto', value: 'auto' },
  { id: nanoid(), label: 'Normal', value: 'normal' },
  { id: nanoid(), label: 'Center', value: 'center' },
  { id: nanoid(), label: 'Start', value: 'start' },
  { id: nanoid(), label: 'End', value: 'end' },
  { id: nanoid(), label: 'Self start', value: 'self-start' },
  { id: nanoid(), label: 'Self end', value: 'self-end' },
  { id: nanoid(), label: 'Flex start', value: 'flex-start' },
  { id: nanoid(), label: 'Flex end', value: 'flex-end' },
  { id: nanoid(), label: 'Baseline', value: 'baseline' },
  { id: nanoid(), label: 'First baseline', value: 'first baseline' },
  { id: nanoid(), label: 'Last baseline', value: 'last baseline' },
  { id: nanoid(), label: 'Stretch', value: 'stretch' },
  { id: nanoid(), label: 'Safe center', value: 'safe center' },
  { id: nanoid(), label: 'Unsafe center', value: 'unsafe center' },
  { id: nanoid(), label: 'Inherit', value: 'inherit' },
  { id: nanoid(), label: 'Initial', value: 'initial' },
  { id: nanoid(), label: 'Revert', value: 'revert' },
  { id: nanoid(), label: 'Revert layer', value: 'revert-layer' },
  { id: nanoid(), label: 'Unset', value: 'unset' },
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
    borderStyle = 'none',
    borderWidth = '1px',
    shadowStyle,
    display = 'flex'
  } = prev || {};


  const isBelow = shadowStyle === 'below';
  const isAbove = shadowStyle === 'above';

  return {
    background: {
      type: 'color',
      color: 'transparent',

    },
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
    display: display,
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
