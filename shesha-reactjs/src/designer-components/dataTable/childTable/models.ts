import { IStoredFilter } from '@/interfaces';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';

export interface IChildTableSettingsProps {
  title?: string | undefined;
  parentEntityId?: string | undefined;
  allowQuickSearch?: boolean | undefined;
  isInline?: boolean | undefined;
  toolbarItems?: ButtonGroupItemProps[] | undefined;
  filters?: IStoredFilter[] | undefined;
  defaultSelectedFilterId: string | null;
  defaultPageSize?: number | undefined;
  customVisibility?: string | undefined;
  permissions?: string[] | undefined;
  showPagination?: boolean | undefined;
  totalRecords?: number | undefined;
  isNotWrapped?: boolean | undefined;
}
