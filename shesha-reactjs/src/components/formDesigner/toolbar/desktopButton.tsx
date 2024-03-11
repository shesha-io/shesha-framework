import React, { FC } from 'react';
import { Button } from 'antd';
import { DesktopOutlined } from '@ant-design/icons';
import { useForm } from '@/providers';

export interface IPreviewButtonProps {

}

export const DeskTopButton: FC<IPreviewButtonProps> = () => {
    const {  formMode } = useForm();
    
    return (
        
        <Button
           
            type={formMode === 'designer' ? 'default' : 'primary'}
            shape="round"
            title="Desktop"
        >
            <DesktopOutlined size={80} style={{color:'#ad25b8'}} />
        </Button>
  
    );
};