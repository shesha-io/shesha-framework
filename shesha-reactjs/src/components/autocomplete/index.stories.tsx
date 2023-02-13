import React, { FC, useState } from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import Autocomplete from './';
import { Button, Form } from 'antd';
import { addStory } from '../../stories/utils';
import StoryApp from '../storyBookApp';
import { AutocompleteDataSourceType, IAutocompleteProps } from './models';

export default {
  title: 'Components/Autocomplete',
  component: Autocomplete,
} as Meta;

interface IStoryArgs extends IAutocompleteProps {
  /**
   * Test Value, is used only by this story for the `Set Test Value Button`
   */
  testValue?: any;
  /**
   * Initial Value, is used only by this story
   */
  initialValue?: any;
}

interface ITemplateProps extends IStoryArgs {
  children: React.ReactNode;
}

const BaseTemplate: FC<ITemplateProps> = props => {
  const { testValue, children } = props;
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
const RawTemplate: Story<IStoryArgs> = args => {
  const { testValue, initialValue, ...autocompleteProps } = args;
  return (
    <BaseTemplate {...args}>
      <Autocomplete.Raw {...autocompleteProps} />
    </BaseTemplate>
  );
};

const EntityDtoTemplate: Story<IStoryArgs> = args => {
  const { testValue, initialValue, ...autocompleteProps } = args;
  return (
    <BaseTemplate {...args}>
      <Autocomplete.EntityDto {...autocompleteProps} />
    </BaseTemplate>
  );
};

interface IHasDataSourceType {
  dataSourceType: AutocompleteDataSourceType;
}
interface IUrlDataSourceProps extends IHasDataSourceType {
  dataSourceUrl: string;
}
const urlDataSourceProps: IUrlDataSourceProps = {
  dataSourceType: 'url',
  dataSourceUrl: '/api/v1/BursMan/ScheduleVisits/MembersAutocomplete',
};

const singleEntityDtoBaseProps: IStoryArgs = {
  ...urlDataSourceProps,
  testValue: {
    id: '291b86be-27f1-41a0-8bfd-f867a3b38e32',
    displayText: 'Friday Green',
  },
};
//#region Single Entity DTO
export const SingleEntityDto = addStory(EntityDtoTemplate, {
  ...singleEntityDtoBaseProps,
});
//#endregion

//#region Single Entity DTO with initial value
export const SingleEntityDtoWithInitialValue = addStory(EntityDtoTemplate, {
  ...singleEntityDtoBaseProps,
  initialValue: {
    id: '6fb28e47-591e-46ed-90b5-13a88c69c759',
    displayText: 'Dimakatso Masetlane',
  },
});
//#endregion

//#region Single Entity DTO with initial value
export const SingleEntityDtoWithInitialValueReadOnly = addStory(EntityDtoTemplate, {
  ...singleEntityDtoBaseProps,
  readOnly: true,
  initialValue: {
    id: '6fb28e47-591e-46ed-90b5-13a88c69c759',
    displayText: 'Dimakatso Masetlane',
  },
});
//#endregion

const multipleEntityDtoBaseProps: IStoryArgs = {
  ...urlDataSourceProps,
  mode: 'multiple',
  testValue: [
    {
      id: '7f3076a1-e766-41a4-a05b-90e70a01d8ae',
      displayText: 'Cinisile Mathonsi',
    },
    {
      id: '291b86be-27f1-41a0-8bfd-f867a3b38e32',
      displayText: 'Friday Green',
    },
  ],
};

//#region Multiple Entity DTO
export const MultipleEntityDto = addStory(EntityDtoTemplate, {
  ...multipleEntityDtoBaseProps,
});
//#endregion

//#region Multiple Entity with initial value DTO
export const MultipleEntityDtoWithInitialValue = addStory(EntityDtoTemplate, {
  ...multipleEntityDtoBaseProps,
  initialValue: [
    {
      id: '42756bfc-0789-4aa3-91ac-68fef3b8d5f1',
      displayText: 'DJ Khaled',
    },
    {
      id: '8da3928a-6e03-4260-8961-c3d0b5a33c42',
      displayText: 'Jane Smith',
    },
  ],
});
//#endregion

//#region Multiple Entity with initial value DTO ReadOnly
export const MultipleEntityDtoWithInitialValueReadOnly = addStory(EntityDtoTemplate, {
  ...multipleEntityDtoBaseProps,
  readOnly: true,
  initialValue: [
    {
      id: '42756bfc-0789-4aa3-91ac-68fef3b8d5f1',
      displayText: 'DJ Khaled',
    },
    {
      id: '8da3928a-6e03-4260-8961-c3d0b5a33c42',
      displayText: 'Jane Smith',
    },
  ],
});
//#endregion

//#region Tags Entity DTO
export const TagsEntityDto = addStory(EntityDtoTemplate, {
  ...urlDataSourceProps,
  mode: 'tags',
  testValue: [
    {
      id: '7f3076a1-e766-41a4-a05b-90e70a01d8ae',
      displayText: 'Cinisile Mathonsi',
    },
    {
      id: '291b86be-27f1-41a0-8bfd-f867a3b38e32',
      displayText: 'Friday Green',
    },
  ],
});
//#endregion

//#region Single Raw
export const SingleRaw = addStory(RawTemplate, {
  ...urlDataSourceProps,
  testValue: '7f3076a1-e766-41a4-a05b-90e70a01d8ae',
});
//#endregion

//#region Single Raw with initial value
export const SingleRawWithInitialValue = addStory(RawTemplate, {
  ...urlDataSourceProps,
  testValue: '7f3076a1-e766-41a4-a05b-90e70a01d8ae',
  initialValue: '42756bfc-0789-4aa3-91ac-68fef3b8d5f1',
});
//#endregion

//#region Multiple Raw
export const MultipleRaw = addStory(RawTemplate, {
  ...urlDataSourceProps,
  mode: 'multiple',
  testValue: ['7f3076a1-e766-41a4-a05b-90e70a01d8ae', '42756bfc-0789-4aa3-91ac-68fef3b8d5f1'],
});
//#endregion

//#region Multiple Raw with initial value
export const MultipleRawWithInitialValue = addStory(RawTemplate, {
  ...urlDataSourceProps,
  mode: 'multiple',
  initialValue: ['7f3076a1-e766-41a4-a05b-90e70a01d8ae', '42756bfc-0789-4aa3-91ac-68fef3b8d5f1'],
});
//#endregion

//#region Single Raw with initial value (entity)
export const SingleEntityRawWithInitialValue = addStory(RawTemplate, {
  dataSourceType: 'entitiesList',
  typeShortAlias: 'Shesha.Core.Person',
  testValue: 'd257e62d-2521-4930-8022-151efeeb0034',
  initialValue: 'f84056e6-73fb-4609-a286-07c2244e4c7b',
});
//#endregion

//#region Multiple Raw with initial value (entity)
export const MultipleEntityRawWithInitialValue = addStory(RawTemplate, {
  dataSourceType: 'entitiesList',
  typeShortAlias: 'Shesha.Core.Person',
  mode: 'multiple',
  initialValue: ['f84056e6-73fb-4609-a286-07c2244e4c7b', '8caef933-0c50-42ac-afc8-0e9be0ffd6f4'],
});
//#endregion
