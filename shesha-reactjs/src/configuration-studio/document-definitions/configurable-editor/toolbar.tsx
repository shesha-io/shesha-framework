import { ItemEditorProps } from '@/configuration-studio/models';
import { SaveOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { FC } from 'react';
import { useShaFormInstance, useShaFormDataUpdate, useShaFormSubscription } from '@/providers/form/providers/shaFormProvider';

export type IGenericToolbarProps = ItemEditorProps;

export const GenericToolbar: FC<IGenericToolbarProps> = ({ }) => {
  useShaFormDataUpdate();
  useShaFormSubscription('data-loading');
  useShaFormSubscription('data-submit');
  const shaForm = useShaFormInstance();

  const onSaveClick = (): void => {
    shaForm.submit();
  };
  return (
    <div>
      <Button type="link" icon={<SaveOutlined />} onClick={onSaveClick} disabled={!shaForm.isDataModified}>Save</Button>
    </div>
  );
};
