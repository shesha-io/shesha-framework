import React, { FC } from 'react';
import { Button, Tooltip } from 'antd';
import { QuestionCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { usePropertiesEditor } from '../provider';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { getIconTypeByDataType } from '@/utils/metadata';
import { ShaIcon } from '../../..';
import { MetadataSourceType } from '@/interfaces/metadata';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';
import { ItemChangeDetails } from '@/components/listEditor';
import PropertyWrapper from './propertyWrapper';
import { ContainerRenderer } from './itemsContainer';

export interface IProps {
  index: number[];
  data: IModelItem;
  parent?: IModelItem;
  containerRendering: ContainerRenderer;
  onChange?: (newValue: IModelItem, changeDetails: ItemChangeDetails) => void;
}

export const ComplexProperty: FC<IProps> = (props) => {
  const { addItem } = usePropertiesEditor();
  const { styles } = useStyles();

  const icon = getIconTypeByDataType(props.data.dataType);

  const onAddChildClick = (): void => {
    addItem(props.data.id);
  };

  const label = props.data.isItemsType
    ? <>Array items type</>
    : <>{props.data.name} {props.data.label && <>({props.data.label})</>}</>;

  // skip array items type property
  const properties = props.data.properties?.filter((p) => !p.isItemsType) || [];

  return (
    <PropertyWrapper {...props.data} index={props.index}>
      {icon && <ShaIcon iconName={icon} />}
      <span className={styles.shaToolbarItemName}>{label}</span>
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
          items: properties,
          parent: props.data,
          onChange: (newItems, changeDetails) => {
            if (props.onChange)
              props.onChange({ ...props.data, properties: [...newItems] }, changeDetails);
          },
        })}
      </div>
    </PropertyWrapper>
  );
};

export default ComplexProperty;
