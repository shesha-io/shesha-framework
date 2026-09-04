import { render, screen, fireEvent } from '@testing-library/react';
import { App } from 'antd';
import { FC, useState } from 'react';
import { DimensionFieldWrapper } from '../dimensionField';

// jsdom has no ResizeObserver; antd's select machinery expects one.
beforeAll(() => {
  vi.stubGlobal('ResizeObserver', class {
    observe(): void {}

    unobserve(): void {}

    disconnect(): void {}
  });
});

interface IHarnessProps {
  initialValue: string;
  onCommit: (value: string | undefined | null) => void;
}

/** Owns the value the way the settings form does, so blur sees what the field really holds. */
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

const renderField = (ui: React.ReactElement): ReturnType<typeof render> => render(<App>{ui}</App>);

describe('DimensionFieldWrapper - what the user typed is what gets stored', () => {
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
  });

  it('stores an over-wide typed value exactly as typed, silently', () => {
    const commits: (string | undefined | null)[] = [];
    renderField(<Harness initialValue="1000px" onCommit={(v) => commits.push(v)} />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '2000px' } });
    fireEvent.blur(input);

    expect(commits[commits.length - 1]).toBe('2000px');
    // Nothing is rewritten to a canvas-derived maximum, on change or on blur.
    expect(commits.some((v) => v !== '2000px')).toBe(false);
    // And nothing is said about it: the canvas bounds the value visually at render time.
    expect(document.querySelector('.ant-message')).toBeNull();
  });
});
