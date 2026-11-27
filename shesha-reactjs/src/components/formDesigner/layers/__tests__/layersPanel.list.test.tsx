vi.mock('@/providers/formDesigner/formValidator', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/providers/formDesigner/formValidator')>();
  class FormValidatorStub {
    validateAllComponentsAsync = (): Promise<void> => Promise.resolve();

    validateFormSettingsAsync = (): Promise<[]> => Promise.resolve([]);
  }
  return { ...actual, FormValidator: FormValidatorStub };
});

vi.mock('@atlaskit/pragmatic-drag-and-drop/element/adapter', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@atlaskit/pragmatic-drag-and-drop/element/adapter')>();
  return { ...actual, dropTargetForElements: vi.fn(actual.dropTargetForElements) };
});

import { render, screen, waitFor } from '@testing-library/react';
import { App } from 'antd';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { designerWrapper } from '@/providers/formDesigner/__tests__/designerWrapper';
import { createTestDesigner } from '@/providers/formDesigner/__tests__/testDesigner';
import { sampleForm } from '@/providers/formDesigner/__tests__/testMarkup';
import { FormDesignerInstance } from '@/providers/formDesigner/instance';
import { LayersPanel } from '..';

class ResizeObserverStub {
  observe = (): void => undefined;

  unobserve = (): void => undefined;

  disconnect = (): void => undefined;
}

const scrollTo = vi.fn();

beforeAll(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
  Element.prototype.scrollIntoView = vi.fn();
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', { configurable: true, value: scrollTo });
});

afterEach(() => {
  scrollTo.mockClear();
  window.localStorage.clear();
});

const renderPanel = (designer: FormDesignerInstance): void => {
  const Wrapper = designerWrapper(designer);
  render(<App><Wrapper><LayersPanel /></Wrapper></App>);
};

// react-window keeps its element in state, so the list's element only appears after the first render
describe('LayersPanel: the virtual list once it has mounted', () => {
  it('is a drop target, so drops under the last row go to the end of the form', async () => {
    renderPanel(createTestDesigner(sampleForm()));
    const tree = screen.getByRole('tree');

    await waitFor(() => expect(vi.mocked(dropTargetForElements).mock.calls.some(([args]) => args.element === tree)).toBe(true));
  });

  it('scrolls to a component that was already selected when the panel opened', async () => {
    const designer = createTestDesigner(sampleForm());
    designer.setSelectedComponent('save');
    renderPanel(designer);
    const tree = screen.getByRole('tree');

    await waitFor(() => expect(scrollTo.mock.contexts).toContain(tree));
  });
});
