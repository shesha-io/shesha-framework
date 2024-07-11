import { IConfigurableFormComponent } from '@/providers/form/models';
import { AlignItems } from '../container/interfaces';

export interface KeyInfomationBarItemProps {
  id: string;
  width: number;
  flexDirection?: 'row' | 'column';
  textAlign?: 'center' | 'inherit' | 'start' | 'end';
  components: IConfigurableFormComponent[];
  padding?: string;
}

export interface IKeyInformationBarProps extends IConfigurableFormComponent {
  width?: string;
  height?: string;
  dividerHeight?: string;
  dividerWidth?: string;
  dividerMargin?: number;
  dividerColor?: string;
  dividerThickness?: string;
  gap?: number;
  alignItems?: AlignItems;
  orientation?: 'horizontal' | 'vertical';
  columns?: KeyInfomationBarItemProps[];
  readOnly?: boolean;
  style?: string;
  stylingBox?: any;
  backgroundColor?: string;
}
