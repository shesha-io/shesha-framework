import React, { FC } from 'react';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';
import { DataTypes, getIconByDataType } from '@/index';
import { NumberFormats } from '@/interfaces/dataTypes';
import PropertyWrapper from './propertyWrapper';

export interface IProps extends IModelItem {
  index: number[];
  parent?: IModelItem;
}

export const ArraySimpleProperty: FC<IProps> = props => {
  const { styles } = useStyles();

  const icon = getIconByDataType(props.dataType, props.dataFormat);

  const itemsType = props.properties?.find(p => p.isItemsType);
  const listIcon = itemsType ? getIconByDataType(itemsType.dataType, itemsType.dataFormat) : null;

  let listType = 'undefined';
  if (itemsType) {
    switch (itemsType.dataType) {
      case DataTypes.string: listType = 'string'; break;
      case DataTypes.number: 
        switch (itemsType.dataFormat) {
          case NumberFormats.int64: listType = 'integer'; break;
          case NumberFormats.int32: listType = 'int32'; break;
          case NumberFormats.float: listType = 'float'; break;
          case NumberFormats.double: listType = 'double'; break;
          case NumberFormats.decimal: listType = 'decimal'; break;
        }
        break;
      case DataTypes.dateTime: listType = 'date time'; break;
      case DataTypes.date: listType = 'date'; break;
      case DataTypes.time: listType = 'time'; break;
      case DataTypes.boolean: listType = 'boolean'; break;
      case DataTypes.referenceListItem: listType = itemsType.referenceListId?.name ? itemsType.referenceListId?.name : 'reference list item'; break;
      case DataTypes.geometry: listType = 'geometry'; break;
    }
  }

  return (
    <PropertyWrapper {...props}>
        {icon}<span> </span>{listIcon}
        <span className={styles.shaToolbarItemName}>{props.name} {props.label && <>({props.label})</>}: <i>List of {`<${listType}>`}</i></span>
        {props.description && (
          <Tooltip title={props.description}>
            <QuestionCircleOutlined className={styles.shaHelpIcon} />
          </Tooltip>
        )}
    </PropertyWrapper>
  );
};

export default ArraySimpleProperty;
