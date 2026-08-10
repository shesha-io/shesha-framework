import { Radio } from 'antd';
import React, { FC } from 'react';
import Icon from '../icon/Icon';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

export interface IIconRadioGroupValueDefinition {
  value: unknown;
  icon: string | React.ReactNode;
  hint?: string | undefined;
  style?: React.CSSProperties | undefined;
}

export interface IIconRadioGroupProps {
  value?: unknown | undefined;
  readOnly?: boolean | undefined;
  onChange?: ((value: boolean | undefined) => void) | undefined;
  size?: SizeType | undefined;
  className?: string | undefined;
  valueDefinitions: IIconRadioGroupValueDefinition[];
}

const IconRadioGroup: FC<IIconRadioGroupProps> = (props) => {
  return (
    <Radio.Group
      buttonStyle="solid"
      value={props.value}
      onChange={(e) => props.onChange?.(e.target.value as boolean | undefined)}
      size={props.size}
      disabled={props.readOnly ?? false}
      {...(props.className ? { className: props.className } : {})}
    >
      {props.valueDefinitions.map((v, i) => {
        return (
          <Radio.Button
            key={i}
            value={v.value}
            {...(v.style ? { style: v.style } : {})}
          >
            <Icon icon={v.icon} hint={v.hint} />
          </Radio.Button>
        );
      })}
    </Radio.Group>
  );
};

export default IconRadioGroup;
