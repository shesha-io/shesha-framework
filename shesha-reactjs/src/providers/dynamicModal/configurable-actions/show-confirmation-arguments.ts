import { nanoid } from "nanoid";
import { DesignerToolbarSettings } from "../../../interfaces/toolbarSettings";

export interface IShowConfigrmationArguments {
  title: string;
  content: string;
  okText?: string;
  cancelText?: string;
  danger: boolean;
}

export const showConfirmationArgumentsForm = new DesignerToolbarSettings()
  .addTextField({
    id: nanoid(),
    name: 'title',
    label: 'Title',
    validate: { required: true },
  })
  .addTextField({
    id: nanoid(),
    name: 'content',
    label: 'Content',
    validate: { required: true },
  })
  .addTextField({
    id: nanoid(),
    name: 'okText',
    label: 'Ok text',
    validate: { required: true },
  })
  .addTextField({
    id: nanoid(),
    name: 'cancelText',
    label: 'Cancel text',
    validate: { required: true },
  })
  .addCheckbox({
    id: nanoid(),
    name: "danger",
    label: "Danger",
  })
  .toJson();