import React, { useRef, useState } from 'react';
import { QueryBuilderProvider, JsonLogicResult } from '../..';
import { Story, Meta } from '@storybook/react';
import StoryApp from '../storyBookApp';
import { QueryBuilder } from '.';
import { addStory } from 'stories/utils';
import isDeepEqual from 'fast-deep-equal/react';
import { IEntityReferencePropertyMetadata, IModelMetadata, IObjectMetadata } from 'interfaces/metadata';
import { DataTypes } from 'interfaces/dataTypes';
import QueryBuilderField from 'designer-components/queryBuilder/queryBuilderField';
import { Button, Select } from 'antd';
import { NodeExpandOutlined } from '@ant-design/icons';
import { IPropertyMetadataWithQBSettings } from 'providers/queryBuilder/models';

export default {
  title: 'Components/QueryBuilder',
  component: QueryBuilder
} as Meta;


interface IQueryBuilderStoryArgs {

}

const metadata: IObjectMetadata = {
  dataType: DataTypes.object,
  properties: [
    {
      label: 'Test field',
      dataType: DataTypes.string,
      path: 'testField',
      isVisible: true,
      toQueryBuilderField: (defaultConverter) => {
        const field = defaultConverter();
        return {
          ...field,
          mainWidget: 'customSelect',
          operators: ['equal'],
          valueSources: ['value'],
          defaultOperator: 'equal',
          widgets: {
            customSelect: {
              operators: ['equal'],
            },
          }
        };
      },
    } as IPropertyMetadataWithQBSettings,
    {
      label: 'Recommend Submission: Last Decision',
      dataType: DataTypes.string,
      path: 'lastDecision_recommentUid',
      isVisible: true,
    },
    {
      label: 'Review Submission: Last Decision',
      dataType: DataTypes.string,
      path: 'lastDecision_reviewUid',
      isVisible: true,
    },
    {
      label: 'Workflow',
      dataType: DataTypes.entityReference,
      path: 'workflow',
      isVisible: true,
      entityType: 'Shesha.Enterprise.Workflow.WorkflowInstance'
    } as IEntityReferencePropertyMetadata,
  ]
};

const BaseTemplate: Story<IQueryBuilderStoryArgs> = () => {
  return (
    <StoryApp>
      <TestQB />
    </StoryApp>
  );
};

export const CustomFields = addStory(BaseTemplate, {

});

export interface ISimpleQueryBuilderProps {
  value?: object;
  onChange: (newValue?: object) => void;
  metadata: IModelMetadata;
}

const TestQB = () => {

  const [value, setValue] = useState<object>(undefined);
  return (
    <SimpleQueryBuilder
      value={value}
      onChange={setValue}
      metadata={metadata}
    />
  );
};

const SimpleQueryBuilder = ({ value, onChange, metadata }) => {
  const lastResult = useRef<JsonLogicResult>();

  const handleChange = (jsonLogicResult: JsonLogicResult) => {

    lastResult.current = jsonLogicResult;
    if (jsonLogicResult) {
      if (jsonLogicResult && jsonLogicResult.errors && jsonLogicResult.errors.length > 0) {
        console.log(jsonLogicResult);
        // show errors
        return;
      }

      if (onChange && !isDeepEqual(value, jsonLogicResult?.logic)) {
        onChange(jsonLogicResult?.logic);
      }
    }
  };

  const onSetTestValueClick = () => {
    onChange({
      "and": [
        {
          "==": [
            {
              "var": "testField"
            },
            "99"
          ]
        }
      ]
    });
  };

  return (
    <>
      <Button onClick={onSetTestValueClick}>Set Test Value</Button>
      <QueryBuilderProvider metadata={metadata} /*customWidgets={customWidgets}*/>
        <QueryBuilder
          value={value}
          onChange={handleChange}
        />
      </QueryBuilderProvider>
    </>
  );
};

const { Option } = Select;
const ModalTemplate: Story<IQueryBuilderStoryArgs> = () => {

  const onExpandClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event?.preventDefault();
    event.stopPropagation();

    console.log('LOG: expand clicked');
  };

  return (
    <StoryApp>
      <TestQBModal />
      <Select dropdownMatchSelectWidth style={{ width: '200px' }}>
        <Option value="1" label="item 1">Item 1</Option>
        <Option value="2" label="item 2">Item 2 <Button onClick={onExpandClick} shape="circle" size='small' title='Click to expand'><NodeExpandOutlined /></Button></Option>
      </Select>
    </StoryApp>
  );
};

const TestQBModal = () => {
  const [value, setValue] = useState<object>(undefined);

  const onChange = (newValue: object) => {
    console.log('LOG: onChange', newValue);
    setValue(newValue);
  };

  return (
    <QueryBuilderProvider metadata={metadata}>
      <QueryBuilderField value={value} onChange={onChange} />
    </QueryBuilderProvider>
  );
};
export const InsideModal = addStory(ModalTemplate, {

});