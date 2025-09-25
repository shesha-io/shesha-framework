import React, { FC } from 'react';
import { Tag, Tooltip } from 'antd';
import { QuestionCircleOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { getIconTypeByDataType } from '@/utils/metadata';
import ShaIcon from '@/components/shaIcon';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';

export interface IProps extends IModelItem {
  index: number[];
}

export const EntityProperty: FC<IProps> = (props) => {
  const { styles } = useStyles();

  const icon = getIconTypeByDataType(props.dataType);

  return (
    <div>
      {props.suppress && <span><EyeInvisibleOutlined /> </span>}
      {icon && <ShaIcon iconName={icon} />}
      <span className={styles.shaToolbarItemName}>{props.name} {props.label && <>({props.label})</>}: <i>{props.entityType ?? 'undefined'}</i></span>
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
