import React, { Fragment } from 'react';
import { IToolboxComponent } from '../../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../../providers/form/models';
import { BarChartOutlined } from '@ant-design/icons';
import settingsFormJson from './settingsForm.json';
import ComponentsContainer from '../../../componentsContainer';
import { useForm } from '../../../../../providers/form';
import { validateConfigurableComponentSettings } from '../../../../../providers/form/utils';

export interface IDashboardViewProps extends IConfigurableFormComponent {}

const settingsForm = settingsFormJson as FormMarkup;

const DashboardViewComponent: IToolboxComponent<IDashboardViewProps> = {
  type: 'dashboardView',
  name: 'Dashboard View',
  icon: <BarChartOutlined />,
  factory: (model: IDashboardViewProps) => {
    const { formMode, visibleComponentIds } = useForm();

    const hiddenByCondition = visibleComponentIds && !visibleComponentIds.includes(model.id);

    const isDesignerMode = formMode === 'designer';

    const isHidden = !isDesignerMode && (model.hidden || hiddenByCondition);

    if (isHidden) return null;

    return (
      <Fragment>
        <ComponentsContainer containerId={model.id} />
      </Fragment>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  initModel: model => {
    const customProps: IDashboardViewProps = {
      ...model,
    };
    return customProps;
  },
};

export default DashboardViewComponent;
