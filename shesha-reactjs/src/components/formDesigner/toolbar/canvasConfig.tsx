import React, { FC, useEffect, useState } from 'react';
import { useStyles } from '../styles/styles';
import { Radio } from 'antd';
import { DesktopOutlined, MobileOutlined, TabletOutlined } from '@ant-design/icons';
import { useCanvasConfig } from '@/providers';

export interface ICanvasConfigProps {

}

export const CanvasConfig: FC<ICanvasConfigProps> = () => {
  const { styles } = useStyles();
  const { setCanvasWidth } = useCanvasConfig();
  const [radioValue, setRadioValue] = useState('desktop');


  useEffect(() => {
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
          value="tablet"
          onClick={() => {
 setRadioValue('tablet'); setCanvasWidth(924, 'tablet'); 
}}
          title="Tablet"
        >
          <TabletOutlined />
        </Radio.Button>

        <Radio.Button
          className="radio-button"
          value="mobile"
          onClick={() => {
 setRadioValue('mobile'); setCanvasWidth(428, 'mobile'); 
}}
          title="Mobile"
        >
          <MobileOutlined />
        </Radio.Button>
      </Radio.Group>
    </div>
  );
};

