import { ContainerDirection } from '@/components/formDesigner/common/interfaces';
import { ComponentDefinition } from '@/interfaces';
import { StringSubtype } from '@/interfaces/utilityTypes';
import { IConfigurableFormComponent, IInputStyles } from '@/providers/form/models';

export const JUSTIFY_CONTENTS = [
  'center',
  'center',
  'start',
  'end',
  'flex-start',
  'flex-end',
  'left',
  'right',
  'normal',
  'space-between',
  'space-around',
  'space-evenly',
  'stretch',
  'safecenter',
  'unsafecenter',
  'inherit',
  'initial',
  'revert',
  'revert-layer',
  'unset',
] as const;

export type JustifyContent = StringSubtype<typeof JUSTIFY_CONTENTS>;

export type JustifyItems =
  | 'normal' |
  'stretch' |
  'center' |
  'start' |
  'end' |
  'flex-start' |
  'flex-end' |
  'self-start' |
  'self-end' |
  'left' |
  'right' |
  'baseline' |
  'first baseline' |
  'last baseline' |
  'safe center' |
  'unsafe center' |
  'legacy right' |
  'legacy left' |
  'legacy center' |
  'inherit' |
  'initial' |
  'revert' |
  'revert-layer' |
  'unset';

export type FlexDirection =
  | 'row' |
  'row-reverse' |
  'column' |
  'column-reverse' |
  'inherit' |
  'initial' |
  'revert' |
  'revert-layer' |
  'unset';

export const FLEX_WRAPS = ['nowrap', 'wrap', 'wrap-reverse', 'inherit', 'initial', 'revert', 'revert-layer', 'unset'] as const;
export type FlexWrap = StringSubtype<typeof FLEX_WRAPS>;

export type JustifySelf =
  | 'auto' |
  'normal' |
  'stretch' |
  'center;' |
  'start' |
  'end' |
  'flex-start' |
  'flex-end; ' |
  'self-start' |
  'self-end' |
  'left' |
  'right;' |
  'baseline' |
  'first baseline' |
  'last baseline' |
  'safe center' |
  'unsafe center' |
  'inherit' |
  'initial' |
  'revert' |
  'revert-layer' |
  'unset';

export type TextJustify =
  // | 'none'
  | 'auto' |
  'inter-word' |
  'inter-character' |
  'distribute' |
  'inherit' |
  'initial' |
  'revert' |
  'revert-layer' |
  'unset';

export type AlignItems =
  | 'normal' |
  'stretch' |
  'center' |
  'start' |
  'end' |
  'flex-start' |
  'flex-end' |
  'baseline' |
  'first baseline' |
  'last baseline' |
  'safe center' |
  'unsafe center' |
  'inherit' |
  'initial' |
  'revert' |
  'revert-layer' |
  'unset';

export type AlignSelf =
  | 'auto' |
  'normal' |
  'center' |
  'start' |
  'end' |
  'self-start' |
  'self-end' |
  'flex-start' |
  'flex-end' |
  'baseline' |
  'first baseline' |
  'last baseline' |
  'stretch' |
  'safe center' |
  'unsafe center' |
  'inherit' |
  'initial' |
  'revert' |
  'revert-layer' |
  'unset';

export type ShadowStyleType = 'none' | 'above' | 'below';

export const DISPLAY_TYPES = ['block', 'flex', 'grid', 'inline-grid'] as const;
export type DisplayType = StringSubtype<typeof DISPLAY_TYPES>;

export interface ICommonContainerProps extends Omit<IInputStyles, 'style'> {
  display?: DisplayType | undefined;
  direction?: ContainerDirection | undefined;
  flexWrap?: FlexWrap | undefined;
  flexDirection?: FlexDirection | undefined;
  justifyContent?: JustifyContent | undefined;
  alignItems?: AlignItems | undefined;
  alignSelf?: AlignSelf | undefined;
  justifyItems?: JustifyItems | undefined;
  textJustify?: TextJustify | undefined;
  justifySelf?: JustifySelf | undefined;
  noDefaultStyling?: boolean | undefined;
  gridColumnsCount?: number | undefined;
  gap?: string | number | undefined;
  width?: string | number | undefined;
  minWidth?: string | number | undefined;
  maxWidth?: string | number | undefined;
  height?: string | number | undefined;
  minHeight?: string | number | undefined;
  maxHeight?: string | number | undefined;
  borderWidth?: string | number | undefined;
  maxRadius?: string | undefined;
  borderColor?: string | undefined;
  borderRadius?: string | number | undefined;
  shadowStyle?: string | undefined;
  style?: React.CSSProperties | undefined;
}

export const IMAGE_SOURCE_TYPES = ['storedFileId', 'base64', 'url'] as const;
export type ImageSourceType = StringSubtype<typeof IMAGE_SOURCE_TYPES>;

export interface IContainerComponentProps extends IConfigurableFormComponent, Omit<ICommonContainerProps, 'style'> {
  backgroundCover?: 'contain' | 'cover' | undefined;
  backgroundRepeat?: 'repeat' | 'no-repeat' | 'repeat-x' | 'repeat-y' | 'round' | undefined;
  className?: string | undefined;
  wrapperStyle?: string | undefined;
  components: IConfigurableFormComponent[]; // Only important for fluent API
  backgroundType?: 'image' | 'color' | undefined;
  backgroundColor?: string | undefined;
  backgroundDataSource?: ImageSourceType | undefined;
  backgroundUrl?: string | undefined;
  backgroundBase64?: string | undefined;
  backgroundStoredFileId?: string | undefined;
  // desktop?: IInputStyles | undefined;
  // tablet?: IInputStyles | undefined;
  // mobile?: IInputStyles | undefined;
  showAdvanced?: boolean;
}

export type ContainerComponentDefinition = ComponentDefinition<"container", IContainerComponentProps> & {
  /** Static empty array to prevent unnecessary re-renders when isDynamic is false */
  emptyComponents?: [];
};
