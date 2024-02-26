import React, { FC } from 'react';
import { Button } from 'antd';
import { RebaseEditOutlined } from '@/icons/rebaseEditOutlined';

export const EditViewMsg: FC = () => {
  
  return (
    <div className='sha-configurable-view-button-wrapper'>
      <Button title='Edit view' shape='default' icon={<RebaseEditOutlined />} />
    </div>
  );
};

export default EditViewMsg;
