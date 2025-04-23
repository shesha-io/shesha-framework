import { CodeEditor } from '../codeEditor/codeEditor';
import { FormAutocomplete } from '@/components/configurableItemAutocomplete/formAutocomplete';
import React, { FC } from 'react';
import ReadOnlyModeSelector from '@/components/editModeSelector/index';
import SettingsCollapsiblePanel from '@/designer-components/_settings/settingsCollapsiblePanel';
import SettingsForm, { useSettingsForm } from '@/designer-components/_settings/settingsForm';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import { Checkbox, Input, Select } from 'antd';
import { ContextPropertyAutocomplete } from '@/designer-components/contextPropertyAutocomplete';
import { IChildEntitiesTagGroupProps } from './models';
import { ISettingsFormFactoryArgs } from '@/interfaces';
import { useForm } from '@/providers';
import { useFormDesignerState } from '@/providers/formDesigner';
import { useAvailableConstantsMetadata } from '@/utils/metadata/useAvailableConstants';
import { PermissionAutocomplete } from '@/components/permissionAutocomplete';

const { Option } = Select;

const ChildEntitiesTagGroupSettings: FC<ISettingsFormFactoryArgs<IChildEntitiesTagGroupProps>> = ({ readOnly }) => {
  const { model, onValuesChange } = useSettingsForm<IChildEntitiesTagGroupProps>();

  const designerModelType = useFormDesignerState(false)?.formSettings?.modelType;
  const { formSettings } = useForm();
  const labelFormatConstants = useAvailableConstantsMetadata({ 
    addGlobalConstants: true, 
    onBuild: (builder) => {
      builder.addObject("item", "Properties of the edited object", undefined);
    }
  });

  return (
    <>
      <SettingsCollapsiblePanel header='Display'>
        <ContextPropertyAutocomplete id="415cc8ec-2fd1-4c5a-88e2-965153e16069"
          readOnly={readOnly}
          defaultModelType={designerModelType ?? formSettings.modelType}
          onValuesChange={onValuesChange}
          componentName={model.componentName}
          propertyName={model.propertyName}
          contextName={model.context}
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

        <SettingsFormItem name="editMode" label="Edit mode" jsSetting>
          <ReadOnlyModeSelector readOnly={readOnly} />
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
        {/*<SettingsFormItem name="capturedProperties" label="Captured Properties" jsSetting>
          <Select mode="tags" />
  </SettingsFormItem>*/}

        <SettingsFormItem name="formId" label="Form Path" jsSetting>
          <FormAutocomplete readOnly={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="labelFormat" label="Label Format" required>
          <CodeEditor
            readOnly={readOnly}
            mode="dialog"
            propertyName="labelFormat"
            label="Label Format"
            //description="Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key."
            exposedVariables={[
              { name: "item", description: "Properties of the edited object", type: "object" },
              { name: "data", description: "Form values", type: "object" },
              { name: "contexts", description: "Contexts data", type: "object" },
              { name: "globalState", description: "Global state", type: "object" },
              { name: "setGlobalState", description: "Functiont to set globalState", type: "function" },
              { name: "formMode", description: "Form mode", type: "'designer' | 'edit' | 'readonly'" },
              { name: "form", description: "Form instance", type: "object" },
              { name: "selectedRow", description: "Selected row of nearest table (null if not available)", type: "object" },
              { name: "moment", description: "moment", type: "object" },
              { name: "http", description: "axiosHttp", type: "object" },
              { name: "message", description: "message framework", type: "object" },
            ]}
            wrapInTemplate={true}
            templateSettings={{
              functionName: "getFormat",              
            }}
            availableConstants={labelFormatConstants}
          />
        </SettingsFormItem>
      </SettingsCollapsiblePanel>
      
      <SettingsCollapsiblePanel header="Security">
        <SettingsFormItem
          jsSetting
          label="Permissions"
          name="permissions"
          initialValue={model.permissions}
          tooltip="Enter a list of permissions that should be associated with this component"
        >
          <PermissionAutocomplete readOnly={readOnly} />
        </SettingsFormItem>
      </SettingsCollapsiblePanel>
    </>
  );
};

export const ChildEntitiesTagGroupSettingsForm: FC<ISettingsFormFactoryArgs<IChildEntitiesTagGroupProps>> = (props) => {
  return (
    SettingsForm<IChildEntitiesTagGroupProps>({ ...props, children: <ChildEntitiesTagGroupSettings {...props} /> })
  );
};