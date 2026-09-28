import { IActionDescriptor } from "@/interfaces/configurableAction";

export const StartEditAction: IActionDescriptor = {
  name: 'Start Edit',
  hasArguments: false,
};
export const CancelEditAction: IActionDescriptor = {
  name: 'Cancel Edit',
  hasArguments: false,
};
export const SubmitAction: IActionDescriptor = {
  name: 'Submit',
  hasArguments: false,
};

export const ResetAction: IActionDescriptor = {
  name: 'Reset',
  hasArguments: false,
};

export const RefreshAction: IActionDescriptor = {
  name: 'Refresh',
  description: 'Refresh the form data by fetching it from the back-end',
  hasArguments: false,
};

export const ValidateAction: IActionDescriptor = {
  name: 'Validate',
  description: 'Validate the form data and show validation errors if any',
  hasArguments: false,
};

export const SetValidationErrorsAction: IActionDescriptor = {
  name: 'Set validation errors',
  description: 'Errors are displayed on the Validation Errors component attached to the form',
  hasArguments: false,
};

export const ResetValidationErrorsAction: IActionDescriptor = {
  name: 'Reset validation errors',
  description: 'Clear errors displayed on the Validation Errors component attached to the form',
  hasArguments: false,
};

export const FormActions = [StartEditAction,
  CancelEditAction,
  SubmitAction,
  ResetAction,
  RefreshAction,
  ValidateAction,
  SetValidationErrorsAction,
  ResetValidationErrorsAction,
];
