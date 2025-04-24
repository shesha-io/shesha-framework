import { ContainerDirection } from '@/components/formDesigner/common/interfaces';
import { IConfigurableFormComponent, IInputStyles, OverflowType } from '@/providers/form/models';

export type JustifyContent =
  | 'center'
  | 'start'
  | 'end'
  | 'flex-start'
  | 'flex-end'
  | 'left'
  | 'right'
  | 'normal'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
  | 'stretch'
  | 'safe center'
  | 'unsafe center'
  | 'inherit'
  | 'initial'
  | 'revert'
  | 'revert-layer'
  | 'unset';

export type JustifyItems =
  | 'normal'
  | 'stretch'
  | 'center'
  | 'start'
  | 'end'
  | 'flex-start'
  | 'flex-end'
  | 'self-start'
  | 'self-end'
  | 'left'
  | 'right'
  | 'baseline'
  | 'first baseline'
  | 'last baseline'
  | 'safe center'
  | 'unsafe center'
  | 'legacy right'
  | 'legacy left'
  | 'legacy center'
  | 'inherit'
  | 'initial'
  | 'revert'
  | 'revert-layer'
  | 'unset';

export type FlexDirection =
  | 'row'
  | 'row-reverse'
  | 'column'
  | 'column-reverse'
  | 'inherit'
  | 'initial'
  | 'revert'
  | 'revert-layer'
  | 'unset';

export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse' | 'inherit' | 'initial' | 'revert' | 'revert-layer' | 'unset';

export type JustifySelf =
  | 'auto'
  | 'normal'
  | 'stretch'
  | 'center;'
  | 'start'
  | 'end'
  | 'flex-start'
  | 'flex-end; '
  | 'self-start'
  | 'self-end'
  | 'left'
  | 'right;'
  | 'baseline'
  | 'first baseline'
  | 'last baseline'
  | 'safe center'
  | 'unsafe center'
  | 'inherit'
  | 'initial'
  | 'revert'
  | 'revert-layer'
  | 'unset';

export type TextJustify =
  // | 'none'
  | 'auto'
  | 'inter-word'
  | 'inter-character'
  | 'distribute'
  | 'inherit'
  | 'initial'
  | 'revert'
  | 'revert-layer'
  | 'unset';

export type AlignItems =
  | 'normal'
  | 'stretch'
  | 'center'
  | 'start'
  | 'end'
  | 'flex-start'
  | 'flex-end'
  | 'baseline'
  | 'first baseline'
  | 'last baseline'
  | 'safe center'
  | 'unsafe center'
  | 'inherit'
  | 'initial'
  | 'revert'
  | 'revert-layer'
  | 'unset';

export type AlignSelf =
  | 'auto'
  | 'normal'
  | 'center'
  | 'start'
  | 'end'
  | 'self-start'
  | 'self-end'
  | 'flex-start'
  | 'flex-end'
  | 'baseline'
  | 'first baseline'
  | 'last baseline'
  | 'stretch'
  | 'safe center'
  | 'unsafe center'
  | 'inherit'
  | 'initial'
  | 'revert'
  | 'revert-layer'
  | 'unset';

export type ShadowStyleType = 'none' | 'above' | 'below';

export interface ICommonContainerProps extends Omit<IInputStyles, 'style'> {
  display?: 'block' | 'flex' | 'grid' | 'inline-grid';
  direction?: ContainerDirection;
  flexWrap?: FlexWrap;
  flexDirection?: FlexDirection;
  justifyContent?: JustifyContent;
  alignItems?: AlignItems;
  alignSelf?: AlignSelf;
  justifyItems?: JustifyItems;
  textJustify?: TextJustify;
  justifySelf?: JustifySelf;
  noDefaultStyling?: boolean;
  gridColumnsCount?: number;
  gap?: string | number;
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  height?: string | number;
  minHeight?: string | number;
  maxHeight?: string | number;
  borderWidth?: string | number;
  maxRadius?: string;
  borderColor?: string;
  borderStyle?: string;
  borderRadius?: string | number;
  overflow?: OverflowType;
  shadowStyle?: string;
  style?: React.CSSProperties;
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
