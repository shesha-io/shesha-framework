import { IActionDescriptor } from "@/interfaces/configurableAction";

export const RefreshTableAction: IActionDescriptor = {
  name: 'Refresh table',
  hasArguments: false,
};

export const ExportToExcelAction: IActionDescriptor = {
  name: 'Export to Excel',
  hasArguments: false,
};

export const ToggleAdvancedFilterAction: IActionDescriptor = {
  name: 'Toggle Advanced Filter',
  hasArguments: false,
};

export const ToggleColumnsSelectorAction: IActionDescriptor = {
  name: 'Toggle Columns Selector',
  hasArguments: false,
};
