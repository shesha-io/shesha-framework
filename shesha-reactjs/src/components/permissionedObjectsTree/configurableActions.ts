import { IActionDescriptor } from "@/interfaces/configurableAction";
import { IUpdateItemArguments, updateItemArgumentsForm } from "./update-item-arguments";
import { getSetGroupingArgumentsForm, ISetGroupingArguments } from "./set-grouping-arguments";
import { ISetSearchTextArguments, setSearchTextArgumentsForm } from "./set-search-text-arguments";

export const UpdateItemAction: IActionDescriptor<IUpdateItemArguments> = {
  name: 'Update item',
  description: 'Update Permissioned object Tree item',
  hasArguments: true,
  argumentsFormMarkup: updateItemArgumentsForm,
};

export const SetGroupingAction: IActionDescriptor<ISetGroupingArguments> = {
  name: 'Set grouping',
  description: 'Set grouping',
  hasArguments: true,
  argumentsFormMarkup: getSetGroupingArgumentsForm,
};

export const SetSearchTextAction: IActionDescriptor<ISetSearchTextArguments> = {
  name: 'Set search text',
  description: 'Set search text',
  hasArguments: true,
  argumentsFormMarkup: setSearchTextArgumentsForm,
};
