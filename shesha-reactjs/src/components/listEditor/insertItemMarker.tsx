import React, { FC } from 'react';
import { Button, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useStyles } from './styles/styles';

interface InsertItemMarkerProps {
  onClick: () => void;
  onOpenChange?: (open: boolean) => void;
}
export const InsertItemMarker: FC<InsertItemMarkerProps> = ({ onClick, onOpenChange }) => {
  const { styles } = useStyles();
  return (
    <Tooltip
      placement="left"
      color="#fff"
      arrow={{ pointAtCenter: true }}
      align={{ offset: [10, 0] }}
      styles={{ body: { borderRadius: '5px', padding: 0, minHeight: '5px' } }}
      onOpenChange={onOpenChange}
      mouseEnterDelay={0}
      mouseLeaveDelay={0}
      title={(
        <Button
          onClick={onClick}
          icon={<PlusOutlined />}
          size="small"
          type="link"
        >
          Add
        </Button>
      )}
    >
      <div className={styles.listInsertArea}></div>
    </Tooltip>
  );
};
