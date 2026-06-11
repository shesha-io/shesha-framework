import { FilterExpression, IConfigurableFormComponent } from '@/interfaces';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';
import { FormIdentifier } from '@/providers/form/models';

export interface IListItemsProps {
  name: string;
  /**
   * deprecated
   */
  uniqueStateId?: string | undefined;
  queryParamsExpression?: string | undefined;
  title?: string | undefined;
  footer?: string | undefined;
  formId?: FormIdentifier | undefined;
  selectionMode?: 'none' | 'single' | 'multiple' | undefined;
  allowDeleteItems?: boolean | undefined;
  allowRemoteDelete?: boolean | undefined;
  deleteUrl?: string | undefined;
  deleteConfirmMessage?: string | undefined;
  submitUrl?: string | undefined;
  submitHttpVerb?: 'POST' | 'PUT' | undefined;
  onSubmit?: string | undefined;
  showPagination?: boolean | undefined;
  showQuickSearch?: boolean | undefined;
  paginationDefaultPageSize: number;
  buttons?: ButtonGroupItemProps[] | undefined;
  isButtonInline?: boolean | undefined;
  maxHeight?: number | undefined;
  totalRecords?: number | undefined;
  labelCol?: number | undefined;
  wrapperCol?: number | undefined;
  dataSource?: 'form' | 'api' | undefined;
  apiSource?: 'entity' | 'custom' | undefined;
  renderStrategy?: 'dragAndDrop' | 'externalForm' | undefined;
  entityType?: string | undefined;
  properties?: string[] | undefined;
  filters?: FilterExpression | undefined;
  placeholder?: string | undefined;
  orientation?: 'vertical' | 'horizontal' | undefined;
  listItemWidth?: number | 'custom' | undefined;
  customListItemWidth?: number | undefined;
  customApiUrl?: string | undefined;
}

export interface IListComponentProps extends IListItemsProps, IConfigurableFormComponent {
  /** the source of data for the list component */
  labelCol?: number;
  wrapperCol?: number;
  dataSource?: 'form' | 'api';
  renderStrategy?: 'dragAndDrop' | 'externalForm';
}
