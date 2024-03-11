import React, { FC, useState } from 'react';
import { Button, Dropdown, MenuProps } from 'antd';
import { MobileOutlined,BlockOutlined } from '@ant-design/icons';
import { useForm } from '@/providers';

export interface IPreviewButtonProps {}

export const DialogButton: FC<IPreviewButtonProps> = () => {
  const {  formMode } = useForm();
  const [mode,setMode]=useState(1);


  const handleMenuClick: MenuProps['onClick'] = (e) => {
    setMode(parseInt(e.key));
  };

  const disable=(key:number)=>mode===key?true:false;
  
  const items: MenuProps['items'] = [
    {
      label: 'Small',
      key: '1',
      icon: <MobileOutlined size={25}/>,
      disabled: disable(1),
          },
    {
      label: 'Medium',
      key: '2',
      icon: <MobileOutlined rotate={-90} />,
      disabled: disable(2),
    },
    {
        label: 'Full Screen',
        key: '3',
        icon: <MobileOutlined size={80} />,
        disabled: disable(3),
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
        title="disable"
      >
        <BlockOutlined size={60} style={{ color: '#ad25b8' }}  />
      </Button>
      </Dropdown>
  );

    };

  

