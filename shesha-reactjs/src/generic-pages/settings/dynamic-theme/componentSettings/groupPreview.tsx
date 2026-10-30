import { Card } from 'antd';
import { FC, useMemo } from 'react';
import { FormMarkup, IConfigurableFormComponent, IConfigurableTheme } from '@/providers';
import { ThemeComponentGroup } from '@/providers/theme/contexts';
import { useFormDesignerComponents } from '@/providers/form/hooks';
import { ComponentPreviewContext } from '@/providers/componentPreview';
import { isDefined, isNotNullOrWhiteSpace } from '@/utils/nullables';
import { IToolboxComponent } from '@/interfaces/formDesigner';
import { useStyles } from '../styles/styles';
import { CardTitle } from '../cardTitle';
import { getDataTablePreviewModel, getPreviewComponentModel, getPreviewValue, SAMPLE_TABLE_PROPERTY, SAMPLE_TABLE_ROWS } from './previewModel';
import { PreviewForm } from './preview';

/**
 * Sample components previewed on each style-group tab, by component type - common members of the
 * group that render something recognisable without data. A type that is not registered, or is no
 * longer in the group, is skipped.
 */
const GROUP_PREVIEW_TYPES: Record<ThemeComponentGroup, string[]> = {
  input: ['textField', 'textArea', 'numberField'],
  inline: ['button', 'statusTag'],
  standard: ['datatable'],
  layout: ['card', 'collapsiblePanel'],
};

/** Type of the Data Table, which previews with sample rows (see `getDataTablePreviewModel`). */
const DATATABLE_TYPE = 'datatable';

export interface IGroupDefaultsPreviewProps {
  group: ThemeComponentGroup;
  theme: IConfigurableTheme;
}

/**
 * Live preview of a style-group tab: a few of the group's components, each rendered as on the
 * Components tab (see `ComponentDefaultsPreview`), so changes to the group defaults can be judged.
 */
export const GroupDefaultsPreview: FC<IGroupDefaultsPreviewProps> = ({ group, theme }) => {
  // The preview section paints the theme being edited's Page colour, so pass that theme in.
  const { styles } = useStyles(theme);
  const components = useFormDesignerComponents();

  const formSettings = useMemo(() => ({
    colon: theme.colon,
    layout: theme.layout,
    labelCol: { span: theme.labelSpan },
    wrapperCol: { span: theme.componentSpan },
  }), [theme.colon, theme.layout, theme.labelSpan, theme.componentSpan]);

  // All samples share one form, laid out as they would be in a real form, so the spacing between
  // them - margins included - is what the group defaults produce.
  const preview = useMemo(() => {
    const models: IConfigurableFormComponent[] = [];
    const previewValues: Record<string, unknown> = {};
    GROUP_PREVIEW_TYPES[group]
      .map((type) => components[type])
      .filter((definition): definition is IToolboxComponent => isDefined(definition) && definition.themeGroup === group)
      .forEach((definition) => {
        if (definition.type === DATATABLE_TYPE) {
          models.push(getDataTablePreviewModel(definition));
          previewValues[SAMPLE_TABLE_PROPERTY] = SAMPLE_TABLE_ROWS;
          return;
        }
        const model = getPreviewComponentModel(definition);
        models.push(model);
        const value = getPreviewValue(definition.type);
        if (isDefined(value) && isNotNullOrWhiteSpace(model.propertyName))
          previewValues[model.propertyName] = value;
      });
    return models.length === 0
      ? undefined
      : { markup: { components: models, formSettings } as FormMarkup, previewValues };
  }, [components, group, formSettings]);

  if (!preview)
    return null;

  const groupTitle = group.charAt(0).toUpperCase() + group.slice(1);

  return (
    <Card
      className={styles.previewSection}
      title={(
        <CardTitle
          title={`${groupTitle} Preview`}
          description={`Sample ${group} components with the current ${group} defaults.`}
        />
      )}
    >
      <ComponentPreviewContext.Provider value={true}>
        <PreviewForm
          markup={preview.markup}
          theme={theme}
          className={styles.appearanceForm}
          formErrors={undefined}
          previewValues={preview.previewValues}
        />
      </ComponentPreviewContext.Provider>
    </Card>
  );
};
