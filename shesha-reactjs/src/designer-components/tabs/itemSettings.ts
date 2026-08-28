import { FormBuilderFactory } from '@/form-factory/interfaces';
import { IConfigurableFormComponent } from '@/interfaces';
import { nanoid } from '@/utils/uuid';

export const getItemSettings = (fbf: FormBuilderFactory): IConfigurableFormComponent[] => {
  const commonTabId = nanoid();

  return fbf()
    .addSearchableTabs({ propertyName: 'settingsTabs', parentId: 'root', label: 'Settings', hideLabel: true, labelAlign: 'right', size: 'small',
      tabs: [
        { key: 'common', title: 'Common', id: commonTabId,
          components: fbf(commonTabId)
            .addSettingsInputRow({ inputs: [
              { type: 'textField', propertyName: 'name', label: 'Name', labelAlign: 'right', jsSetting: false },
              { type: 'textField', propertyName: 'title', label: 'Title', labelAlign: 'right', jsSetting: true },
            ] })
            .stdVisibleEditableInputs('full')
            .addSettingsInputRow({ inputs: [
              { type: 'switch', propertyName: 'animated', label: 'Animated', labelAlign: 'right', jsSetting: true },
              { type: 'iconPicker', propertyName: 'icon', label: 'Icon', jsSetting: true, labelAlign: 'right' },
            ] })
            .addSettingsInputRow({ inputs: [
              { type: 'switch', propertyName: 'forceRender', label: 'Force Render', labelAlign: 'right', jsSetting: true },
              { type: 'switch', propertyName: 'destroyInactiveTabPane', label: 'Destroy Inactive Tab Pane', labelAlign: 'right', jsSetting: true },
            ] })
            .addSettingsInputRow({ inputs: [
              { type: 'textField', propertyName: 'key', label: 'Key', jsSetting: false, labelAlign: 'right' },
              { type: 'textField', propertyName: 'className', label: 'Class Name', labelAlign: 'right', jsSetting: true },
            ] })
            .toJson(),
        }],
    })
    .toJson();
};
