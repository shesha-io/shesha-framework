import React, { FC } from 'react';
import { Tag, Tooltip } from 'antd';
import { QuestionCircleOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { getIconTypeByDataType } from '@/utils/metadata';
import { ShaIcon } from '../../..';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';
import { MetadataSourceType } from '@/interfaces/metadata';
import { ItemChangeDetails } from '@/components/listEditor';

export interface IContainerRenderArgs {
  index?: number[];
  items: IModelItem[];
  onChange?: (items: IModelItem[], changeDetails: ItemChangeDetails) => void;
}

export type ContainerRenderer = (args: IContainerRenderArgs) => React.ReactNode;

export interface IProps {
  index: number[];
  data: IModelItem;
  containerRendering: ContainerRenderer;
  onChange: (newValue: IModelItem, changeDetails: ItemChangeDetails) => void;
}

export const ComplexProperty: FC<IProps> = ({ data, index, containerRendering, onChange }) => {
  const { styles } = useStyles();

  const icon = getIconTypeByDataType(data.dataType);

  return (
    <div>
      {data.suppress && <span><EyeInvisibleOutlined /> </span>}
      {icon && <ShaIcon iconName={icon} />}
      <span className={styles.shaToolbarItemName}>{data.name}</span>
      {data.description && (
        <Tooltip title={data.description}>
          <QuestionCircleOutlined className={styles.shaHelpIcon} />
        </Tooltip>
      )}
      <div className={styles.shaToolbarItemControls}>
        {data.source === MetadataSourceType.ApplicationCode && (<Tag>APP</Tag>)}
      </div>
      <div className={styles.shaToolbarGroupContainer}>
        {containerRendering({
          index: index,
          items: data.properties || [],
          onChange: (newItems, changeDetails) => {
            onChange({ ...data, properties: [...newItems] }, changeDetails);
          },
        })}
      </div>
    </div>
  );
};
