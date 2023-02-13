import React, { Fragment } from 'react';
import { IToolboxComponent } from '../../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../../providers/form/models';
import { TableOutlined } from '@ant-design/icons';
import settingsFormJson from './settingsForm.json';
import ComponentsContainer from '../../../componentsContainer';
import { useForm } from '../../../../../providers/form';
import { validateConfigurableComponentSettings } from '../../../../../providers/form/utils';

export interface ITableViewComponentProps extends IConfigurableFormComponent {
  components?: IConfigurableFormComponent[];
}

const settingsForm = settingsFormJson as FormMarkup;

const TableViewComponent: IToolboxComponent<ITableViewComponentProps> = {
  type: 'tableView',
  name: 'Table View',
  icon: <TableOutlined />,
  factory: (model: ITableViewComponentProps) => {
    const { formMode, visibleComponentIds } = useForm();

    const hiddenByCondition = visibleComponentIds && !visibleComponentIds.includes(model.id);

    const isHidden = formMode !== 'designer' && (model.hidden || hiddenByCondition);
    if (isHidden) return null;

    return (
      <Fragment>
        <ComponentsContainer
          containerId={model.id}
          //  dynamicComponents={model?.isDynamic ? model?.components : []}
        />
      </Fragment>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  initModel: model => {
    const customProps: ITableViewComponentProps = {
      ...model,
    };
    return customProps;
  },
};

export default TableViewComponent;
