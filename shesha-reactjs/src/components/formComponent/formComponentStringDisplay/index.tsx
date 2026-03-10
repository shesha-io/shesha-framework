import React, { FC, useState } from 'react';
import { Input } from 'antd';
import { IFormComponent } from '@/interfaces';
import FormComponentDisplay from '../formComponentDisplay';
import { StringValueChange } from '@/interfaces/formComponent';

export const FormComponentStringDisplay: FC<IFormComponent> = ({ name, isEditting, value, editable, onChange }) => {
  const [val, changeVal] = useState(value as string);

  if (isEditting) {
    const handleChange = ({ target: { value: text = '' } }: React.ChangeEvent<HTMLInputElement>): void => {
      changeVal(text);

      if (onChange) {
        (onChange as StringValueChange)(name || '', text);
      }
    };

    return <Input className="sha-form-component sha-form-component-input" value={val} onChange={handleChange} />;
  }

  return <FormComponentDisplay value={value} editable={editable} />;
};

export default FormComponentStringDisplay;
