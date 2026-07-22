import { nanoid } from '@/utils/uuid';
import { FormMarkupFactory } from '@/interfaces/configurableAction';

export interface ISetGroupingArguments {
  group?: string;
}

export const getSetGroupingArgumentsForm: FormMarkupFactory = ({ fbf }) => {
  return fbf().addTextField({
    id: nanoid(),
    propertyName: 'group',
    label: 'Group',
  })
    .toJson();
};
