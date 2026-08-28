import { SettingsFormMarkupFactory } from '@/interfaces';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';

export const getSettings: SettingsFormMarkupFactory = ({ fbf }) => {
  const commonTabId = nanoid();
  return {
    components: fbf()
      .addSearchableTabs({ propertyName: 'settingsTabs', parentId: 'root', label: 'Settings', hideLabel: true, labelAlign: 'right', size: 'small',
        tabs: [
          { key: 'common', title: 'Common', id: commonTabId,
            components: fbf(commonTabId)
              .addSettingsInput({ inputType: 'textField', propertyName: 'componentName', label: 'Component Name', size: 'small', validate: { required: true } })
              .addSettingsInputRow({ inputs: [
                { type: 'switch', propertyName: 'hidden', label: 'Hide', jsSetting: true, layout: 'horizontal' },
                { type: 'switch', propertyName: 'showIcon', label: 'Show Icon', description: 'Display the layout icon next to the View label', layout: 'horizontal' },
              ] })
              .stdCollapsiblePanel('Filters', (fbf) => fbf.addSettingsInput({ inputType: 'filtersList', propertyName: 'filters', hideLabel: true, label: 'Filters', layout: 'horizontal' }))
              .toJson(),
          },
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
