import { FormMarkupFactory } from '@/interfaces/configurableAction';

export interface IUpdateItemArguments {
  name: string;
  displayName: string;
  description?: string | null | undefined;
  moduleId?: string | null | undefined;
  moduleName?: string | null | undefined;
}

export const updateItemArgumentsForm: FormMarkupFactory = ({ fbf }) => {
  return fbf().addTextField({
    propertyName: 'name',
    label: 'Name',
    validate: { required: true },
  })
    .addTextField({
      propertyName: 'displayName',
      label: 'Display Name',
      validate: { required: true },
    })
    .addTextField({
      propertyName: 'description',
      label: 'Description',
    })
    .addTextField({
      propertyName: 'moduleId',
      label: 'Module id',
    })
    .addTextField({
      propertyName: 'moduleName',
      label: 'Module name',
    })
    .toJson();
};
