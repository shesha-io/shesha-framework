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

export interface IDropdownComponentProps extends Omit<IDropdownProps, "style" | "readOnly" | "value" | "onChange">, IConfigurableFormComponent, IInputStyles {
}

export type DropdownComponentDefinition = ComponentDefinition<"dropdown", IDropdownComponentProps>;
