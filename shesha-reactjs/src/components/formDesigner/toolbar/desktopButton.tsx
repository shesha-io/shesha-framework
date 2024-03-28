import React, { FC } from 'react';
import { Button } from 'antd';
import { DesktopOutlined } from '@ant-design/icons';
import { useForm } from '@/providers';

export interface IPreviewButtonProps {

}

export const DeskTopButton: FC<IPreviewButtonProps> = () => {
    const {  setFormWidth,formWidth} = useForm();

    return (        
        <Button
           
          type={formWidth == 100 ? 'primary':'default'}
            shape="round"
            title="Desktop"
            onClick={()=>setFormWidth(100)}
        >
            <DesktopOutlined  />
        </Button>
  
    );
};