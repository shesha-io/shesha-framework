import TableComponent from '../table/tableComponent';
import DataListComponent from '../../dataList/dataListComponent';
import AdvancedFilterButtonComponent from '../advancedFilterButton/advancedFilterButtonComponent';
import PagerComponent from '../pager/pagerComponent';
import QuickSearchComponent from '../quickSearch/quickSearchComponent';
import TableViewSelectorComponent from '../tableViewSelector/tableViewSelectorComponent';
import { dataContextRequired } from '../utils';

describe('components that need a Data Context', () => {
  it.each([
    ['Data Table', TableComponent],
    ['DataList', DataListComponent],
    ['Table Filter', AdvancedFilterButtonComponent],
    ['Table Pager', PagerComponent],
    ['Quick Search', QuickSearchComponent],
    ['Table View Selector', TableViewSelectorComponent],
  ])('%s can only be dropped inside a Data Context', (name, component) => {
    expect(component.requiredParent).toEqual(dataContextRequired(name));
  });

  it('accepts both the current and the legacy Data Context', () => {
    expect(dataContextRequired('Data Table')).toEqual({
      types: ['dataContext', 'datatableContext'],
      message: 'Data Table must be placed inside a Data Context.',
    });
  });
});
