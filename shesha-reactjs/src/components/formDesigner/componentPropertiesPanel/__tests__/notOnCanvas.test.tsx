vi.mock('@/providers/formDesigner/formValidator', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/providers/formDesigner/formValidator')>();
  class FormValidatorStub {
    validateAllComponentsAsync = (): Promise<void> => Promise.resolve();

    validateFormSettingsAsync = (): Promise<[]> => Promise.resolve([]);
  }
  return { ...actual, FormValidator: FormValidatorStub };
});

import { act, render, screen } from '@testing-library/react';
import { FormDesignerContext } from '@/providers/formDesigner/contexts';
import { createTestDesigner } from '@/providers/formDesigner/__tests__/testDesigner';
import { sampleForm } from '@/providers/formDesigner/__tests__/testMarkup';
import { ComponentPropertiesPanel } from '..';

describe('ComponentPropertiesPanel: selected component not on the canvas', () => {
  it('explains why the settings are missing, and stops once the component is drawn', () => {
    const designer = createTestDesigner(sampleForm());
    render(
      <FormDesignerContext.Provider value={designer}>
        <ComponentPropertiesPanel />
      </FormDesignerContext.Provider>,
    );

    act(() => designer.setSelectedComponent('email'));
    expect(screen.getByText(/isn't on the canvas right now, so its settings can't be shown\. It's inside Main tabs\./)).toBeInTheDocument();

    act(() => {
      designer.registerMountedComponent('email');
    });
    expect(screen.queryByText(/isn't on the canvas right now/)).not.toBeInTheDocument();
  });
});
