import { IConfigurableFormComponent, IStyleType } from '@/providers/form/models';

export interface IColumnProps {
  id: string;
  flex: number;
  offset: number;
  push: number;
  pull: number;
  components: IConfigurableFormComponent[];
}

export interface IColumnsInputProps extends IStyleType {
  borderSize?: string | number;
  borderRadius?: number;
  borderType?: string;
  borderColor?: string;
  stylingBox?: string;
  height?: string | number;
  width?: string | number;
  backgroundColor?: string;
  hideBorder?: boolean;
  columns?: IColumnProps[];
  gutterX?: number;
  gutterY?: number;
}

export interface IColumnsComponentProps extends IConfigurableFormComponent, IColumnsInputProps {
  style?: string;
  customVisibility?: string;
}
