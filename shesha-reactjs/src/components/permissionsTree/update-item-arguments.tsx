import { nanoid } from '@/utils/uuid';
import { DesignerToolbarSettings } from "@/interfaces/toolbarSettings";

export interface IUpdateItemArguments {
  name: string;
  displayName: string;
  description?: string | null | undefined;
  moduleId?: string | null | undefined;
  moduleName?: string | null | undefined;
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
  .addTextField({
    id: nanoid(),
    propertyName: 'moduleId',
    label: 'Module id',
  })
  .addTextField({
    id: nanoid(),
    propertyName: 'moduleName',
    label: 'Module name',
  })
  .toJson();
