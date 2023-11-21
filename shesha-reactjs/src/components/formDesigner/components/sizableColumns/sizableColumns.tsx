import { IToolboxComponent } from 'interfaces';
import { ISizableColumnComponentProps } from './interfaces';
import { BorderHorizontalOutlined } from '@ant-design/icons';
import React, { Fragment } from 'react';
import { useFormData, useGlobalState } from 'providers';
import Split from 'react-split';
import ComponentsContainer from 'components/formDesigner/containers/componentsContainer';
import { getStyle } from 'utils/publicUtils';
import { nanoid } from 'nanoid';
import { SizableColumnsSettingsForm } from './sizableColumnsSettings';
import { migrateCustomFunctions, migratePropertyName } from 'designer-components/_common-migrations/migrateSettings';

const SizableColumnsComponent: IToolboxComponent<ISizableColumnComponentProps> = {
  type: 'sizableColumns',
  name: 'SizableColumns',
  icon: <BorderHorizontalOutlined />,
  Factory: ({ model }) => {
    const { data } = useFormData();
    const { globalState } = useGlobalState();
    const { columns } = model as ISizableColumnComponentProps;
    const style = { ...getStyle(model?.style, data, globalState), display: 'flex' };

    if (model.hidden) return null;

    return (
      <Split cursor="col-resize" style={style}>
        {columns &&
          columns.map((col) => (
            <Fragment>
              <ComponentsContainer
                containerId={col.id}
                dynamicComponents={
                  model?.isDynamic ? col?.components?.map((c) => ({ ...c, readOnly: model?.readOnly })) : []
                }
              />
            </Fragment>
          ))}
      </Split>
    );
  },
  initModel: (model) => {
    const tabsModel: ISizableColumnComponentProps = {
      ...model,
      columns: [
        { id: nanoid(), size: 50, components: [] },
        { id: nanoid(), size: 50, components: [] },
      ],
    };

    return tabsModel;
  },
  settingsFormFactory: (props) => <SizableColumnsSettingsForm {...props} />,
  migrator: m => m
    .add<ISizableColumnComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)) as ISizableColumnComponentProps)
  ,
  customContainerNames: ['columns'],
};

export default SizableColumnsComponent;
