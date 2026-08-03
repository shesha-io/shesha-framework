import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { GroupOutlined } from '@ant-design/icons';
import React from 'react';
import { IContainerCheckerComponentProps, ContainerCheckerComponentDefinition } from './interfaces';
import { getSettings } from './settingsForm';
import { isDefined } from '@/utils';
import { IConfigurableFormComponent, isConfigurableFormComponent, useShaFormInstanceOrUndefined } from '@/providers';
import { useParentOrUndefined } from '@/providers/parentProvider';
import { isContainerComponent } from '../container/containerComponent';
import { useFormDesignerOrUndefined } from '@/providers/formDesigner';

const ContainerCheckerComponent: ContainerCheckerComponentDefinition = {
  type: 'containerChecker',
  isInput: false,
  name: 'Container checker',
  icon: <GroupOutlined />,
  Factory: ({ model }) => {
    const data = useShaFormInstanceOrUndefined()?.formData;
    const parent = useParentOrUndefined();
    const form = useFormDesignerOrUndefined()?.state.formFlatMarkup;

    if (!isDefined(form) || !isDefined(data) || !('id' in data)) return null;

    let container = parent;
    while (isDefined(container) && 'formMode' in container && container.formMode !== 'designer')
      container = container.parent;

    if (!isDefined(container) || !('model' in container)) return null;

    const parentModel = container.model;
    if (!isConfigurableFormComponent(parentModel)) return null;
    if (!isContainerComponent(parentModel)) return null;
    if (!isDefined(parentModel.gridColumnsCount) || parentModel.gridColumnsCount === 0) return null;

    const components = 'id' in parentModel && typeof parentModel.id === 'string' ? form.componentRelations[parentModel.id] ?? [] : [];
    if (components.find((x) => x === data.id) == null) return null;

    return <ComponentsContainer containerId={model.id} dynamicComponents={model.isDynamic === true ? model.components : []} />;
  },
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
};

export const isContainerCheckerComponent = (component: IConfigurableFormComponent): component is IContainerCheckerComponentProps => component.type === ContainerCheckerComponent.type;

export default ContainerCheckerComponent;
