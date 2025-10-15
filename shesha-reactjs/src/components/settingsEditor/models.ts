import { SettingValue } from './provider/models';
import { ISettingSelection } from './provider/contexts';

export interface ISettingEditorWithValueProps {
  selection: ISettingSelection;
  value?: SettingValue;
}
