import { render, screen, fireEvent } from '@testing-library/react';
import { App } from 'antd';
import { FC, useState } from 'react';
import { DimensionFieldWrapper } from '../dimensionField';
import {
  CANVAS_CONTEXT_INITIAL_STATE,
  CanvasActionsContext,
  CanvasStateContext,
  ICanvasActionsContext,
  ICanvasStateContext,
} from '@/providers/canvas/contexts';

// jsdom has no ResizeObserver; antd's select machinery expects one.
beforeAll(() => {
  vi.stubGlobal('ResizeObserver', class {
    observe(): void {}

    unobserve(): void {}

    disconnect(): void {}
  });
});

const actions: ICanvasActionsContext = {
  setDesignerDevice: vi.fn(),
  setCanvasWidth: vi.fn(),
  setCanvasZoom: vi.fn(),
  setManualZoom: vi.fn(),
  setCanvasAutoZoom: vi.fn(),
  setCanvasAutoWidth: vi.fn(),
  setCanvasWidthPercent: vi.fn(),
  setAvailableCanvasWidth: vi.fn(),
  setCanvasMeasurement: vi.fn(),
  registerCanvas: vi.fn(),
  unregisterCanvas: vi.fn(),
};

// The iPhone SE preset pinned: the narrowest canvas, so any desktop-ish width exceeds it.
const pinnedToMobile: ICanvasStateContext = {
  ...CANVAS_CONTEXT_INITIAL_STATE,
  autoWidth: false,
  designerWidth: '375px',
  deviceWidth: '375px',
  designerDevice: 'mobile',
};

const renderField = (ui: React.ReactElement): ReturnType<typeof render> => render(
  <App>
    <CanvasStateContext.Provider value={pinnedToMobile}>
      <CanvasActionsContext.Provider value={actions}>
        {ui}
      </CanvasActionsContext.Provider>
    </CanvasStateContext.Provider>
  </App>,
);

interface IHarnessProps {
  initialValue: string;
  onCommit: (value: string | undefined | null) => void;
}

/** Owns the value the way the settings form does, so blur judges what the field really holds. */
const Harness: FC<IHarnessProps> = ({ initialValue, onCommit }) => {
  const [value, setValue] = useState<string>(initialValue);

  return (
    <DimensionFieldWrapper
      type="dimensionField"
      propertyName="dimensions.width"
      label="Width"
      dimensionType="width"
      value={value}
      onChange={(data) => {
        onCommit(data);
        setValue(data ?? '');
      }}
    />
  );
};

describe('DimensionFieldWrapper - the canvas never rewrites stored config', () => {
  it('calls onChange zero times when the field is focused and blurred without an edit', () => {
    const onChange = vi.fn();
    renderField(
      <DimensionFieldWrapper
        type="dimensionField"
        propertyName="dimensions.width"
        label="Width"
        dimensionType="width"
        value="1000px"
        onChange={onChange}
      />,
    );

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.blur(input);

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByText(/wider than the canvas/)).toBeNull();
  });

  it('stores an over-wide typed value exactly as typed, and only warns', async () => {
    const commits: (string | undefined | null)[] = [];
    renderField(<Harness initialValue="1000px" onCommit={(v) => commits.push(v)} />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '2000px' } });
    fireEvent.blur(input);

    expect(commits[commits.length - 1]).toBe('2000px');
    // Nothing rewritten to the canvas maximum - not on change, not on blur.
    expect(commits).not.toContain('375px');
    // findByText throws when the warning is absent.
    expect(await screen.findByText(/wider than the canvas/)).toBeDefined();
  });
});
