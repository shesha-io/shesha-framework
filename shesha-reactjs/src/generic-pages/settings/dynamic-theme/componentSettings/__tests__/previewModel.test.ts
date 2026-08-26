import { IToolboxComponent } from '@/interfaces/formDesigner';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { IAutocompleteComponentProps } from '@/designer-components/autocomplete/interfaces';
import { getPreviewComponentModel, getPreviewModelExtras } from '../previewModel';

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

  it('returns the declared preview configuration untouched for a component with no extras', () => {
    expect(getPreviewComponentModel(makeDefinition('textField', textFieldPreviewConfiguration)))
      .toEqual(textFieldPreviewConfiguration);
  });
});
