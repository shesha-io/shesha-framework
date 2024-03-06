import React, { FC } from 'react';
import { Button ,Tooltip} from 'antd';
import { DesktopOutlined } from '@ant-design/icons';
import { useForm } from '@/providers';

export interface IPreviewButtonProps {

}

export const DeskTopButton: FC<IPreviewButtonProps> = () => {
    const { setFormMode, formMode } = useForm();
    
    return (
        <Tooltip placement='bottom' title='DeskTop view'>
        <Button
            onClick={() => {
                setFormMode(formMode === 'designer' ? 'edit' : 'designer');
            }}
            type={formMode === 'designer' ? 'default' : 'primary'}
            shape="round"
            title="Desktop"
        >
            <DesktopOutlined size={80} style={{color:'#ad25b8'}} />
        </Button>
        </Tooltip>
    );
};