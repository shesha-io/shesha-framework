import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';
import { ITableViewProps } from '@/providers/dataTable/filters/models';

export interface IChildTableSettingsProps {
  title?: string;
  parentEntityId?: string;
  allowQuickSearch?: boolean;
  isInline?: boolean;
  toolbarItems?: ButtonGroupItemProps[];
  filters?: ITableViewProps[];
  defaultSelectedFilterId: string;
  defaultPageSize?: number;
  customVisibility?: string;
  permissions?: string[];
  showPagination?: boolean;
  totalRecords?: number;
}
