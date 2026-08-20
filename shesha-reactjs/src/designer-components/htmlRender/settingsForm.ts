import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { SettingsFormMarkupFactory } from '@/interfaces';

export const getSettings: SettingsFormMarkupFactory = ({ fbf }) => {
  const commonTabId = nanoid();
  const eventsTabId = nanoid();
  const styleRouterId = nanoid();

  return {
    components: fbf()
      .addSearchableTabs({ propertyName: 'settingsTabs', parentId: 'root', label: 'Settings', hideLabel: true, labelAlign: 'right', size: 'small',
        tabs: [
          { key: 'common', title: 'Common', id: commonTabId,
            components: fbf(commonTabId)
              .addContextPropertyAutocomplete({ propertyName: 'propertyName', label: 'Property Name', styledLabel: true, size: 'small', validate: { required: true } })
              .addSettingsInput({ inputType: 'switch', propertyName: 'visible', label: 'Visible', jsSetting: true, layout: 'horizontal', permissionSettings: true })
              .addSettingsInputRow({ inputs: [
                { type: 'dropdown', propertyName: 'contentType', label: 'Content Type', dropdownOptions: [{ label: 'HTML', value: 'html' }, { label: 'JSX', value: 'jsx' }] },
                { type: 'switch', propertyName: 'sanitize', label: 'Sanitize',
                  tooltip: 'Remove all scripts and styles. Switch off to allow scripts and styles. This will make it possible to create complex, stylized, and interactive components. USE WITH CAUTION!',
                },
              ] })
              .addSettingsInputRow({ inputs: [
                { type: 'codeEditor', language: 'html', propertyName: 'html', label: 'Pure HTML', description: 'Enter HTML that will render a component', wrapInTemplate: false,
                  visibleJs: 'return getSettingValue(data?.contentType) === "html";',
                },
                { type: 'codeEditor', propertyName: 'renderer', label: 'JS for Render HTML', description: 'Enter custom JSX script that will render a component',
                  visibleJs: 'return getSettingValue(data?.contentType) === "jsx";',
                },
              ] })
              .addPropertyRouter({ id: styleRouterId, propertyName: 'propertyRouter1', componentName: 'propertyRouter', label: 'Property router1', labelAlign: 'right',
                propertyRouteName: { _mode: "code", _code: "    return contexts.canvasContext?.designerDevice || 'desktop';", _value: "" },
                components: fbf()
                  .addSettingsInput({ id: nanoid(), inputType: 'codeEditor', propertyName: 'style', label: 'Container Style',
                    description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                  }).toJson(),
              })
              .toJson(),
          },
          { key: 'events', title: 'Events', id: eventsTabId, components: [...fbf(eventsTabId).stdEventHandlers(['onClick', 'onDoubleClick', 'onMouseEnter', 'onMouseMove', 'onMouseLeave']).toJson()] },
        ],
      })
      .toJson(),
    formSettings: {
      isSettingsForm: true,
      colon: false,
      layout: 'vertical' as FormLayout,
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
    },
  };
};
