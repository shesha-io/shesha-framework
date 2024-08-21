import { IConfigurableFormComponent } from '@/providers/form/models';

export interface IColumnProps {
  id: string;
  flex: number;
  offset: number;
  push: number;
  pull: number;
  components: IConfigurableFormComponent[];
}

export interface IColumnsComponentProps extends IConfigurableFormComponent {
  columns: IColumnProps[];
  gutterX?: number;
  gutterY?: number;
  style?: string;
  customVisibility?: string;
}
