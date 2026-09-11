import CustomLayoutComponent from '../customLayoutComponent';
import { ICustomLayoutComponentProps } from '../interfaces';

const buildModel = (overrides: Partial<ICustomLayoutComponentProps> = {}): ICustomLayoutComponentProps => ({
  id: '1',
  type: 'customLayout',
  components: [],
  ...overrides,
} as ICustomLayoutComponentProps);

const initModel = (model: ICustomLayoutComponentProps): ICustomLayoutComponentProps => {
  const init = CustomLayoutComponent.initModel;
  if (!init) throw new Error('CustomLayoutComponent.initModel is not defined');
  return init(model);
};

describe('CustomLayoutComponent', () => {
  test('is registered with the expected type and capabilities', () => {
    expect(CustomLayoutComponent.type).toBe('customLayout');
    // Refs #4804 AC8 - a container, never an input with a value of its own
    expect(CustomLayoutComponent.isInput).toBe(false);
  });

  test('initModel gives a visible default heading', () => {
    const model = initModel(buildModel());

    expect(model.label).toBe('Custom Layout');
    expect(model.hideLabel).toBe(false);
    expect(model.labelAlign).toBe('left');
  });

  // Without an explicit colour the heading inherits from the surrounding designer chrome
  test('initModel gives the heading its own typography', () => {
    const model = initModel(buildModel());

    expect(model.headingFont).toEqual({ color: '#000', size: 14, weight: '500' });
  });

  // initModel only runs when the component is dropped, so the defaults always win
  test('initModel applies defaults unconditionally', () => {
    const model = initModel(buildModel({ label: 'Contact details', hideLabel: true }));

    expect(model.label).toBe('Custom Layout');
    expect(model.hideLabel).toBe(false);
  });

  test('initModel keeps unrelated settings', () => {
    const model = initModel(buildModel({ componentName: 'customLayout1', display: 'flex' }));

    expect(model.componentName).toBe('customLayout1');
    expect(model.display).toBe('flex');
  });
});
