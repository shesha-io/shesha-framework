import React, { FC, useEffect, useRef, useState } from 'react';
import { DialogButton } from './dialogButton';
import { useStyles } from '../styles/styles';
import { Radio } from 'antd';
import { DesktopOutlined, TabletOutlined } from '@ant-design/icons';
import { useCanvasConfig } from '@/providers';

export interface ICanvasConfigProps {

}

export const CanvasConfig: FC<ICanvasConfigProps> = () => {
  const { styles } = useStyles();
  const { setCanvasWidth } = useCanvasConfig();
  const [radioValue, setRadioValue] = useState('desktop');
  const dialogRef = useRef(null);

  useEffect(() => {
    dialogRef.current.addEventListener('click', () => {
      setRadioValue('dialog');
    });
  }, []);

  return (
    <div className={styles.shaDesignerCanvasConfig}>
      <Radio.Group value={radioValue} buttonStyle="solid" size={'middle'}>
        <Radio.Button value="desktop" onClick={() => {
          setRadioValue('desktop');
          setCanvasWidth(100);
        }
        }
          title="Desktop">
          <DesktopOutlined />
        </Radio.Button>
        <Radio.Button value="tablet" onClick={() => {
          setRadioValue('tablet');
          setCanvasWidth(75);
        }}
          title="Tablet"
        >
          <TabletOutlined />
        </Radio.Button>
        <Radio.Button value="dialog" onClick={() => dialogRef.current.click()} title="Custom-Width">
          <DialogButton refLink={dialogRef} />
        </Radio.Button>
      </Radio.Group>
    </div>
  );
};




