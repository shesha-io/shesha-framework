import React, { useEffect, useState } from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import ReactTable from '.';
// import { IReactTableProps } from './interfaces';
import { TEST_COLUMNS, TEST_DATA } from './_data';
import { IReactTableProps } from './interfaces';
import CollapsiblePanel from '../panel';

export default {
  title: 'Components/ReactTable',
  component: ReactTable,
} as Meta;

const reactTableProps: IReactTableProps = {
  data: TEST_DATA,
  columns: TEST_COLUMNS,
  useMultiSelect: false,
  loading: false,
  defaultSorting: [],
  defaultCanSort: false,
  manualPagination: true,
  // manualFilters: null,
  // selectedRowIndex: null,
  // defaultColumn: null,
  disableSortBy: false,
  // pageCount: null,
  scroll: false,
  height: 250,
  // tableRef: null,
  // resizeDebounceDelay: 250,
  // onFetchData: null,
  // onSelectRow: null,
  // onRowDoubleClick: null,
  // onResizedChange: null,
  tableId: 'persistedTableId',
  // rememberColumnWidths: true,
};

// Create a master template for mapping args to render the Button component
const Template: Story<IReactTableProps> = args => {
  const [selectedRowIndex, setSelectedRowIndex] = useState(-1);

  useEffect(() => {
    console.log('selectedRowIndex: ', selectedRowIndex);
  }, [selectedRowIndex]);

  return (
    <CollapsiblePanel header="Simple stuff">
      <ReactTable
        {...args}
        selectedRowIndex={selectedRowIndex}
        onResizedChange={columnSizes => {
          console.log('Template columnSizes : ', columnSizes);
        }}
        onSelectedIdsChanged={ids => {
          console.log('Template ids : ', ids);
        }}
        onRowDoubleClick={rowData => {
          console.log('Template rowData : ', rowData);
        }}
        onSelectRow={setSelectedRowIndex}
      />
    </CollapsiblePanel>
  );
};

export const Basic = Template.bind({});
Basic.args = { ...reactTableProps };
