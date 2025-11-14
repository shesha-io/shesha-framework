import { IConfigurableFormComponent, IToolboxComponent } from '@/interfaces';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';

export interface IColumnsEditorComponentProps extends IConfigurableFormComponent {
  modelType: string | IEntityTypeIdentifier;
}

export type ColumnsEditorComponentDefinition = IToolboxComponent<IColumnsEditorComponentProps>;
