import { Select } from 'antd';
import { SelectProps } from 'antd/lib/select';
import React, { FC } from 'react';

interface IBooleanDropDownProps extends SelectProps<any> {
  readonly objectItem: any;
  readonly setObjectItem: (objectItem: any) => void;
  readonly itemKey: string;
}

const { Option } = Select;

const optionsArr = ['Yes', 'No'];

export const BooleanDropDown: FC<IBooleanDropDownProps> = ({ objectItem, setObjectItem, itemKey, value, ...rest }) => {
  const handleOnSelect = (arg): void => {
    if (arg === 1)
      setObjectItem({ ...objectItem, [itemKey]: true });
    else
      setObjectItem({ ...objectItem, [itemKey]: false });
  };

  const options = optionsArr.map((a, index) => (
    <Option value={index + 1} key={index}>
      {a}
    </Option>
  ));

  const selectProps = { ...rest, value: options ? value : null };
  return (
    <Select
      showSearch={false}
      defaultActiveFirstOption={false}
      suffixIcon={null} // hide arrow
      notFoundContent={null}
      allowClear={true}
      onSelect={handleOnSelect}
      {...selectProps}
    >
      {options}
    </Select>
  );
};

export default BooleanDropDown;
