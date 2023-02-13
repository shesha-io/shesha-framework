import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import Autocomplete, { IGooglePlacesAutocompleteProps } from './';
import { Button, Form } from 'antd';
import { GooglePlacesAutocomplete } from '..';

export default {
  title: 'Components/GooglePlacesAutocomplete',
  component: Autocomplete,
} as Meta;

const autocompleteProps: IGooglePlacesAutocompleteProps = {};

// Create a master template for mapping args to render the Button component
const Template: Story<IGooglePlacesAutocompleteProps> = args => {
  const [form] = Form.useForm();

  const onFinish = (data: any) => {
    console.log('GooglePlacesAutocomplete data: ', data);
  };

  return (
    <div style={{ width: 500 }}>
      <Form
        form={form}
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
      >
        <Form.Item label="Autocomplete">
          <Autocomplete {...args} />
        </Form.Item>

        <Form.Item label="Address" name="address">
          <GooglePlacesAutocomplete />
        </Form.Item>

        <div
          style={{
            marginTop: 16,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </div>
      </Form>
    </div>
  );
};

export const Basic = Template.bind({});
Basic.args = { ...autocompleteProps };
