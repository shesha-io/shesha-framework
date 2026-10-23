import { IFlagsSetters, IFlagsState } from '@/interfaces';
import { IConfigurableComponentProps } from './models';

type IFlagProgressFlags = 'load' | 'save';
type IFlagSucceededFlags = 'load' | 'save';
type IFlagErrorFlags = 'load' | 'save';
type IFlagActionedFlags = '__DEFAULT__';

export interface IConfigurableComponentStateContext<TSettings extends object = object>
  extends IFlagsState<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags>,
  IConfigurableComponentProps {
  settings: TSettings | undefined;
}

export interface IConfigurableComponentActionsContext<TSettings extends object>
  extends IFlagsSetters<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags> {
  load: () => void;
  save: (settings: TSettings) => Promise<void>;
}

export interface IConfigurableComponentContext<TSettings extends object = object>
  extends IConfigurableComponentStateContext<TSettings>,
  IConfigurableComponentActionsContext<TSettings> {}
