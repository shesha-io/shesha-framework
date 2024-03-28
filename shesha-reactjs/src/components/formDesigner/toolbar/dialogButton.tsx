import React, { FC, useEffect, useState } from 'react';
import { Button, Dropdown, Form, Input, MenuProps } from 'antd';
import { BlockOutlined } from '@ant-design/icons';
import { useForm } from '@/providers';

export interface IPreviewButtonProps {}

const totalBrowserWidth = window.innerWidth;

const calculatePercentageToPx = (value: number) => {
  return Math.round((value / 100) * totalBrowserWidth);
}

export const DialogButton: FC<IPreviewButtonProps> = () => {
  const { setFormWidth,formWidth,setFormZoom} = useForm();
  const [currentWidth,setCurrentWidth]=useState(calculatePercentageToPx(formWidth))

  useEffect(()=>{
    setCurrentWidth(calculatePercentageToPx((formWidth)))
  },[formWidth])
  
  const calculatePercentage=(value: number) =>{
    if(!value){
      return 0;
    }
    return (value / totalBrowserWidth) * 100;
  }

  const items: MenuProps['items'] = [
    {
      label :<div style={{width:'11rem'}}>
        <h5 style={{marginTop:'-5px',textDecorationLine:'underline'}}> Canvas Settings</h5>
        <Form>
          <Form.Item label="Width">
            <Input type="number"  value={currentWidth} suffix={'px'} onChange={e=>{
                 setFormWidth(calculatePercentage(parseInt(e.target.value)))
             }
            }/>
          </Form.Item>
          <Form.Item label="Zoom">
            <Input type="number" defaultValue={100} step={10} suffix={'%'} onChange={e=>{
             setFormZoom(parseInt(e.target.value))
            }
            }/>
          </Form.Item>
        </Form>
  
      </div>,
      key: '1',
      disabled: true,
    },       
  ];

  const menuProps = {
    items,
    title: 'Tablet',
  };
  const isCustomWidth = (formWidth === 100 || formWidth === 75)
  return (
<Dropdown menu={menuProps}  placement="bottom" trigger={['click']} overlayStyle={{border:'1px dashed gray'}} >
<Button
        type={isCustomWidth ? 'default' : 'primary'}
        shape="round"
        title="disable"
      >
        <BlockOutlined  />
      </Button>
      </Dropdown>
  );
 };

  

