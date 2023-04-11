import { IConfigurableFormComponent } from '../../../../providers/form/models';
import { ContainerDirection } from '../../common/interfaces';

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
  | 'center  '
  | 'start '
  | 'end  '
  | 'flex-start'
  | 'flex-end'
  | 'self-start'
  | 'self-end'
  | 'left  '
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
  | 'left;  '
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

export interface ICommonContainerProps {
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
}

export interface IContainerComponentProps extends IConfigurableFormComponent, ICommonContainerProps {
  className?: string;
  wrapperStyle?: string;
  components: IConfigurableFormComponent[]; // Only important for fluent API
}