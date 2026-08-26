/* eslint @typescript-eslint/strict-boolean-expressions: "error" */
import { IConfigurableFormComponent, UnwrapCodeEvaluators } from "@/interfaces";
import { isDefined } from '@/utils/nullables';
import { SettingOutlined } from "@ant-design/icons";
import { FC, useRef } from 'react';
import * as React from 'react';
import { useStyles } from '../inputComponent/styles';
import { SettingInput } from '../settingsInput/settingsInput';
import { getWidth } from '../settingsInput/utils';
import { IInputRowProps, ISettingsInputRowProps, SettingsInputRowDefinition } from './interfaces';
import { useShaFormInstance } from "@/providers/form/providers/shaFormProvider";
import { nanoid } from '@/utils/uuid';
import { ISettingsInputProps } from '../settingsInput/interfaces';

export const isSettingsInputRow = (component: IConfigurableFormComponent): component is ISettingsInputRowProps => isDefined(component) && component.type === 'settingsInputRow';

type UnwrappedInputRowProps = UnwrapCodeEvaluators<IInputRowProps>;

type IInputRowInputProps = UnwrapCodeEvaluators<ISettingsInputProps> & {
  parentReadOnly?: boolean | undefined;
  formData: object | undefined;
};

const InputRowInput = (props: IInputRowInputProps): React.JSX.Element => {
  const {
    parentReadOnly = false,
    hidden = false,
    readOnly,
  } = props;
  const width = getWidth(props.type, props.width);
  // eslint-disable-next-line react-hooks/refs
  const id = useRef(nanoid()).current;

  return (
    <SettingInput
      {...props}
      id={props.id ?? id}
      hidden={hidden}
      readOnly={parentReadOnly || readOnly}
      inline={props.inline}
      width={width}
    />
  );
};

export const InputRow: FC<UnwrappedInputRowProps> = ({ inputs, readOnly, children, inline = false, hidden = false }) => {
  const { styles } = useStyles();
  const { formData } = useShaFormInstance();

  return hidden
    ? null
    : (
      <div className={inline ? styles.inlineInputs : styles.rowInputs}>
        {inputs?.map((props) => {
          return (
            <InputRowInput
              key={props.id ?? props.propertyName}
              {...props}
              readOnly={props.readOnly}
              parentReadOnly={readOnly}
              formData={formData}
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
    const { hidden = false } = model;
    return hidden
      ? null
      : (
        <InputRow readOnly={model.readOnly} {...model} />
      );
  },
  customContainerNames: ['inputs'],
};

export default SettingsInputRow;
