import { IConfigurableFormComponent } from '@/interfaces';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';

export interface IColumnsEditorComponentProps extends IConfigurableFormComponent {
  // items: ColumnsItemProps[];
  modelType: string | IEntityTypeIdentifier;
}
