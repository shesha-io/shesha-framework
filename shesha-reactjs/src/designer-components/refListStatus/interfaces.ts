import { RefListDisplayValue } from '@/components/refListDisplaySelector/models';
import { ComponentDefinition } from '@/interfaces';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { IConfigurableFormComponent, IInputStyles, IPropertySetting } from '@/providers/form/models';

/**
 * Model as it was before the refactor. Kept for the migrator steps that were released against it —
 * those steps must keep type-checking against the shape they were written for.
 */
export interface IRefListStatusComponentPropsV1 extends IConfigurableFormComponent, IInputStyles {
  referenceListId?: IReferenceListIdentifier | undefined;
  showIcon?: boolean | undefined;
  solidBackground?: boolean | undefined;
  showReflistName?: boolean | undefined;
}

export interface IRefListStatusComponentProps extends IConfigurableFormComponent, IInputStyles {
  referenceListId?: IReferenceListIdentifier | undefined;
  /**
   * Whether the item's name, its icon, or both are shown. A JS setting supplies the flags directly
   * instead of a mode - see `RefListDisplayValue`. Replaces the `showReflistName` and `showIcon`
   * switches, which V1 kept as a pair.
   */
  itemDisplay?: RefListDisplayValue | IPropertySetting<RefListDisplayValue> | undefined;
  solidBackground?: boolean | undefined;
}

export type RefListStatusComponentDefinition = ComponentDefinition<'refListStatus', IRefListStatusComponentProps>;
