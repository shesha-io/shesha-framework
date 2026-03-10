import React, { FC, useState } from 'react';
import { InputNumber } from 'antd';
import { IFormComponent } from '@/interfaces';
import FormComponentDisplay from '../formComponentDisplay';
import { NumberValueChange } from '@/interfaces/formComponent';

export const FormComponentNumberDisplay: FC<IFormComponent> = ({ name, isEditting, value, editable, onChange }) => {
  const [val, changeVal] = useState(value as number);

  if (isEditting) {
    const handleChange = (num: number | undefined = 0): void => {
      changeVal(num);

      if (onChange) {
        (onChange as NumberValueChange)(name || '', num);
      }
    };

    return <InputNumber className="sha-form-component sha-form-component-input" value={val} onChange={handleChange} />;
  }

  return <FormComponentDisplay value={value} editable={editable} />;
};

export default FormComponentNumberDisplay;
