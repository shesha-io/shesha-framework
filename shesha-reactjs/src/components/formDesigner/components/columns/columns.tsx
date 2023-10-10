import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { SplitCellsOutlined } from '@ant-design/icons';
import { Row, Col } from 'antd';
import ComponentsContainer from '../../containers/componentsContainer';
import { useFormData, useGlobalState } from '../../../../providers';
import { nanoid } from 'nanoid/non-secure';
import { IColumnsComponentProps } from './interfaces';
import { getStyle } from 'utils/publicUtils';
import { migrateCustomFunctions, migratePropertyName } from 'designer-components/_common-migrations/migrateSettings';
import { ColumnsSettingsForm } from './columnsSettings';

const ColumnsComponent: IToolboxComponent<IColumnsComponentProps> = {
  type: 'columns',
  name: 'Columns',
  icon: <SplitCellsOutlined />,
  factory: (model) => {
    const { data } = useFormData();
    const { globalState } = useGlobalState();
    const { columns, gutterX = 0, gutterY = 0 } = model as IColumnsComponentProps;

    if (model.hidden) return null;

    return (
      <Row gutter={[gutterX, gutterY]} style={getStyle(model?.style, data, globalState)}>
        {columns &&
          columns.map((col, index) => (
            <Col
              key={index}
              md={col.flex}
              offset={col.offset}
              pull={col.pull}
              push={col.push}
              className="sha-designer-column"
            >
              <ComponentsContainer
                containerId={col.id}
                dynamicComponents={
                  model?.isDynamic ? col?.components?.map((c) => ({ ...c, readOnly: model?.readOnly })) : []
                }
              />
            </Col>
          ))}
      </Row>
    );
  },
  migrator: (m) => m
    .add<IColumnsComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)) as IColumnsComponentProps)
  ,
  initModel: (model) => {
    const tabsModel: IColumnsComponentProps = {
      ...model,
      propertyName: 'custom Name',
      columns: [
        { id: nanoid(), flex: 12, offset: 0, push: 0, pull: 0, components: [] },
        { id: nanoid(), flex: 12, offset: 0, push: 0, pull: 0, components: [] },
      ],
      gutterX: 12,
      gutterY: 12,
    };

    return tabsModel;
  },
  settingsFormFactory: (props) => (<ColumnsSettingsForm {...props}/>),
  customContainerNames: ['columns'],
};

export default ColumnsComponent;
