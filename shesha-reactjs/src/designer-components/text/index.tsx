import { legacyColor2Hex } from '@/designer-components/_common-migrations/migrateColor';
import { migrateCustomFunctions, migrateHiddenToVisible, migratePropertyName, migrateStylingBoxToJson } from '@/designer-components/_common-migrations/migrateSettings';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';
import { LineHeightOutlined } from '@ant-design/icons';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { FONT_SIZES, ITextComponentProps, ITextComponentPropsV0, LevelType, TextComponentDefinition } from './models';
import { getSettings } from './settingsForm';
import { defaultStyles, remToPx } from './utils';
import { getFullSizeWrapperDesignerStyle } from '@/components/formDesigner/utils/stylingUtils';
import { GenericText } from './genericText';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { isNullOrWhiteSpace } from '@/utils';
import { getComponentEvents } from '../_common/events';
import { useEvents } from '@/components/formDesigner/components/eventsAndApiValueProcessor';

const TextComponent: TextComponentDefinition = {
  allowInherit: true,
  type: 'text',
  name: 'Text',
  icon: <LineHeightOutlined />,
  isOutput: true,
  isInput: false,
  tooltip: 'Complete Typography component that combines Text, Paragraph and Title',
  getWrapperStyle: (model) => getFullSizeWrapperDesignerStyle(model),
  Factory: ({ model }) => {
    const handleEvent = useEvents<void>(model.componentName);
    return (
      <GenericText
        {...model}
        additionalDomProperties={getComponentEvents<void, ITextComponentProps>(model, ['onClick', 'onDoubleClick', 'onMouseEnter', 'onMouseMove', 'onMouseLeave'], { handleEvent })}
      >
        {model.content}
      </GenericText>
    );
  },
  getDefaultStyles: () => defaultStyles(),
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  initModel: (model) => ({
    ...model,
    copyable: false,
    delete: false,
    italic: false,
    underline: false,
    level: 0,
    content: 'Your text here...',
  }),
  migrator: (m) =>
    m
      .add<ITextComponentPropsV0>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)) as ITextComponentPropsV0)
      .add<ITextComponentPropsV0>(1, (prev) => ({
        ...prev,
        color: legacyColor2Hex(prev.color),
        backgroundColor: legacyColor2Hex(prev.backgroundColor),
      }))
      .add<ITextComponentPropsV0>(2, (prev) => ({ ...migrateFormApi.properties(prev) }))
      .add<ITextComponentPropsV0>(3, (prev, ctx) => ctx.isNew === true ? prev : { ...migratePrevStyles(prev, defaultStyles(prev)) })
      .add<ITextComponentPropsV0>(4, (prev) => ({ ...prev, contentType: prev.contentType }))
      .add<ITextComponentPropsV0>(5, (prev, ctx) => {
        if (ctx.isNew === true) return prev;
        const fontSizeEntry = FONT_SIZES[prev.fontSize as keyof typeof FONT_SIZES];
        const rem = fontSizeEntry ? fontSizeEntry.fontSize : prev.fontSize;
        const px = remToPx(rem);
        return {
          ...prev,
          desktop: { ...prev.desktop, font: { ...prev.desktop?.font, size: px } },
        };
      })
      .add<ITextComponentPropsV0>(6, (prev, ctx) => ctx.isNew === true
        ? prev
        : { ...prev, desktop: { ...prev.desktop, level: prev.textType === 'title' && Number.isInteger(prev.level) ? Number(prev.level) as LevelType : 0 } })
      .add<ITextComponentProps>(7, (prev) => {
        const newModel: ITextComponentProps = {
          ...prev,
          content: prev.contentDisplay === 'name' && !isNullOrWhiteSpace(prev.propertyName)
            ? isNullOrWhiteSpace(prev.context) ? `{{data.${prev.propertyName}}}` : `{{contexts.${prev.context}.${prev.propertyName}}}`
            : prev.content,
        };
        return migratePermissionsToVisiblePermissions(migrateHiddenToVisible(migrateStylingBoxToJson(newModel)));
      }),
  previewConfiguration: {
    version: 'latest',
    type: 'text',
    copyable: false,
    delete: false,
    italic: false,
    underline: false,
    level: 0,
    content: 'Your text here...',
    id: 'text',
  },
};

export default TextComponent;
