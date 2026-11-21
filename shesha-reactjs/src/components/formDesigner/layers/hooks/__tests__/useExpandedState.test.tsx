vi.mock('@/providers/formDesigner/formValidator', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/providers/formDesigner/formValidator')>();
  class FormValidatorStub {
    validateAllComponentsAsync = (): Promise<void> => Promise.resolve();

    validateFormSettingsAsync = (): Promise<[]> => Promise.resolve([]);
  }
  return { ...actual, FormValidator: FormValidatorStub };
});

import { act, renderHook } from '@testing-library/react';
import { designerWrapper } from '@/providers/formDesigner/__tests__/designerWrapper';
import { createTestDesigner } from '@/providers/formDesigner/__tests__/testDesigner';
import { sampleForm } from '@/providers/formDesigner/__tests__/testMarkup';
import { buildLayersIndex } from '../../model/buildLayersIndex';
import { useExpandedState } from '../useExpandedState';
import { useLayersData } from '../useLayersData';

describe('useExpandedState()', () => {
  it('opens the path to a component selected on the canvas', () => {
    const designer = createTestDesigner(sampleForm());
    const index = buildLayersIndex(designer.state.formFlatMarkup, designer.getComponentDefinition);
    const { result } = renderHook(() => useExpandedState(index, undefined), { wrapper: designerWrapper(designer) });
    expect(result.current.expanded.has('pane-a')).toBe(false);

    act(() => designer.setSelectedComponent('email'));

    expect(result.current.expanded.has('pane-a')).toBe(true);
  });

  it('opens the path to the selection on open, even with remembered rows, and drops ids that are gone', () => {
    window.localStorage.setItem('layers-test-key', JSON.stringify(['panel', 'ghost']));
    const designer = createTestDesigner(sampleForm());
    designer.setSelectedComponent('email');

    const { result } = renderHook(() => useExpandedState(useLayersData().index, 'layers-test-key'), { wrapper: designerWrapper(designer) });

    expect([...result.current.expanded].sort()).toEqual(['pane-a', 'panel', 'tabs1']);
    window.localStorage.removeItem('layers-test-key');
  });

  it('opens the new parent when the selected component is moved there', () => {
    const designer = createTestDesigner(sampleForm());
    const { result } = renderHook(() => useExpandedState(useLayersData().index, undefined), { wrapper: designerWrapper(designer) });
    act(() => designer.setSelectedComponent('email'));
    expect(result.current.expanded.has('pane-b')).toBe(false);

    act(() => {
      designer.moveComponent({ componentId: 'email', containerId: 'pane-b', index: 0 });
    });

    expect(result.current.expanded.has('pane-b')).toBe(true);
  });

  it('leaves collapsed rows alone when an unrelated part of the form changes', () => {
    const designer = createTestDesigner(sampleForm());
    const { result } = renderHook(() => useExpandedState(useLayersData().index, undefined), { wrapper: designerWrapper(designer) });
    act(() => designer.setSelectedComponent('email'));
    act(() => result.current.setRowExpanded('pane-a', false));

    act(() => {
      designer.moveComponent({ componentId: 'city', containerId: 'root', index: 0 });
    });

    expect(result.current.expanded.has('pane-a')).toBe(false);
  });

  it('collapses everything except the path to the selection', () => {
    const designer = createTestDesigner(sampleForm());
    const index = buildLayersIndex(designer.state.formFlatMarkup, designer.getComponentDefinition);
    const { result } = renderHook(() => useExpandedState(index, undefined), { wrapper: designerWrapper(designer) });
    act(() => result.current.expandAll());
    act(() => designer.setSelectedComponent('city'));

    act(() => result.current.collapseAll());

    expect([...result.current.expanded]).toEqual(['panel']);
  });
});
