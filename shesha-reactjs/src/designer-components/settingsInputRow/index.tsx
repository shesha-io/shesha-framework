import { evaluateString, useShaFormInstance } from '@/index';
import { IConfigurableFormComponent } from "@/interfaces";
import { isDefined } from '@/utils/nullables';
import { SettingOutlined } from "@ant-design/icons";
import React from 'react';
import { useStyles } from '../inputComponent/styles';
import { SettingInput } from '../settingsInput/settingsInput';
import { getWidth } from '../settingsInput/utils';
import { IInputRowProps, ISettingsInputRowProps, SettingsInputRowDefinition } from './interfaces';

export const isSettingsInputRow = (component: IConfigurableFormComponent): component is ISettingsInputRowProps => isDefined(component) && component.type === 'settingsInputRow';

export const InputRow: React.FC<IInputRowProps> = ({ inputs, readOnly, children, inline, hidden }) => {
  const { styles } = useStyles();
  const { formData } = useShaFormInstance();

  const isHidden = typeof hidden === 'string' ? evaluateString(hidden, { data: formData }) : hidden;
  return isHidden ? null : (
    <div className={inline ? styles.inlineInputs : styles.rowInputs}>
      {inputs?.map((props, i) => {
        const { type } = props;
        const isHidden = typeof props.hidden === 'string' ? evaluateString(props.hidden, { data: formData }) : props.hidden;

        const width = getWidth(type, props.width);

        return (
          <SettingInput
            key={i + props.label}
            {...props}
            hidden={isHidden as boolean}
            readOnly={props.readOnly || readOnly}
            inline={inline}
            width={width}
          />
        );
      })}
      {children}
    </div>
  );
};

const SettingsInputRow: SettingsInputRowDefinition = {
  type: 'settingsInputRow',
  isInput: true,
  isOutput: true,
  name: 'SettingsInputRow',
  icon: <SettingOutlined />,
  Factory: ({ model }) => {
    return model.hidden ? null : (
      <InputRow readOnly={model.readOnly} {...model} />
    );
  },
};

export default SettingsInputRow;
