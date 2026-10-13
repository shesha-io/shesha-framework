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

  it('returns the declared preview configuration untouched for a component with no extras', () => {
    expect(getPreviewComponentModel(makeDefinition('textField', textFieldPreviewConfiguration)))
      .toEqual(textFieldPreviewConfiguration);
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
