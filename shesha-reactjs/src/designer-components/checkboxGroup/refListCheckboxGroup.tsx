import React, { FC } from 'react';
import RadioGroup from '../radio/radioGroup';
import MultiCheckbox from './multiCheckbox';
import { ICheckboxGroupProps } from './interfaces';

export const RefListCheckboxGroup: FC<ICheckboxGroupProps> = (props) => {
  if (props.mode === 'single') {
    return (
      <RadioGroup
        {...props}
        value={!Array.isArray(props.value) ? props.value : undefined}
        onChange={(event) => {
          if (!props.onChange)
            return;
          const newValue = event.target.value ? String(event.target.value) : null;
          props.onChange(newValue);
        }}
      />
    );
  }

  return <MultiCheckbox {...props} />;
};

export default RefListCheckboxGroup;
