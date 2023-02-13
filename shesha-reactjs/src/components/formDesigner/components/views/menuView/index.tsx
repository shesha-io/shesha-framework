import React, { Fragment } from 'react';
import { IToolboxComponent } from '../../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../../providers/form/models';
import { MenuUnfoldOutlined } from '@ant-design/icons';
import settingsFormJson from './settingsForm.json';
import ComponentsContainer from '../../../componentsContainer';
import { useForm } from '../../../../../providers/form';
import { validateConfigurableComponentSettings } from '../../../../../providers/form/utils';

export interface IMenuViewProps extends IConfigurableFormComponent {}

const settingsForm = settingsFormJson as FormMarkup;

const MenuViewComponent: IToolboxComponent<IMenuViewProps> = {
  type: 'menuView',
  name: 'Menu View',
  icon: <MenuUnfoldOutlined />,
  factory: (model: IMenuViewProps) => {
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
    const customProps: IMenuViewProps = {
      ...model,
    };
    return customProps;
  },
};

export default MenuViewComponent;
