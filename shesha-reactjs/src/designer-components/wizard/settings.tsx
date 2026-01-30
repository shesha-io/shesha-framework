import React, { FC, useRef } from 'react';
import SettingsCollapsiblePanel from '@/designer-components/_settings/settingsCollapsiblePanel';
import SettingsForm, { useSettingsForm } from '@/designer-components/_settings/settingsForm';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import StyleBox from '../styleBox/components/box';
import {
  Alert,
  Checkbox,
  Input,
  RefSelectProps,
  Select
} from 'antd';
import { CodeEditor } from '@/components';
import { getSettings } from './itemSettings';
import { ISettingsFormFactoryArgs } from '@/interfaces';
import { IWizardComponentProps, IWizardStepProps } from './models';
import { nanoid } from '@/utils/uuid';
import { useAvailableConstantsMetadata } from '@/utils/metadata/useAvailableConstants';
import { SheshaConstants } from '@/utils/metadata/standardProperties';
import { PermissionAutocomplete } from '@/components/permissionAutocomplete';
import { ItemListConfiguratorModal } from '../itemListConfigurator/itemListConfiguratorModal';
import { useActualContextData } from '@/hooks/useActualContextData';

const { Option } = Select;

const wizardStepSettingsMarkup = getSettings();

const WizardSettings: FC<ISettingsFormFactoryArgs<IWizardComponentProps>> = (props) => {
  const { readOnly } = props;

  const { model } = useSettingsForm<IWizardComponentProps>();

  const onAddNewItem = (items) => {
    const count = (items ?? []).length;
    const stepId = nanoid();
    const buttonProps: IWizardStepProps = {
      id: stepId,
      name: `step${count + 1}`,
      label: `Step ${count + 1}`,
      key: `stepKey${count + 1}`,
      title: `Step ${count + 1}`,
      subTitle: `Sub title ${count + 1}`,
      description: `Description ${count + 1}`,
      nextButtonText: 'Next',
      backButtonText: 'Back',
      components: [],
      status: undefined,
    };

    return buttonProps;
  };

  const steps = props?.model?.steps?.map((item) => ({ ...item, label: item?.title }));

  const stepList = useActualContextData(model?.steps);
  const selectRef = useRef<RefSelectProps>();

  const getStyleConstants = useAvailableConstantsMetadata({
    addGlobalConstants: false,
    standardConstants: [
      SheshaConstants.globalState, SheshaConstants.formData
    ]
  });

  return (
    <>
      <SettingsCollapsiblePanel header="Display">
        <SettingsFormItem name="componentName" label="Component name" required={true}>
          <Input disabled={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="wizardType" label="Wizard Type" jsSetting>
          <Select allowClear disabled={readOnly}>
            <Option value="default">Default</Option>
            <Option value="navigation">Navigation</Option>
          </Select>
        </SettingsFormItem>

        <SettingsFormItem name="size" jsSetting label="Size" tooltip="This will set the size for all buttons">
          <Select disabled={readOnly}>
            <Option value="default">default</Option>
            <Option value="small">small</Option>
          </Select>
        </SettingsFormItem>

        <SettingsFormItem
          name="direction"
          jsSetting
          label="Direction"
          tooltip="To specify the direction of the step bar"
        >
          <Select disabled={readOnly}>
            <Option value="vertical">vertical</Option>
            <Option value="horizontal">horizontal</Option>
          </Select>
        </SettingsFormItem>

        <SettingsFormItem
          name="labelPlacement"
          jsSetting
          label="Label Placement"
          tooltip="To specify the label placement"
        >
          <Select disabled={readOnly}>
            <Option value="vertical">vertical</Option>
            <Option value="horizontal">horizontal</Option>
          </Select>
        </SettingsFormItem>

        <SettingsFormItem
          name="defaultActiveStep"
          jsSetting
          label="Default Active Step"
          tooltip="This will be the default step tha"
        >
          <Select allowClear ref={selectRef} value={model?.defaultActiveStep} disabled={readOnly}>
            {stepList?.map(({ id, title }) => (
              <Option value={id} key={id}>
                {title}
              </Option>
            ))}
          </Select>
        </SettingsFormItem>

        <SettingsFormItem
          name="buttonsLayout"
          jsSetting
          label="Buttons Layout"
          tooltip="How you want the steps buttons to be aligned"
        >
          <Select disabled={readOnly}>
            <Option value="left">Left</Option>
            <Option value="right">Right</Option>
            <Option value="spaceBetween">Space Between</Option>
          </Select>
        </SettingsFormItem>

        <SettingsFormItem name="hidden" label="Hidden" valuePropName="checked" jsSetting>
          <Checkbox disabled={readOnly} />
        </SettingsFormItem>
      </SettingsCollapsiblePanel>

      <SettingsCollapsiblePanel header="Configure Wizard Steps">
        <SettingsFormItem name="steps" initialValue={steps}>
          <ItemListConfiguratorModal<IWizardStepProps>
            readOnly={readOnly}
            initNewItem={onAddNewItem}
            settingsMarkupFactory={() => {
              return {
                components: wizardStepSettingsMarkup,
                formSettings: {
                  layout: "horizontal",
                  isSettingsForm: true,
                  colon: true,
                  labelCol: {span: 5},
                  wrapperCol: {span: 13}
                }
              };
            }}
            itemRenderer={({ item }) => ({
              label: item.title || item.label || item.name,
              description: item.tooltip,
              icon: item.icon
            })}
            buttonText={readOnly ? "View Wizard Steps" : "Configure Wizard Steps"}
            modalSettings={{
              title: readOnly ? "View Wizard Steps" : "Configure Wizard Steps",
              header: <Alert message={readOnly ? 'Here you can view wizard steps configuration.' : 'Here you can configure the wizard steps by adjusting their settings and ordering.'} />,
            }}
          >
          </ItemListConfiguratorModal>
        </SettingsFormItem>
      </SettingsCollapsiblePanel>

      <SettingsCollapsiblePanel header="Style">
        <SettingsFormItem
          label="Style"
          name="style"
          tooltip="A script that returns the style of the element as an object. This should conform to CSSProperties"
        >
          <CodeEditor
            propertyName="style"
            readOnly={readOnly}
            mode="dialog"
            label="Style"
            description="A script that returns the style of the element as an object. This should conform to CSSProperties"
            exposedVariables={[
              {
                id: 'f9f25102-bdc7-41bc-b4bc-87eea6a86fc5',
                name: 'data',
                description: 'Selected form values',
                type: 'object',
              },
              {
                id: '6374545e-4848-4e92-9846-27f2a7884c41',
                name: 'globalState',
                description: 'The global state of the application',
                type: 'object',
              },
            ]}
            wrapInTemplate={true}
            templateSettings={{
              functionName: 'getStyle'
            }}
            availableConstants={getStyleConstants}
          />
        </SettingsFormItem>

        <SettingsFormItem name="stylingBox">
          <StyleBox />
        </SettingsFormItem>
      </SettingsCollapsiblePanel>

      <SettingsCollapsiblePanel header="Security">
        <SettingsFormItem
          jsSetting
          label="Permissions"
          name="permissions"
          initialValue={props.model.permissions}
          tooltip="Enter a list of permissions that should be associated with this component"
        >
          <PermissionAutocomplete readOnly={readOnly} />
        </SettingsFormItem>
      </SettingsCollapsiblePanel>
    </>
  );
};

export const WizardSettingsForm: FC<ISettingsFormFactoryArgs<IWizardComponentProps>> = (props) => {
  const onValuesChange = React.useCallback((changedValues: any, values: IWizardComponentProps) => {
    // Sync stepFooters when steps change
    if (changedValues.steps) {
      const stepFooters = values.stepFooters || [];
      const updatedFooters = [...stepFooters];

      // Ensure every step with customActions has a footer container
      values.steps?.forEach(step => {
        if (step.customActions) {
          const existingFooter = updatedFooters.find(f => f.stepId === step.id);
          if (!existingFooter) {
            updatedFooters.push({
              id: nanoid(),
              stepId: step.id,
              components: []
            });
          }
        }
      });

      // Remove footers for steps without customActions
      const finalFooters = updatedFooters.filter(footer => {
        const step = values.steps?.find(s => s.id === footer.stepId);
        return step && step.customActions;
      });

      // If footers changed, update the model
      if (JSON.stringify(finalFooters) !== JSON.stringify(stepFooters)) {
        values.stepFooters = finalFooters;
      }
    }

    if (props.onValuesChange) {
      props.onValuesChange(changedValues, values);
    }
  }, [props]);

  return SettingsForm<IWizardComponentProps>({ ...props, onValuesChange, children: <WizardSettings {...props} /> });
};

export default WizardSettingsForm;
