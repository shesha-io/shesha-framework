import { nanoid } from '@/utils/uuid';
import { DesignerToolbarSettings } from "@/interfaces/toolbarSettings";

export interface IUpdateItemArguments {
  object?: string;
  category: string;
  access: string;
  description?: string | null | undefined;
}

export const updateItemArgumentsForm = new DesignerToolbarSettings()
  .addTextField({
    id: nanoid(),
    propertyName: 'object',
    label: 'Object',
    validate: { required: true },
  })
  .addTextField({
    id: nanoid(),
    propertyName: 'category',
    label: 'Category',
  })
  .addTextField({
    id: nanoid(),
    propertyName: 'description',
    label: 'Description',
  })
  .addTextField({
    id: nanoid(),
    propertyName: 'access',
    label: 'Access',
    validate: { required: true },
  })
  .toJson();
