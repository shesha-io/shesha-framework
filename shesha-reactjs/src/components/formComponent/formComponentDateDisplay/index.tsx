import React, { FC, useState } from 'react';
import { DatePicker } from '@/components/antd';
import moment from 'moment';
import { IFormComponent } from '@/interfaces';
import { StringValueChange } from '@/interfaces/formComponent';
import FormComponentDisplay from '../formComponentDisplay';

export const FormComponentDateDisplay: FC<IFormComponent> = ({ name, isEditting, value, editable, onChange }) => {
  const [val, changeVal] = useState(value as string);

  if (isEditting) {
    const handleChange = (_: any, dateString: string): void => {
      changeVal(dateString);

      if (onChange) {
        (onChange as StringValueChange)(name || '', dateString);
      }
    };

    return (
      <DatePicker className="sha-form-component sha-form-component-input" value={moment(val)} onChange={handleChange} />
    );
  }

  return <FormComponentDisplay value={Boolean(value) ? moment(value).format('L') : ''} editable={editable} />;
};

export default FormComponentDateDisplay;
