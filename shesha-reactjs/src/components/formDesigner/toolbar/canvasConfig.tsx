import React, { FC, useEffect, useRef, useState } from 'react';
import { DialogButton } from './dialogButton';
import { useStyles } from '../styles/styles';
import { Radio } from 'antd';
import { DesktopOutlined } from '@ant-design/icons';
import { useCanvasConfig } from '@/providers';
import { MobileOptions } from './mobileDropdown';

export interface ICanvasConfigProps {

}

export const CanvasConfig: FC<ICanvasConfigProps> = () => {
  const { styles } = useStyles();
  const { setCanvasWidth } = useCanvasConfig();
  const [radioValue, setRadioValue] = useState('desktop');
  const dialogRef = useRef(null);
  const mobileRef = useRef(null);


  useEffect(() => {
    dialogRef.current.addEventListener('click', () => {
      setRadioValue('dialog');
    });
    mobileRef.current.addEventListener('click', () => {
      setRadioValue('mobile');
      setCanvasWidth(430, 'mobile');
    });
    setCanvasWidth(100, 'desktop');
    return () => {
      setRadioValue('desktop');
    };
  }, []);

  return (
    <div className={styles.shaDesignerCanvasConfig}>
      <Radio.Group className="radio-group" value={radioValue} buttonStyle="solid" size={'middle'}>
        <Radio.Button className="radio-button" value="desktop" onClick={() => {
          setRadioValue('desktop');
          setCanvasWidth(100, 'desktop');
        }}
          title="Desktop"
        >
          <DesktopOutlined />
        </Radio.Button>
        <Radio.Button
          className="radio-button"
          value="mobile"
          onClick={() => mobileRef.current.click()}
          title="Mobile"
        >
          <MobileOptions refLink={mobileRef} customEditRef={dialogRef} />
        </Radio.Button>
        <Radio.Button className="radio-button" value="dialog" onClick={() => dialogRef.current.click()} title="Custom-Width"
        >
          <DialogButton refLink={dialogRef} />
        </Radio.Button>
      </Radio.Group>
    </div>
  );
};

