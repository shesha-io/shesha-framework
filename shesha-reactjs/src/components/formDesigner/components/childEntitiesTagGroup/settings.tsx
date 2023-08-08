import { Checkbox, Input, Select } from 'antd';
import { ContextPropertyAutocomplete } from 'designer-components/contextPropertyAutocomplete';
import SettingsCollapsiblePanel from 'designer-components/_settings/settingsCollapsiblePanel';
import SettingsForm, { useSettingsForm } from 'designer-components/_settings/settingsForm';
import SettingsFormItem from 'designer-components/_settings/settingsFormItem';
import { ISettingsFormFactoryArgs } from 'interfaces';
import { useForm } from 'providers';
import { useFormDesigner } from 'providers/formDesigner';
import React, { FC } from 'react';
import FormAutocomplete from '../../../formAutocomplete';
import CodeEditor from '../codeEditor/codeEditor';
import { IChildEntitiesTagGroupProps } from './models';

const { Option } = Select;

export const ChildEntitiesTagGroupSettingsForm: FC<ISettingsFormFactoryArgs<IChildEntitiesTagGroupProps>> = (props) => {
  return (
    SettingsForm<IChildEntitiesTagGroupProps>({...props, children: <ChildEntitiesTagGroupSettings {...props}/>})
  );
};

const ChildEntitiesTagGroupSettings: FC<ISettingsFormFactoryArgs<IChildEntitiesTagGroupProps>> = ({readOnly}) => {
  const { getFieldsValue, onValuesChange } = useSettingsForm<IChildEntitiesTagGroupProps>();

  const designerModelType = useFormDesigner(false)?.formSettings?.modelType;
  const { formSettings } = useForm();

  const formData = getFieldsValue();

  return (
    <>
    <SettingsCollapsiblePanel header='Display'>
        <ContextPropertyAutocomplete id="415cc8ec-2fd1-4c5a-88e2-965153e16069"
          readOnly={readOnly} 
          defaultModelType={designerModelType ?? formSettings.modelType}
          formData={formData}
          onValuesChange={onValuesChange}
        />

        <SettingsFormItem name="label" label="Label" jsSetting>
          <Input readOnly={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="labelAlign" label="Label align" jsSetting>
          <Select disabled={readOnly}>
            <Option value="left">left</Option>
            <Option value="right">right</Option>
          </Select>
        </SettingsFormItem>

        <SettingsFormItem name="readOnly" label="Read Only" valuePropName="checked" jsSetting>
          <Checkbox disabled={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="hidden" label="Hidden" valuePropName="checked" jsSetting>
          <Checkbox disabled={readOnly} />
        </SettingsFormItem>
      </SettingsCollapsiblePanel>

      <SettingsCollapsiblePanel header='Modal Display'>
        <SettingsFormItem name="deleteConfirmationTitle" label="Delete Confirmation Title" jsSetting>
          <Input readOnly={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="deleteConfirmationBody" label="Delete Confirmation Body" jsSetting>
          <Input readOnly={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="modalTitle" label="Modal Title" jsSetting>
          <Input readOnly={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="modalWidth" label="Modal Width" jsSetting>
          <Select disabled={readOnly} defaultValue="60%">
            <Option value="100%">Full</Option>
            <Option value="80%">Large</Option>
            <Option value="60%">Medium</Option>
            <Option value="40%">Small</Option>
          </Select>
        </SettingsFormItem>
      </SettingsCollapsiblePanel>

      <SettingsCollapsiblePanel header='Render'>
        <SettingsFormItem name="capturedProperties" label="Captured Properties" jsSetting>
          <Select mode="tags" />
        </SettingsFormItem>

        <SettingsFormItem name="formId" label="Form Path"  jsSetting>
          <FormAutocomplete readOnly={readOnly} convertToFullId={true} />
        </SettingsFormItem>

        <SettingsFormItem name="labelFormat" label="Label Format" required>
          <CodeEditor
            readOnly={readOnly}
            mode="dialog"
            setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
            propertyName="labelFormat"
            type={''}
            id={''}
            label="Label Format"
            description="Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key."
            exposedVariables={[
              {
                id: 'ee243565-14ba-4c98-af34-adac37c83baa',
                name: 'data',
                description: 'Form data',
                type: 'object',
              },
              {
                id: '3d53b1ae-1e15-4519-9d07-af6b4225416e',
                name: 'globalState',
                description: 'The global state',
                type: 'object',
              },
              {
                id: '3a288d08-a00c-4458-a6ff-a00da9bd070b',
                name: 'formMode',
                description: 'Editable state of form',
                type: "'designer' | 'edit' | 'readonly'",
              },
            ]}
          />
        </SettingsFormItem>
      </SettingsCollapsiblePanel>
    </>
  );
};
