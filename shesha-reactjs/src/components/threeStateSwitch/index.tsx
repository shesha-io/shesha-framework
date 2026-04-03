import React, { FC } from 'react';
import { CheckOutlined, CloseOutlined, SettingOutlined } from '@ant-design/icons';
import { useDeepCompareMemo } from '@/hooks';
import IconRadioGroup, { IIconRadioGroupValueDefinition } from '../iconRadioGroup';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

export interface IThreeStateSwitchProps {
  value?: boolean | undefined;
  defaultValue?: boolean | undefined;
  readOnly?: boolean;
  onChange?: (value: boolean | undefined) => void;
  size?: SizeType;
  className?: string;
  yesDefinition?: Partial<IIconRadioGroupValueDefinition>;
  noDefinition?: Partial<IIconRadioGroupValueDefinition>;
  defaultDefinition?: Partial<IIconRadioGroupValueDefinition>;
}

const notRecommendedColor = '#F0F0F0';

const ThreeStateSwitch: FC<IThreeStateSwitchProps> = ({
  yesDefinition: yesValueProp,
  noDefinition: noValueProp,
  defaultDefinition: defaultValueProp,
  defaultValue,
  value,
  ...rest
}) => {
  const yes = useDeepCompareMemo(() => {
    return {
      ...{
        value: true,
        icon: <CheckOutlined />,
        hint: `Yes${defaultValue === true ? ' (Default for Metadata)' : defaultValue === false ? ' (Not recommended for Metadata)' : ''}`,
        style: defaultValue === false && value !== true ? { backgroundColor: notRecommendedColor } : undefined,
      },
      ...yesValueProp,
    };
  }, [yesValueProp, defaultValue, value]);

  const no = useDeepCompareMemo(() => {
    return {
      ...{
        value: false,
        icon: <CloseOutlined />,
        hint: `No${defaultValue === false ? ' (Default for Metadata)' : defaultValue === true ? ' (Not recommended for Metadata)' : ''}`,
        style: defaultValue === true && value !== false ? { backgroundColor: notRecommendedColor } : undefined,
      },
      ...noValueProp,
    };
  }, [noValueProp, defaultValue, value]);

  const def = useDeepCompareMemo(() => {
    return { ...{ value: undefined, icon: <SettingOutlined />, hint: `Default${defaultValue === true ? ' (Yes)' : defaultValue === false ? ' (No)' : ''}` }, ...defaultValueProp };
  }, [defaultValueProp, defaultValue]);

  return <IconRadioGroup {...rest} value={value} valueDefinitions={[yes, no, def]} />;
};

export default ThreeStateSwitch;
