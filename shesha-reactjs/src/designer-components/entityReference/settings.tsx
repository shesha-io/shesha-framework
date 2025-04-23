import { AutoComplete, Checkbox, Input, InputNumber, Select, Switch } from 'antd';
import React, { FC, useState } from 'react';
import PropertyAutocomplete from '@/components/propertyAutocomplete/propertyAutocomplete';
import { CodeEditor } from '@/designer-components/codeEditor/codeEditor';
import Show from '@/components/show';
import { Autocomplete } from '@/components/autocomplete';
import { FormAutocomplete } from '@/components/configurableItemAutocomplete/formAutocomplete';
import { EndpointsAutocomplete } from '@/components/endpointsAutocomplete/endpointsAutocomplete';
import { MetadataProvider, useForm } from '@/providers';
import { LabelValueEditor } from '@/components/labelValueEditor/labelValueEditor';
import CollapsiblePanel from '@/components/panel';
import { ConfigurableActionConfigurator } from '../configurableActionsConfigurator/configurator';
import { ISettingsFormFactoryArgs } from '@/interfaces';
import { IEntityReferenceControlProps } from './entityReference';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import SettingsCollapsiblePanel from '@/designer-components/_settings/settingsCollapsiblePanel';
import SettingsForm, { useSettingsForm } from '@/designer-components/_settings/settingsForm';
import { ContextPropertyAutocomplete } from '@/designer-components/contextPropertyAutocomplete';
import { useFormDesignerState } from '@/providers/formDesigner';
import { ButtonGroupConfigurator, IconPicker } from '@/components';
import { PermissionAutocomplete } from '@/components/permissionAutocomplete';

export const formTypes = ['Table', 'Create', 'Edit', 'Details', 'Quickview', 'ListItem', 'Picker'];

const EntityReferenceSettings: FC<ISettingsFormFactoryArgs<IEntityReferenceControlProps>> = (props) => {
  const { readOnly } = props;

  const { values, onValuesChange } = useSettingsForm<IEntityReferenceControlProps>();

  const designerModelType = useFormDesignerState(false)?.formSettings?.modelType;
  const { formSettings } = useForm();

  const [formTypesOptions, setFormTypesOptions] = useState<{ value: string }[]>(
    formTypes.map((i) => {
      return { value: i };
    })
  );

  return (
    <>
      <SettingsCollapsiblePanel header="Display">
        <ContextPropertyAutocomplete
          id="fb71cb51-884f-4f34-aa77-820c12276c95"
          readOnly={readOnly}
          defaultModelType={designerModelType ?? formSettings.modelType}
          onValuesChange={onValuesChange}
          componentName={values.componentName}
          propertyName={values.propertyName}
          contextName={values.context}
        />

        <SettingsFormItem name="label" label="Label" jsSetting>
          <Input readOnly={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="labelAlign" label="Label align" jsSetting>
          <Select disabled={readOnly}>
            <Select.Option value="left">left</Select.Option>
            <Select.Option value="right">right</Select.Option>
          </Select>
        </SettingsFormItem>

        <SettingsFormItem name="description" label="Description" jsSetting>
          <Input readOnly={readOnly} />
        </SettingsFormItem>
      </SettingsCollapsiblePanel>

      <SettingsCollapsiblePanel header="Entity reference configuration">
        <SettingsFormItem name="placeholder" label="Placeholder" jsSetting>
          <Input readOnly={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="getEntityUrl" label="Get entity URL" jsSetting>
          <EndpointsAutocomplete readOnly={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="entityType" label="Entity type" style={{ width: '100%' }} jsSetting>
          <Autocomplete.Raw
            dataSourceType="url"
            dataSourceUrl="/api/services/app/Metadata/TypeAutocomplete"
            readOnly={readOnly}
          />
        </SettingsFormItem>

        <SettingsFormItem name="displayType" label="Display type" jsSetting>
          <Select disabled={readOnly}>
            <Select.Option value="displayProperty">Display property</Select.Option>
            <Select.Option value="icon">Icon</Select.Option>
            <Select.Option value="textTitle">Text title</Select.Option>
          </Select>
        </SettingsFormItem>

        {values?.displayType === 'displayProperty' && (
          <MetadataProvider modelType={values?.entityType}>
            <SettingsFormItem name="displayProperty" label="Display property" jsSetting>
              <PropertyAutocomplete readOnly={readOnly} autoFillProps={false} />
            </SettingsFormItem>
          </MetadataProvider>
        )}

        {values?.displayType === 'icon' && (
          <SettingsFormItem name="icon" label="Icon" jsSetting>
            <IconPicker
              readOnly={readOnly}
              defaultValue={values?.iconName}
              onIconChange={(_, iconName) => onValuesChange({ ...values, iconName })}
            />
          </SettingsFormItem>
        )}

        {values?.displayType === 'textTitle' && (
          <SettingsFormItem name="textTitle" label="Text title" jsSetting>
            <Input readOnly={readOnly} />
          </SettingsFormItem>
        )}

        <SettingsFormItem name="entityReferenceType" initialValue={'Quickview'} label="Entity Reference Type">
          <Select disabled={readOnly}>
            <Select.Option value="Quickview">Quickview</Select.Option>
            <Select.Option value="NavigateLink">Navigate Link</Select.Option>
            <Select.Option value="Dialog">Modal dialog box</Select.Option>
          </Select>
        </SettingsFormItem>

        <SettingsFormItem name="formSelectionMode" initialValue={'name'} label="Form selection mode">
          <Select disabled={readOnly}>
            <Select.Option value="name">Name</Select.Option>
            <Select.Option value="dynamic">Dynamic</Select.Option>
          </Select>
        </SettingsFormItem>

        {values?.formSelectionMode === 'dynamic' && (
          <SettingsFormItem name="formType" label="Form type" jsSetting>
            <AutoComplete
              disabled={readOnly}
              options={formTypesOptions}
              onSearch={(t) =>
                setFormTypesOptions(
                  (t
                    ? formTypes.filter((f) => {
                        return f.toLowerCase().includes(t.toLowerCase());
                      })
                    : formTypes
                  ).map((i) => {
                    return { value: i };
                  })
                )
              }
            />
          </SettingsFormItem>
        )}
        {values?.formSelectionMode === 'name' && (
          <SettingsFormItem name="formIdentifier" label="Form" jsSetting>
            <FormAutocomplete readOnly={readOnly} />
          </SettingsFormItem>
        )}
      </SettingsCollapsiblePanel>

      <Show when={values?.entityReferenceType === 'Quickview'}>
        <SettingsCollapsiblePanel header="Quickview settings">
          <SettingsFormItem name="quickviewWidth" label="Quickview width" jsSetting>
            <InputNumber min={0} defaultValue={600} step={1} readOnly={readOnly} />
          </SettingsFormItem>
        </SettingsCollapsiblePanel>
      </Show>

      <Show when={values?.entityReferenceType === 'Dialog'}>
        <SettingsCollapsiblePanel header="Dialog settings">
          <SettingsFormItem name="modalTitle" label="Title" jsSetting>
            <Input readOnly={readOnly} />
          </SettingsFormItem>

          <SettingsFormItem name="footerButtons" label="Buttons type">
            <Select>
              <Select.Option value="default">Default</Select.Option>
              <Select.Option value="custom">Custom</Select.Option>
              <Select.Option value="none">None</Select.Option>
            </Select>
          </SettingsFormItem>

          <Show when={values?.footerButtons === 'custom'}>
            <SettingsFormItem name="buttons" label="Configure Modal Buttons">
              <ButtonGroupConfigurator readOnly={false}></ButtonGroupConfigurator>
            </SettingsFormItem>
          </Show>

          {values?.showModalFooter ||
            (values?.footerButtons === 'default' && (
              <SettingsFormItem name="submitHttpVerb" initialValue={'POST'} label="Submit Http Verb" jsSetting>
                <Select disabled={readOnly}>
                  <Select.Option value="POST">POST</Select.Option>
                  <Select.Option value="PUT">PUT</Select.Option>
                </Select>
              </SettingsFormItem>
            ))}
          <SettingsFormItem name="additionalProperties" label="Additional properties" jsSetting>
            <LabelValueEditor
              labelName="key"
              labelTitle="Key"
              valueName="value"
              valueTitle="Value"
              description={
                'Additional properties you want to be passed when the form gets submitted like parentId in the case where the modal is used in a childTable. ' +
                'Also note you can use Mustache expression like {{id}} for value property. \n\n' +
                'Id initial value is already initialised with {{entityReference.id}} but you can override it'
              }
              exposedVariables={[
                { name: 'data', description: 'This form data', type: 'object' },
                { name: 'form', description: 'Form instance', type: 'object' },
                { name: 'formMode', description: 'Current form mode', type: "'designer' | 'edit' | 'readonly'" },
                { name: 'globalState', description: 'Global state', type: 'object' },
                { name: 'entityReference.id', description: 'Id of entity reference entity', type: 'object' },
                { name: 'entityReference.entity', description: 'Entity', type: 'object' },
                { name: 'moment', description: 'moment', type: '' },
                { name: 'http', description: 'axiosHttp', type: '' },
              ]}
            />
          </SettingsFormItem>

          <SettingsFormItem name="modalWidth" label="Dialog Width (%)" jsSetting>
            <Select disabled={readOnly}>
              <Select.Option value="40%">Small</Select.Option>
              <Select.Option value="60%">Medium</Select.Option>
              <Select.Option value="80%">Large</Select.Option>
              <Select.Option value="custom">Custom</Select.Option>
            </Select>
          </SettingsFormItem>
          {values?.modalWidth === 'custom' && (
            <>
              <SettingsFormItem name="widthUnits" label="Units" jsSetting>
                <Select disabled={readOnly}>
                  <Select.Option value="%">Percentage (%)</Select.Option>
                  <Select.Option value="px">Pixels (px)</Select.Option>
                </Select>
              </SettingsFormItem>
              <SettingsFormItem name="customWidth" label="Enter Custom Width">
                <InputNumber min={0} readOnly={readOnly} />
              </SettingsFormItem>
            </>
          )}

          <SettingsFormItem name="handleSuccess" label="Handle Success" valuePropName="checked">
            <Switch />
          </SettingsFormItem>
          {values?.handleSuccess && (
            <CollapsiblePanel header="On Success handler">
              <SettingsFormItem name="onSuccess" label="On Success">
                <ConfigurableActionConfigurator editorConfig={null} level={0} />
              </SettingsFormItem>
            </CollapsiblePanel>
          )}

          <SettingsFormItem name="handleFail" label="Handle Fail" valuePropName="checked">
            <Switch />
          </SettingsFormItem>
          {values?.handleFail && (
            <CollapsiblePanel header="On Fail handler">
              <SettingsFormItem name="onFail" label="On Fail">
                <ConfigurableActionConfigurator editorConfig={null} level={0} />
              </SettingsFormItem>
            </CollapsiblePanel>
          )}
        </SettingsCollapsiblePanel>
      </Show>

      <SettingsCollapsiblePanel header="Layout">
        <SettingsFormItem name="labelCol" label="Label Col" jsSetting>
          <InputNumber min={0} max={24} defaultValue={8} step={1} readOnly={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="wrapperCol" label="Wrapper Col" jsSetting>
          <InputNumber min={0} max={24} defaultValue={16} step={1} readOnly={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="style" label="Style">
          <CodeEditor
            readOnly={readOnly}
            mode="dialog"
            label="Style"
            propertyName="style"
            description="CSS Style"
            exposedVariables={[
              {
                id: '788673a5-5eb9-4a9a-a34b-d8cea9cacb3c',
                name: 'data',
                description: 'Form data',
                type: 'object',
              },
            ]}
          />
        </SettingsFormItem>
      </SettingsCollapsiblePanel>

      <SettingsCollapsiblePanel header="Visibility">
        <SettingsFormItem name="hidden" label="Hidden" valuePropName="checked" jsSetting>
          <Checkbox disabled={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="hideLabel" label="Hide Label" valuePropName="checked" jsSetting>
          <Checkbox disabled={readOnly} />
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

export const EntityReferenceSettingsForm: FC<ISettingsFormFactoryArgs<IEntityReferenceControlProps>> = (props) => {
  return SettingsForm<IEntityReferenceControlProps>({ ...props, children: <EntityReferenceSettings {...props} /> });
};
