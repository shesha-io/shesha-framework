import { FC, useState } from 'react';
import * as React from 'react';
import { useStyles } from './styles';
import { labelAlignOptions } from './utils';
import { SettingInput } from '../settingsInput/settingsInput';
import { nanoid } from '@/utils/uuid';
import { IRadioOption } from '../settingsInput/interfaces';

export interface ILabelProps {
  readOnly?: boolean | undefined;
  label: string | React.ReactNode;
  hideLabel?: boolean | undefined;
  labelAlignOptions?: IRadioOption[] | undefined;
  placeholder?: string | undefined;
}

const LabelConfiguratorComponent: FC<ILabelProps> = ({ hideLabel: value, readOnly, label, labelAlignOptions: labelAlign, placeholder }) => {
  const { styles } = useStyles();

  const [ids] = useState<string[]>([nanoid(), nanoid(), nanoid(), nanoid()]);

  return (
    <>
      <div className={value !== true ? styles.flexWrapper : ''}>
        <SettingInput
          label="Label Align"
          hideLabel
          propertyName="labelAlign"
          readOnly={readOnly}
          type="radio"
          visible={value !== true}
          buttonGroupOptions={labelAlign ? labelAlign : labelAlignOptions}
          jsSetting={false}
          id={ids[0]}
        />
        <SettingInput
          id={ids[1]}
          label="Show Label"
          hideLabel={value !== true}
          visible={value}
          propertyName="hideLabel"
          readOnly={readOnly}
          jsSetting={false}
          type="button"
          icon="EyeOutlined"
        />
        <SettingInput
          id={ids[2]}
          label="Hide Label"
          tooltip="Hide Label"
          hideLabel={value !== true}
          propertyName="hideLabel"
          readOnly={readOnly}
          jsSetting={false}
          visible={value !== true}
          type="button"
          icon="EyeInvisibleOutlined"
        />
      </div>
      <SettingInput
        id={ids[3]}
        type="textField"
        label={label}
        propertyName="label"
        readOnly={readOnly}
        jsSetting={value !== true}
        placeholder={placeholder}
        visible={value !== true}
      />
    </>
  );
};

export default LabelConfiguratorComponent;
