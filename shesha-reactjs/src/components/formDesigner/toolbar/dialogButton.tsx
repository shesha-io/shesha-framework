import React, { FC, useEffect, useState } from 'react';
import {Dropdown, Form, Input, MenuProps } from 'antd';
import { BlockOutlined } from '@ant-design/icons';
import { useCanvasConfig } from '@/providers';

export interface IPreviewButtonProps {
  refLink?: React.LegacyRef<HTMLSpanElement>;
};

const calculatePercentageToPx = (value: number,browserWidth: number) => {
  return Math.round((value / 100) * browserWidth);
};


export const DialogButton: FC<IPreviewButtonProps> = ({refLink}) => {
  const { setCanvasWidth,setCanvasZoom,width} = useCanvasConfig();
  const [browserWidth, setBrowserWidth] = useState<number>();
  const [currentWidth,setCurrentWidth]=useState(calculatePercentageToPx(width,browserWidth));

  useEffect(()=>{
    if(!browserWidth){
      setBrowserWidth(window.innerWidth);
    }else if(browserWidth){
      setCurrentWidth(calculatePercentageToPx(width,browserWidth));

    };
  },[width,browserWidth]);
  
  const calculatePercentage=(value: number) =>{
    if(!value){
      return 0;
    }
    return (value / browserWidth) * 100;
  };

  //console.log('currentWidth',width);

  const items: MenuProps['items'] = [
    {
      label :<div style={{width:'11rem'}}>
        <h5 style={{marginTop:'-5px',textDecorationLine:'underline'}}> Canvas Settings</h5>
        <Form>
          <Form.Item label="Width">
            <Input type="number"  value={currentWidth} suffix={'px'} onChange={e=>{
                 setCanvasWidth(calculatePercentage(parseInt(e.target.value,10)));
             }
            }/>
          </Form.Item>
          <Form.Item label="Zoom">
            <Input type="number" defaultValue={100} step={10} suffix={'%'} onChange={e=>{
             setCanvasZoom(parseInt(e.target.value,10));
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
    title: 'Options',
  };

  return (
      <Dropdown menu={menuProps}   placement="bottom" trigger={['click']} overlayStyle={{border:'1px dashed gray'}} >
        <BlockOutlined  ref={refLink}  onClick={(e) => e.preventDefault()}/>
      </Dropdown>
       );
 };

  

