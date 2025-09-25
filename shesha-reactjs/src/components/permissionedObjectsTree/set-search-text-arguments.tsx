import { nanoid } from '@/utils/uuid';
import { DesignerToolbarSettings } from "@/interfaces/toolbarSettings";

export interface ISetSearchTextArguments {
  searchText?: string;
}

export const setSearchTextArgumentsForm = new DesignerToolbarSettings()
  .addTextField({
    id: nanoid(),
    propertyName: 'searchText',
    label: 'Search text',
  })
  .toJson();
