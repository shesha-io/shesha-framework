import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { DataTypes, SettingsFormMarkupFactory } from '@/interfaces';

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();
  const styleRouterId = nanoid();

  const json = {
    components: fbf('root')
      .addSearchableTabs({
        id: searchableTabsId,
        propertyName: 'settingsTabs',
        label: 'Settings',
        hideLabel: true,
        labelAlign: 'right',
        size: 'small',
        tabs: [
          {
            key: 'common', title: 'Common', id: commonTabId,
            components: [
              ...fbf(commonTabId)
                .addContextPropertyAutocomplete({ propertyName: 'propertyName', label: 'Property Name', styledLabel: true, size: 'small', validate: { required: true } })
                .addLabelConfigurator({ propertyName: 'hideLabel', label: 'Label', hideLabel: true })
                .addSettingsInputRow({ inputs: [{ type: 'textArea', propertyName: 'description', label: 'Tooltip', jsSetting: true }] })
                .stdVisibleEditableInputs('full')
                .stdCollapsiblePanel('Validations', (fb) => fb
                  .addSettingsInput({ inputType: 'switch', propertyName: 'validate.required', label: 'Required', size: 'small', layout: 'horizontal', jsSetting: true }))
                .toJson(),
            ],
          },
          {
            key: 'events', title: 'Events', id: eventsTabId,
            components: [...fbf(eventsTabId).stdEventHandlers(['onChange', 'onFocus', 'onBlur', 'onClick', 'onMouseEnter', 'onMouseLeave', 'onKeyDown', 'onKeyUp'], DataTypes.boolean).toJson()],
          },
          {
            key: 'appearance', title: 'Appearance', id: appearanceTabId,
            // Two independent style sets, each in its own group: "Track Styles" binds to the root
            // style properties, "Toggle Styles" to `handleStyles.*`. Neither has a font panel —
            // the switch renders no text of its own. Toggle Styles has no Margin & Padding panel:
            // the toggle is absolutely positioned inside the track rather than laid out, so a box
            // model has nothing to act on.
            components: [...fbf(appearanceTabId)
              .addPropertyRouter({
                id: styleRouterId,
                propertyName: 'styleRouter',
                componentName: 'styleRouter',
                label: 'Style router',
                labelAlign: 'right',
                propertyRouteName: { _code: `return ${removeStyleRouter === true ? '' : 'contexts.canvasContext?.designerDevice || "desktop"'};`, _mode: 'code', _value: '' },
                components: [
                  ...fbf(styleRouterId)
                    .stdDimensionsPanel()
                    .stdBorderPanel(removeStyleRouter !== true)
                    .stdBackgroundPanel(removeStyleRouter !== true)
                    .stdShadowPanel()
                    .stdMarginPaddingPanel()
                    .stdCustomStylePanel()
                    .stdCollapsiblePanel('Toggle Styles', (f) => f
                      .stdDimensionsPanel('handleStyles.dimensions')
                      .stdBorderPanel(removeStyleRouter !== true, 'handleStyles.border')
                      .stdBackgroundPanel(removeStyleRouter !== true, 'handleStyles.background')
                      .stdShadowPanel('handleStyles.shadow')
                      .stdCustomStylePanel(undefined, 'handleStyles.style'))
                    .toJson(),
                ],
              })
              .toJson()],
          },
        ],
      })
      .toJson(),
    formSettings: { colon: false, layout: 'vertical' as FormLayout, labelCol: { span: 24 }, wrapperCol: { span: 24 } },
  };

  return json;
};
