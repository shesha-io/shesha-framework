import React, { FC } from 'react';
import { Button ,Tooltip} from 'antd';
import { TabletOutlined } from '@ant-design/icons';
import { useForm } from '@/providers';

export interface IPreviewButtonProps {

}

export const TabletButton: FC<IPreviewButtonProps> = () => {
    const { setFormMode, formMode } = useForm();
    
    return (
        <Tooltip placement='bottom' title='Tablet View'>
        <Button
            onClick={() => {
                setFormMode(formMode === 'designer' ? 'edit' : 'designer');
            }}
            type={formMode === 'designer' ? 'default' : 'primary'}
            shape="round"
            title="tablet"
        >
            <TabletOutlined size={60} style={{color:'#ad25b8'}} />
        </Button>
        </Tooltip>
    );
};