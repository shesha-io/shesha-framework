import React, { FC } from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';
import { IFormComponent } from '../../../interfaces';

export const FormComponentDateDisplay: FC<IFormComponent> = ({ isEditting, value }) => {
  if (isEditting) {
    return <DatePicker className="sha-form-component sha-form-component-input" value={moment(value)} />;
  }

  return <span className="sha-form-component sha-form-component-display">{value}</span>;
};

export default FormComponentDateDisplay;
