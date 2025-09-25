import React, { FC } from 'react';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { getIconByDataType } from '@/utils/metadata';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';
import { DataTypes } from '@/index';
import { ObjectFormats } from '@/interfaces/dataTypes';
import PropertyWrapper from './propertyWrapper';

export interface IProps extends IModelItem {
  index: number[];
  parent?: IModelItem;
}

export const SimpleProperty: FC<IProps> = (props) => {
  const { styles } = useStyles();

  const icon = getIconByDataType(props.dataType, props.dataFormat || props.entityType);

  const label = props.isItemsType
    ? <>Array items type</>
    : <>{props.name} {props.label && <>({props.label})</>}</>;

  const labelInfo = props.dataType === DataTypes.entityReference
    ? <>: <i>{props.entityType ?? 'Generic entity reference' }</i></>
    : props.dataType === DataTypes.object && props.dataFormat === ObjectFormats.interface
      ? <>: <i>{props.entityType ?? 'undefined' }</i></>
      : null;


  const refList = props.dataType === DataTypes.referenceListItem && props.referenceListId
    ? <span> <i>{`RefList<${props.referenceListId.name}>`}</i></span>
    : null;

  return (
    <PropertyWrapper {...props}>
      {icon}
      <span className={styles.shaToolbarItemName}>{label}{labelInfo}{refList}</span>
      {props.description && (
        <Tooltip title={props.description}>
          <QuestionCircleOutlined className={styles.shaHelpIcon} />
        </Tooltip>
      )}
    </PropertyWrapper>
  );
};

export default SimpleProperty;
