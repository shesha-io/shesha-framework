import React, { FC } from 'react';
import { Button } from 'antd';
import { RebaseEditOutlined } from '@/icons/rebaseEditOutlined';
import { IPersistedFormProps } from '@/index';

export interface IEditViewMsgProps {
  persistedFormProps?: IPersistedFormProps;
};

export const EditViewMsg: FC<IEditViewMsgProps> = ({persistedFormProps}) => {
  
  return (
    <div className='sha-configurable-view-button-wrapper'>
      <span className='sha-configurable-view-details'>
        Form: {persistedFormProps?.module}\{persistedFormProps?.name} v{persistedFormProps?.versionNo}
      </span>
      <Button title='Edit view' shape='default' icon={<RebaseEditOutlined />} />
    </div>
  );
};

export default EditViewMsg;
