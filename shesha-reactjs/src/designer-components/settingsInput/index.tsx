import { SettingOutlined } from "@ant-design/icons";
import { SettingInput } from './settingsInput';
import { SettingsInputDefinition } from './interfaces';
import { isDefined } from "@/utils";
import { getSettingsInputValidator } from "../settingsInputRow/validation";
import { Rule } from "antd/es/form";

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

    const rule: Rule = { validator: getSettingsInputValidator(model, context) };
    return [rule];
  },
};

export default SettingsInput;
