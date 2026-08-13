import { FormLayout } from 'antd/lib/form/Form';
import { fontTypes, fontWeightsOptions, textAlignOptions } from '../_settings/utils/font/utils';
import { nanoid } from '@/utils/uuid';
import { SettingsFormMarkupFactory } from '@/interfaces';

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const appearanceTabId = nanoid();
  const eventsTabId = nanoid();
  const styleRouter1Id = nanoid();
  const styleRouter2Id = nanoid();

  return {
    components: fbf('root')
      .addSearchableTabs({ id: searchableTabsId, propertyName: 'settingsTabs', label: 'Settings', hideLabel: true, labelAlign: 'right', size: 'small',
        tabs: [
          { key: 'common', title: 'Common', id: commonTabId, components: fbf(commonTabId)
            .addContextPropertyAutocomplete({ propertyName: 'propertyName', label: 'Property Name', styledLabel: true, size: 'small', validate: { required: true }, jsSetting: true })
            .addSettingsInputRow({ inputs: [
              { type: 'dropdown', propertyName: 'contentDisplay', label: 'Content Display', size: 'small', jsSetting: true,
                dropdownOptions: [{ label: 'Content', value: 'content' }, { label: 'Property name', value: 'name' }],
              },
              { type: 'dropdown', propertyName: 'dataType', label: 'Data Type', size: 'small', jsSetting: true,
                dropdownOptions: [{ label: 'String', value: 'string' }, { label: 'Date time', value: 'date-time' }, { label: 'Number', value: 'number' }, { label: 'Boolean', value: 'boolean' }],
                visibleJs: 'return data?.contentDisplay === "name";',
              },
            ],
            })
            .addSettingsInputRow({ inputs: [
              { type: 'switch', propertyName: 'visible', label: 'Visible', size: 'small', jsSetting: true, permissionSettings: true },
            ],
            })
            .addSettingsInput({ inputType: 'textField', propertyName: 'dateFormat', label: 'Date Format', size: 'small', jsSetting: true, placeholder: 'Date Format', visibleJs: 'return getSettingValue(data?.dataType) === "date-time";' })
            .addSettingsInput({
              inputType: 'dropdown', propertyName: 'numberFormat', label: 'Number Format', size: 'small', jsSetting: true, visibleJs: 'return  getSettingValue(data?.dataType) === "number";',
              dropdownOptions: [{ label: 'Currency', value: 'currency' }, { label: 'Double', value: 'double' }, { label: 'Round', value: 'round' }, { label: 'Thousand separator', value: 'thousandSeparator' }],
            })
            .addSettingsInput({ inputType: 'textArea', propertyName: 'content', label: 'Content', size: 'small', jsSetting: true, visibleJs: 'return getSettingValue(data?.contentDisplay) !== "name";' })
            .addSettingsInputRow({ inputs: [
              { type: 'switch', propertyName: 'italic', label: 'Italic', size: 'small', jsSetting: true },
              { type: 'switch', propertyName: 'code', label: 'Code', size: 'small', jsSetting: true },
            ] })
            .addSettingsInputRow({ inputs: [
              { type: 'switch', propertyName: 'delete', label: 'Strikethrough', size: 'small', jsSetting: true },
              { type: 'switch', propertyName: 'underline', label: 'Underline', size: 'small', jsSetting: true },
            ] })
            .addSettingsInputRow({ inputs: [
              { type: 'switch', propertyName: 'ellipsis', label: 'Ellipsis', size: 'small', jsSetting: true },
              { type: 'switch', propertyName: 'mark', label: 'Mark', size: 'small', jsSetting: true },
            ] })
            .addSettingsInputRow({ inputs: [
              { type: 'switch', propertyName: 'keyboard', label: 'Keyboard', size: 'small', jsSetting: true },
              { type: 'switch', propertyName: 'copyable', label: 'Copyable', size: 'small', jsSetting: true },
            ] })
            .addPropertyRouter({ id: styleRouter1Id, componentName: 'propertyRouter1', label: 'Property router1', labelAlign: 'right',
              propertyRouteName: removeStyleRouter === true ? '' : { _mode: "code", _code: "    return contexts.canvasContext?.designerDevice || 'desktop';", _value: "" },
              components: fbf(styleRouter1Id)
                .stdCollapsiblePanel('Font', (fbf) => fbf
                  .addSettingsInputRow({ inline: true, inputs: [
                    { type: 'dropdown', label: 'Family', propertyName: 'font.type', hideLabel: true, dropdownOptions: fontTypes },
                    { type: 'dropdown', label: 'Weight', propertyName: 'font.weight', hideLabel: true, dropdownOptions: fontWeightsOptions, width: 100, tooltip: 'Controls text thickness (light, normal, bold, etc.)' },
                    { type: 'dropdown', label: 'Align', propertyName: 'font.align', hideLabel: true, width: 60, dropdownOptions: textAlignOptions },
                  ] })
                  .addSettingsInput({ inputType: 'dropdown', label: 'Size', propertyName: 'level',
                    dropdownOptions: [{ label: 'Custom', value: 0 }, { label: 'H1', value: 1 }, { label: 'H2', value: 2 }, { label: 'H3', value: 3 }, { label: 'H4', value: 4 }, { label: 'H5', value: 5 }],
                  })
                  .addSettingsInput({ inputType: 'numberField', label: 'Size', propertyName: 'font.size', hideLabel: true,
                    visibleJs: removeStyleRouter === true
                      ? 'return data?.level === 0;'
                      : 'return data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.level === 0;',
                  })
                  .addSettingsInput({ inputType: 'dropdown', propertyName: 'contentType', label: 'Type', hideLabel: false, dropdownOptions: [
                    { label: 'Default', value: '' }, { label: 'Primary', value: 'primary' }, { label: 'Secondary', value: 'secondary' }, { label: 'Success', value: 'success' },
                    { label: 'Warning', value: 'warning' }, { label: 'Info', value: 'info' }, { label: 'Error', value: 'danger' }, { label: 'Custom color', value: 'custom' },
                  ] })
                  .addSettingsInput({ inputType: 'colorPicker', label: 'Custom Color', propertyName: 'font.color', jsSetting: true,
                    visibleJs: removeStyleRouter === true
                      ? 'return data?.contentType === "custom";'
                      : 'return data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.contentType === "custom";',
                  }),
                )
                .stdDimensionsPanel()
                .stdMarginPaddingPanel()
                .toJson(),
            })
            .toJson(),
          },
          { key: 'events', title: 'Events', id: eventsTabId, components: [...fbf(eventsTabId).stdEventHandlers(['onClick', 'onDoubleClick', 'onMouseEnter', 'onMouseMove', 'onMouseLeave']).toJson()] },
          { key: 'appearance', title: 'Appearance', id: appearanceTabId,
            components: fbf(appearanceTabId)
              .addPropertyRouter({ id: styleRouter2Id, componentName: 'propertyRouter2', label: 'Property router2', labelAlign: 'right',
                propertyRouteName: removeStyleRouter === true ? '' : { _mode: "code", _code: "    return contexts.canvasContext?.designerDevice || 'desktop';", _value: "" },
                components: fbf(styleRouter2Id)
                  .stdCollapsiblePanel('Font', (fbf) => fbf
                    .addSettingsInputRow({ inline: true, inputs: [
                      { type: 'dropdown', label: 'Family', propertyName: 'font.type', hideLabel: true, dropdownOptions: fontTypes },
                      { type: 'dropdown', label: 'Size', propertyName: 'level',
                        dropdownOptions: [{ label: 'Custom', value: 0 }, { label: 'H1', value: 1 }, { label: 'H2', value: 2 }, { label: 'H3', value: 3 }, { label: 'H4', value: 4 }, { label: 'H5', value: 5 }],
                      },
                      { type: 'numberField', label: 'Size', propertyName: 'font.size', hideLabel: true, width: 50,
                        visibleJs: removeStyleRouter === true
                          ? 'return getSettingValue(data?.level) < 1;'
                          : 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.level) < 1;',
                      },
                      { type: 'dropdown', label: 'Weight', propertyName: 'font.weight', hideLabel: true, dropdownOptions: fontWeightsOptions, width: 100, tooltip: 'Controls text thickness (light, normal, bold, etc.)' },
                      { type: 'dropdown', label: 'Align', propertyName: 'font.align', hideLabel: true, width: 60, dropdownOptions: textAlignOptions },
                    ] })
                    .addSettingsInput({ inputType: 'dropdown', propertyName: 'contentType', label: 'Type', hideLabel: false, dropdownOptions: [
                      { label: 'Default', value: '' }, { label: 'Primary', value: 'primary' }, { label: 'Secondary', value: 'secondary' }, { label: 'Success', value: 'success' },
                      { label: 'Warning', value: 'warning' }, { label: 'Info', value: 'info' }, { label: 'Error', value: 'danger' }, { label: 'Custom color', value: 'custom' },
                    ] })
                    .addSettingsInput({ inputType: 'colorPicker', label: 'Custom Color', propertyName: 'font.color', jsSetting: true,
                      visibleJs: removeStyleRouter === true
                        ? 'return getSettingValue(data?.contentType) === "custom";'
                        : 'return getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.contentType) === "custom";',
                    }),
                  )
                  .stdDimensionsPanel()
                  .stdBorderPanel(removeStyleRouter !== true)
                  .stdBackgroundPanel(removeStyleRouter !== true)
                  .stdShadowPanel()
                  .stdMarginPaddingPanel()
                  .addSettingsInput({ inputType: 'codeEditor', propertyName: 'style', label: 'Custom Style', description: 'A script that returns the style of the element as an object. This should conform to CSSProperties' })
                  .toJson(),
              }).toJson(),
          },
        ],
      })
      .toJson(),
    formSettings: {
      colon: false,
      layout: 'vertical' as FormLayout,
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
    },
  };
};
