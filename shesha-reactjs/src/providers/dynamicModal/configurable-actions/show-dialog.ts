import { IActionDescriptor } from "@/interfaces/configurableAction";
import { IShowModalActionArguments } from "./dialog-arguments";
import { showDialogArgumentsFormFactory } from "./show-dialog-arguments";
import { migrateToV0 } from "../migrations/ver0";

export const ShowDialog: IActionDescriptor<IShowModalActionArguments> = {
  name: 'Show Dialog',
  sortOrder: 3,
  hasArguments: true,
  argumentsFormMarkup: showDialogArgumentsFormFactory,
  migrator: (m) => m.add<IShowModalActionArguments>(0, migrateToV0)
    .add<IShowModalActionArguments>(1, (prev) => ({
      ...prev,
      showCloseIcon: prev.showCloseIcon !== undefined ? prev.showCloseIcon : true,
    })),
};
