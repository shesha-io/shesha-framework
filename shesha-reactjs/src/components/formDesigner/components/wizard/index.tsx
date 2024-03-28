import React from 'react';
import WizardSettingsForm from './settings';
import { DataContextProvider } from '@/providers/dataContextProvider/index';
import { DoubleRightOutlined } from '@ant-design/icons';
import { IConfigurableFormComponent, IFormComponentContainer } from '@/providers/form/models';
import { IToolboxComponent } from '@/interfaces';
import { IWizardComponentProps } from './models';
import { IWizardComponentPropsV0, migrateV0toV1 } from './migrations/migrate-v1';
import { migrateWizardActions } from './migrations/migrateWizardActions';
import { nanoid } from '@/utils/uuid';
import { Tabs } from './tabs';
import {
  migrateCustomFunctions,
  migratePropertyName,
  migrateFunctionToProp,
} from '@/designer-components/_common-migrations/migrateSettings';

const TabsComponent: IToolboxComponent<Omit<IWizardComponentProps, 'size'>> = {
  type: 'wizard',
  name: 'Wizard',
  icon: <DoubleRightOutlined />,
  Factory: ({ model }) => {
    return (
      <DataContextProvider
        id={'ctx_' + model.id}
        name={model.componentName}
        description={`Wizard context for ${model.componentName}`}
        type='control'
      >
        <Tabs {...model} />
      </DataContextProvider>
    );
  },
  migrator: (m) =>
    m
      .add<IWizardComponentPropsV0>(0, (prev) => {
        const model: IWizardComponentPropsV0 = {
          ...prev,
          name: prev['name'] ?? 'custom Name',
          tabs: prev['filteredTabs'] ?? [
            {
              id: nanoid(),
              name: 'step1',
              label: 'Step 1',
              title: 'Step 1',
              subTitle: 'Sub title 1',
              description: 'Description 1',
              sortOrder: 0,
              allowCancel: false,
              cancelButtonText: 'Cancel',
              nextButtonText: 'Next',
              backButtonText: 'Back',
              doneButtonText: 'Done',
              key: 'step1',
              components: [],
              itemType: 'item',
            },
          ],
        };
        return model;
      })
      .add(1, migrateV0toV1)
      .add(2, (prev) => {
        return {
          ...prev,
          steps: prev.steps.map((step) => {
            return {
              ...step,
              beforeBackActionConfiguration: step.backButtonActionConfiguration,
              beforeNextActionConfiguration: step.nextButtonActionConfiguration,
              beforeCancelActionConfiguration: step.cancelButtonActionConfiguration,
              beforeDoneActionConfiguration: step.doneButtonActionConfiguration,
            };
          }),
        };
      })
      .add<IWizardComponentProps>(
        3,
        (prev) =>
          migrateFunctionToProp(
            migratePropertyName(migrateCustomFunctions(prev as IConfigurableFormComponent)),
            'defaultActiveStep',
            'defaultActiveValue'
          ) as IWizardComponentProps
      )
      .add<IWizardComponentProps>(4, (prev) => migrateWizardActions(prev)),
  settingsFormFactory: (props) => <WizardSettingsForm {...props} />,
  // validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  customContainerNames: ['steps'],
  getContainers: (model) => {
    const { steps } = model as IWizardComponentProps;

    return steps.map<IFormComponentContainer>((t) => ({ id: t.id }));
  },
};

export default TabsComponent;