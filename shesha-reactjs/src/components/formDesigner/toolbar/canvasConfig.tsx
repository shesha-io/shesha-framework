import React, { FC,useEffect, useRef, useState } from 'react';
import { DialogButton } from './dialogButton';
import { useStyles } from '../styles/styles';
import { Radio } from 'antd';
import { useForm } from '@/providers';
import { DesktopOutlined, TabletOutlined } from '@ant-design/icons';

export interface ICanvasConfigProps {

}

export const CanvasConfig: FC<ICanvasConfigProps> = () => {
    const { styles } = useStyles();
    const {setFormWidth} = useForm();
    const [radioValue, setRadioValue] = useState('desktop');
    const dialogRef=useRef(null);

    useEffect(()=>{
      dialogRef.current.addEventListener('click',()=>{
        setRadioValue('dialog');
        });
    },[]);

  return (
    <div className={styles.shaDesignerCanvasConfig}>
    <Radio.Group value={radioValue} buttonStyle="solid" size={'middle'}>
      <Radio.Button value="desktop" onClick={()=>{
        setRadioValue('desktop');
        setFormWidth(100);
      }
      }>
        <DesktopOutlined/>
        </Radio.Button>
      <Radio.Button value="tablet"  onClick={()=>{
            setRadioValue('tablet');
            setFormWidth(75);     
      }}>
        <TabletOutlined/>
      </Radio.Button>
      <Radio.Button value="dialog" onClick={()=> dialogRef.current.click()}>
        <DialogButton refLink={dialogRef}/>
        </Radio.Button>
    </Radio.Group>
    </div>
  );
};




