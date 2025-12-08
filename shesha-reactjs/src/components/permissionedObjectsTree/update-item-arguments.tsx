import { FormMarkupFactory } from '@/interfaces/configurableAction';

export interface IUpdateItemArguments {
  object?: string;
  category: string;
  access: string;
  description?: string | null | undefined;
}

export const updateItemArgumentsForm: FormMarkupFactory = ({ fbf }) => {
  return fbf().addTextField({
    propertyName: 'object',
    label: 'Object',
    validate: { required: true },
  })
    .addTextField({
      propertyName: 'category',
      label: 'Category',
    })
    .addTextField({
      propertyName: 'description',
      label: 'Description',
    })
    .addTextField({
      propertyName: 'access',
      label: 'Access',
      validate: { required: true },
    })
    .toJson();
};
