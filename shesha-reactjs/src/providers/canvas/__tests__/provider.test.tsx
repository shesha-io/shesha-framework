import { act, render } from '@testing-library/react';
import { FC, PropsWithChildren, ReactNode } from 'react';

interface ICapturedBinderProps {
  onChangeData?: (data: unknown, changedData: unknown) => void;
  children?: ReactNode;
}

let binderProps: ICapturedBinderProps | undefined;

// The binder needs the whole data-context stack; the provider's own behavior does not.
vi.mock('@/providers/dataContextProvider/dataContextBinder', () => ({
  default: (props: PropsWithChildren<ICapturedBinderProps>) => {
    binderProps = props;
    return props.children;
  },
}));

import { CanvasProvider, useCanvasState } from '../index';
import { ICanvasStateContext } from '../contexts';

let renders: ICanvasStateContext[] = [];

const Probe: FC = () => {
  renders.push(useCanvasState());
  return null;
};

const renderProvider = (): ReturnType<typeof render> => render(
  <CanvasProvider>
    <Probe />
  </CanvasProvider>,
);

const latest = (): ICanvasStateContext => {
  const state = renders[renders.length - 1];
  if (!state) throw new Error('no state captured');
  return state;
};

/** A script write into the canvas context, as DataContextBinder would deliver it. */
const scriptWrite = (changedData: object): void => {
  act(() => binderProps?.onChangeData?.(undefined, changedData));
};

beforeEach(() => {
  window.localStorage.clear();
  binderProps = undefined;
  renders = [];
});

describe('CanvasProvider - script writes to designerWidth', () => {
  it('routes a percentage to widthPercent instead of pinning it as pixels', () => {
    renderProvider();
    scriptWrite({ designerWidth: '80%' });

    // parseFloat('80%') is 80, which used to pin an 80px mobile canvas and persist it.
    expect(latest().widthPercent).toBe(80);
    expect(latest().autoWidth).toBe(true);
    expect(latest().designerWidth).not.toBe('80px');
    expect(latest().designerDevice).not.toBe('mobile');
  });

  it('still pins a plain length, with or without the px unit', () => {
    renderProvider();

    scriptWrite({ designerWidth: '1024px' });
    expect(latest().designerWidth).toBe('1024px');
    expect(latest().autoWidth).toBe(false);
    expect(latest().designerDevice).toBe('desktop');

    scriptWrite({ designerWidth: '375' });
    expect(latest().designerWidth).toBe('375px');
    expect(latest().designerDevice).toBe('mobile');
  });

  it('ignores a width that is neither a plain length nor a percentage', () => {
    renderProvider();
    const before = latest();

    scriptWrite({ designerWidth: '50vw' });

    expect(latest().designerWidth).toBe(before.designerWidth);
    expect(latest().autoWidth).toBe(before.autoWidth);
  });
});

describe('CanvasProvider - initial activeDevice on a rendered page', () => {
  it('takes the viewport, not the designer device persisted by a previous session', () => {
    // The leak: pin iPhone SE in the designer once, and the first client render of every page in
    // that browser resolved styles as mobile.
    window.localStorage.setItem('shesha:designerDevice', JSON.stringify('mobile'));

    renderProvider();

    // The very first render, before any effect has run - jsdom's window is desktop-width.
    expect(renders[0]?.activeDevice).toBe('desktop');
    // The stored device still applies to the designer itself.
    expect(renders[0]?.designerDevice).toBe('mobile');
  });
});
