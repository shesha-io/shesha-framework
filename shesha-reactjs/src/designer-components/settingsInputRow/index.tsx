import { IConfigurableFormComponent, UnwrapCodeEvaluators } from "@/interfaces";
import { isDefined } from '@/utils/nullables';
import { SettingOutlined } from "@ant-design/icons";
import React, { FC, useRef } from 'react';
import { useStyles } from '../inputComponent/styles';
import { SettingInput } from '../settingsInput/settingsInput';
import { getWidth } from '../settingsInput/utils';
import { IInputRowProps, ISettingsInputRowProps, SettingsInputRowDefinition } from './interfaces';
import { evaluateString } from "@/providers/form/utils";
import { useShaFormInstance } from "@/providers/form/providers/shaFormProvider";
import { nanoid } from '@/utils/uuid';
import { ISettingsInputProps } from '../settingsInput/interfaces';

export const isSettingsInputRow = (component: IConfigurableFormComponent): component is ISettingsInputRowProps => isDefined(component) && component.type === 'settingsInputRow';

type UnwrappedInputRowProps = UnwrapCodeEvaluators<IInputRowProps>;
type IInputRowInputProps = UnwrapCodeEvaluators<IInputRowProps['inputs'][number]> & {
  parentReadOnly?: boolean;
  formData: object;
};

const InputRowInput = (props: IInputRowInputProps): React.JSX.Element => {
  const isHidden = typeof props.hidden === 'string' ? evaluateString(props.hidden, { data: props.formData }) : props.hidden;
  const width = getWidth(props.type, props.width);
  // eslint-disable-next-line react-hooks/refs
  const id = useRef(nanoid()).current;

  return (
    <SettingInput
      {...props}
      id={props.id ?? id}
      hidden={isHidden as boolean}
      readOnly={props.parentReadOnly || props.readOnly}
      inline={props.inline}
      width={width}
    />
  );
};

export const InputRow: FC<UnwrappedInputRowProps> = ({ inputs, readOnly, children, inline, hidden }) => {
  const { styles } = useStyles();
  const { formData } = useShaFormInstance();

  const isHidden = typeof hidden === 'string' ? evaluateString(hidden, { data: formData }) : hidden;
  return isHidden ? null : (
    <div className={inline ? styles.inlineInputs : styles.rowInputs}>
      {inputs?.map((props: UnwrapCodeEvaluators<ISettingsInputProps>, i) => {
        return <InputRowInput key={props.id ?? props.propertyName ?? i} {...props} parentReadOnly={readOnly} formData={formData} />;
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
