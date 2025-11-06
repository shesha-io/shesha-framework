import { IConfigurableFormComponent } from '@/providers/form/models';
import { IEntityTypeIndentifier } from '@/providers/sheshaApplication/publicApi/entities/models';

export interface IQueryBuilderComponentProps extends IConfigurableFormComponent {
  jsonExpanded?: boolean;
  modelType?: string | IEntityTypeIndentifier;
  fieldsUnavailableHint?: string;
}
