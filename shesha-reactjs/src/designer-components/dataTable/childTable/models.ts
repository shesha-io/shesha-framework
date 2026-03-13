import { IStoredFilter } from '@/interfaces';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';

export interface IChildTableSettingsProps {
  title?: string;
  parentEntityId?: string;
  allowQuickSearch?: boolean;
  isInline?: boolean;
  toolbarItems?: ButtonGroupItemProps[];
  filters?: IStoredFilter[];
  defaultSelectedFilterId: string;
  defaultPageSize?: number;
  customVisibility?: string;
  permissions?: string[];
  showPagination?: boolean;
  totalRecords?: number;
}
