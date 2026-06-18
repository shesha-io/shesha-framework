import { IConfigurableFormComponent, IStyleType } from '@/providers';
import { IBorderType } from '../_settings/utils/border/interfaces';

export interface ISizableColumnInputProps extends IStyleType {
  borderSize?: string | number | undefined;
  borderRadius?: number | undefined;
  borderType?: IBorderType | undefined;
  borderColor?: string | undefined;
  stylingBox?: string | undefined;
  height?: string | number | undefined;
  width?: string | number | undefined;
  backgroundColor?: string | undefined;
  hideBorder?: boolean | undefined;
  columns?: ISizableColumnProps[] | undefined;
}

export interface ISizableColumnProps {
  id: string;
  size: number;
  components: IConfigurableFormComponent[];
}

export interface ISizableColumnComponentProps extends IConfigurableFormComponent, ISizableColumnInputProps { }
