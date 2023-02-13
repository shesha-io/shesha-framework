import React from 'react';
import { IToolboxComponent } from '../../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../../providers/form/models';
import { FormOutlined } from '@ant-design/icons';
import settingsFormJson from './settingsForm.json';
import { CollapsiblePanel } from '../../../../..';
import ComponentsContainer from '../../../componentsContainer';
import { ExpandIconPosition } from 'antd/lib/collapse/Collapse';
import { useForm } from '../../../../../providers/form';
import { validateConfigurableComponentSettings } from '../../../../../providers/form/utils';

export interface ICollapsiblePanelProps extends IConfigurableFormComponent {
  expandIconPosition?: ExpandIconPosition;
}

const settingsForm = settingsFormJson as FormMarkup;

const DetailsViewComponent: IToolboxComponent<ICollapsiblePanelProps> = {
  type: 'formView',
  name: 'Form View',
  icon: <FormOutlined />,
  factory: (model: ICollapsiblePanelProps) => {
    const { formMode, visibleComponentIds } = useForm();
    const { label, expandIconPosition } = model;

    const hiddenByCondition = visibleComponentIds && !visibleComponentIds.includes(model.id);

    const isHidden = formMode !== 'designer' && (model.hidden || hiddenByCondition);

    if (isHidden) return null;

    return (
      <CollapsiblePanel header={label} expandIconPosition={expandIconPosition}>
        <ComponentsContainer containerId={model.id} />
      </CollapsiblePanel>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  initModel: model => {
    const customProps: ICollapsiblePanelProps = {
      ...model,
      expandIconPosition: 'right',
    };
    return customProps;
  },
};

export default DetailsViewComponent;
