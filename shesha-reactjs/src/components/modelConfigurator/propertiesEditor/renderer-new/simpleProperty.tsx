import React, { FC } from 'react';
import { Tooltip, Tag } from 'antd';
import { EyeInvisibleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { getIconTypeByDataType } from '@/utils/metadata';
import { ShaIcon } from '../../..';
import { MetadataSourceType } from '@/interfaces/metadata';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';

export interface IProps extends IModelItem {
  index: number[];
}

export const SimpleProperty: FC<IProps> = (props) => {
  const { styles } = useStyles();

  const icon = getIconTypeByDataType(props.dataType);

  return (
    <div>
      {props.suppress && <span><EyeInvisibleOutlined /> </span>}
      {icon && <ShaIcon iconName={icon} />}

      <span className={styles.shaToolbarItemName}>{props.name} {props.label && <>({props.label})</>}</span>

      {props.description && (
        <Tooltip title={props.description}>
          <QuestionCircleOutlined className={styles.shaHelpIcon} />
        </Tooltip>
      )}
      <div className={styles.shaToolbarItemControls}>
        {props.source === MetadataSourceType.ApplicationCode && (<Tag>APP</Tag>)}
      </div>
    </div>
  );
};

export default SimpleProperty;
