import React, { FC } from 'react';
import { useStyles } from '../styles/styles';
import { Radio } from 'antd';
import { DesktopOutlined, MobileOutlined, TabletOutlined } from '@ant-design/icons';
import { useCanvas } from '@/providers';

export interface ICanvasConfigProps {

}

export const CanvasConfig: FC<ICanvasConfigProps> = () => {
  const { styles } = useStyles();
  const { setDesignerDevice, designerDevice } = useCanvas();

  return (
    <div className={styles.shaDesignerCanvasConfig}>
      <Radio.Group className="radio-group" value={designerDevice} buttonStyle="solid" size="middle">
        <Radio.Button className="radio-button" value="desktop" onClick={() => setDesignerDevice('desktop')} title="Desktop">
          <DesktopOutlined />
        </Radio.Button>

        <Radio.Button className="radio-button" value="tablet" onClick={() => setDesignerDevice('tablet')} title="Tablet">
          <TabletOutlined />
        </Radio.Button>

        <Radio.Button className="radio-button" value="mobile" onClick={() => setDesignerDevice('mobile')} title="Mobile">
          <MobileOutlined />
        </Radio.Button>
      </Radio.Group>
    </div>
  );
};

