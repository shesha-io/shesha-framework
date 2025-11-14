import { EntityIdentifier, EntityTypeAutocompleteType } from "@/components/configurableItemAutocomplete/entityTypeAutocomplete";
import { ComponentDefinition, IConfigurableFormComponent } from "@/interfaces";

export interface IEntityTypeAutocompleteComponentProps extends IConfigurableFormComponent {
  entityTypeAutocompleteType?: EntityTypeAutocompleteType;
  baseModel?: EntityIdentifier;
}

export type EntityTypeAutocompleteComponentDefinition = ComponentDefinition<"entityTypeAutocomplete", IEntityTypeAutocompleteComponentProps, IEntityTypeAutocompleteComponentProps>;
