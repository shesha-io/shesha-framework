import { IConfigurableFormComponent } from '@/interfaces';
import { ITableComponentBaseProps } from '../models';

export interface IColumnsEditorComponentProps extends ITableComponentBaseProps, IConfigurableFormComponent {
  //items: ColumnsItemProps[];
  modelType: string;
}
