import React, { FC } from 'react';
import { Button, ButtonProps } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useFormActions } from '@/providers';
import { useFormDesigner, useFormDesignerFormMode } from '@/providers/formDesigner';

export type IPreviewButtonProps = Pick<ButtonProps, 'size'>;

export const PreviewButton: FC<IPreviewButtonProps> = (props) => {
  const { setFormMode } = useFormActions();
  const { setFormMode: setFormDesignerMode } = useFormDesigner();
  const formMode = useFormDesignerFormMode();

  return (
    <Button
      icon={<EyeOutlined />}
      onClick={() => {
        setFormMode(formMode === 'designer' ? 'edit' : 'designer');
        setFormDesignerMode(formMode === 'designer' ? 'edit' : 'designer');
      }}
      type={formMode === 'designer' ? 'default' : 'primary'}
      title="Preview"
      size={props.size}
    />
  );
};
