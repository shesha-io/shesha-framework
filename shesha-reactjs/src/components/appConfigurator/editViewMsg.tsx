import React, { FC } from 'react';
import { EditOutlined } from '@ant-design/icons';
import { useStyles } from './styles/styles';

export const EditViewMsg: FC = () => {
  const { styles } = useStyles();
  return (
    <div className={styles.shaEditViewMsg}>
      <EditOutlined />
      <h3>Edit View</h3>
      <p>Click to edit the view</p>
    </div>
  );
};

export default EditViewMsg;
