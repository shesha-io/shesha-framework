import React, { FC } from 'react';
import { Tag, Tooltip } from 'antd';
import { QuestionCircleOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { JsonOutlined } from '@/icons/jsonOutlined';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';

export interface IProps extends IModelItem {
  index: number[];
}

export const JsonProperty: FC<IProps> = (props) => {
  const { styles } = useStyles();

  return (
    <div>
      {props.suppress && <span><EyeInvisibleOutlined /> </span>}
      <JsonOutlined />
      <span className={styles.shaToolbarItemName}>{props.name} : <i>{props.entityType ?? 'undefined'}</i></span>
      {props.description && (
        <Tooltip title={props.description}>
          <QuestionCircleOutlined className={styles.shaHelpIcon} />
        </Tooltip>
      )}
      <div className={styles.shaToolbarItemControls}>
        <Tag>Json</Tag>
      </div>

    </div>
  );
};
