import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';

export type IReferenceListAutocompleteComponentProps = IConfigurableFormComponent;

export type ReferenceListAutocompleteComponentDefinition = ComponentDefinition<"referenceListAutocomplete", IReferenceListAutocompleteComponentProps>;
