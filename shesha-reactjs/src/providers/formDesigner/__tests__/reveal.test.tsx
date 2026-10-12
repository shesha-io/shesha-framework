vi.mock('@/providers/formDesigner/formValidator', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/providers/formDesigner/formValidator')>();
  class FormValidatorStub {
    validateAllComponentsAsync = (): Promise<void> => Promise.resolve();

    validateFormSettingsAsync = (): Promise<[]> => Promise.resolve([]);
  }
  return { ...actual, FormValidator: FormValidatorStub };
});

import { act, render, renderHook, screen } from '@testing-library/react';
import { FC, PropsWithChildren, StrictMode, useEffect, useState } from 'react';
import { useFormDesignerReveal } from '..';
import { FormDesignerContext } from '../contexts';
import { FormDesignerInstance } from '../instance';
import { createTestDesigner } from './testDesigner';
import { sampleForm } from './testMarkup';

const wrapperFor = (designer: FormDesignerInstance): FC<PropsWithChildren> => {
  const Wrapper: FC<PropsWithChildren> = ({ children }) => (
    <FormDesignerContext.Provider value={designer}>{children}</FormDesignerContext.Provider>
  );
  return Wrapper;
};

/** The hook opens panes a tick after it hears of a reveal */
const afterReveal = (): Promise<void> => act(() => new Promise<void>((resolve) => setTimeout(resolve, 10)));

describe('designer.reveal() and useFormDesignerReveal()', () => {
  it('stores the panes to open and notifies "reveal"', () => {
    const designer = createTestDesigner(sampleForm());
    const onReveal = vi.fn();
    designer.subscribe('reveal', onReveal);

    designer.reveal('email');

    expect(designer.revealRequest.containerIds).toEqual(['pane-a']);
    expect(onReveal).toHaveBeenCalledTimes(1);
  });

  it('opens the pane when a reveal names it', async () => {
    const designer = createTestDesigner(sampleForm());
    const open = vi.fn();
    renderHook(() => useFormDesignerReveal(['pane-a', 'pane-b'], open), { wrapper: wrapperFor(designer) });

    act(() => designer.reveal('email'));
    await afterReveal();

    expect(open).toHaveBeenCalledWith('pane-a');
  });

  it('applies a request made before it mounted (inner panes mount after outer ones open)', async () => {
    const designer = createTestDesigner(sampleForm());
    designer.reveal('email');
    const open = vi.fn();

    renderHook(() => useFormDesignerReveal(['pane-a', 'pane-b'], open), { wrapper: wrapperFor(designer) });
    await afterReveal();

    expect(open).toHaveBeenCalledWith('pane-a');
  });

  it('opens each pane once per request, even if the component mounts again', async () => {
    const designer = createTestDesigner(sampleForm());
    designer.reveal('email');
    const open = vi.fn();
    const first = renderHook(() => useFormDesignerReveal(['pane-a'], open), { wrapper: wrapperFor(designer) });
    await afterReveal();
    first.unmount();

    renderHook(() => useFormDesignerReveal(['pane-a'], open), { wrapper: wrapperFor(designer) });
    await afterReveal();

    expect(open).toHaveBeenCalledTimes(1);
  });

  it('wins over the pane a component opens by default when it mounts, also in StrictMode', async () => {
    const designer = createTestDesigner(sampleForm());
    designer.reveal('email');
    // like Tabs, which selects its default tab in an effect
    const Panes: FC = () => {
      const [active, setActive] = useState('pane-b');
      useEffect(() => setActive('pane-b'), []);
      useFormDesignerReveal(['pane-a', 'pane-b'], setActive);
      return <span>open: {active}</span>;
    };

    // StrictMode at the root, as in the app: it mounts, unmounts and mounts again, running effects twice
    render(<StrictMode><FormDesignerContext.Provider value={designer}><Panes /></FormDesignerContext.Provider></StrictMode>);
    await afterReveal();

    expect(screen.getByText(/^open:/)).toHaveTextContent('open: pane-a');
  });

  it('does nothing outside the designer', () => {
    const open = vi.fn();
    renderHook(() => useFormDesignerReveal(['pane-a'], open));
    expect(open).not.toHaveBeenCalled();
  });
});
