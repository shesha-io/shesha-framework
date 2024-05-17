import React, { FC } from 'react';
import { Button } from 'antd';
import { RebaseEditOutlined } from '@/icons/rebaseEditOutlined';
import { IPersistedFormProps } from '@/index';

export interface IEditViewMsgProps {
  persistedFormProps?: IPersistedFormProps;
};

export const EditViewMsg: FC<IEditViewMsgProps> = ({persistedFormProps}) => {

  console.log(persistedFormProps, "PERSISTED FORM PROPS")

  if(persistedFormProps == undefined){
    return (
      <div className='sha-configurable-view-button-wrapper lite'>
      <Button title='Edit view' shape='default' icon={<RebaseEditOutlined />} />
    </div>
    )
  }
  
  return (

    <div className='sha-configurable-view-button-wrapper'>
      <Button title='Edit view' shape='default' icon={<RebaseEditOutlined />} />
      <span className='sha-configurable-view-details'>
        Form: {persistedFormProps?.module}\{persistedFormProps?.name} v{persistedFormProps?.versionNo}
      </span>
    </div>
  );
};

export default EditViewMsg;
