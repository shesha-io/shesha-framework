import React, { FC } from 'react';
import { Button, Tooltip } from 'antd';
import { QuestionCircleOutlined, PlusOutlined, DatabaseOutlined } from '@ant-design/icons';
import { usePropertiesEditor } from '../provider';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';
import { ItemChangeDetails } from '@/components/listEditor';
import { JsonOutlined } from '@/icons/jsonOutlined';
import PropertyWrapper from './propertyWrapper';
import { ContainerRenderer } from './itemsContainer';
import { MetadataSourceType } from '@/interfaces/metadata';

export interface IProps {
  index: number[];
  data: IModelItem;
  parent?: IModelItem;
  containerRendering: ContainerRenderer;
  onChange?: (newValue: IModelItem, changeDetails: ItemChangeDetails) => void;
}

export const ArrayObjectProperty: FC<IProps> = (props) => {
  const { addItem } = usePropertiesEditor();
  const { styles } = useStyles();

  const onAddChildClick = (): void => {
    if (props.data.properties[0])
      addItem(props.data.properties[0].id);
  };

  const itemsType = props.data.properties?.find((p) => p.isItemsType);

  return (
    <PropertyWrapper {...props.data} index={props.index}>
      <DatabaseOutlined /><span> </span><JsonOutlined />
      <span className={styles.shaToolbarItemName}>{props.data.name} {props.data.label && <>({props.data.label})</>}: <i>{'List of <object>'}</i></span>
      {props.data.description && (
        <Tooltip title={props.data.description}>
          <QuestionCircleOutlined className={styles.shaHelpIcon} />
        </Tooltip>
      )}
      {
        props.data.source === MetadataSourceType.UserDefined && !props.data.inheritedFromId &&
        <Button icon={<PlusOutlined color="red" />} onClick={onAddChildClick} size="small">Add child</Button>
      }
      <div className={styles.shaToolbarGroupContainer}>
        {props.containerRendering({
          index: props.index,
          items: itemsType?.properties || [],
          parent: props.data,
          disableDrag: true,
          onChange: (newItems, changeDetails) => {
            if (props.onChange)
              props.onChange({ ...props.data, properties: [...newItems] }, changeDetails);
          },
        })}
      </div>
    </PropertyWrapper>
  );
};

export default ArrayObjectProperty;
