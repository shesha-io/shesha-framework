import React, { FC } from 'react';
import { Tag, Tooltip } from 'antd';
import { QuestionCircleOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { IModelItem } from '@/interfaces/modelConfigurator';
import GenericOutlined from '@/icons/genericOutlined';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';

export interface IProps extends IModelItem {
  index: number[];
}

export const GenericEntityProperty: FC<IProps> = (props) => {
  const { styles } = useStyles();

  return (
    <div>
      {props.suppress && <span><EyeInvisibleOutlined /> </span>}
      <GenericOutlined />
      <span className={styles.shaToolbarItemName}>{props.name} {props.label && <>({props.label})</>}: <i>Generic entity reference</i></span>
      {props.description && (
        <Tooltip title={props.description}>
          <QuestionCircleOutlined className={styles.shaHelpIcon} />
        </Tooltip>
      )}
      <div className={styles.shaToolbarItemControls}>
        <Tag>App</Tag>
      </div>
    </div>
  );
};
