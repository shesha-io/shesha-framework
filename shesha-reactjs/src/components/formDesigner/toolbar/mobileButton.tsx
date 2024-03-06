import React, { FC } from 'react';
import { Button ,Tooltip} from 'antd';
import { MobileOutlined } from '@ant-design/icons';
import { useForm } from '@/providers';

export interface IPreviewButtonProps {

}

export const MobileButton: FC<IPreviewButtonProps> = () => {
    const { setFormMode, formMode } = useForm();
    
    return (
        <Tooltip placement='bottom' title='Mobile View'>
        <Button
            onClick={() => {
                setFormMode(formMode === 'designer' ? 'edit' : 'designer');
            }}
            type={formMode === 'designer' ? 'default' : 'primary'}
            shape="round"
            title="mobile"
        >
            <MobileOutlined size={60} style={{color:'#ad25b8'}} />
        </Button>
        </Tooltip>
    );
};