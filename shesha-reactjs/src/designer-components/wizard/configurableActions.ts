import { IActionDescriptor } from "@/interfaces/configurableAction";

export const Back: IActionDescriptor = {
  name: 'Back',
  hasArguments: false,
};

export const Next: IActionDescriptor = {
  name: 'Next',
  hasArguments: false,
};

export const Cancel: IActionDescriptor = {
  name: 'Cancel',
  hasArguments: false,
};

export const Close: IActionDescriptor = {
  name: 'Close',
  hasArguments: false,
};

export const Done: IActionDescriptor = {
  name: 'Done',
  hasArguments: false,
};

export const ResetSteps: IActionDescriptor = {
  name: 'Reset Steps',
  hasArguments: false,
};

export const Validate: IActionDescriptor<object> = {
  name: 'Validate',
  description: 'Validate the Wizard step data and show validation errors if any',
  hasArguments: false,
};
