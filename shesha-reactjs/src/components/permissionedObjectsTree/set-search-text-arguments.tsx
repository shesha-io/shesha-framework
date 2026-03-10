import { nanoid } from '@/utils/uuid';
import { FormMarkupFactory } from '@/interfaces/configurableAction';

export interface ISetSearchTextArguments {
  searchText?: string;
}

export const setSearchTextArgumentsForm: FormMarkupFactory = ({ fbf }) => {
  return fbf().addTextField({
    id: nanoid(),
    propertyName: 'searchText',
    label: 'Search text',
  })
    .toJson();
};
