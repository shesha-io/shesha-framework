import { nanoid } from '@/utils/uuid';
import { DesignerToolbarSettings } from "@/interfaces/toolbarSettings";

export interface ISetGroupingArguments {
  group?: string;
}

export const setGroupingArgumentsForm = new DesignerToolbarSettings()
  .addTextField({
    id: nanoid(),
    propertyName: 'group',
    label: 'Group',
  })
  .toJson();
