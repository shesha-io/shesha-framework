import { ShareAltOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { FC, useMemo } from 'react';
import { useStyles } from './styles';

export interface IInheritedButtonProps {
  jsSettings?: boolean;
  onClick?: () => void;
}

const InheritedButton: FC<IInheritedButtonProps> = ({ jsSettings, onClick }) => {
  const { styles } = useStyles();

  const shiftStyle = useMemo((): React.CSSProperties => {
    return jsSettings ? { right: '16px' } : { };
  }, [jsSettings]);

  return (
    <div className={styles.inheritedButtonContent}>
      <Button
        className={`${styles.inheritedButton} inlineJS`}
        style={shiftStyle}
        type="text"
        size="small"
        icon={<ShareAltOutlined style={{ color: 'white', backgroundColor: '#ff0000ff' }} />}
        onClick={onClick}
      />
    </div>
  );
};

export default InheritedButton;
