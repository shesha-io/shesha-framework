import { CSSProperties } from 'react';
import { ComponentDefinition, FilterExpression } from '@/interfaces';
import { IConfigurableFormComponent, IInputStyles, FormIdentifier } from '@/providers/form/models';
import { IConfigurableColumnsProps } from '@/providers/datatableColumnsConfigurator/models';
import { ModalFooterButtons } from '@/providers/dynamicModal/models';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';

export interface IEntityPickerComponentProps extends IConfigurableFormComponent, IInputStyles {
  placeholder?: string | undefined;
  items: IConfigurableColumnsProps[];
  hideBorder?: boolean | undefined;
  valueFormat?: 'simple' | 'entityReference' | 'custom' | undefined;
  incomeCustomJs?: string | undefined;
  outcomeCustomJs?: string | undefined;
  mode?: 'single' | 'multiple' | 'tags' | undefined;
  entityType: string | IEntityTypeIdentifier;
  filters?: FilterExpression | undefined;
  title?: string | undefined;
  displayEntityKey?: string | undefined;
  allowNewRecord?: boolean | undefined;
  modalFormId?: FormIdentifier | undefined;
  modalTitle?: string | undefined;
  showModalFooter?: boolean | undefined;
  modalWidth?: number | string | 'custom' | undefined;
  customWidth?: number | undefined;
  widthUnits?: string | undefined;
  addNewModalWidth?: number | string | 'custom' | undefined;
  addNewCustomWidth?: number | undefined;
  addNewWidthUnits?: string | undefined;
  buttons?: ButtonGroupItemProps[] | undefined;
  footerButtons?: ModalFooterButtons | undefined;
  dividerWidth?: string | undefined;
  dividerStyle?: CSSProperties['borderLeftStyle'] | undefined;
  dividerColor?: string | undefined;
  /** Text shown in the picker when it is read-only and no entity is selected. */
  readOnlyPlaceholder?: string | undefined;
}

export type EntityPickerComponentDefinition = ComponentDefinition<"entityPicker", IEntityPickerComponentProps>;
