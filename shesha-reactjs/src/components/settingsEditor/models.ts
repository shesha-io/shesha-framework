import { SettingValue } from './provider/models';
import { ISettingSelection } from './provider/contexts';

export interface ISettingEditorProps {

}

export interface ISettingEditorWithValueProps extends ISettingEditorProps {
  selection: ISettingSelection;
  value?: SettingValue;
}
