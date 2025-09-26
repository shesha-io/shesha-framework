import React, { FC } from 'react';
import { Button, ButtonProps } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useFormActions } from '@/providers';
import { useFormDesignerActions, useFormDesignerStateSelector } from '@/providers/formDesigner';

export interface IPreviewButtonProps extends Pick<ButtonProps, 'size'> {

}

export const PreviewButton: FC<IPreviewButtonProps> = (props) => {
  const { setFormMode } = useFormActions();
  const { setFormMode: setFormDesignerMode } = useFormDesignerActions();
  const formMode = useFormDesignerStateSelector((x) => x.formMode);

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
