import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent, UnwrapCodeEvaluators } from '@/providers/form/models';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';

export interface IQueryBuilderComponentProps extends IConfigurableFormComponent {
  jsonExpanded?: boolean | undefined;
  modelType?: string | IEntityTypeIdentifier | undefined;
  fieldsUnavailableHint?: string | undefined;
}
export type IQueryBuilderComponentPropsUnwrapped = UnwrapCodeEvaluators<IQueryBuilderComponentProps>;

export type QueryBuilderCalculatedProps = {
  modelType: string | IEntityTypeIdentifier | undefined;
};

export type QueryBuilderComponentDefinition = ComponentDefinition<"queryBuilder", IQueryBuilderComponentProps, QueryBuilderCalculatedProps>;
