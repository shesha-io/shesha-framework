import { getSortingOrDefault } from './utils';
import { ISortingItem } from '@/providers/dataTable/interfaces';

describe('getSortingOrDefault', () => {
  it('sorts by the display property ascending when no sorting is stored', () => {
    expect(getSortingOrDefault(undefined, 'fullName')).toEqual([{ propertyName: 'fullName', sorting: 'asc' }]);
  });

  it('applies the default when the stored sorting is empty', () => {
    expect(getSortingOrDefault([], '_displayName')).toEqual([{ propertyName: '_displayName', sorting: 'asc' }]);
  });

  it('keeps the stored sorting when there is one', () => {
    const stored: ISortingItem[] = [{ propertyName: 'lastName', sorting: 'desc' }];
    expect(getSortingOrDefault(stored, 'fullName')).toBe(stored);
  });
});
