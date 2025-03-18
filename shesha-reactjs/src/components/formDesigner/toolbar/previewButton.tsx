import React, { FC } from 'react';
import { Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useForm } from '@/providers';
import { useFormDesignerActions, useFormDesignerState } from '@/providers/formDesigner';

export interface IPreviewButtonProps {

}

export const PreviewButton: FC<IPreviewButtonProps> = () => {
    const { setFormMode, formMode,  } = useForm();
    const { isPreview } = useFormDesignerState();
    const { setPreviewMode } = useFormDesignerActions(); 
    
    return (
        <Button
            onClick={() => {
                setFormMode(formMode === 'designer' ? 'edit' : 'designer');
                setPreviewMode(!isPreview);
            }}
            type={formMode === 'designer' ? 'default' : 'primary'}
            shape="circle"
            title="Preview"
        >
            <EyeOutlined />
        </Button>
    );
};