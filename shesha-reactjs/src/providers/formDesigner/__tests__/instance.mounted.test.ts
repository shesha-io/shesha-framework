vi.mock('@/providers/formDesigner/formValidator', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/providers/formDesigner/formValidator')>();
  class FormValidatorStub {
    validateAllComponentsAsync = (): Promise<void> => Promise.resolve();

    validateFormSettingsAsync = (): Promise<[]> => Promise.resolve([]);
  }
  return { ...actual, FormValidator: FormValidatorStub };
});

import { createTestDesigner } from './testDesigner';
import { sampleForm } from './testMarkup';

describe('FormDesignerInstance: mounted components', () => {
  it('knows which components are drawn', () => {
    const designer = createTestDesigner(sampleForm());
    const unregister = designer.registerMountedComponent('email');

    expect(designer.isComponentMounted('email')).toBe(true);
    unregister();
    expect(designer.isComponentMounted('email')).toBe(false);
  });

  it('notifies "mounted" only for the selected component', () => {
    const designer = createTestDesigner(sampleForm());
    const onMounted = vi.fn();
    designer.subscribe('mounted', onMounted);
    designer.setSelectedComponent('email');

    designer.registerMountedComponent('phone');
    expect(onMounted).not.toHaveBeenCalled();

    designer.registerMountedComponent('email');
    expect(onMounted).toHaveBeenCalledTimes(1);
  });

  it('counts double registration (React StrictMode mounts twice)', () => {
    const designer = createTestDesigner(sampleForm());
    const first = designer.registerMountedComponent('email');
    const second = designer.registerMountedComponent('email');

    first();
    expect(designer.isComponentMounted('email')).toBe(true);
    second();
    expect(designer.isComponentMounted('email')).toBe(false);
  });
});
