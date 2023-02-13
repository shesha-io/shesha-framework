import React, { FC } from 'react';
import { Input } from 'antd';
import { IFormComponent } from '../../../../interfaces';

export const StoredFile: FC<IFormComponent> = ({ isEditting, value }) => {
  if (isEditting) {
    return <Input className="sha-form-component sha-form-component-input" value={value} />;
  }

  return <span className="sha-form-component sha-form-component-display">{value}</span>;
};

export default StoredFile;
