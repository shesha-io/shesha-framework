import { IActionDescriptor } from "@/interfaces/configurableAction";
import { ICloseModalActionArguments, closeDialogArgumentsForm } from "./dialog-arguments";

export const CloseDialog: IActionDescriptor<ICloseModalActionArguments> = {
  name: 'Close Dialog',
  sortOrder: 4,
  hasArguments: true,
  argumentsFormMarkup: closeDialogArgumentsForm,
};
