vi.mock('@/providers/formDesigner/formValidator', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/providers/formDesigner/formValidator')>();
  class FormValidatorStub {
    validateAllComponentsAsync = (): Promise<void> => Promise.resolve();

    validateFormSettingsAsync = (): Promise<[]> => Promise.resolve([]);
  }
  return { ...actual, FormValidator: FormValidatorStub };
});

import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
