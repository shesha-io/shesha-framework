import { nanoid } from 'nanoid';
import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';

export interface IShowConfirmationArguments {
  title: string;
  content: string;
  okText?: string;
  cancelText?: string;
  danger: boolean;
}

export const showConfirmationArgumentsForm = new DesignerToolbarSettings()
  .addTextField({
    id: nanoid(),
    propertyName: 'title',
    label: 'Title',
    validate: { required: true },
  })
  .addTextField({
    id: nanoid(),
    propertyName: 'content',
    label: 'Content',
    validate: { required: true },
  })
  .addTextField({
    id: nanoid(),
    propertyName: 'okText',
    label: 'Ok text',
    validate: { required: true },
  })
  .addTextField({
    id: nanoid(),
    propertyName: 'cancelText',
    label: 'Cancel text',
    validate: { required: true },
  })
  .addCheckbox({
    id: nanoid(),
    propertyName: "danger",
    label: "Danger",
  })
  .toJson();
