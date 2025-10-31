import { ItemEditorProps } from '@/configuration-studio/models';
import { SaveOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { FC } from 'react';
import { useShaFormDataModified, useShaFormInstance } from '@/providers/form/providers/shaFormProvider';

export type IGenericToolbarProps = ItemEditorProps;

export const GenericToolbar: FC<IGenericToolbarProps> = ({ }) => {
  const shaForm = useShaFormInstance();
  const dataModified = useShaFormDataModified();

  const onSaveClick = (): void => {
    shaForm.submit();
  };
  return (
    <div>
      <Button type="link" icon={<SaveOutlined />} onClick={onSaveClick} disabled={!dataModified}>Save</Button>
    </div>
  );
};
