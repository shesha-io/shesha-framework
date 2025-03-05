import React, { FC } from 'react';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { useStyles } from './styles';
import { labelAlignOptions } from './utils';
import { SettingInput } from '../settingsInput/settingsInput';
import { nanoid } from '@/utils/uuid';
import { Tooltip } from 'antd';
import { IRadioOption } from '../settingsInput/interfaces';

export interface ILabelProps {
  readOnly?: boolean;
  onChange?: (value: any) => void;
  value?: boolean;
  label: string | React.ReactNode;
  labelAlignOptions?: IRadioOption[];
}

const LabelConfiguratorComponent: FC<ILabelProps> = ({ value, readOnly, label, labelAlignOptions:labelAlign }) => {
  const { styles } = useStyles();
  return (
    <>
      <div className={!value ? styles.flexWrapper : ''}>
        <SettingInput
          label={`${label} Align`}
          hideLabel
          propertyName="labelAlign"
          readOnly={readOnly}
          type="radio"
          hidden={value}
          buttonGroupOptions={labelAlign ? labelAlign : labelAlignOptions}
          jsSetting={false}
          id={nanoid()}
        />
        <SettingInput
          id={nanoid()}
          label={`Hide ${label}`}
          hideLabel={!value}
          propertyName="hideLabel"
          readOnly={readOnly}
          jsSetting={false}
          type="button"
          icon={
            <Tooltip title="Hide label">
              <EyeOutlined />
            </Tooltip>
          }
          iconAlt={
            <Tooltip title="Show Label">
              <EyeInvisibleOutlined />
            </Tooltip>
          }
        />
      </div>
      <SettingInput
        id={nanoid()}
        type="textField"
        label={label as string}
        propertyName="label"
        readOnly={readOnly}
        jsSetting={!value}
        hidden={value}
      />
    </>
  );
};

export default LabelConfiguratorComponent;
