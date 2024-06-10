import { IConfigurableFormComponent } from '@/providers/form/models';
import { AlignItems } from '../container/interfaces';

export interface IColumnProps {
  id: string;
  flex: number;
  offset: number;
  push: number;
  pull: number;
  components: IConfigurableFormComponent[];
}


export interface KeyInfomationBarItemProps {
  id: string;
  width: number;
  gap: number;
  textAlign: 'left' | 'center' | 'right' | 'justify' | 'initial' | 'inherit' | 'start' | 'end';
  components: IConfigurableFormComponent[];
}

export interface IKeyInformationBarProps extends IConfigurableFormComponent, IColumnProps {
  width?: string;
  height?: string;
  dividerHeight?: string;
  space?: number;
  formData?: any;
  alignItems?: AlignItems;
  columnWidth?: string;
  barWidth?: string;
  barHeight?: string;
  vertical?: boolean;
  columns?: KeyInfomationBarItemProps[];
  readOnly?: boolean;
  style?: string;
  stylingBox?: any;
}
