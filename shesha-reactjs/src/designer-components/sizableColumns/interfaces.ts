import { IConfigurableFormComponent, IStyleType } from '@/providers';

export interface ISizableColumnInputProps extends IStyleType {
  borderSize?: string | number;
  borderRadius?: number;
  borderType?: string;
  borderColor?: string;
  stylingBox?: string;
  height?: string | number;
  width?: string | number;
  backgroundColor?: string;
  hideBorder?: boolean;
  columns?: ISizableColumnProps[];
}

export interface ISizableColumnProps {
  id: string;
  size: number;
  components: IConfigurableFormComponent[];
}

export interface ISizableColumnComponentProps extends IConfigurableFormComponent, ISizableColumnInputProps { }
