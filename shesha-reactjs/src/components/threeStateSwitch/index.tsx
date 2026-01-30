import { EditMode } from '@/interfaces';
import React, { FC } from 'react';
import { CheckOutlined, CloseOutlined, QuestionOutlined } from '@ant-design/icons';
import { useDeepCompareMemo } from '@/hooks';
import IconRadioGroup, { IIconRadioGroupValue } from '../iconRadioGroup';

export interface IThreeStateSwitchProps {
  value?: boolean | undefined;
  readOnly?: boolean;
  onChange?: (value: EditMode) => void;
  size?: 'small' | 'middle' | 'large';
  className?: string;
  yesValue?: Partial<IIconRadioGroupValue>;
  noValue?: Partial<IIconRadioGroupValue>;
  defaultValue?: Partial<IIconRadioGroupValue>;
}

const ThreeStateSwitch: FC<IThreeStateSwitchProps> = (props) => {
  const yesValue = useDeepCompareMemo(() => {
    return { ...{ value: true, icon: <CheckOutlined />, hint: "Yes" }, ...props.yesValue };
  }, [props.yesValue]);

  const noValue = useDeepCompareMemo(() => {
    return { ...{ value: false, icon: <CloseOutlined />, hint: "No" }, ...props.noValue };
  }, [props.noValue]);

  const defaultValue = useDeepCompareMemo(() => {
    return { ...{ value: undefined, icon: <QuestionOutlined />, hint: "Default" }, ...props.defaultValue };
  }, [props.defaultValue]);

  return <IconRadioGroup {...props} values={[yesValue, noValue, defaultValue]} />;
};

export default ThreeStateSwitch;
