import SectionSeparator from '@/components/sectionSeparator';
import { migrateCustomFunctions, migrateHiddenToVisible, migratePropertyName, migrateStylingBoxToJson } from '@/designer-components/_common-migrations/migrateSettings';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { getBooleanPropertyOrUndefined } from '@/utils/object';
import { LineOutlined } from '@ant-design/icons';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { ISectionSeparatorComponentProps, ISectionSeparatorComponentPropsV0, SectionSeparatorComponentDefinition } from './interfaces';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { isDefined } from '@/utils';
import { useEvents } from '@/components/formDesigner/components/eventsAndApiValueProcessor';
import { getComponentEvents } from '../_common/events';
import { getStyleBoxValue } from '../styleBox/utils';
import { DEFAULT_DESIGNER_PADDING, getDesignerPadding } from '@/components/formDesigner/utils/stylingUtils';

const SectionSeparatorComponent: SectionSeparatorComponentDefinition = {
  allowInherit: true,
  type: 'sectionSeparator',
  isInput: false,
  name: 'Section Separator',
  icon: <LineOutlined />,
  getWrapperStyle: (model) => ({
    designerStyle: {
      ...DEFAULT_DESIGNER_PADDING,
      // use default designer margin if component margin is not set or component margin is less than designer margin
      stylingBoxJson: {
        _type: 'styleBox',
        paddingBottom: getDesignerPadding(model.stylingBoxJson?.marginBottom, DEFAULT_DESIGNER_PADDING.stylingBoxJson?.paddingBottom),
        paddingLeft: getDesignerPadding(model.stylingBoxJson?.marginLeft, DEFAULT_DESIGNER_PADDING.stylingBoxJson?.paddingLeft),
        paddingRight: getDesignerPadding(model.stylingBoxJson?.marginRight, DEFAULT_DESIGNER_PADDING.stylingBoxJson?.paddingRight),
        paddingTop: getDesignerPadding(model.stylingBoxJson?.marginTop, DEFAULT_DESIGNER_PADDING.stylingBoxJson?.paddingTop),
      },
    },
  }),
  Factory: ({ model }) => {
    const handleEvent = useEvents<void>(model.componentName);

    if (model.hidden === true) return null;
    const inputProps = { ...model, lineThickness: model.lineFont?.size, lineColor: model.lineFont?.color };
    return (
      <SectionSeparator
        {...inputProps}
        title={model.hideLabel !== true ? model.label : undefined}
        tooltip={model.description}
        containerStyle={model.wrapperStyleCss}
        titleStyle={model.styleCss}
        additionalDomProperties={getComponentEvents<void, ISectionSeparatorComponentProps>(model, ['onClick', 'onDoubleClick', 'onMouseEnter', 'onMouseMove', 'onMouseLeave'], { handleEvent })}
      />
    );
  },
  getDefaultStyles: defaultStyles,
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  initModel: (model) => {
    return {
      ...model,
      label: 'Section',
      lineThickness: 2,
      labelAlign: 'left',
      orientation: 'horizontal',
    };
  },
  migrator: (m) =>
    m
      .add<ISectionSeparatorComponentPropsV0>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<ISectionSeparatorComponentPropsV0>(1, (prev) => ({ ...migrateFormApi.properties(prev) }))
      .add<ISectionSeparatorComponentPropsV0>(2, (prev) => ({ ...prev, labelAlign: 'left' }))
      .add<ISectionSeparatorComponentPropsV0>(3, (prev, ctx) => ctx.isNew === true ? prev : { ...prev, titleMargin: getBooleanPropertyOrUndefined(prev, 'noMargin') === true ? 0 : undefined })
      .add<ISectionSeparatorComponentPropsV0>(4, (prev, ctx) => {
        if (ctx.isNew === true) return prev;

        const prevStyles = {
          containerStyle: prev.containerStyle,
          titleStyle: prev.titleStyle,
          lineFont: prev.lineFont,
          font: prev.font,
          titleStylingBox: prev.titleStylingBox,
          containerStylingBox: prev.containerStylingBox,
          lineType: prev.dashed === true ? 'dashed' : 'solid',
        };

        return {
          ...prev,
          desktop: { ...prev.desktop, ...prevStyles },
          tablet: { ...prev.tablet, ...prevStyles },
          mobile: { ...prev.mobile, ...prevStyles },
        };
      })
      .add<ISectionSeparatorComponentPropsV0>(5, (prev, ctx) => ctx.isNew === true ? prev : { ...migratePrevStyles(prev, defaultStyles()) })
      .add<ISectionSeparatorComponentPropsV0>(6, (prev, ctx) => {
        // move titleStyle and containerStyle to style and wrapperStyle because of new style model with automatic calculation
        if (ctx.isNew === true) return prev;
        const getNewStyles = (value: Partial<ISectionSeparatorComponentPropsV0> | undefined): Partial<ISectionSeparatorComponentProps> | undefined => {
          if (!isDefined(value)) return value;
          return {
            style: value.titleStyle,
            wrapperStyle: value.containerStyle,
            titleStylingBoxJson: getStyleBoxValue(value.titleStylingBox),
            containerStylingBoxJson: getStyleBoxValue(value.containerStylingBox),
          };
        };
        return {
          ...prev,
          desktop: { ...prev.desktop, ...getNewStyles(prev.desktop) },
          tablet: { ...prev.tablet, ...getNewStyles(prev.tablet) },
          mobile: { ...prev.mobile, ...getNewStyles(prev.mobile) },
        };
      })
      .add<ISectionSeparatorComponentProps>(7, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(migrateStylingBoxToJson(prev)))),
};

export default SectionSeparatorComponent;
