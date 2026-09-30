import { IActionDescriptor } from '@/interfaces/configurableAction';
import { IUpdateItemArguments, updateItemArgumentsForm } from './update-item-arguments';

export const UpdateItemAction: IActionDescriptor<IUpdateItemArguments> = {
  name: 'Update item',
  description: 'Update Permission Tree item',
  hasArguments: true,
  argumentsFormMarkup: updateItemArgumentsForm,
};

export const CreateRootAction: IActionDescriptor = {
  name: 'Create root',
  description: 'Create root Permission Tree item',
  hasArguments: false,
};

export const CreateChildAction: IActionDescriptor = {
  name: 'Create child',
  description: 'Create child Permission Tree item',
  hasArguments: false,
};

export const DeleteItemAction: IActionDescriptor = {
  name: 'Delete item',
  description: 'Delete Permission Tree item',
  hasArguments: false,
};
