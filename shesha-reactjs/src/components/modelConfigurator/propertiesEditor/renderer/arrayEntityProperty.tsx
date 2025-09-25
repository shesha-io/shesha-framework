import React, { FC } from 'react';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { getIconByDataType } from '@/utils/metadata';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';
import PropertyWrapper from './propertyWrapper';

export interface IProps extends IModelItem {
  index: number[];
  parent?: IModelItem;
}

export const ArrayEntityProperty: FC<IProps> = (props) => {
  const { styles } = useStyles();

  const icon = getIconByDataType(props.dataType, props.dataFormat);

  const itemsType = props.properties?.find((p) => p.isItemsType);
  const listType = itemsType?.entityType;
  const listIcon = itemsType ? getIconByDataType(itemsType.dataType, itemsType.dataFormat) : null;

  return (
    <PropertyWrapper {...props}>
      {icon}<span> </span>{listIcon}
      <span className={styles.shaToolbarItemName}>{props.name} {props.label && <>({props.label})</>}: <i>List of {`<${listType ?? 'undefined'}>`}</i></span>
      {props.description && (
        <Tooltip title={props.description}>
          <QuestionCircleOutlined className={styles.shaHelpIcon} />
        </Tooltip>
      )}
    </PropertyWrapper>
  );
};

export default ArrayEntityProperty;
