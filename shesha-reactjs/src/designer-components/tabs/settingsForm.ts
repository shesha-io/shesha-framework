import { FormLayout } from 'antd/lib/form/Form';
import { onAddNewItem } from './utils';
import { getItemSettings } from './itemSettings';
import { nanoid } from '@/utils/uuid';
import { SettingsFormMarkupFactory } from '@/interfaces';
import { IItemListConfiguratorModalProps } from '../itemListConfigurator/itemListConfiguratorModal';
import { ListItemWithId } from '@/components/listEditor/models';

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  const commonTabId = nanoid();
  const appearanceTabId = nanoid();
  const styleRouterId = nanoid();

  return {
    components: fbf()
      .addSearchableTabs({ propertyName: 'settingsTabs', parentId: 'root', label: 'Settings', hideLabel: true, labelAlign: 'right', size: 'small',
        tabs: [
          { key: 'common', title: 'Common', id: commonTabId,
            components: fbf(commonTabId)
              .addSettingsInput({ inputType: 'textField', propertyName: 'componentName', label: 'Component Name', validate: { required: true }, jsSetting: false })
              .stdVisibleEditableInputs('full')
              .addSettingsInputRow({ inputs: [
                { type: 'dropdown', propertyName: 'defaultActiveKey', label: 'Default Active Tab', labelAlign: 'right', parentId: 'root', allowClear: true,
                  dropdownOptions: { _code: 'return  getSettingValue(data?.tabs)?.map((item) => ({ ...item, label: item?.title, value: item?.key }));', _mode: 'code' },
                },
                { type: 'dropdown', propertyName: 'tabType', label: 'Tab Type', jsSetting: false, labelAlign: 'right',
                  dropdownOptions: [{ value: 'line', label: 'Line' }, { value: 'card', label: 'Card' }],
                },
              ] })
              .addSettingsInput({ inputType: 'itemListConfiguratorModal', propertyName: 'tabs', label: 'Tabs', labelAlign: 'right', buttonTextReadOnly: 'View Tab Panes',
                buttonText: 'Configure Tab Panes', listItemSettingsMarkup: getItemSettings(fbf),
                // TODO: implement supports of generics and remove this workaround
                onAddNewItem: onAddNewItem as unknown as IItemListConfiguratorModalProps<ListItemWithId>['initNewItem'],
                modalSettings: { title: 'Configure Tab Panes', header: 'Here you can configure the tab panes by adjusting their settings and ordering.' },
                modalReadonlySettings: { title: 'View Tab Panes', header: 'Here you can view tab panes configuration' },
              })
              .toJson(),
          },
          { key: 'appearance', title: 'Appearance', id: appearanceTabId,
            components: fbf(appearanceTabId)
              .addPropertyRouter({ id: styleRouterId, componentName: 'propertyRouter2', label: 'Property router2', labelAlign: 'right',
                propertyRouteName: removeStyleRouter === true ? '' : { _mode: "code", _code: "    return contexts.canvasContext?.designerDevice || 'desktop';", _value: "" },
                components: fbf(styleRouterId)
                  .addSettingsInput({ inputType: 'dropdown', propertyName: 'tabPosition', tooltip: "This will set the position for all buttons", label: 'Position', labelAlign: 'right', parentId: 'root',
                    dropdownOptions: [{ value: 'top', label: 'Top' }, { value: 'bottom', label: 'Bottom' }, { value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }],
                  })
                  .stdFontPanel()
                  .stdDimensionsPanel()
                  .stdBorderPanel(removeStyleRouter !== true)
                  .stdCollapsiblePanel('Line Color', (fbf) => fbf.addSettingsInput({ inputType: 'colorPicker', label: 'Color', propertyName: 'tabLineColor', jsSetting: false }), false, 'return  getSettingValue(data?.tabType) === "line";')
                  .stdBackgroundPanel(removeStyleRouter !== true)
                  .stdShadowPanel()
                  .stdMarginPaddingPanel()
                  .addSettingsInput({ inputType: 'codeEditor', propertyName: 'style', label: 'Style', description: 'A script that returns the style of the element as an object. This should conform to CSSProperties' })
                  .stdCollapsiblePanel('Card Styles', (fbf) => fbf
                    .stdFontPanel(undefined, 'card.font')
                    .stdDimensionsPanel('card.dimensions')
                    .stdContainer((fbf) => fbf.stdBackgroundPanel(removeStyleRouter !== true, 'card.background'), 'return  getSettingValue(data?.tabType) !== "line";')
                    .addSettingsInput({ inputType: 'codeEditor', propertyName: 'card.style', label: 'Style', description: 'A script that returns the style of the element as an object. This should conform to CSSProperties' })
                    .addSettingsInput({ inputType: 'codeEditor', propertyName: 'card.activeStyle', label: 'Active Card Style', description: 'A script that returns the style of the element as an object. This should conform to CSSProperties' }),
                  ).toJson(),
              }).toJson(),
          },
        ],
      }).toJson(),
    formSettings: {
      colon: false,
      layout: 'vertical' as FormLayout,
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
    },
  };
};
