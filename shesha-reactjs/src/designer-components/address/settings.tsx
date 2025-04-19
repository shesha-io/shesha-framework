import { CodeEditor } from '../codeEditor/codeEditor';
import React, { FC } from 'react';
import ReadOnlyModeSelector from '@/components/editModeSelector/index';
import SettingsCollapsiblePanel from '@/designer-components/_settings/settingsCollapsiblePanel';
import SettingsForm, { useSettingsForm } from '@/designer-components/_settings/settingsForm';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import Show from '@/components/show';
import TextArea from 'antd/lib/input/TextArea';
import { Checkbox, Input, InputNumber, Select } from 'antd';
import { ContextPropertyAutocomplete } from '@/designer-components/contextPropertyAutocomplete';
import { COUNTRY_CODES } from '@/shesha-constants/country-codes';
import { EXPOSED_VARIABLES } from './utils';
import { IAddressCompomentProps } from './models';
import { ISettingsFormFactoryArgs } from '@/interfaces';
import { Option } from 'antd/lib/mentions';
import { useForm } from '@/providers';
import { useFormDesignerState } from '@/providers/formDesigner';
import { useAvailableConstantsMetadata } from '@/utils/metadata/useAvailableConstants';
import { PermissionAutocomplete } from '@/components/permissionAutocomplete';

interface IEntityReferenceSettingsState extends IAddressCompomentProps { }

const AddressSettings: FC<ISettingsFormFactoryArgs<IAddressCompomentProps>> = ({ readOnly }) => {
  const { values, model, onValuesChange } = useSettingsForm<IAddressCompomentProps>();

  const designerModelType = useFormDesignerState(false)?.formSettings?.modelType;
  const { formSettings } = useForm();

  const onChangeOrSelectConstants = useAvailableConstantsMetadata({
    standardConstants: [],
    onBuild: (builder) => {
      builder.addAllStandard().addObject("event", "Event callback when user input", undefined);
    }
  });

  return (
    <>
      <SettingsCollapsiblePanel header="Display">
        <ContextPropertyAutocomplete
          id="415cc8ec-2fd1-4c5a-88e2-965153e16069"
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
            <Option value="left">left</Option>
            <Option value="right">right</Option>
          </Select>
        </SettingsFormItem>

        <SettingsFormItem name="placeholder" label="Placeholder" jsSetting>
          <Input readOnly={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="description" label="Description" jsSetting>
          <TextArea readOnly={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="hideLabel" label="Hide Label" valuePropName="checked" jsSetting>
          <Checkbox disabled={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="hidden" label="Hidden" valuePropName="checked" jsSetting>
          <Checkbox disabled={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="editMode" label="Edit mode" jsSetting>
          <ReadOnlyModeSelector readOnly={readOnly} />
        </SettingsFormItem>
      </SettingsCollapsiblePanel>

      <SettingsCollapsiblePanel header="Configuration">
        <SettingsFormItem
          name="minCharactersSearch"
          label="Min Characters Before Search"
          tooltip="The minimum characters required before an api call can be made."
          jsSetting
        >
          <InputNumber style={{ width: '100%' }} disabled={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem
          name="debounce"
          label="Debounce (MS)"
          tooltip="Debouncing prevents extra activations/inputs from triggering too often. This is the time in milliseconds the call will be delayed by."
          jsSetting
        >
          <InputNumber style={{ width: '100%' }} disabled={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem
          name="googleMapsApiKey"
          label="Google Maps Key"
          tooltip="API key for authorization. Google Maps key which is required to make successful calls to Google services."
          jsSetting
        >
          <Input.Password readOnly={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem
          name="openCageApiKey"
          label="OpenCage Key"
          tooltip="API key for authorization. Go to (https://opencagedata.com/api) to learn about OpenCage. OpenCage key which is required to make successful calls to OpenCage services."
          jsSetting
        >
          <Input.Password readOnly={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem
          name="countryRestriction"
          label="Country Restriction"
          tooltip="A filter which is based on the country/countries, multiple countries can be selected."
          jsSetting
        >
          <Select
            allowClear
            mode="multiple"
            options={COUNTRY_CODES}
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          />
        </SettingsFormItem>

        <SettingsFormItem
          name="prefix"
          label="Prefix (Area Restriction)"
          tooltip="A simple prefix which is appended in the search but not the input search field, often used to create a biased search in address."
          jsSetting
        >
          <Input style={{ width: '100%' }} disabled={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem
          name="showPriorityBounds"
          label="Priority Bounds (Advanced)"
          valuePropName="checked"
          tooltip="Advanced search options, not required if a search priority is not needed. Note this will be discarded unless all values are provided."
          jsSetting
        >
          <Checkbox disabled={readOnly} />
        </SettingsFormItem>

        <Show when={values.showPriorityBounds}>
          <SettingsFormItem
            name="latPriority"
            label="Latitude (Priority Bound)"
            required
            tooltip="Latitude value which the search will be prioritized from."
            jsSetting
          >
            <InputNumber style={{ width: '100%' }} disabled={readOnly} />
          </SettingsFormItem>

          <SettingsFormItem
            name="lngPriority"
            label="Longitude (Priority Bound)"
            required
            tooltip="Longitude value which the search will be prioritized from."
            jsSetting
          >
            <InputNumber style={{ width: '100%' }} disabled={readOnly} />
          </SettingsFormItem>

          <SettingsFormItem
            name="radiusPriority"
            label="Radius (Priority Bound)"
            required
            tooltip="The radius in which the latitude and longitude will be priorities from."
            jsSetting
          >
            <InputNumber style={{ width: '100%' }} />
          </SettingsFormItem>
        </Show>
      </SettingsCollapsiblePanel>

      <SettingsCollapsiblePanel header="Events">
        <SettingsFormItem
          label="On Change"
          name="onChangeCustom"
          tooltip="Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key."
        >
          <CodeEditor
            propertyName="onChangeCustom"
            readOnly={readOnly}
            mode="dialog"
            label="On Change"
            description="Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key."
            exposedVariables={EXPOSED_VARIABLES}
            wrapInTemplate={true}
            templateSettings={{
              functionName: 'onChange'
            }}
            availableConstants={onChangeOrSelectConstants}
          />
        </SettingsFormItem>

        <SettingsFormItem
          label="On Select"
          name="onSelectCustom"
          tooltip="Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key."
        >
          <CodeEditor
            propertyName="onSelectCustom"
            readOnly={readOnly}
            mode="dialog"
            label="On Select"
            description="Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key."
            exposedVariables={EXPOSED_VARIABLES}
            wrapInTemplate={true}
            templateSettings={{
              functionName: 'onSelect'
            }}
            availableConstants={onChangeOrSelectConstants}
          />
        </SettingsFormItem>
      </SettingsCollapsiblePanel>
      <SettingsCollapsiblePanel header="Validation">
        <SettingsFormItem name="validate.required" label="Required" valuePropName="checked" jsSetting>
          <Checkbox disabled={readOnly} />
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

export const AddressSettingsForm: FC<ISettingsFormFactoryArgs<IAddressCompomentProps>> = (props) => {
  return SettingsForm<IEntityReferenceSettingsState>({ ...props, children: <AddressSettings {...props} /> });
};
