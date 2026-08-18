import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { legacyColor2Hex } from '@/designer-components/_common-migrations/migrateColor';
import { migrateCustomFunctions, migrateHiddenToVisible, migratePropertyName, migrateStylingBoxToJson } from '@/designer-components/_common-migrations/migrateSettings';
import { evaluateString, validateConfigurableComponentSettings } from '@/formDesignerUtils';
import { LineHeightOutlined } from '@ant-design/icons';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { FONT_SIZES, ITextComponentProps, LevelType, TextComponentDefinition } from './models';
import { getSettings } from './settingsForm';
import { defaultStyles, getContent, remToPx } from './utils';
import { getFullSizeWrapperDesignerStyle } from '@/components/formDesigner/utils/stylingUtils';
import { isMoment } from 'moment';
import { GenericText } from './genericText';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { isDefined } from '@/utils';
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
  calculateModel: (model, allData) => {
    const evaluateValue = (value: unknown): string | undefined => {
      const val: string | undefined =
        typeof value === 'string'
          ? value
          : isMoment(value)
            ? value.isValid() ? value.format(model.dateFormat) : ''
            : isDefined(value) ? value.toString() : '';

      const contentEvaluation = evaluateString(val, allData);
      const content = getContent(contentEvaluation, { dataType: model.dataType, dateFormat: model.dateFormat, numberFormat: model.numberFormat });

      if (!content && model.contentDisplay === 'content' && allData.form?.formMode === 'designer')
        return 'Please make sure you enter the content to be displayed here!';

      return content;
    };
    return { evaluateValue };
  },
  Factory: ({ model, calculatedModel }) => {
    const handleEvent = useEvents<void>(model.componentName);
    return (
      <ConfigurableFormItem model={{ ...model, hideLabel: true }}>
        {(value) => {
          const val = calculatedModel.evaluateValue(model.contentDisplay === 'name' ? value : model.content);
          return (
            <GenericText
              {...model}
              additionalDomProperties={getComponentEvents<void, ITextComponentProps>(model, ['onClick', 'onDoubleClick', 'onMouseEnter', 'onMouseMove', 'onMouseLeave'], { handleEvent })}
            >
              {val}
            </GenericText>
          );
        }}
      </ConfigurableFormItem>
    );
  },
  getDefaultStyles: defaultStyles,
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  initModel: (model) => ({
    ...model,
    code: false,
    copyable: false,
    delete: false,
    ellipsis: false,
    mark: false,
    italic: false,
    underline: false,
    level: 0,
    content: 'Your text here...',
    contentDisplay: 'content',
  }),
  migrator: (m) =>
    m
      .add<ITextComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)) as ITextComponentProps)
      .add<ITextComponentProps>(1, (prev) => ({
        ...prev,
        color: legacyColor2Hex(prev.color),
        backgroundColor: legacyColor2Hex(prev.backgroundColor),
      }))
      .add<ITextComponentProps>(2, (prev) => ({ ...migrateFormApi.properties(prev) }))
      .add<ITextComponentProps>(3, (prev, ctx) => ctx.isNew === true ? prev : { ...migratePrevStyles(prev, defaultStyles(prev)) })
      .add<ITextComponentProps>(4, (prev) => ({ ...prev, contentType: prev.contentType }))
      .add<ITextComponentProps>(5, (prev, ctx) => {
        if (ctx.isNew === true) return prev;
        const fontSizeEntry = FONT_SIZES[prev.fontSize as keyof typeof FONT_SIZES];
        const rem = fontSizeEntry ? fontSizeEntry.fontSize : prev.fontSize;
        const px = remToPx(rem);
        return {
          ...prev,
          desktop: { ...prev.desktop, font: { ...prev.desktop?.font, size: px } },
        };
      })
      .add<ITextComponentProps>(6, (prev, ctx) => ctx.isNew === true
        ? prev
        : { ...prev, desktop: { ...prev.desktop, level: prev.textType === 'title' && Number.isInteger(prev.level) ? Number(prev.level) as LevelType : 0 } })
      .add<ITextComponentProps>(7, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(migrateStylingBoxToJson(prev)))),
  previewConfiguration: {
    type: 'text',
    code: false,
    copyable: false,
    delete: false,
    ellipsis: false,
    mark: false,
    italic: false,
    underline: false,
    level: 0,
    content: 'Your text here...',
    contentDisplay: 'content',
    id: 'text',
  },
};

export default TextComponent;
