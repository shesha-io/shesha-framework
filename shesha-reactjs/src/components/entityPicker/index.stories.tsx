import React, { useState } from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import StoredFileUpload, { EntityPicker } from './';
import { CollapsiblePanel } from '..';
import { Button, Form, Input } from 'antd';
import StoryApp from '../storyBookApp';
import { IEntityPickerProps } from './models';
import { addStory } from '../../stories/utils';
import { IDataColumnsProps } from '../../providers/datatableColumnsConfigurator/models';

export default {
  title: 'Components/EntityPicker',
  component: StoredFileUpload,
} as Meta;

interface IStoryArgs extends IEntityPickerProps {
  /**
   * Test Value, is used only by this story for the `Set Test Value Button`
   */
  testValue?: any;
  /**
   * Initial Value, is used only by this story
   */
  initialValue?: string | string[];
}

// Create a master template for mapping args to render the Button component
const Template: Story<IStoryArgs> = props => {
  const { testValue, initialValue, ...restProps } = props;
  const [state, setState] = useState(null);
  const [form] = Form.useForm();

  const label = 'Entity Picker';
  const name = 'entityPicker';

  const onFinish = (data: any) => {
    console.log('onFinish data ', data);
    setState(data);
  };

  const initialValues = {
    firstName: 'Man',
    lastName: 'Down',
  };
  if (props.initialValue)
    initialValues[name] = props.initialValue;

  return (
    <StoryApp>
      <CollapsiblePanel>
        <Form
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 6 }}
          form={form}
          initialValues={initialValues}
          onFinish={onFinish}
        >
          <Form.Item label="first Name" name="firstName">
            <Input />
          </Form.Item>

          <Form.Item label="Last Name" name="lastName">
            <Input />
          </Form.Item>

          <Form.Item label={label} name={name}>
            <EntityPicker
              {...restProps}
            // onChange={(value, selectedRow) => setState({ ...state, value, selectedRow})}
            // onSelect={selectedRow => {
            //   setState({ ...state, selectedRow });
            // }}
            //value={state?.value}

            />
          </Form.Item>

          {Boolean(testValue) && (
            <Button
              onClick={() =>
                form?.setFieldsValue({
                  [name]: testValue,
                })
              }
            >
              Set Test Value
            </Button>
          )}
          <Button onClick={() => form?.resetFields()} style={{ margin: '0 12px' }}>
            Reset
          </Button>

          <Button onClick={() => form?.submit()} type="primary">
            Submit
          </Button>
        </Form>
      </CollapsiblePanel>
      {Boolean(state) && (
        <div>
          <pre>{JSON.stringify(state, null, 2)}</pre>
        </div>
      )}
    </StoryApp>
  );
};


const columns: IDataColumnsProps[] = [
  {
    id: 'column1',
    caption: 'First Name',
    sortOrder: 0,
    itemType: 'item',
    description: 'Lorem ipsum',
    minWidth: 100,
    isVisible: true,
    columnType: 'data',
    propertyName: 'firstName'
  },
  {
    id: 'column2',
    caption: 'First Name',
    sortOrder: 1,
    itemType: 'item',
    description: 'Lorem ipsum',
    minWidth: 100,
    isVisible: true,
    columnType: 'data',
    propertyName: 'lastName'
  },
];
export const SingleMode = addStory(Template, {
  entityType: 'Shesha.Core.Person',
  configurableColumns: columns,
  onSelect: null,
  initialValue: '25da1b6a-1111-4741-b881-122fbbb3e160', // Sipho
  testValue: 'ad4224a7-37ae-40c5-b25a-21cf955c4057', // Thulane
});

export const MultipleMode = addStory(Template, {
  entityType: 'Shesha.Core.Person',
  configurableColumns: columns,
  onSelect: null,
  mode: 'multiple',
  initialValue: [
    '25da1b6a-1111-4741-b881-122fbbb3e160', 
    'ad4224a7-37ae-40c5-b25a-21cf955c4057'
  ], // Sipho + Thulane
  testValue:  [
    "7c4ecc68-dc55-4628-bb27-20ef0f278572",  
    "a8776bd6-cf56-4f35-8100-2240512b2336",
    "25ba7e3a-d802-466f-8d92-22e7b2ab0a93"
  ], // 
});

export const MultipleReadonlyMode = addStory(Template, {
  entityType: 'Shesha.Core.Person',
  configurableColumns: columns,
  onSelect: null,
  mode: 'multiple',
  readOnly: true,
  initialValue: [
    '25da1b6a-1111-4741-b881-122fbbb3e160', 
    'ad4224a7-37ae-40c5-b25a-21cf955c4057'
  ], // Sipho + Thulane
  testValue:  [
    "7c4ecc68-dc55-4628-bb27-20ef0f278572",  
    "a8776bd6-cf56-4f35-8100-2240512b2336",
    "25ba7e3a-d802-466f-8d92-22e7b2ab0a93"
  ], // 
});
