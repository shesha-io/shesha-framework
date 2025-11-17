import { EntityIdentifier, EntityTypeAutocompleteType } from "@/components/configurableItemAutocomplete/entityTypeAutocomplete";
import { IConfigurableFormComponent, IToolboxComponent } from "@/interfaces";

export interface IEntityTypeAutocompleteComponentProps extends IConfigurableFormComponent {
  entityTypeAutocompleteType?: EntityTypeAutocompleteType;
  baseModel?: EntityIdentifier;
}

export type EntityTypeAutocompleteComponentDefinition = IToolboxComponent<IEntityTypeAutocompleteComponentProps, IEntityTypeAutocompleteComponentProps>;
