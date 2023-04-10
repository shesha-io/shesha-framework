import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup } from '../../../../providers/form/models';
import { GroupOutlined } from '@ant-design/icons';
import settingsFormJson from './settingsForm.json';
import { CollapsiblePanel } from '../../../../';
import ComponentsContainer from '../../componentsContainer';
import { useForm } from '../../../../providers/form';
import React from 'react';
import { validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { ICollapsiblePanelComponentProps } from './interfaces';

const settingsForm = settingsFormJson as FormMarkup;

const CollapsiblePanelComponent: IToolboxComponent<ICollapsiblePanelComponentProps> = {
  type: 'collapsiblePanel',
  name: 'Collapsible Panel',
  icon: <GroupOutlined />,
  factory: (model: ICollapsiblePanelComponentProps) => {
    const { isComponentHidden } = useForm();
    const { label, expandIconPosition, collapsedByDefault } = model;

    if (isComponentHidden(model)) return null;

    return (
      <CollapsiblePanel header={label} expandIconPosition={expandIconPosition} collapsedByDefault={collapsedByDefault}>
        <ComponentsContainer
          containerId={model.id}
          dynamicComponents={model?.isDynamic ? model?.components?.map(c => ({ ...c, readOnly: model?.readOnly })) : []}
        />
      </CollapsiblePanel>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  initModel: model => {
    const customProps: ICollapsiblePanelComponentProps = {
      ...model,
      expandIconPosition: 'right',
    };
    return customProps;
  },
};

export default CollapsiblePanelComponent;
