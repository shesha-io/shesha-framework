import React, { FC, useState } from 'react';
import { Checkbox } from 'antd';
import { IFormComponent } from '@/interfaces';
import FormComponentDisplay from '../formComponentDisplay';
import { BooleanValueChange } from '@/interfaces/formComponent';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

export const FormComponentBoolDisplay: FC<IFormComponent> = ({ name, isEditting, value, editable, onChange }) => {
  const [isChecked, changeVal] = useState(value as boolean);

  if (isEditting) {
    const handleChange = ({ target: { checked } }: CheckboxChangeEvent): void => {
      changeVal(checked);

      if (onChange) {
        (onChange as BooleanValueChange)(name || '', checked);
      }
    };

    return (
      <Checkbox className="sha-form-component sha-form-component-input" checked={isChecked} onChange={handleChange} />
    );
  }

  return <FormComponentDisplay value={Boolean(isChecked) ? 'Yes' : 'No'} editable={editable} />;
};

export default FormComponentBoolDisplay;
