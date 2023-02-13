import React from 'react';
import { IToolboxComponent } from '../../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../../providers/form/models';
import { BorderOutlined } from '@ant-design/icons';
import settingsFormJson from './settingsForm.json';
import ComponentsContainer from '../../../componentsContainer';
import { useForm } from '../../../../../providers/form';
import { validateConfigurableComponentSettings } from '../../../../../providers/form/utils';

export interface IBlankViewProps extends IConfigurableFormComponent {}

const settingsForm = settingsFormJson as FormMarkup;

const BlankViewComponent: IToolboxComponent<IBlankViewProps> = {
  type: 'blankView',
  name: 'Blank View',
  icon: <BorderOutlined />,
  factory: (model: IBlankViewProps) => {
    const { formMode, visibleComponentIds } = useForm();

    const hiddenByCondition = visibleComponentIds && !visibleComponentIds.includes(model.id);

    const isHidden = formMode !== 'designer' && (model.hidden || hiddenByCondition);
    if (isHidden) return null;

    return (
      <div>
        <ComponentsContainer containerId={model.id} />
      </div>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  initModel: model => {
    const customProps: IBlankViewProps = {
      ...model,
    };
    return customProps;
  },
};

export default BlankViewComponent;
