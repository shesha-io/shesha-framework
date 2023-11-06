import { DoubleRightOutlined } from '@ant-design/icons';
import { Button, Space, Steps } from 'antd';
import classNames from 'classnames';
import { nanoid } from 'nanoid/non-secure';
import React from 'react';
import { getStyle, useFormExpression } from '../../../../';
import { IToolboxComponent } from '../../../../interfaces';
import { useForm, useFormData, useGlobalState } from '../../../../providers';
import { IConfigurableFormComponent, IFormComponentContainer } from '../../../../providers/form/models';
import ConditionalWrap from '../../../conditionalWrapper';
import ShaIcon from '../../../shaIcon';
import ComponentsContainer from '../../containers/componentsContainer';
import { useWizard } from './hooks';
import { IWizardComponentPropsV0, migrateV0toV1 } from './migrations/migrate-v1';
import { IStepProps, IWizardComponentProps } from './models';
import WizardSettingsForm from './settings';
import { getWizardButtonStyle } from './utils';
import './styles.less';
import {
  migrateCustomFunctions,
  migratePropertyName,
} from '../../../../designer-components/_common-migrations/migrateSettings';

const TabsComponent: IToolboxComponent<Omit<IWizardComponentProps, 'size'>> = {
  type: 'wizard',
  name: 'Wizard',
  icon: <DoubleRightOutlined />,
  factory: (model) => {
    const { formMode } = useForm();
    const { executeBooleanExpression } = useFormExpression();
    const { data } = useFormData();
    const { globalState } = useGlobalState();

    const { back, components, cancel, content, current, currentStep, done, next, visibleSteps } = useWizard(model);

    const {
      buttonsLayout = 'spaceBetween',
      direction,
      isDynamic,
      labelPlacement,
      readOnly,
      wizardType = 'default',
    } = model;

    const steps = visibleSteps?.map<IStepProps>(({ id, title, subTitle, description, icon, customEnabled }, index) => {
      const isDisabledByCondition = !executeBooleanExpression(customEnabled, true) && formMode !== 'designer';

      const iconProps = icon ? { icon: <ShaIcon iconName={icon as any} /> } : {};

      return {
        id,
        title,
        subTitle,
        description: content(description, index),
        disabled: isDisabledByCondition,
        ...iconProps,
        content: (
          <ComponentsContainer
            containerId={id}
            dynamicComponents={isDynamic ? components?.map((c) => ({ ...c, readOnly })) : []}
          />
        ),
      };
    });

    const splitButtons = buttonsLayout === 'spaceBetween';

    if (model?.hidden) return null;
    const btnStyle = getWizardButtonStyle(buttonsLayout);

    return (
      <div className="sha-wizard" style={getStyle(model?.style, data, globalState)}>
        <div className={classNames('sha-wizard-container', { vertical: direction === 'vertical' })}>
          <Steps
            type={wizardType}
            current={current}
            items={steps}
            size={model['size']}
            direction={direction}
            labelPlacement={labelPlacement}
          />

          <div className="sha-steps-content">{steps[current]?.content}</div>
        </div>

        <ConditionalWrap condition={buttonsLayout === 'left'} wrap={(children) => <Space>{children}</Space>}>
          <div
            className={classNames('sha-steps-buttons-container', {
              split: splitButtons,
              left: buttonsLayout === 'left',
              right: buttonsLayout === 'right',
            })}
          >
            <ConditionalWrap
              condition={splitButtons}
              wrap={(children) => (
                <Space>
                  <div className={classNames('sha-steps-buttons')}>{children}</div>
                </Space>
              )}
            >
              {current > 0 && (
                <Button
                  style={btnStyle('back')}
                  onClick={back}
                  disabled={!executeBooleanExpression(currentStep?.backButtonCustomEnabled, true)}
                >
                  {currentStep.backButtonText ? currentStep.backButtonText : 'Back'}
                </Button>
              )}

              {currentStep.allowCancel === true && (
                <Button
                  style={btnStyle('cancel')}
                  onClick={cancel}
                  disabled={!executeBooleanExpression(currentStep?.cancelButtonCustomEnabled, true)}
                >
                  {currentStep.cancelButtonText ? currentStep.cancelButtonText : 'Cancel'}
                </Button>
              )}
            </ConditionalWrap>

            <ConditionalWrap
              condition={splitButtons}
              wrap={(children) => (
                <Space>
                  <div className={classNames('sha-steps-buttons')}>{children}</div>
                </Space>
              )}
            >
              {current < visibleSteps.length - 1 && (
                <Button
                  type="primary"
                  style={btnStyle('next')}
                  onClick={next}
                  disabled={!executeBooleanExpression(currentStep?.nextButtonCustomEnabled, true)}
                >
                  {currentStep.nextButtonText ? currentStep.nextButtonText : 'Next'}
                </Button>
              )}

              {current === visibleSteps.length - 1 && (
                <Button
                  type="primary"
                  style={btnStyle('next')}
                  onClick={done}
                  disabled={!executeBooleanExpression(currentStep?.doneButtonCustomEnabled, true)}
                >
                  {currentStep.doneButtonText ? currentStep.doneButtonText : 'Done'}
                </Button>
              )}
            </ConditionalWrap>
          </div>
        </ConditionalWrap>
      </div>
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
          migratePropertyName(migrateCustomFunctions(prev as IConfigurableFormComponent)) as IWizardComponentProps
      ),
  settingsFormFactory: (props) => <WizardSettingsForm {...props} />,
  // validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  customContainerNames: ['steps'],
  getContainers: (model) => {
    const { steps } = model as IWizardComponentProps;

    return steps.map<IFormComponentContainer>((t) => ({ id: t.id }));
  },
};

export default TabsComponent;
