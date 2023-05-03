import { ButtonGroupItemProps } from '../../../providers/buttonGroupConfigurator/models';
import { ITableViewProps } from '../../../providers/tableViewSelectorConfigurator/models';

export interface IChildTableSettingsProps {
  title?: string;
  parentEntityId?: string;
  allowQuickSearch?: boolean;
  isInline?: boolean;
  toolbarItems?: ButtonGroupItemProps[];
  filters?: ITableViewProps[];
  defaultSelectedFilterId: string;
  customVisibility?: string;
  permissions?: string[];
}
