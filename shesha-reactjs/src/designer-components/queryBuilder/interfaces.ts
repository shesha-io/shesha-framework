import { IConfigurableFormComponent } from '@/providers/form/models';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';

export interface IQueryBuilderComponentProps extends IConfigurableFormComponent {
  jsonExpanded?: boolean;
  modelType?: string | IEntityTypeIdentifier;
  fieldsUnavailableHint?: string;
}
