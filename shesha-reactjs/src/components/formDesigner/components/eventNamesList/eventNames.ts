export interface IEvent {
  name: string;
  displayName: string;
}

export const EVENT_NAMES = [
  // SubForm
  'getFormData',
  'postFormData',
  'updateFormData',
  'deleteFormData',

  // List Item
  'refreshListItems',
  'saveListItems',
  'addListItems',

  // DataTable
  'REFRESH_TABLE',
  'TOGGLE_COLUMNS_SELECTOR',
  'TOGGLE_ADVANCED_FILTER',
  'EXPORT_TO_EXCEL',
  'DELETE_ROW',
  'STATE_CHANGED',
  'DOWNLOAD_LOG_FILE',
];

export const EVENTS: IEvent[] = [
  // SubForm
  { name: 'getFormData', displayName: 'getFormData (SubForm)' },
  { name: 'postFormData', displayName: 'postFormData (SubForm)' },
  { name: 'updateFormData', displayName: 'updateFormData (SubForm)' },
  { name: 'deleteFormData', displayName: 'deleteFormData (SubForm)' },

  // List Item
  { name: 'refreshListItems', displayName: 'refreshListItems (List)' },
  { name: 'saveListItems', displayName: 'saveListItems (List)' },
  { name: 'addListItems', displayName: 'addListItems (List)' },

  // DataTable
  { name: 'REFRESH_TABLE', displayName: 'refreshTable (DataTable)' },
  { name: 'TOGGLE_COLUMNS_SELECTOR', displayName: 'toggleColumnsSelector (DataTable)' },
  { name: 'TOGGLE_ADVANCED_FILTER', displayName: 'toggleAdvancedFilter (DataTable)' },
  { name: 'EXPORT_TO_EXCEL', displayName: 'exportToExcel (DataTable)' },
  { name: 'DELETE_ROW', displayName: 'deleteRow (DataTable)' },
  { name: 'STATE_CHANGED', displayName: 'stateChanged (DataTable)' },
  { name: 'DOWNLOAD_LOG_FILE', displayName: 'downloadLogFile (DataTable)' },

  // Configuration framework
  { name: 'ITEM_SET_READY', displayName: 'Set Item Ready (Configuration Framework)' },  
  { name: 'ITEM_PUBLISH', displayName: 'Publish Item (Configuration Framework)' },  
  { name: 'ITEM_CANCEL_VERSION', displayName: 'Cancel item version (Configuration Framework)' },  
  { name: 'ITEM_CREATE_NEW_VERSION', displayName: 'Create new item version (Configuration Framework)' },  
  /*
    ItemSetReady = 'ITEM_SET_READY',
    ItemPublish = 'ITEM_PUBLISH',
    ItemCancelVersion = 'ITEM_CANCEL_VERSION',
    ItemCreateNewVersion = 'ITEM_CREATE_NEW_VERSION',  
  */
];