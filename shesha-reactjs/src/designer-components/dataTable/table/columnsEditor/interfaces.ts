import { IConfigurableFormComponent } from '@/interfaces';
import { IEntityTypeIndentifier } from '@/providers/sheshaApplication/publicApi/entities/models';

export interface IColumnsEditorComponentProps extends IConfigurableFormComponent {
  // items: ColumnsItemProps[];
  modelType: string | IEntityTypeIndentifier;
}
