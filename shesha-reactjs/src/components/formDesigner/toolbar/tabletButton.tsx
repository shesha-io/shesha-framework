import React, { FC } from 'react';
import { Button ,Select,Tooltip} from 'antd';
import { TabletOutlined } from '@ant-design/icons';
import { useForm } from '@/providers';

export interface IPreviewButtonProps {

}

export const TabletButton: FC<IPreviewButtonProps> = () => {
    const { setFormMode, formMode } = useForm();
    
    return (
        <Tooltip placement='bottom' title={<div style={{height:'200px',width:'200px', backgroundColor:'#A9A9A9'}}>
            <Select
      defaultValue="lucy"
      style={{ width: 120 }}
      loading
      options={[{ value: 'lucy', label: 'Lucy' }, { value: 'Yiminghe', label: 'yiminghe' }]}
    />
        </div>}>
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