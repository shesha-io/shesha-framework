import { IConfigurableFormComponent, IFormItem } from '@/interfaces';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';
import { FormIdentifier } from '@/providers/form/models';

export interface IListItemsProps {
  name: string;
  /**
   * deprecated
   */
  uniqueStateId?: string;
  queryParamsExpression?: string;
  title?: string;
  footer?: string;
  formId?: FormIdentifier;
  selectionMode?: 'none' | 'single' | 'multiple';
  allowDeleteItems?: boolean;
  allowRemoteDelete?: boolean;
  deleteUrl?: string;
  deleteConfirmMessage?: string;
  submitUrl?: string;
  submitHttpVerb?: 'POST' | 'PUT';
  onSubmit?: string;
  showPagination?: boolean;
  showQuickSearch?: boolean;
  paginationDefaultPageSize: number;
  buttons?: ButtonGroupItemProps[];
  isButtonInline?: boolean;
  maxHeight?: number;
  totalRecords?: number;
  labelCol?: number;
  wrapperCol?: number;
  dataSource?: 'form' | 'api';
  apiSource?: 'entity' | 'custom';
  renderStrategy?: 'dragAndDrop' | 'externalForm';
  entityType?: string;
  readOnly?: boolean;
  properties?: string[];
  filters?: object;
  placeholder?: string;
  orientation?: 'vertical' | 'horizontal';
  listItemWidth?: number | 'custom';
  customListItemWidth?: number;
  customApiUrl?: string;
}

export interface IListComponentProps extends IListItemsProps, IConfigurableFormComponent {
  /** the source of data for the list component */
  labelCol?: number;
  wrapperCol?: number;
  dataSource?: 'form' | 'api';
  renderStrategy?: 'dragAndDrop' | 'externalForm';
}

export interface IListControlProps extends IListItemsProps, IFormItem {
  containerId: string;
  value?: any[];
  namePrefix?: string;
  customVisibility?: string;
}

export interface IListComponentRenderState {
  quickSearch?: string;
  skipCount?: number;
  maxResultCount?: number;
  selectedItemIndexes?: number[];
  selectedItemIndex?: number;
}

export interface IEvaluatedFilters {
  filter: string;
  ready: boolean;
}
