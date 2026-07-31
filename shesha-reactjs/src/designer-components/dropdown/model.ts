import { IConfigurableFormComponent, IInputStyles } from '@/providers/form/models';
import { IDropdownProps } from '@/components/dropdown/model';
import { ComponentDefinition } from '@/interfaces';
import { StringSubtype } from '@/interfaces/utilityTypes';

export const DATA_SOURCE_TYPES = ['values', 'referenceList', 'url'] as const;
export type DataSourceType = StringSubtype<typeof DATA_SOURCE_TYPES>;

export interface ILabelValue<TValue = unknown> {
  id: string;
  label: string;
  value: TValue;
}

/**
 * Runtime plumbing supplied by the Factory rather than configured on the form: the emotion class,
 * the ref backing the API's `focus()`, the handlers from `getComponentEvents`, and the style model
 * handed to the read-only renderer. They are not settings, so they stay out of the component model.
 */
type DropdownRuntimeProps = 'className' | 'events' | 'selectRef' | 'styleValue';

export interface IDropdownComponentProps extends Omit<IDropdownProps, "style" | "readOnly" | "value" | "onChange" | DropdownRuntimeProps>, IConfigurableFormComponent, IInputStyles {
}

export type DropdownComponentDefinition = ComponentDefinition<"dropdown", IDropdownComponentProps>;
