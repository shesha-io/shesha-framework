import { render } from '@testing-library/react';
import { ChevronControl } from '..';
import { RefListGroupItemProps } from '@/components/refListSelectorDisplay/provider/models';
import { IChevronProps } from '../models';

const items: RefListGroupItemProps[] = [
  { id: 'male-id', item: 'Male', itemValue: 1 } as RefListGroupItemProps,
  { id: 'female-id', item: 'Female', itemValue: 2, hidden: true } as RefListGroupItemProps,
  { id: 'other-id', item: 'Other', itemValue: 3 } as RefListGroupItemProps,
];

vi.mock('@/components/refListSelectorDisplay/provider', () => ({
  useRefListItemGroupConfigurator: () => ({ items }),
}));
vi.mock('@/providers/theme', () => ({ useTheme: () => ({ theme: { application: { primaryColor: '#1890ff' } } }) }));
vi.mock('@/designer-components/button/configurableButton', () => ({
  default: (props: { label?: string }) => <button type="button">{props.label}</button>,
}));

const model = { id: 'c1', type: 'chevron', propertyName: 'gender' } as IChevronProps;

const steps = (): (string | null)[] => Array.from(document.querySelectorAll('button')).map((b) => b.textContent);

describe('ChevronControl', () => {
  it('does not render a hidden step', () => {
    render(<ChevronControl {...model} value={1} />);
    expect(steps()).toEqual(['Male', 'Other']);
  });
});
