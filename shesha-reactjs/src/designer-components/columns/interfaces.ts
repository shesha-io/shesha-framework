import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent, IStyleType } from '@/providers/form/models';
import { IBorderType } from '../_settings/utils/border/interfaces';

export interface IColumnProps {
  id: string;
  flex: number;
  offset: number;
  push: number;
  pull: number;
  components: IConfigurableFormComponent[];
}

export interface IColumnsInputProps extends IStyleType {
  borderSize?: string | number | undefined;
  borderRadius?: number | undefined;
  borderType?: IBorderType | undefined;
  borderColor?: string | undefined;
  stylingBox?: string | undefined;
  height?: string | number | undefined;
  width?: string | number | undefined;
  backgroundColor?: string | undefined;
  hideBorder?: boolean | undefined;
  columns?: IColumnProps[] | undefined;
  gutterX?: number | undefined;
  gutterY?: number | undefined;
}

export interface IColumnsComponentProps extends IConfigurableFormComponent, IColumnsInputProps {
  style?: string | undefined;
  customVisibility?: string | undefined;
}

export type ColumnsComponentDefinition = ComponentDefinition<"columns", IColumnsComponentProps>;
