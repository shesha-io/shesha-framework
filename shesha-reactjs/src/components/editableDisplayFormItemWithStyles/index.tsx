import React, { FC } from 'react';
import 'antd/lib/date-picker/style/index.less'; // REMOVE IT BEFORE PUBLISHING
import EditableDisplayFormItem, { IEditableDisplayLabelProps } from '../editableDisplayFormItem';

export const EditableDisplayFormItemWithStyles: FC<IEditableDisplayLabelProps> = (props) =>  {

  return (
    <EditableDisplayFormItem {...props} />
  );
}

export default EditableDisplayFormItemWithStyles;
