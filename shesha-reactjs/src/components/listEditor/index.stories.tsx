import React, { useState } from 'react';
import { StoryFn } from '@storybook/react';
import { ListEditor } from './index';
import StoryApp from 'components/storyBookApp/index';
import { MainLayout, PropertyAutocomplete } from 'components/index';
import { addStory } from 'src/stories/utils';
import { Col, Input, Row, Select } from 'antd';
import { MetadataProvider } from 'providers/index';
import { getNanoId } from 'utils/uuid';

export default {
  title: 'Components/ListEditor',
  component: ListEditor,
};

const { Option } = Select;

export interface IUserDecisionsEditorStoryProps {

}

type SortOrder = 'asc' | 'desc';
export interface CustomListItem {
  id: string;
  propertyName: string;
  sortOrder: SortOrder;
}

const Template: StoryFn<IUserDecisionsEditorStoryProps> = ({ }) => {
  const [value, setValue] = useState<CustomListItem[]>([
    { id: '1', propertyName: 'gender', sortOrder: 'asc' },
    { id: '2', propertyName: 'title', sortOrder: 'asc' },
    { id: '3', propertyName: 'primarySite', sortOrder: 'desc' },
  ]);

  return (
    <StoryApp>
      <MainLayout>
        <Row>
          <Col md={12}>
            <MetadataProvider modelType='Shesha.Core.Person'>
              <ListEditor<CustomListItem>
                value={value}
                onChange={setValue}
                initNewItem={(_items) => ({ id: getNanoId(), propertyName: '', sortOrder: 'asc' })}
              >
                {(item, itemOnChange, _index) => {
                  return (
                    <div>
                      <Input.Group style={{ width: '100%' }}>
                        <PropertyAutocomplete
                          style={{ width: 'calc(100% - 120px)' }}
                          mode='single'
                          value={item.propertyName}
                          onChange={(value) => {
                            if (!Array.isArray(value))
                              itemOnChange({ ...item, propertyName: value });
                          }}
                        />
                        <Select<SortOrder>
                          value={item.sortOrder}
                          onChange={(value) => {
                            itemOnChange({ ...item, sortOrder: value });
                          }}
                          style={{ width: '120px' }}
                        >
                          <Option value="asc">Ascending</Option>
                          <Option value="desc">Descending</Option>
                        </Select>
                      </Input.Group>
                    </div>);
                }}
              </ListEditor>
            </MetadataProvider>
            <pre>{JSON.stringify(value, null, 2)}</pre>
          </Col>
        </Row>
      </MainLayout>
    </StoryApp>
  )
};

export const Base = addStory(Template, {

});