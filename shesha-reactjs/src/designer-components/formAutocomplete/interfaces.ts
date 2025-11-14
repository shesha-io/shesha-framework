import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';

export type IFormAutocompleteComponentProps = IConfigurableFormComponent;

export type FormAutocompleteComponentDefinition = ComponentDefinition<"formAutocomplete", IFormAutocompleteComponentProps>;
