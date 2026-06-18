import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';

export interface IExpressionEditorComponentProps extends IConfigurableFormComponent {
  placeholder?: string;
  value?: string;
}

export type ExpressionEditorComponentDefinition = ComponentDefinition<'expressionEditor', IExpressionEditorComponentProps>;
