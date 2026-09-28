import { IActionDescriptor } from "@/interfaces/configurableAction";

export const OpenDrawer: IActionDescriptor = {
  name: 'Open drawer',
  hasArguments: false,
};

export const CloseDrawer: IActionDescriptor = {
  name: 'Close drawer',
  hasArguments: false,
};
