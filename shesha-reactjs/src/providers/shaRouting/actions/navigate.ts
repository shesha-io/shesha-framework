import { IActionDescriptor } from "@/interfaces/configurableAction";
import { getNavigateArgumentsForm } from './navigate-arguments';
import { IHasVersion } from '@/utils/fluentMigrator/migrator';
import { IKeyValue } from '@/interfaces/keyValue';
import { FormIdentifier } from '@/interfaces';
import { isNullOrWhiteSpace } from "@/utils";

const NAVIGATE_ACTION_NAME = 'Navigate';

export type NavigationType = 'url' | 'form';

export interface INavigateActoinArguments extends IHasVersion {
  navigationType: NavigationType;
  url?: string | undefined;
  formId?: FormIdentifier | undefined;
  queryParameters?: IKeyValue[] | undefined;
}

export const NavigateAction: IActionDescriptor<INavigateActoinArguments> = {
  name: NAVIGATE_ACTION_NAME,
  sortOrder: 2,
  hasArguments: true,
  argumentsFormMarkup: getNavigateArgumentsForm,
  migrator: (m) => m.add<INavigateActoinArguments>(0, (prev) => ({ ...prev, navigationType: !isNullOrWhiteSpace(prev.navigationType) ? prev.navigationType : 'form' })),
};
