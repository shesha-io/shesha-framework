import React, { FC } from 'react';
import { Button } from 'antd';
import { RebaseEditOutlined } from '@/icons/rebaseEditOutlined';
import { IPersistedFormProps } from '@/providers/form/models';

export interface IEditViewMsgProps {
  persistedFormProps?: IPersistedFormProps | undefined;
}

export const EditViewMsg: FC<IEditViewMsgProps> = ({ persistedFormProps }) => {
  return persistedFormProps && persistedFormProps.name
    ? (
      <div className="sha-configurable-view-button-wrapper">
        <Button title="Edit view" shape="default" icon={<RebaseEditOutlined />} />
        <span className="sha-configurable-view-details">
          Form: {persistedFormProps.module}\{persistedFormProps.name}
        </span>
      </div>
    )
    : (
      <div className="sha-configurable-view-button-wrapper lite">
        <Button title="Edit view" shape="default" icon={<RebaseEditOutlined />} />
      </div>
    );
};

export default EditViewMsg;
