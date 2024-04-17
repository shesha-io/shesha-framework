import React, { FC } from 'react';
import { Tag, Tooltip } from 'antd';
import { QuestionCircleOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { getIconByDataType } from '@/utils';
import { ShaIcon } from '../../..';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';
import { MetadataSourceType } from '@/interfaces/metadata';

export interface IContainerRenderArgs {
  index?: number[];
  items: IModelItem[];
}

export type ContainerRenderer = (args: IContainerRenderArgs) => React.ReactNode;

export interface IProps extends IModelItem {
  index: number[];
  containerRendering: ContainerRenderer;
}

export const ComplexProperty: FC<IProps> = props => {
  const { styles } = useStyles();

  const icon = getIconByDataType(props.dataType);

  return (
    <div>
      {props.suppress && <span><EyeInvisibleOutlined /> </span>}
      {icon && <ShaIcon iconName={icon} />}
      <span className={styles.shaToolbarItemName}>{props.name}</span>
      {props.description && (
        <Tooltip title={props.description}>
          <QuestionCircleOutlined className={styles.shaHelpIcon} />
        </Tooltip>
      )}
      <div className={styles.shaToolbarItemControls}>
        {props.source === MetadataSourceType.ApplicationCode && (<Tag>APP</Tag>)}
      </div>
      <div className={styles.shaToolbarGroupContainer}>
        {props.containerRendering({ index: props.index, items: props.properties || [] })}
      </div>
    </div>
  );
};