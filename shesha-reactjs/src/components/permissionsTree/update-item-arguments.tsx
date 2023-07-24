import { nanoid } from "nanoid";
import { DesignerToolbarSettings } from "interfaces/toolbarSettings";

export interface IUpdateItemArguments {
  name: string;
  displayName: string;
  description?: string | null | undefined;
}

export const updateItemArgumentsForm = new DesignerToolbarSettings()
  .addTextField({
    id: nanoid(),
    propertyName: 'name',
    label: 'Name',
    validate: { required: true },
  })
  .addTextField({
    id: nanoid(),
    propertyName: 'displayName',
    label: 'Display Name',
    validate: { required: true },
  })
  .addTextField({
    id: nanoid(),
    propertyName: 'description',
    label: 'Description',
  })
  .toJson();