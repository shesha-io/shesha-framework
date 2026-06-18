import { SettingValue } from './provider/models';
import { ISettingSelection } from './provider/contexts';
import { WithRequiredStrict } from '@/interfaces/utilityTypes';
import { isDefined } from '@/utils/nullables';

export interface ISettingEditorWithValueProps {
  selection: WithRequiredStrict<ISettingSelection, 'setting'>;
  value?: SettingValue;
}

export const isSelectionWithSetting = (value: ISettingSelection): value is WithRequiredStrict<ISettingSelection, 'setting'> => isDefined(value.setting);
