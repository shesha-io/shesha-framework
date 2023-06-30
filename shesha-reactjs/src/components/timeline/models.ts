import { FormIdentifier } from '../..';
import { IConfigurableFormComponent } from '../../providers';
import { ICommonContainerProps } from '../../designer-components/container/interfaces';

export interface ITimelineItemProps {
  toPerson?: string;
  fromPerson?: string;
  channel?: number;
  body?: string;
  title?: string;
  actionDate?: string;
  type?: string;
}

export interface ITimelineProps extends IConfigurableFormComponent, ICommonContainerProps {
  entityType: string;
  permissions?: any;
  properties?: string[];
  formId?: FormIdentifier;
  ownerId?: string;
  queryParamsExpression?: string;
  readOnly?: boolean;
  dataSource?: 'form' | 'api';
  customApiUrl?: string;
  apiSource?: 'entity' | 'custom';
  filters?: object;
}
