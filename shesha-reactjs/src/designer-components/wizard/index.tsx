import React from 'react';
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
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { removeComponents } from '../_common-migrations/removeComponents';
import { getSettings } from './settingsForm';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { defaultStyles } from './utils';

const TabsComponent: IToolboxComponent<Omit<IWizardComponentProps, 'size'>> = {
  type: 'wizard',
  isInput: false,
  name: 'Wizard',
  icon: <DoubleRightOutlined />,
  Factory: ({ model, form }) => {
    return <Tabs {...model} form={form} />;
  },
  initModel: (model) => ({
    ...model,
    steps: model.steps?.map((step) => ({
      ...step,
      showBackButton: step?.showBackButton ?? true,
      showDoneButton: step?.showDoneButton ?? true,
      hasCustomFooter: step?.hasCustomFooter ?? false,
      stepFooter: step?.stepFooter ?? {
        id: `${step.id}_footer`,
        components: [],
      },
    })) ?? [],
  }),
  customContainerNames: ['steps'],
  migrator: (m) =>
    m
      .add<IWizardComponentPropsV0>(0, (prev) => {
        const id = nanoid();
        const model: IWizardComponentPropsV0 = {
          ...prev,
          name: prev['name'] ?? 'custom Name',
          tabs: prev['filteredTabs'] ?? [
            {
              id: id,
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
              key: id,
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
          editMode: 'inherited',
        };
      })
      .add<IWizardComponentProps>(
        3,
        (prev) =>
          migrateFunctionToProp(
            migratePropertyName(migrateCustomFunctions(prev as IConfigurableFormComponent)),
            'defaultActiveStep',
            'defaultActiveValue',
          ) as IWizardComponentProps,
      )
      .add<IWizardComponentProps>(4, (prev) => migrateWizardActions(prev))
      .add<IWizardComponentProps>(5, (prev) => ({ ...migrateFormApi.properties(prev) }))
      .add<IWizardComponentProps>(6, (prev) => removeComponents(prev))
      .add<IWizardComponentProps>(7, (prev) => ({ ...migratePrevStyles({ ...prev, primaryTextColor: '#fff' }, defaultStyles()), overflow: true }))
      .add<IWizardComponentProps>(8, (prev) => ({ ...prev, stepWidth: '200px' }))
      .add<IWizardComponentProps>(9, (prev) => ({
        ...prev,
        steps: prev.steps?.map((step) => ({
          ...step,
          hasCustomFooter: step.hasCustomFooter ?? false,
          stepFooter: step?.stepFooter ?? {
            id: `${step.id}_footer`,
            components: [],
          },
        })) ?? [],
      })),
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),

  getContainers: (model) => {
    const containers: IFormComponentContainer[] = [];
    model.steps.forEach((step) => {
      containers.push({ id: step.id, parentId: model.id });
    });

    // Add step footer containers
    const footerContainers = model.steps
      .filter((s) => s.hasCustomFooter)
      .map((s) => ({
        id: s.stepFooter?.id ?? `${s.id}_footer`,
        parentId: model.id,
      }));

    return [...containers, ...footerContainers];
  },
};

export default TabsComponent;
