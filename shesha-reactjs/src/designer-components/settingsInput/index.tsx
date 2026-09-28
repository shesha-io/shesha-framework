import { SettingOutlined } from "@ant-design/icons";
import { SettingInput } from './settingsInput';
import { SettingsInputDefinition } from './interfaces';
import { isDefined } from "@/utils";
import { getSettingsInputValidator } from "../settingsInputRow/validation";

const SettingsInput: SettingsInputDefinition = {
  type: 'settingsInput',
  isInput: true,
  isOutput: true,
  name: 'SettingsInput',
  icon: <SettingOutlined />,
  Factory: ({ model }) => {
    return model.hidden === true ? null : <SettingInput {...model} size="small" />;
  },

  useStandardValidation: false,
  getExtraValidationRules: (model, context) => {
    if (!isDefined(context))
      return [];

    return [{ validator: getSettingsInputValidator(model, context) }];
  },
};

export default SettingsInput;
