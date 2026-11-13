vi.mock('@/providers/formDesigner/formValidator', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/providers/formDesigner/formValidator')>();
  class FormValidatorStub {
    validateAllComponentsAsync = (): Promise<void> => Promise.resolve();

    validateFormSettingsAsync = (): Promise<[]> => Promise.resolve([]);
  }
  return { ...actual, FormValidator: FormValidatorStub };
});

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App } from 'antd';
import { FC } from 'react';
import { createPortal } from 'react-dom';
import { designerWrapper } from '@/providers/formDesigner/__tests__/designerWrapper';
import { createTestDesigner } from '@/providers/formDesigner/__tests__/testDesigner';
import { sampleForm } from '@/providers/formDesigner/__tests__/testMarkup';
import { FormDesignerInstance } from '@/providers/formDesigner/instance';
import { useDesignerClipboardEvents } from '../useDesignerClipboardEvents';

const Root: FC = () => (
  <div data-testid="root" tabIndex={-1} {...useDesignerClipboardEvents()}>
    <input aria-label="Property" />
    <div data-sha-drag-wrapper="save"><input aria-label="Canvas field" /></div>
    {createPortal(<button type="button">In a dialog</button>, document.body)}
  </div>
);

const renderRoot = (designer: FormDesignerInstance): void => {
  const Wrapper = designerWrapper(designer);
  render(<App><Wrapper><Root /></Wrapper></App>);
};

/** Stands in for the clipboard events' DataTransfer, which jsdom doesn't have */
const clipboard = (text = ''): { getData: () => string; setData: (type: string, value: string) => void } => {
  let value = text;
  return {
    getData: () => value,
    setData: (_type, newValue) => {
      value = newValue;
    },
  };
};

describe('designer clipboard events', () => {
  it('copies the selected component and pastes the copy after it', () => {
    const designer = createTestDesigner(sampleForm());
    renderRoot(designer);
    act(() => designer.setSelectedComponent('save'));
    const data = clipboard();

    fireEvent.copy(screen.getByTestId('root'), { clipboardData: data });
    expect(data.getData()).toContain('"form-components"');

    fireEvent.paste(screen.getByTestId('root'), { clipboardData: data });
    expect(designer.state.formFlatMarkup.componentRelations['root']).toHaveLength(5);
    expect(designer.selectedComponentId).not.toBe('save');
  });

  it('cuts: copies the component and removes it', () => {
    const designer = createTestDesigner(sampleForm());
    renderRoot(designer);
    act(() => designer.setSelectedComponent('save'));
    const data = clipboard();

    fireEvent.cut(screen.getByTestId('root'), { clipboardData: data });

    expect(data.getData()).toContain('"btnSave"');
    expect(designer.state.formFlatMarkup.componentRelations['root']).not.toContain('save');
  });

  it('leaves typing alone, but treats fields on the canvas as part of the canvas', () => {
    const designer = createTestDesigner(sampleForm());
    renderRoot(designer);
    act(() => designer.setSelectedComponent('save'));

    const typing = clipboard();
    fireEvent.copy(screen.getByLabelText('Property'), { clipboardData: typing });
    expect(typing.getData()).toBe('');

    const canvas = clipboard();
    fireEvent.copy(screen.getByLabelText('Canvas field'), { clipboardData: canvas });
    expect(canvas.getData()).toContain('"form-components"');
  });

  it('leaves dialogs and menus shown over the designer alone', () => {
    const designer = createTestDesigner(sampleForm());
    renderRoot(designer);
    act(() => designer.setSelectedComponent('save'));
    const data = clipboard();
    fireEvent.copy(screen.getByTestId('root'), { clipboardData: data });
    const before = designer.state.formFlatMarkup;

    const dialog = screen.getByText('In a dialog');
    fireEvent.cut(dialog, { clipboardData: clipboard() });
    fireEvent.paste(dialog, { clipboardData: data });

    expect(designer.state.formFlatMarkup).toBe(before);
  });

  it('only copies in a read-only designer', () => {
    const designer = createTestDesigner(sampleForm());
    act(() => designer.setReadOnly(true));
    renderRoot(designer);
    act(() => designer.setSelectedComponent('save'));
    const data = clipboard();

    fireEvent.copy(screen.getByTestId('root'), { clipboardData: data });
    fireEvent.cut(screen.getByTestId('root'), { clipboardData: clipboard() });
    fireEvent.paste(screen.getByTestId('root'), { clipboardData: data });

    expect(data.getData()).toContain('"form-components"');
    expect(designer.state.formFlatMarkup.componentRelations['root']).toEqual(['tabs1', 'panel', 'link1', 'save']);
  });

  it('ignores clipboard text that is not a Shesha copy', () => {
    const designer = createTestDesigner(sampleForm());
    renderRoot(designer);
    const before = designer.state.formFlatMarkup;

    fireEvent.paste(screen.getByTestId('root'), { clipboardData: clipboard('hello') });

    expect(designer.state.formFlatMarkup).toBe(before);
  });

  it('pastes after the selection with Ctrl+Shift+V, even into a container', () => {
    const designer = createTestDesigner(sampleForm());
    renderRoot(designer);
    act(() => designer.setSelectedComponent('save'));
    const data = clipboard();
    fireEvent.copy(screen.getByTestId('root'), { clipboardData: data });
    act(() => designer.setSelectedComponent('panel'));

    fireEvent.keyDown(screen.getByTestId('root'), { key: 'V', code: 'KeyV', ctrlKey: true, shiftKey: true });
    fireEvent.paste(screen.getByTestId('root'), { clipboardData: data });

    expect(designer.state.formFlatMarkup.componentRelations['panel']).toEqual(['city']);
    expect(designer.state.formFlatMarkup.componentRelations['root']).toHaveLength(5);
  });
});

describe('settings keys', () => {
  let text = '';
  beforeEach(() => {
    text = '';
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: (value: string) => {
          text = value;
          return Promise.resolve();
        },
        readText: () => Promise.resolve(text),
      },
    });
  });

  it('leaves the settings keys alone in dialogs shown over the designer', () => {
    const designer = createTestDesigner(sampleForm());
    renderRoot(designer);
    act(() => designer.setSelectedComponent('phone'));

    fireEvent.keyDown(screen.getByText('In a dialog'), { key: 'c', code: 'KeyC', ctrlKey: true, altKey: true });

    expect(text).toBe('');
  });

  it('copies one component\'s settings with Ctrl+Alt+C and pastes them onto another with Ctrl+Alt+V', async () => {
    const designer = createTestDesigner(sampleForm());
    renderRoot(designer);
    act(() => designer.setSelectedComponent('phone'));

    fireEvent.keyDown(screen.getByTestId('root'), { key: 'c', code: 'KeyC', ctrlKey: true, altKey: true });
    await waitFor(() => expect(text).toContain('"settings"'));

    act(() => designer.setSelectedComponent('email'));
    fireEvent.keyDown(screen.getByTestId('root'), { key: 'v', code: 'KeyV', ctrlKey: true, altKey: true });

    await waitFor(() => expect(designer.state.formFlatMarkup.allComponents['email']).toMatchObject({ id: 'email', label: 'Phone', propertyName: 'email' }));
  });
});
