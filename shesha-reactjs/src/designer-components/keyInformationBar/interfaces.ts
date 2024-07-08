import { IConfigurableFormComponent } from '@/providers/form/models';
import { AlignItems } from '../container/interfaces';

export interface KeyInfomationBarItemProps {
  id: string;
  width: number;
  flexDirection?: 'row' | 'column';
  textAlign: 'left' | 'center' | 'right' | 'justify' | 'initial' | 'inherit' | 'start' | 'end';
  components: IConfigurableFormComponent[];
}

export interface IKeyInformationBarProps extends IConfigurableFormComponent {
  width?: string;
  height?: string;
  dividerHeight?: string;
  dividerWidth?: string;
  dividerMargin?: number;
  dividerColor?: string;
  gap?: number;
  alignItems?: AlignItems;
  orientation?: 'horizontal' | 'vertical';
  columns?: KeyInfomationBarItemProps[];
  readOnly?: boolean;
  style?: string;
  stylingBox?: any;
}
