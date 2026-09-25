import { IToolboxComponent } from '@/interfaces/formDesigner';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { IAutocompleteComponentProps } from '@/designer-components/autocomplete/interfaces';
import { getPreviewComponentModel, getPreviewModelExtras, getPreviewVariants } from '../previewModel';

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

  // Charts show "Chart control properties not set correctly!" until all four are set.
  it.each(['barChart', 'lineChart', 'pieChart', 'polarAreaChart'])(
    'gives %s the entity and axis/value properties it needs to render',
    (chartType) => {
      expect(getPreviewModelExtras(chartType)).toEqual({
        dataMode: 'entityType',
        entityType: { name: 'DummyTable', module: 'Shesha' },
        simpleOrPivot: 'simple',
        axisProperty: 'country',
        valueProperty: 'population',
        aggregationMethod: 'sum',
      });
    },
  );

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

  it('gives a chart every property its control checks for before rendering', () => {
    // Mirrors the guard in chartControl.tsx - any missing one renders the warning instead of a chart.
    expect(getPreviewComponentModel(makeDefinition('barChart'))).toMatchObject({
      entityType: { name: 'DummyTable', module: 'Shesha' },
      axisProperty: 'country',
      valueProperty: 'population',
    });
  });

  it('returns the declared preview configuration untouched for a component with no extras', () => {
    expect(getPreviewComponentModel(makeDefinition('textField', textFieldPreviewConfiguration)))
      .toEqual(textFieldPreviewConfiguration);
  });
});

describe('getPreviewVariants', () => {
  it('lists the dropdown modes so tag styling is visible, not just plain text', () => {
    const labels = getPreviewVariants('dropdown')?.map((v) => v.label);
    expect(labels).toEqual(['Single', 'Multiple', 'Tags', 'Free-text tags']);
  });

  it('lists the file list display styles', () => {
    const variants = getPreviewVariants('attachmentsEditor');
    expect(variants?.map((v) => v.model['displayStyle'])).toEqual([
      'text', 'thumbnailSmall', 'thumbnailMedium', 'thumbnailLarge', 'text',
    ]);
  });

  it('returns undefined for a component with only one appearance', () => {
    expect(getPreviewVariants('textField')).toBeUndefined();
    expect(getPreviewVariants(undefined)).toBeUndefined();
  });
});

describe('getPreviewComponentModel - variants', () => {
  const dropdownDef = makeDefinition('dropdown');

  it('applies the variant properties over the base model', () => {
    const tags = getPreviewVariants('dropdown')?.find((v) => v.label === 'Tags');
    const model = getPreviewComponentModel(dropdownDef, tags) as Record<string, unknown>;

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
