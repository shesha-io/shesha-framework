vi.mock('@/providers/formDesigner/formValidator', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/providers/formDesigner/formValidator')>();
  class FormValidatorStub {
    validateAllComponentsAsync = (): Promise<void> => Promise.resolve();

    validateFormSettingsAsync = (): Promise<[]> => Promise.resolve([]);
  }
  return { ...actual, FormValidator: FormValidatorStub };
});

import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { App } from 'antd';
import { designerWrapper } from '@/providers/formDesigner/__tests__/designerWrapper';
import { createTestDesigner } from '@/providers/formDesigner/__tests__/testDesigner';
import { sampleForm } from '@/providers/formDesigner/__tests__/testMarkup';
import { FormDesignerInstance } from '@/providers/formDesigner/instance';
import { IShaRouter, ShaRouterContext } from '@/providers/shaRouting/contexts';
import { highlightRowFromCanvas } from '../canvasBridge';
import { LayersPanel } from '..';

class ResizeObserverStub {
  observe = (): void => undefined;

  unobserve = (): void => undefined;

  disconnect = (): void => undefined;
}

beforeAll(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  cleanup(); // unmount before clearing the page, or portals (messages, menus) are already gone
  highlightRowFromCanvas(null);
  document.body.innerHTML = '';
  window.localStorage.clear();
});

const renderPanel = (designer: FormDesignerInstance): void => {
  const Wrapper = designerWrapper(designer);
  render(<App><Wrapper><LayersPanel /></Wrapper></App>);
};

const rowLabels = (): string[] =>
  screen.queryAllByRole('treeitem').map((item) => item.querySelector('.sha-layers-row-label')?.textContent ?? '');

const rowOf = (label: string): HTMLElement => {
  const row = screen.getByText(label).closest<HTMLElement>('[role="treeitem"]');
  if (row === null)
    throw new Error(`No row for ${label}`);
  return row;
};

describe('LayersPanel: tree, selection and hover', () => {
  it('shows the form as a tree with the top level open', () => {
    renderPanel(createTestDesigner(sampleForm()));
    expect(rowLabels()).toEqual(['Main tabs', 'Details', 'Address', 'Panel', 'City', 'Link', 'Link text', 'Save']);
  });

  it('expands a row from its chevron', () => {
    renderPanel(createTestDesigner(sampleForm()));
    const chevron = rowOf('Details').querySelector('.sha-layers-row-chevron');
    if (chevron === null)
      throw new Error('No chevron');

    fireEvent.click(chevron);

    expect(rowLabels()).toContain('Email');
  });

  it('selects the owner and opens the tab when a pane row is clicked', () => {
    const designer = createTestDesigner(sampleForm());
    renderPanel(designer);

    fireEvent.click(screen.getByText('Details'));

    expect(designer.selectedComponentId).toBe('tabs1');
    expect(designer.revealRequest.containerIds).toEqual(['pane-a']);
  });

  it('selects a component when its row is clicked', () => {
    const designer = createTestDesigner(sampleForm());
    renderPanel(designer);

    fireEvent.click(screen.getByText('City'));

    expect(designer.selectedComponentId).toBe('city');
    expect(rowOf('City')).toHaveAttribute('aria-selected', 'true');
  });

  it('shows pane titles, an Empty hint and the property name', () => {
    renderPanel(createTestDesigner(sampleForm()));
    expect(rowOf('Address')).toHaveTextContent('Empty');
    expect(within(rowOf('City')).getByText('address.city')).toBeInTheDocument();
  });

  it('dims hidden components and shows the hidden badge', () => {
    renderPanel(createTestDesigner([{ id: 'h1', type: 'textField', label: 'Secret', hidden: true }]));
    expect(rowOf('Secret')).toHaveClass('is-hidden');
    expect(within(rowOf('Secret')).getByLabelText('Hidden')).toBeInTheDocument();
  });

  it('expands everything, and collapses everything except the path to the selection', () => {
    const designer = createTestDesigner(sampleForm());
    renderPanel(designer);

    fireEvent.click(screen.getByLabelText('Expand all'));
    expect(rowLabels()).toContain('Email');

    act(() => designer.setSelectedComponent('email'));
    fireEvent.click(screen.getByLabelText('Collapse all'));

    expect(rowLabels()).toEqual(['Main tabs', 'Details', 'Email', 'Phone', 'Address', 'Panel', 'Link', 'Save']);
  });

  it('opens the path to a component selected on the canvas', () => {
    const designer = createTestDesigner(sampleForm());
    renderPanel(designer);

    act(() => designer.setSelectedComponent('email'));

    expect(rowOf('Email')).toHaveAttribute('aria-selected', 'true');
  });

  it('outlines the component on the canvas while its row is hovered', () => {
    renderPanel(createTestDesigner(sampleForm()));
    document.body.insertAdjacentHTML('beforeend', '<div data-sha-drag-wrapper="city"></div>');
    const canvasCity = document.querySelector('[data-sha-drag-wrapper="city"]');

    fireEvent.mouseEnter(rowOf('City'));
    expect(canvasCity).toHaveClass('sha-layers-canvas-hover');

    fireEvent.mouseLeave(rowOf('City'));
    expect(canvasCity).not.toHaveClass('sha-layers-canvas-hover');
  });

  it('highlights the row of a component hovered on the canvas', () => {
    renderPanel(createTestDesigner(sampleForm()));

    highlightRowFromCanvas('city');

    expect(rowOf('City')).toHaveClass('is-canvas-hover');
  });
});

describe('LayersPanel: search', () => {
  it('filters to matches and their parents, and Esc restores the tree', async () => {
    renderPanel(createTestDesigner(sampleForm()));
    const search = screen.getByPlaceholderText('Search layers');

    fireEvent.change(search, { target: { value: 'phone' } });
    await waitFor(() => expect(rowLabels()).toEqual(['Main tabs', 'Details', 'Phone']));
    expect(screen.getByText('1 match')).toBeInTheDocument();

    fireEvent.keyDown(search, { key: 'Escape' });
    await waitFor(() => expect(rowLabels()).toEqual(['Main tabs', 'Details', 'Address', 'Panel', 'City', 'Link', 'Link text', 'Save']));
  });

  it('highlights the matched text', async () => {
    renderPanel(createTestDesigner(sampleForm()));
    fireEvent.change(screen.getByPlaceholderText('Search layers'), { target: { value: 'pho' } });
    await waitFor(() => expect(document.querySelector('mark')?.textContent).toBe('Pho'));
  });

  it('updates the results when a label is edited during a search', async () => {
    const designer = createTestDesigner(sampleForm());
    renderPanel(designer);
    fireEvent.change(screen.getByPlaceholderText('Search layers'), { target: { value: 'town' } });
    await waitFor(() => expect(rowLabels()).toEqual([]));

    act(() => designer.updateComponent({ componentId: 'city', updater: (model) => ({ ...model, label: 'Town' }) }));

    await waitFor(() => expect(rowLabels()).toEqual(['Panel', 'Town']));
  });
});

describe('LayersPanel: keyboard', () => {
  it('moves the cursor with the arrow keys and selects with Enter', () => {
    const designer = createTestDesigner(sampleForm());
    renderPanel(designer);
    const tree = screen.getByRole('tree');

    fireEvent.focus(tree);
    fireEvent.keyDown(tree, { key: 'ArrowDown' });
    fireEvent.keyDown(tree, { key: 'ArrowDown' });
    expect(tree).toHaveAttribute('aria-activedescendant', 'layer-row-pane-b');

    fireEvent.keyDown(tree, { key: 'Enter' });
    expect(designer.selectedComponentId).toBe('tabs1');
    expect(designer.revealRequest.containerIds).toEqual(['pane-b']);
  });

  it('opens and closes rows with the right and left arrow keys', () => {
    renderPanel(createTestDesigner(sampleForm()));
    const tree = screen.getByRole('tree');
    fireEvent.focus(tree);
    fireEvent.keyDown(tree, { key: 'ArrowDown' });

    fireEvent.keyDown(tree, { key: 'ArrowRight' });
    expect(rowLabels()).toContain('Email');

    fireEvent.keyDown(tree, { key: 'ArrowLeft' });
    expect(rowLabels()).not.toContain('Email');
  });

  it('jumps to a row by typing the start of its label', () => {
    renderPanel(createTestDesigner(sampleForm()));
    const tree = screen.getByRole('tree');
    fireEvent.focus(tree);

    fireEvent.keyDown(tree, { key: 'c' });

    expect(tree).toHaveAttribute('aria-activedescendant', 'layer-row-city');
  });
});

describe('LayersPanel: errors', () => {
  it('keeps a failure inside the Layers tab', () => {
    const designer = createTestDesigner(sampleForm());
    vi.spyOn(designer, 'getComponentDefinition').mockImplementation(() => {
      throw new Error('boom');
    });
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const Wrapper = designerWrapper(designer);

    render(<ShaRouterContext.Provider value={{} as IShaRouter}><App><Wrapper><LayersPanel /></Wrapper></App></ShaRouterContext.Provider>);

    // upstream's error boundary: an icon whose popover has the details, and no tree
    expect(screen.getByRole('img', { name: 'error indicator' })).toBeInTheDocument();
    expect(screen.queryByRole('tree')).not.toBeInTheDocument();
  });
});

describe('LayersPanel: row menu and keyboard moves', () => {
  it('moves a component down from the right-click menu and announces it', async () => {
    const designer = createTestDesigner(sampleForm());
    renderPanel(designer);
    fireEvent.click(screen.getByLabelText('Expand all'));

    fireEvent.contextMenu(screen.getByText('Email'));
    fireEvent.click(await screen.findByText('Move Down'));

    expect(designer.state.formFlatMarkup.componentRelations['pane-a']).toEqual(['phone', 'email']);
    expect(designer.selectedComponentId).toBe('email');
    await waitFor(() => expect(document.body).toHaveTextContent('Moved Email into Details, position 2 of 2.'));
  });

  it('disables Move up for the first child and says why', async () => {
    renderPanel(createTestDesigner(sampleForm()));
    fireEvent.click(screen.getByLabelText('Expand all'));

    fireEvent.contextMenu(screen.getByText('Email'));

    const moveUp = await screen.findByText('Move Up');
    expect(moveUp.closest('[role="menuitem"]')).toHaveAttribute('aria-disabled', 'true');
    expect(moveUp.closest('[title]')).toHaveAttribute('title', 'Already at the top');
  });

  it('opens the menu from the row button and duplicates', async () => {
    const designer = createTestDesigner(sampleForm());
    renderPanel(designer);

    fireEvent.click(within(rowOf('Save')).getByLabelText('Row actions'));
    fireEvent.click(await screen.findByText('Duplicate'));

    expect(designer.state.formFlatMarkup.componentRelations['root']).toHaveLength(5);
  });

  it('moves the selected component with Alt+Arrow keys', () => {
    const designer = createTestDesigner(sampleForm());
    renderPanel(designer);
    act(() => designer.setSelectedComponent('email'));
    const tree = screen.getByRole('tree');

    fireEvent.keyDown(tree, { key: 'ArrowDown', altKey: true });

    expect(designer.state.formFlatMarkup.componentRelations['pane-a']).toEqual(['phone', 'email']);
  });
});

describe('LayersPanel: keys inside a row', () => {
  it('leaves keys pressed on the row button to the button', () => {
    renderPanel(createTestDesigner(sampleForm()));
    const tree = screen.getByRole('tree');
    fireEvent.focus(tree);
    const before = tree.getAttribute('aria-activedescendant');

    fireEvent.keyDown(within(rowOf('Save')).getByLabelText('Row actions'), { key: 'ArrowDown' });

    expect(tree.getAttribute('aria-activedescendant')).toBe(before);
  });

  it('moves focus into the row menu when it is opened from the keyboard', async () => {
    const designer = createTestDesigner(sampleForm());
    renderPanel(designer);
    act(() => designer.setSelectedComponent('save'));
    const tree = screen.getByRole('tree');
    fireEvent.focus(tree);

    fireEvent.keyDown(tree, { key: 'F10', shiftKey: true });

    const menu = await screen.findByRole('menu');
    await waitFor(() => expect(menu.contains(document.activeElement)).toBe(true));
  });
});

describe('LayersPanel: pointer and keyboard cursor', () => {
  it('puts the keyboard cursor on the row that was pressed', () => {
    renderPanel(createTestDesigner(sampleForm()));
    const tree = screen.getByRole('tree');

    fireEvent.mouseDown(rowOf('Panel'));
    fireEvent.focus(tree);

    expect(tree).toHaveAttribute('aria-activedescendant', 'layer-row-panel');
  });
});

describe('LayersPanel: following the selection', () => {
  const scrollTo = vi.fn();
  beforeEach(() => Object.defineProperty(HTMLElement.prototype, 'scrollTo', { configurable: true, value: scrollTo }));
  afterEach(() => {
    scrollTo.mockClear();
    Reflect.deleteProperty(HTMLElement.prototype, 'scrollTo');
  });

  it('scrolls to a selected component again after it moves', () => {
    const designer = createTestDesigner(sampleForm());
    renderPanel(designer);
    act(() => designer.setSelectedComponent('email'));
    const scrollsBefore = scrollTo.mock.calls.length;

    fireEvent.keyDown(screen.getByRole('tree'), { key: 'ArrowDown', altKey: true });

    expect(scrollTo.mock.calls.length).toBeGreaterThan(scrollsBefore);
  });

  it('does not scroll when a row is clicked, even when that selects another row', () => {
    renderPanel(createTestDesigner(sampleForm()));
    scrollTo.mockClear();

    fireEvent.click(screen.getByText('Details'));

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('scrolls back to the selection when the search is cleared', async () => {
    renderPanel(createTestDesigner(sampleForm()));
    const search = screen.getByPlaceholderText('Search layers');
    fireEvent.change(search, { target: { value: 'city' } });
    await waitFor(() => expect(rowLabels()).toContain('City'));
    fireEvent.click(screen.getByText('City'));
    scrollTo.mockClear();

    fireEvent.keyDown(search, { key: 'Escape' });

    await waitFor(() => expect(scrollTo).toHaveBeenCalled());
  });

  /** jsdom doesn't tell keyboard focus from a mouse press, so :focus-visible is faked for this one focus */
  const focusFromKeyboard = (element: HTMLElement): void => {
    const matches = element.matches.bind(element);
    const spy = vi.spyOn(element, 'matches').mockImplementation((selector) => selector === ':focus-visible' || matches(selector));
    fireEvent.focus(element);
    spy.mockRestore();
  };

  it('scrolls to the selected row when the keyboard brings focus to the tree', () => {
    const designer = createTestDesigner(sampleForm());
    renderPanel(designer);
    act(() => designer.setSelectedComponent('save'));
    scrollTo.mockClear();

    focusFromKeyboard(screen.getByRole('tree'));

    expect(screen.getByRole('tree')).toHaveAttribute('aria-activedescendant', 'layer-row-save');
    expect(scrollTo).toHaveBeenCalled();
  });

  it('keeps the keyboard cursor where it was when focus comes back, and scrolls to it', () => {
    const designer = createTestDesigner(sampleForm());
    renderPanel(designer);
    act(() => designer.setSelectedComponent('save'));
    const tree = screen.getByRole('tree');
    focusFromKeyboard(tree);
    fireEvent.keyDown(tree, { key: 'Home' });
    fireEvent.blur(tree);
    scrollTo.mockClear();

    focusFromKeyboard(tree);

    expect(tree).toHaveAttribute('aria-activedescendant', 'layer-row-tabs1');
    expect(scrollTo).toHaveBeenCalled();
  });

  it('leaves the scroll alone when a mouse press focuses the tree, as on its scrollbar', () => {
    const designer = createTestDesigner(sampleForm());
    renderPanel(designer);
    act(() => designer.setSelectedComponent('save'));
    const tree = screen.getByRole('tree');
    scrollTo.mockClear();

    fireEvent.mouseDown(tree);
    fireEvent.focus(tree);

    expect(tree).toHaveAttribute('aria-activedescendant', 'layer-row-save');
    expect(scrollTo).not.toHaveBeenCalled();
  });
});

describe('LayersPanel: copy and paste', () => {
  let clipboardText = '';
  beforeEach(() => {
    clipboardText = '';
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: (value: string) => {
          clipboardText = value;
          return Promise.resolve();
        },
        readText: () => Promise.resolve(clipboardText),
      },
    });
  });

  it('copies a component from its row menu and pastes it into a tab from the tab row', async () => {
    const designer = createTestDesigner(sampleForm());
    renderPanel(designer);

    fireEvent.contextMenu(screen.getByText('City'));
    fireEvent.click(await screen.findByText('Copy'));
    await waitFor(() => expect(clipboardText).toContain('"form-components"'));

    fireEvent.contextMenu(screen.getByText('Address'));
    fireEvent.click(await screen.findByText('Paste Inside'));

    await waitFor(() => expect(designer.state.formFlatMarkup.componentRelations['pane-b']).toHaveLength(1));
  });

  it('pastes into the tab row under the keyboard cursor with Ctrl+V', () => {
    const designer = createTestDesigner(sampleForm());
    renderPanel(designer);
    const tree = screen.getByRole('tree');
    fireEvent.focus(tree);
    fireEvent.keyDown(tree, { key: 'ArrowDown' });
    fireEvent.keyDown(tree, { key: 'ArrowDown' });
    expect(tree).toHaveAttribute('aria-activedescendant', 'layer-row-pane-b');
    const text = JSON.stringify({ shesha: 'form-components', version: 1, kind: 'components', components: [{ id: 'n', type: 'textField', label: 'New' }] });

    fireEvent.paste(tree, { clipboardData: { getData: () => text } });

    expect(designer.state.formFlatMarkup.componentRelations['pane-b']).toHaveLength(1);
  });

  it('copies and cuts the row under the keyboard cursor, not the selected component', () => {
    const designer = createTestDesigner(sampleForm());
    renderPanel(designer);
    act(() => designer.setSelectedComponent('save'));
    const tree = screen.getByRole('tree');
    fireEvent.focus(tree);
    fireEvent.keyDown(tree, { key: 'Home' });
    expect(tree).toHaveAttribute('aria-activedescendant', 'layer-row-tabs1');
    let copied = '';
    const clipboardData = { getData: () => copied, setData: (_type: string, value: string) => (copied = value) };

    fireEvent.copy(tree, { clipboardData });
    expect(copied).toContain('"mainTabs"');

    fireEvent.cut(tree, { clipboardData });
    expect(designer.state.formFlatMarkup.componentRelations['root']).toEqual(['panel', 'link1', 'save']);
  });
});
