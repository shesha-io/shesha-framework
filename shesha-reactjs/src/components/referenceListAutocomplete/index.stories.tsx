import React, { FC, useState } from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import { FormAutocomplete, IFormAutocompleteRuntimeProps } from './';
import StoryApp from '../storyBookApp';
import { Button, Form } from 'antd';
import { addStory } from '../../stories/utils';
import { FormFullName, FormIdentifier, FormUid } from '../../providers/form/models';

export default {
  title: 'Components/Temp/FormAutocomplete',
  component: FormAutocomplete,
} as Meta;

interface IStoryArgs extends IFormAutocompleteRuntimeProps {
  /**
   * Test Value, is used only by this story for the `Set Test Value Button`
   */
  testFullName?: FormFullName;
  testUid?: FormUid;
  /**
   * Initial Value, is used only by this story
   */
  initialValue?: FormIdentifier;
}

interface ITemplateProps extends IStoryArgs {
  children: React.ReactNode;
}

const BaseTemplate: FC<ITemplateProps> = props => {
  const { testFullName, testUid, children } = props;
  const label = 'Autocomplete';
  const name = 'autocomplete';
  const [state, setState] = useState(null);

  const [form] = Form.useForm();

  const onFinish = (data: any) => {
    console.log('onFinish data ', data);
    setState(data);
  };

  return (
    <StoryApp>
      <div style={{ width: 500 }}>
        <Form
          {...{
            labelCol: {
              xs: { span: 24 },
              md: { span: 8 },
              sm: { span: 8 },
            },
            wrapperCol: {
              xs: { span: 24 },
              md: { span: 16 },
              sm: { span: 16 },
            },
          }}
          onFinish={onFinish}
          form={form}
        >
          <Form.Item label={label} name={name} initialValue={props.initialValue}>
            {children}
          </Form.Item>

          {Boolean(testFullName) && (
            <Button
              onClick={() =>
                form?.setFieldsValue({
                  [name]: testFullName,
                })
              }
            >
              Set Test Value (Full Name)
            </Button>
          )}

          {Boolean(testUid) && (
            <Button
              onClick={() =>
                form?.setFieldsValue({
                  [name]: testUid,
                })
              }
            >
              Set Test Value (UID)
            </Button>
          )}

          <Button onClick={() => form?.resetFields()} style={{ margin: '0 12px' }}>
            Reset
          </Button>

          <Button onClick={() => form?.submit()} type="primary">
            Submit
          </Button>
        </Form>
      </div>

      {Boolean(state) && (
        <div>
          <pre>{JSON.stringify(state, null, 2)}</pre>
        </div>
      )}
    </StoryApp>
  );
};

// Create a master template for mapping args to render the Button component
const Template: Story<IStoryArgs> = args => {
  const { testFullName: testValue, initialValue, ...autocompleteProps } = args;
  return (
    <BaseTemplate {...args}>
      <FormAutocomplete {...autocompleteProps} />
    </BaseTemplate>
  );
};

export const MultipleEntityDto = addStory(Template, {
  testFullName: {
    name: 'forms',
    module: 'shesha'
  },
  testUid: '80A62EAB-2771-4650-88C9-C8FC676D6A60',
});

/*
// Create a master template for mapping args to render the Button component
const Template: Story<IFormAutocompleteProps> = args => (
  <StoryApp>
    <FormAutocomplete {...args}></FormAutocomplete>
  </StoryApp>
);
export const Basic = Template.bind({});
Basic.args = {  };
*/
