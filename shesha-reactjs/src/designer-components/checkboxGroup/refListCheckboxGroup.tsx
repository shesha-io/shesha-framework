import React, { FC } from 'react';
import MultiCheckbox from './multiCheckbox';
import { ICheckboxGroupProps } from './interfaces';

// Checkboxes are designed for multiple independent selections, so the group
// always renders in multi-select mode.
export const RefListCheckboxGroup: FC<ICheckboxGroupProps> = (props) => {
  return <MultiCheckbox {...props} />;
};

export default RefListCheckboxGroup;
