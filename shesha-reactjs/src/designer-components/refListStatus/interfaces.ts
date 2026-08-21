import { ComponentDefinition } from '@/interfaces';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { IConfigurableFormComponent, IInputStyles } from '@/providers/form/models';

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
  showIcon?: boolean | undefined;
  solidBackground?: boolean | undefined;
  showReflistName?: boolean | undefined;
}

export type RefListStatusComponentDefinition = ComponentDefinition<'refListStatus', IRefListStatusComponentProps>;
