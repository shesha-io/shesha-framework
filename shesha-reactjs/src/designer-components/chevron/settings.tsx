import { Autocomplete, ColorPicker, Show } from '@/components';
import RefListItemSelectorSettingsModal from '@/components/refListSelectorDisplay/options/modal';
import { Checkbox, Input, Select } from 'antd';
import React, { FC } from 'react';
import { ContextPropertyAutocomplete } from '@/designer-components/contextPropertyAutocomplete';
import SettingsForm, { useSettingsForm } from '../_settings/settingsForm';
import { useFormDesignerState } from '@/providers/formDesigner';
import { useForm } from '@/providers';
import { ISettingsFormFactoryArgs } from '@/interfaces';
import SettingsFormItem from '../_settings/settingsFormItem';
import { Option } from 'antd/lib/mentions';
import { IChevronProps } from '@/components/chevron/models';
import SettingsCollapsiblePanel from '../_settings/settingsCollapsiblePanel';

interface IChevronSettingsState extends IChevronProps { }

export const ChevronSettings: FC<ISettingsFormFactoryArgs<IChevronProps>> = () => {
  const { values, onValuesChange } = useSettingsForm<IChevronProps>();
  const designerModelType = useFormDesignerState(false)?.formSettings?.modelType;
  const { formSettings } = useForm();

  return (
    <>
      <SettingsCollapsiblePanel header='Display'>
        <ContextPropertyAutocomplete id="fb71cb51-884f-4f34-aa77-820c12276c95"
          readOnly={values.readOnly}
          defaultModelType={designerModelType ?? formSettings.modelType}
          onValuesChange={onValuesChange}
          componentName={values.componentName}
          propertyName={values.propertyName}
          contextName={values.context}
        />

        <SettingsFormItem name="label" label="Label" jsSetting>
          <Input readOnly={values.readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="labelAlign" label="Label align" jsSetting>
          <Select disabled={values.readOnly}>
            <Select.Option value="left">left</Select.Option>
            <Select.Option value="right">right</Select.Option>
          </Select>
        </SettingsFormItem>

        <SettingsFormItem name="hideLabel" label="Hide Label" valuePropName="checked" jsSetting>
          <Checkbox disabled={values.readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="hidden" label="Hidden" valuePropName="checked" jsSetting>
          <Checkbox disabled={values.readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="description" label="Description" jsSetting>
          <Input readOnly={values.readOnly} />
        </SettingsFormItem>
      </SettingsCollapsiblePanel>

      <SettingsCollapsiblePanel header='Items'>
        <SettingsFormItem name="referenceList" label="Reference List" style={{ width: '100%' }} tooltip='Make sure to reselect the reference list if any changes are made to its items'>
          <Autocomplete
            dataSourceType="entitiesList"
            entityType="Shesha.Framework.ReferenceList"
            filter={{"and":[{"==":[{"var":"isLast"},true]}]}}
            readOnly={values.readOnly}
          />
        </SettingsFormItem>
        <SettingsFormItem name="items">
          <RefListItemSelectorSettingsModal referenceList={values.referenceList} readOnly={values.readOnly} />
        </SettingsFormItem>
      </SettingsCollapsiblePanel>

      <SettingsCollapsiblePanel header='Styles'>
        <SettingsFormItem name="colorSource" label="Color Source" jsSetting tooltip='Hex and RGB colors are supported'>
          <Select disabled={values.readOnly}>
            <Option value="primary">Primary Color</Option>
            <Option value="custom">Custom Color</Option>
            <Option value="reflist">From RefList item</Option>
          </Select>
        </SettingsFormItem>

        <Show when={values.colorSource === 'custom'}>
          <SettingsFormItem name="activeColor" label="Active Color" jsSetting >
            <ColorPicker readOnly={values.readOnly} allowClear />
          </SettingsFormItem>
        </Show>

        <SettingsFormItem name="fontColor" label="Font Color" jsSetting >
            <ColorPicker readOnly={values.readOnly} allowClear />
          </SettingsFormItem>

        <SettingsFormItem name="showIcons" label="Show Icons?" valuePropName="checked" jsSetting>
          <Checkbox disabled={values.readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="width" label="Width" jsSetting>
          <Input type='number' disabled={values.readOnly}  />
        </SettingsFormItem>

        <SettingsFormItem name="height" label="Height" jsSetting>
          <Input type='number' disabled={values.readOnly}  />
        </SettingsFormItem>

        <SettingsFormItem name="fontSize" label="Font Size" jsSetting>
          <Input type='number' disabled={values.readOnly}  />
        </SettingsFormItem>

      </SettingsCollapsiblePanel>
    </>
  );
};

export const ChevronSettingsForm: FC<ISettingsFormFactoryArgs<IChevronProps>> = (props) => {
  return SettingsForm<IChevronSettingsState>({ ...props, children: <ChevronSettings {...props} /> });
};
