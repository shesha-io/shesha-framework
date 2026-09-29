import { IActionDescriptor } from "@/interfaces/configurableAction";
import { getShowConfirmationArgumentsForm, IShowConfirmationArguments } from "./show-confirmation-arguments";

export const ShowConfirmationDialog: IActionDescriptor<IShowConfirmationArguments> = {
  name: 'Show Confirmation Dialog',
  sortOrder: 7,
  hasArguments: true,
  argumentsFormMarkup: getShowConfirmationArgumentsForm,
};
