import React, { FC, useState } from 'react';
import { Button, Dropdown, MenuProps } from 'antd';
import { MobileOutlined } from '@ant-design/icons';
import { useForm } from '@/providers';

export interface IPreviewButtonProps {}

export const MobileButton: FC<IPreviewButtonProps> = () => {
  const {  formMode ,setFormWidth} = useForm();
  const [mode,setMode]=useState(1);


  const handleMenuClick: MenuProps['onClick'] = (e) => {
    setMode(parseInt(e.key));
  setFormWidth(e.key==='1'?'30%':'50%')
  };

  const disable=(key:number)=>mode===key?true:false;
  
  const items: MenuProps['items'] = [
    {
      label: 'Potrait',
      key: '1',
      icon: <MobileOutlined />,
      disabled: disable(1),
          },
    {
      label: 'Landscape',
      key: '2',
      icon: <MobileOutlined rotate={-90} />,
      disabled: disable(2),
    },

  
  ];

  
  const menuProps = {
    items,
    onClick: handleMenuClick,
    title: 'Tablet',
  };

  return (


<Dropdown menu={menuProps}  placement="bottom" trigger={['click']} overlayStyle={{border:'1px dashed gray'}} >
<Button
        type={formMode === 'designer' ? 'default' : 'primary'}
        shape="round"
        title="mobile"
      >
        <MobileOutlined size={60} style={{ color: '#ad25b8' }} rotate={mode==2?-90:0} />
      </Button>
      </Dropdown>
  );

    };

  

