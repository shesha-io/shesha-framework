import React, { FC } from 'react';
import { Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useForm } from '@/providers';

export interface IPreviewButtonProps {

}

export const PreviewButton: FC<IPreviewButtonProps> = () => {
    const { setFormMode, formMode } = useForm();
    
    return (
        <Button
            onClick={() => {
                setFormMode(formMode === 'designer' ? 'edit' : 'designer');
            }}
            type={formMode === 'designer' ? 'default' : 'primary'}
            shape="circle"
            title="Preview"
        >
            <EyeOutlined />
        </Button>
    );
};