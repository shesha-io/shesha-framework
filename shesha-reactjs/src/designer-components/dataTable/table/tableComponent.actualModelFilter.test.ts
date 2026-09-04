import TableComponent, { ROW_EVENT_ACTION_PROPERTIES } from './tableComponent';

const filter = TableComponent.actualModelPropertyFilter!;
const navigateAction = {
  actionName: 'Navigate',
  actionOwner: 'shesha.common',
  actionArguments: { queryParameters: [{ key: 'id', value: '{{selectedRow.id}}' }] },
};

describe('datatable actualModelPropertyFilter', () => {
  it('leaves row event actions for evaluation at event time', () => {
    ROW_EVENT_ACTION_PROPERTIES.forEach((name) => expect(filter(name, navigateAction)).toBe(false));
  });

  it('still pre-evaluates ordinary and styling properties', () => {
    expect(filter('caption', 'Members')).toBe(true);
    expect(filter('rowDimensions', { height: '40px' })).toBe(true);
    expect(filter('items', { _mode: 'code', _code: 'return [];' })).toBe(true);
    expect(filter('items', [{ columnType: 'data' }])).toBe(false);
  });
});
