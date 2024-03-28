import React, { FC } from 'react';
import { Button } from 'antd';
import { TabletOutlined } from '@ant-design/icons';
import { useForm } from '@/providers';

export interface IPreviewButtonProps {}

export const TabletButton: FC<IPreviewButtonProps> = () => {
  const {  setFormWidth,formWidth } = useForm();
 return (
<Button
        type={formWidth == 75 ? 'primary':'default'}       
        shape="round"
        title="tablet"
        onClick={()=>setFormWidth(75)}
  
      >
        <TabletOutlined  />
      </Button>
  );

    };

  

