import { ContainerDirection } from '@/components/formDesigner/common/interfaces';
import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent, IInputStyles } from '@/providers/form/models';

export type JustifyContent =
  | 'center' |
  'start' |
  'end' |
  'flex-start' |
  'flex-end' |
  'left' |
  'right' |
  'normal' |
  'space-between' |
  'space-around' |
  'space-evenly' |
  'stretch' |
  'safe center' |
  'unsafe center' |
  'inherit' |
  'initial' |
  'revert' |
  'revert-layer' |
  'unset';

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

export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse' | 'inherit' | 'initial' | 'revert' | 'revert-layer' | 'unset';

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

export interface ICommonContainerProps extends Omit<IInputStyles, 'style'> {
  display?: 'block' | 'flex' | 'grid' | 'inline-grid' | undefined;
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
  borderStyle?: string | undefined;
  borderRadius?: string | number | undefined;
  shadowStyle?: string | undefined;
  style?: React.CSSProperties | undefined;
}

export interface IContainerComponentProps extends IConfigurableFormComponent, Omit<ICommonContainerProps, 'style'> {
  backgroundCover?: 'contain' | 'cover';
  backgroundRepeat?: 'repeat' | 'no-repeat' | 'repeat-x' | 'repeat-y' | 'round';
  className?: string;
  wrapperStyle?: string;
  components: IConfigurableFormComponent[]; // Only important for fluent API
  backgroundType?: 'image' | 'color';
  backgroundColor?: string;
  backgroundDataSource?: 'storedFileId' | 'base64' | 'url';
  backgroundUrl?: string;
  backgroundBase64?: string;
  backgroundStoredFileId?: string;
  desktop?: any;
  tablet?: any;
  mobile?: any;
  showAdvanced?: boolean;
}

export type ContainerComponentDefinition = ComponentDefinition<"container", IContainerComponentProps> & {
  /** Static empty array to prevent unnecessary re-renders when isDynamic is false */
  emptyComponents?: [];
};
