import { IConfigurableFormComponent, UnwrapCodeEvaluators } from "@/interfaces";
import { isDefined } from '@/utils/nullables';
import { SettingOutlined } from "@ant-design/icons";
import React, { FC } from 'react';
import { useStyles } from '../inputComponent/styles';
import { SettingInput } from '../settingsInput/settingsInput';
import { getWidth } from '../settingsInput/utils';
import { IInputRowProps, ISettingsInputRowProps, SettingsInputRowDefinition } from './interfaces';
import { evaluateString } from "@/providers/form/utils";
import { useShaFormInstance } from "@/providers/form/providers/shaFormProvider";

export const isSettingsInputRow = (component: IConfigurableFormComponent): component is ISettingsInputRowProps => isDefined(component) && component.type === 'settingsInputRow';

type UnwrappedInputRowProps = UnwrapCodeEvaluators<IInputRowProps>;

export const InputRow: FC<UnwrappedInputRowProps> = ({ inputs, readOnly, children, inline, hidden }) => {
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
            readOnly={Boolean(props.readOnly) || readOnly}
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
