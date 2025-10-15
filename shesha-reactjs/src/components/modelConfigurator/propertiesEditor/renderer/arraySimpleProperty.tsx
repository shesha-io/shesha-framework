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

const getListType = (itemsType: IModelItem): string => {
  if (itemsType) {
    switch (itemsType.dataType) {
      case DataTypes.string: return 'string';
      case DataTypes.number:
        switch (itemsType.dataFormat) {
          case NumberFormats.int64: return 'integer';
          case NumberFormats.int32: return 'int32';
          case NumberFormats.float: return 'float';
          case NumberFormats.double: return 'double';
          case NumberFormats.decimal: return 'decimal';
        }
      case DataTypes.dateTime: return 'date time';
      case DataTypes.date: return 'date';
      case DataTypes.time: return 'time';
      case DataTypes.boolean: return 'boolean';
      case DataTypes.referenceListItem: return itemsType.referenceListId?.name ? itemsType.referenceListId?.name : 'reference list item';
      case DataTypes.geometry: return 'geometry';
    }
  }
  return 'undefined';
};

export const ArraySimpleProperty: FC<IProps> = (props) => {
  const { styles } = useStyles();

  const icon = getIconByDataType(props.dataType, props.dataFormat);

  const itemsType = props.properties?.find((p) => p.isItemsType);
  const listIcon = itemsType ? getIconByDataType(itemsType.dataType, itemsType.dataFormat) : null;

  const listType = getListType(itemsType);

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
