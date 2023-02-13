import React, { useEffect, useRef } from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import ChildDataTable, { IChildTableProps } from './';
import DataTableProvider from '../../providers/dataTable';
import { SearchOutlined } from '@ant-design/icons';
import JobTitleFieldEditor from './jobTitleFieldEditor';
import { ChildTable, EntityPicker, IDataTableInstance } from '../..';
import StoryApp from '../storyBookApp';

export default {
  title: 'Components/ChildDataTable',
  component: ChildDataTable,
  argTypes: {},
} as Meta;

interface IExtendedChildTableProps extends IChildTableProps {
  parentEntityId?: string;
}

const simpleTableProps: IExtendedChildTableProps = {
  parentEntityId: '20BCF7E3-783A-494E-A0EA-B0DB08F89B61',
  header: 'List of Staff',
  crud: true,
  actionColumns: [
    {
      icon: <SearchOutlined />,
      // type:
      onClick: id => {
        alert(`clicked details id: ${id}`);
      },
    },
  ],
};

const inlineEditingWithCustomEditorsTableProps: IExtendedChildTableProps = {
  parentEntityId: '20BCF7E3-783A-494E-A0EA-B0DB08F89B61',
  header: 'Staff Meeting Custom Editor',
  crud: true,
  customTypeEditors: [
    {
      key: '',
      property: 'JobTitle',
      render: data => <JobTitleFieldEditor {...data} />,
    },
  ],
};

// Create a master template for mapping args to render the Button component
const Template: Story<IExtendedChildTableProps> = args => {
  const tableRef = useRef<IDataTableInstance>(null);

  useEffect(() => {
    console.log('ChildDataTable Template tableRef?.current: ', tableRef?.current);
  }, [tableRef]);

  return (
    <StoryApp>
      <DataTableProvider parentEntityId={args?.parentEntityId}>
        <ChildTable
          {...args}
          tableRef={tableRef}
          toolbarItems={[
            // {
            //   title: 'Add something',
            //   render: () => <Button size="small">Do Something</Button>
            // },
            {
              title: 'Picker',
              render: () => (
                <EntityPicker useButtonPicker pickerButtonProps={{ size: 'small' }} />
              ),
            },
          ]}
        />
      </DataTableProvider>
    </StoryApp>
  );
};

export const SimpleChildTable = Template.bind({});
SimpleChildTable.args = { label: 'Simple', ...simpleTableProps };

export const InlineEditingWithCustomRenderer = Template.bind({});
InlineEditingWithCustomRenderer.args = {
  label: 'Custom Editor',
  ...inlineEditingWithCustomEditorsTableProps,
};
