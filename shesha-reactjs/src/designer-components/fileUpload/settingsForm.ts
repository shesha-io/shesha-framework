import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';
import { DataTypes, SettingsFormMarkupFactory } from '@/interfaces';
import { ALL_INPUT_EVENTS_WITHOUT_DOUBLE_CLICK } from '../_common/events';

export const getSettings: SettingsFormMarkupFactory = ({ fbf, removeStyleRouter }) => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const eventsTabId = nanoid();
  const appearanceTabId = nanoid();

  const styleRouterId = nanoid();

  // The thumbnail tile is the only box this component draws, so the box-style panels are shown only
  // for that display type (matching releases/0.45).
  /* A dragger renders a drop area with a plain text list and has no tile, whatever listType says —
     so the tile's box panels must not be offered for one either. */
  const THUMBNAIL_ONLY_JS = 'return getSettingValue(data?.listType) === "thumbnail" && getSettingValue(data?.isDragger) !== true;';
  const FILE_NAME_ONLY_JS = 'return getSettingValue(data?.listType) !== "thumbnail";';

  const listTypeOptions = [
    { value: 'text', label: 'File name' },
    { value: 'thumbnail', label: 'Thumbnail' },
  ];

  const json = {
    components: fbf('root')
      .addSearchableTabs({ id: searchableTabsId, propertyName: 'settingsTabs', label: 'Settings', hideLabel: true, labelAlign: 'right', size: 'small',
        tabs: [
          { key: 'common', title: 'Common', id: commonTabId, components: fbf(commonTabId)
            .addContextPropertyAutocomplete({ propertyName: 'propertyName', label: 'Property Name', styledLabel: true, size: 'small', validate: { required: true }, jsSetting: true })
            .addLabelConfigurator({ propertyName: 'hideLabel', label: 'Label', hideLabel: true })
            .stdPlaceholderDescriptionInputs()
            .stdVisibleEditableInputs('full')
            .stdCollapsiblePanel('Display', (fb) => fb
              .addSettingsInputRow({ inputs: [
                { type: 'dropdown', propertyName: 'listType', label: 'List Type', size: 'small', jsSetting: true, dropdownOptions: listTypeOptions,
                  tooltip: 'How the selected file is presented: as a file name or as a thumbnail tile',
                  visibleJs: 'return getSettingValue(data?.isDragger) !== true;' },
                { type: 'switch', propertyName: 'isDragger', label: 'Is Dragger', size: 'small', jsSetting: true, layout: 'horizontal',
                  tooltip: 'Whether the uploader should show a drop area instead of a button',
                  visibleJs: 'return getSettingValue(data?.listType) !== "thumbnail";' },
              ] })
              .addSettingsInputRow({ inputs: [
                { type: 'switch', propertyName: 'hideFileName', label: 'Hide File Name', size: 'small', jsSetting: true, layout: 'horizontal' },
              ], visibleJs: 'return getSettingValue(data?.listType) === "thumbnail";' }))
            .stdCollapsiblePanel('Files', (fb) => fb
              .addSettingsInputRow({ inputs: [
                { type: 'switch', propertyName: 'allowUpload', label: 'Allow Upload', size: 'small', jsSetting: true, layout: 'horizontal' },
                { type: 'switch', propertyName: 'allowReplace', label: 'Allow Replace', size: 'small', jsSetting: true, layout: 'horizontal' },
              ] })
              .addSettingsInputRow({ inputs: [
                { type: 'switch', propertyName: 'allowDelete', label: 'Allow Delete', size: 'small', jsSetting: true, layout: 'horizontal' },
                { type: 'switch', propertyName: 'useSync', label: 'Synchronous Upload', size: 'small', jsSetting: true, layout: 'horizontal',
                  tooltip: 'Upload the file with the form submission rather than immediately on selection' },
              ] })
              .addSettingsInput({ inputType: 'editableTagGroupProps', propertyName: 'allowedFileTypes', label: 'Allowed File Types', size: 'small',
                tooltip: 'File types that can be accepted. The file type should include the leading dot, for example: .png' })
              .addSettingsInputRow({ inputs: [
                { type: 'textField', propertyName: 'ownerId', label: 'Owner ID', size: 'small', jsSetting: true,
                  tooltip: 'Id of the entity the file is attached to. Defaults to the form data entity when empty' },
                { type: 'entityTypeAutocomplete', propertyName: 'ownerType', label: 'Owner Type', size: 'small', jsSetting: true,
                  tooltip: 'Type of the entity the file is attached to. Defaults to the form model type when empty' },
              ] }))
            .stdCollapsiblePanel('Validations', (fb) => fb
              .addSettingsInput({ inputType: 'switch', propertyName: 'validate.required', label: 'Required', size: 'small', layout: 'horizontal', jsSetting: true }))
            .toJson(),
          },
          {
            key: 'events', title: 'Events', id: eventsTabId,
            components: fbf(eventsTabId).stdEventHandlers([...ALL_INPUT_EVENTS_WITHOUT_DOUBLE_CLICK], DataTypes.file).toJson(),
          },
          {
            key: 'appearance', title: 'Appearance', id: appearanceTabId,
            components: fbf(appearanceTabId)
              .addPropertyRouter({
                id: styleRouterId, propertyName: 'propertyRouter1', componentName: 'propertyRouter', label: 'Property router1', labelAlign: 'right',
                propertyRouteName: removeStyleRouter === true
                  ? ''
                  : { _mode: 'code', _code: "    return contexts.canvasContext?.designerDevice || 'desktop';", _value: '' },
                components: [
                  ...fbf(styleRouterId)
                    // Font applies in every display type, but Align does not: in thumbnail mode the
                    // content is forced to centre, so the input would collect a value that never
                    // renders. Two variants of the panel, one with Align and one without, keep it
                    // visible only where it does something (matching releases/0.45).
                    .stdContainer((fb) => fb.stdFontPanel('font'), FILE_NAME_ONLY_JS)
                    .stdContainer((fb) => fb.stdFontPanel('font', ['font.align']), THUMBNAIL_ONLY_JS)
                    // The box styles describe the thumbnail tile, which only exists in thumbnail
                    // mode. In file-name mode the component is a plain file name and an upload
                    // button with no box to style, so these panels are hidden rather than left to
                    // collect values that never render.
                    .stdContainer((fb) => fb
                      .stdDimensionsPanel('dimensions')
                      .stdBorderPanel(removeStyleRouter !== true, 'border')
                      .stdBackgroundPanel(removeStyleRouter !== true, 'background')
                      .stdShadowPanel('shadow'),
                    THUMBNAIL_ONLY_JS)
                    // Spacing and the Custom style apply to the component as a whole, so they stay.
                    .stdMarginPaddingPanel('stylingBoxJson')
                    .stdCustomStylePanel('style')
                    .toJson(),
                ],
              })
              .toJson(),
          },
        ],
      })
      .toJson(),
    formSettings: { colon: false, layout: 'vertical' as FormLayout, labelCol: { span: 24 }, wrapperCol: { span: 24 } },
  };

  return json;
};
