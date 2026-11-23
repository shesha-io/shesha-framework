import { IToolboxComponent } from '@/interfaces/formDesigner';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { IAutocompleteComponentProps } from '@/designer-components/autocomplete/interfaces';
import { getPreviewComponentModel, getPreviewModelExtras, getPreviewValue, getPreviewVariants } from '../previewModel';
import { getComponentDefinitions } from '@/providers/form/defaults/toolboxComponents';

const makeDefinition = (type: string, previewConfiguration?: IConfigurableFormComponent): IToolboxComponent => ({
  type,
  name: type,
  icon: null,
  isInput: true,
  Factory: () => null,
  // spread conditionally: `previewConfiguration` is optional and does not accept an explicit undefined
  ...(previewConfiguration ? { previewConfiguration } : {}),
});

const autocompletePreviewConfiguration: IAutocompleteComponentProps = {
  type: 'autocomplete',
  id: 'autocomplete',
  propertyName: 'autocompleteAppearance',
  label: 'Autocomplete Label',
  version: 'latest',
  dataSourceType: 'entitiesList',
  mode: 'single',
};

const textFieldPreviewConfiguration: IConfigurableFormComponent = {
  type: 'textField',
  id: 'textField',
  propertyName: 'textFieldAppearance',
  label: 'Text Field Label',
  version: 'latest',
};

describe('getPreviewModelExtras', () => {
  it('returns the sample entity data source for an autocomplete', () => {
    expect(getPreviewModelExtras('autocomplete')).toEqual({
      entityType: { name: 'DummyTable', module: 'Shesha' },
      displayPropName: 'city',
      fields: ['city'],
    });
  });

  it('returns undefined for a component that needs no data source', () => {
    expect(getPreviewModelExtras('textField')).toBeUndefined();
  });

  it('gives an image an embedded picture, so the preview fetches nothing', () => {
    const extras = getPreviewModelExtras('image');
    expect(extras?.['dataSource']).toBe('base64');
    expect(String(extras?.['base64'])).toMatch(/^data:image\/svg\+xml/);
  });

  // A status tag has nothing to show without both a list and a value from it.
  it('gives a reference list status a seeded list and a value from it', () => {
    expect(getPreviewModelExtras('refListStatus')).toEqual({ referenceListId: { module: 'Shesha', name: 'Shesha.Core.Gender' } });
    expect(getPreviewValue('refListStatus')).toBe(1);
    expect(getPreviewValue('textField')).toBeUndefined();
  });

  it('returns undefined for a missing component type', () => {
    expect(getPreviewModelExtras(undefined)).toBeUndefined();
    expect(getPreviewModelExtras('  ')).toBeUndefined();
  });
});

describe('getPreviewComponentModel', () => {
  it('applies the extras on top of the declared preview configuration', () => {
    expect(getPreviewComponentModel(makeDefinition('autocomplete', autocompletePreviewConfiguration))).toEqual({
      ...autocompletePreviewConfiguration,
      entityType: { name: 'DummyTable', module: 'Shesha' },
      displayPropName: 'city',
      fields: ['city'],
      size: 'small',
    });
  });

  it('applies the extras on top of the generic model when no preview configuration is declared', () => {
    const model = getPreviewComponentModel(makeDefinition('autocomplete'));

    expect(model).toMatchObject({
      type: 'autocomplete',
      id: 'autocomplete',
      propertyName: 'autocompleteAppearance',
      entityType: { name: 'DummyTable', module: 'Shesha' },
      displayPropName: 'city',
      fields: ['city'],
    });
  });

  // Charts preview as the designer creates them on drop: their own type and defaults (title, legend,
  // default data source) come from the migrator, run as for a new component.
  it.each([
    ['barChart', 'bar'],
    ['lineChart', 'line'],
    ['pieChart', 'pie'],
    ['polarAreaChart', 'polarArea'],
  ])('builds %s as a newly dropped component', (componentType, chartType) => {
    const definition = getComponentDefinitions().get(componentType);
    if (!definition) throw new Error(`${componentType} is not registered`);
    const model = getPreviewComponentModel(definition) as unknown as Record<string, unknown>;

    expect(model['chartType']).toBe(chartType);
    expect(model['hideLabel']).toBe(true);
    expect(model['showTitle']).toBe(true);
    expect(model['entityType']).toBe('Shesha.Domain.FormConfiguration');
    expect(typeof model['version']).toBe('number');
  });

  it('returns the declared preview configuration, at the small size, for a component with no extras', () => {
    expect(getPreviewComponentModel(makeDefinition('textField', textFieldPreviewConfiguration)))
      .toEqual({ ...textFieldPreviewConfiguration, size: 'small' });
  });
});

describe('getPreviewVariants', () => {
  it('lists the dropdown modes so tag styling is visible, not just plain text', () => {
    const labels = getPreviewVariants('dropdown')?.map((v) => v.label);
    expect(labels).toEqual(['Single', 'Multiple', 'Tag', 'Multiple tags']);
  });

  it('lists the file list display styles, including the custom thumbnail whose dimensions are editable', () => {
    const variants = getPreviewVariants('attachmentsEditor');
    expect(variants?.map((v) => v.model['displayStyle'])).toEqual([
      'text', 'thumbnailSmall', 'thumbnailMedium', 'thumbnailLarge', 'thumbnailCustom', 'text',
    ]);
  });

  it('lists the file upload display styles, including the custom thumbnail whose dimensions are editable', () => {
    const variants = getPreviewVariants('fileUpload');
    expect(variants?.map((v) => v.model['displayStyle'])).toEqual([
      'text', 'thumbnailSmall', 'thumbnailMedium', 'thumbnailLarge', 'thumbnailCustom', 'text',
    ]);
  });

  it('lists every progress shape, each part-filled', () => {
    const variants = getPreviewVariants('progress') ?? [];
    expect(variants.map((v) => v.model['progressType'])).toEqual(['line', 'circle', 'dashboard']);
    variants.forEach((v) => expect(v.model['percent']).toBeGreaterThan(0));
  });

  // The component draws nothing until its form has errors, so every variant must carry some.
  it('gives validation errors one variant per alert layout, each with form errors', () => {
    const variants = getPreviewVariants('validationErrors') ?? [];
    expect(variants.map((v) => v.label)).toEqual(['Field errors', 'Error with details', 'Error message']);
    variants.forEach((v) => expect(v.formErrors).toBeDefined());
  });

  it('returns undefined for a component with only one appearance', () => {
    expect(getPreviewVariants('textField')).toBeUndefined();
    expect(getPreviewVariants(undefined)).toBeUndefined();
  });
});

describe('getPreviewComponentModel - variants', () => {
  const dropdownDef = makeDefinition('dropdown');

  it('applies the variant properties over the base model', () => {
    const tags = getPreviewVariants('dropdown')?.find((v) => v.label === 'Multiple tags');
    const model = getPreviewComponentModel(dropdownDef, tags) as unknown as Record<string, unknown>;

    expect(model['mode']).toBe('multiple');
    expect(model['displayStyle']).toBe('tags');
  });

  // Shared ids would make the variants share form state, so a value picked in one shows in all.
  it('gives each variant a distinct id and propertyName', () => {
    const variants = getPreviewVariants('dropdown') ?? [];
    const models = variants.map((v) => getPreviewComponentModel(dropdownDef, v));

    expect(new Set(models.map((m) => m.id)).size).toBe(variants.length);
    expect(new Set(models.map((m) => m.propertyName)).size).toBe(variants.length);
  });

  it('is unchanged when no variant is passed', () => {
    expect(getPreviewComponentModel(dropdownDef)).toEqual(getPreviewComponentModel(dropdownDef, undefined));
  });
});

describe('preview styles come from the theme', () => {
  it('renders every preview at the small size, as a fallback under the defaults and the theme', () => {
    const model = getPreviewComponentModel(makeDefinition('textField'));
    expect(model.size).toBe('small');
    // Not a device style: that would override the theme's size.
    expect(model.desktop).toBeUndefined();
  });

  it('drops the per-device styles of a preview configuration, which would override the theme', () => {
    const styled = { type: 'textField', id: 'x', propertyName: 'x', version: 'latest', desktop: { font: { color: 'red' } }, tablet: { size: 'large' }, mobile: {} } as IConfigurableFormComponent;
    const model = getPreviewComponentModel(makeDefinition('textField', styled));
    expect(model).not.toHaveProperty('desktop');
    expect(model).not.toHaveProperty('tablet');
    expect(model).not.toHaveProperty('mobile');
  });

  it('keeps the small size and no device styles on each variant', () => {
    const [variant] = getPreviewVariants('dropdown') ?? [];
    const model = getPreviewComponentModel(makeDefinition('dropdown'), variant);
    expect(model.size).toBe('small');
    expect(model.desktop).toBeUndefined();
  });

  it('renders the Data Table on its own, as on the Components tab, with no device styles', () => {
    const definition = getComponentDefinitions().get('datatable');
    if (!definition) throw new Error('datatable is not registered');
    const table = getPreviewComponentModel(definition);
    expect(table.type).toBe('datatable');
    expect(table.size).toBe('small');
    expect(table?.desktop).toBeUndefined();
  });

  // Every component previewed on a style-group tab (see GROUP_PREVIEW_TYPES) sets its preview up itself.
  it.each(['textField', 'textArea', 'numberField', 'button', 'statusTag', 'datatable', 'card', 'collapsiblePanel', 'tabs'])('%s declares a preview configuration', (type) => {
    expect(getComponentDefinitions().get(type)?.previewConfiguration).toBeDefined();
  });

  it.each(['card', 'collapsiblePanel', 'tabs', 'button'])('%s preview configuration holds no styles of its own', (type) => {
    const configuration = getComponentDefinitions().get(type)?.previewConfiguration as unknown as Record<string, unknown>;
    ['desktop', 'tablet', 'mobile', 'font', 'border', 'background', 'shadow', 'dimensions', 'stylingBoxJson', 'headerStyles'].forEach((key) =>
      expect(configuration).not.toHaveProperty(key));
  });
});

describe('getPreviewComponentModel - layout components', () => {
  type Container = { id: string; components?: IConfigurableFormComponent[] };
  type Layout = IConfigurableFormComponent & { header?: Container; content?: Container; tabs?: Container[] };
  const definitionOf = (type: string): IToolboxComponent => {
    const definition = getComponentDefinitions().get(type);
    if (!definition) throw new Error(`no ${type}`);
    return definition;
  };

  it.each(['card', 'collapsiblePanel'])('%s has a header title in its header and sample content in its body', (type) => {
    const model = getPreviewComponentModel(definitionOf(type)) as Layout;
    const headerLayout = model.header?.components?.[0] as IConfigurableFormComponent & { components: IConfigurableFormComponent[] };
    // Not a Text: the title takes the header's font, not the theme's Text defaults.
    expect(headerLayout.components[0]).toMatchObject({ type: 'headerTitle', content: definitionOf(type).name });
    expect(model.content?.components).toEqual([expect.objectContaining({ type: 'text', parentId: model.content?.id })]);
  });

  it.each(['card', 'collapsiblePanel', 'tabs'])('%s sample content is black text', (type) => {
    const model = getPreviewComponentModel(definitionOf(type)) as Layout;
    const samples = type === 'tabs' ? (model.tabs ?? []).flatMap((tab) => tab.components ?? []) : model.content?.components ?? [];
    expect(samples.length).toBeGreaterThan(0);
    samples.forEach((sample) => expect(sample).toMatchObject({ contentType: 'custom', font: { color: '#000' } }));
  });

  it('tabs have sample content in every tab', () => {
    const model = getPreviewComponentModel(definitionOf('tabs')) as Layout;
    model.tabs?.forEach((tab) => {
      expect(tab.components).toEqual([expect.objectContaining({ type: 'text', parentId: tab.id })]);
    });
  });
});
