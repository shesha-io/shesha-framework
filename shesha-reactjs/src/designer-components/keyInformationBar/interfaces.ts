import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent, IInputStyles } from '@/providers/form/models';
import { AlignItems } from '../container/interfaces';

export interface KeyInfomationBarItemProps {
  id: string;
  width: number;
  flexDirection?: 'row' | 'column' | undefined;
  textAlign?: 'center' | 'inherit' | 'start' | 'end' | undefined;
  components: IConfigurableFormComponent[];
  padding?: string | undefined;
}

export interface IKeyInformationBarComponentProps extends IConfigurableFormComponent, IInputStyles {
  width?: string | undefined;
  height?: string | undefined;
  dividerHeight?: string | undefined;
  dividerWidth?: string | undefined;
  dividerMargin?: number | undefined;
  dividerColor?: string | undefined;
  dividerThickness?: string | undefined;
  gap?: number | undefined;
  alignItems?: AlignItems | undefined;
  orientation?: 'horizontal' | 'vertical' | undefined;
  columns?: KeyInfomationBarItemProps[] | undefined;
  readOnly?: boolean | undefined;
  style?: string | undefined;
  stylingBox?: string | undefined;
  backgroundColor?: string | undefined;
}

export type KeyInformationBarComponentDefinition = ComponentDefinition<"KeyInformationBar", IKeyInformationBarComponentProps>;
