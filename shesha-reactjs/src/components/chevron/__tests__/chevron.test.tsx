import { act, render } from '@testing-library/react';
import { ChevronControl } from '..';
import { RefListGroupItemProps } from '@/components/refListSelectorDisplay/provider/models';
import { IChevronProps } from '../models';

const items = [
  { id: 'male-id', item: 'Male', itemValue: 1 },
  { id: 'female-id', item: 'Female', itemValue: 2, hidden: true },
  { id: 'other-id', item: 'Other', itemValue: 3 },
] satisfies RefListGroupItemProps[];

vi.mock('@/components/refListSelectorDisplay/provider', () => ({
  useRefListItemGroupConfigurator: () => ({ items }),
}));
vi.mock('@/providers/theme', () => ({ useTheme: () => ({ theme: { application: { primaryColor: '#1890ff' } } }) }));
vi.mock('@/designer-components/button/configurableButton', () => ({
  default: (props: { label?: string; onBeforeClick?: () => void }) => (
    <button type="button" onClick={() => props.onBeforeClick?.()}>{props.label}</button>
  ),
}));

const model = { id: 'c1', type: 'chevron', propertyName: 'gender' } satisfies IChevronProps;

const steps = (): (string | null)[] => Array.from(document.querySelectorAll('button')).map((b) => b.textContent);

describe('ChevronControl', () => {
  it('does not render a hidden step', () => {
    render(<ChevronControl {...model} value={1} />);
    expect(steps()).toEqual(['Male', 'Other']);
  });

  it('writes the clicked step back to the bound property', () => {
    const onChange = vi.fn();
    render(<ChevronControl {...model} value={1} onChange={onChange} />);

    act(() => {
      Array.from(document.querySelectorAll('button')).find((b) => b.textContent === 'Other')!.click();
    });

    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('does not write back when read only', () => {
    const onChange = vi.fn();
    render(<ChevronControl {...model} readOnly value={1} onChange={onChange} />);

    act(() => {
      Array.from(document.querySelectorAll('button')).find((b) => b.textContent === 'Other')!.click();
    });

    expect(onChange).not.toHaveBeenCalled();
  });
});
