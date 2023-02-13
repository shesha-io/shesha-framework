import { IToolbarItem } from '../../../../..';

export interface IDetailsViewProps {
  title?: string;
  path: string;
  backUrl?: string;
  statusValue?: string;
  statusColor?: string;
  statusOverride?: string;
  statusColorExpression?: string;
  toolbarItems?: IToolbarItem[];
}
