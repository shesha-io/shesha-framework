import React, { FC } from 'react';
import { EditOutlined } from '@ant-design/icons';

export const EditViewMsg: FC = () => {
  return (
    <div className="sha-edit-view-msg">
      <EditOutlined />
      <h3>Edit View</h3>
      <p>Click to edit the view</p>
    </div>
  );
};

export default EditViewMsg;
