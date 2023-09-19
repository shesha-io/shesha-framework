import { IToolboxComponent } from 'interfaces';
import { ISizableColumnComponentProps } from './interfaces';
import { BorderHorizontalOutlined } from '@ant-design/icons';
import React, { Fragment } from 'react';
import { useForm, useFormData, useGlobalState } from 'providers';
import Split from 'react-split';
import ComponentsContainer from 'components/formDesigner/containers/componentsContainer';
import { getStyle } from 'utils/publicUtils';
import { nanoid } from 'nanoid';
import SizableColumnsSettings from './sizableColumnsSettings';

const SizableColumnsComponent: IToolboxComponent<ISizableColumnComponentProps> = {
  type: 'sizableColumns',
  name: 'SizableColumns',
  icon: <BorderHorizontalOutlined />,
  factory: (model) => {
    const { isComponentHidden } = useForm();
    const { data } = useFormData();
    const { globalState } = useGlobalState();
    const { columns } = model as ISizableColumnComponentProps;
    const style = { ...getStyle(model?.style, data, globalState), display: 'flex' };

    if (isComponentHidden(model)) return null;

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
      name: 'custom Name',
      columns: [
        { id: nanoid(), size: 50, components: [] },
        { id: nanoid(), size: 50, components: [] },
      ],
    };

    return tabsModel;
  },
  settingsFormFactory: ({ readOnly, model, onSave, onCancel, onValuesChange }) => {
    return (
      <SizableColumnsSettings
        readonly={readOnly}
        model={model as ISizableColumnComponentProps}
        onSave={onSave}
        onValuesChange={onValuesChange}
        onCancel={onCancel}
      />
    );
  },
  customContainerNames: ['sizableColumns'],
};

export default SizableColumnsComponent;
