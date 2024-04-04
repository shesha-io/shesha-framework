import React, { useState } from 'react';
import { StoryFn } from '@storybook/react';
import { ListEditor } from './index';
import StoryApp from '@/components/storyBookApp/index';
import { MainLayout, PropertyAutocomplete } from '@/components/index';
import { addStory } from 'src/stories/utils';
import { Checkbox, Col, Row, Select, Space } from 'antd';
import { MetadataProvider } from '@/providers/index';
import { getNanoId } from '@/utils/uuid';
import { ColumnSorting } from '@/providers/dataTable/interfaces';

export default {
  title: 'Components/ListEditor',
  component: ListEditor,
};

const { Option } = Select;

export interface IUserDecisionsEditorStoryProps {

}

export interface CustomListItem {
  propertyName: string;
  sortOrder: ColumnSorting;
}

const Template: StoryFn<IUserDecisionsEditorStoryProps> = ({ }) => {
  const [value, setValue] = useState<CustomListItem[]>([
    { propertyName: 'gender', sortOrder: 'asc' },
    { propertyName: 'title', sortOrder: 'asc' },
    { propertyName: 'primarySite', sortOrder: 'desc' },
  ]);
  const [readOnly, setReadOnly] = useState(null);

  return (
    <StoryApp>
      <MainLayout>
        <Row>
          <Col md={12} offset={2}>
            Read Only: <Checkbox checked={readOnly} 
            onChange={e => { 
              setReadOnly(e.target.checked); 
            }}></Checkbox>
          </Col>
        </Row>
        <Row>
          <Col md={12} offset={2}>
            <MetadataProvider modelType='Shesha.Core.Person'>
              <ListEditor<CustomListItem>
                value={value}
                onChange={setValue}
                initNewItem={(_items) => ({ id: getNanoId(), propertyName: '', sortOrder: 'asc' })}
                readOnly={readOnly}
              >
                {({ item, itemOnChange, readOnly: nestedReadOnly }) => {
                  return (
                    <div>
                      <Space.Compact style={{ width: '100%' }}>
                        <PropertyAutocomplete
                          style={{ width: 'calc(100% - 120px)' }}
                          mode='single'
                          value={item.propertyName}
                          onChange={(value) => {
                            if (!Array.isArray(value))
                              itemOnChange({ ...item, propertyName: value });
                          }}
                          readOnly={nestedReadOnly}
                        />
                        <Select<ColumnSorting>
                          value={item.sortOrder}
                          onChange={(value) => {
                            itemOnChange({ ...item, sortOrder: value });
                          }}
                          style={{ width: '120px' }}
                          disabled={nestedReadOnly}
                        >
                          <Option value="asc">Ascending</Option>
                          <Option value="desc">Descending</Option>
                        </Select>
                      </Space.Compact>
                    </div>);
                }}
              </ListEditor>
            </MetadataProvider>
            <pre>{JSON.stringify(value, null, 2)}</pre>
          </Col>
        </Row>
      </MainLayout>
    </StoryApp>
  );
};

export const Base = addStory(Template, {

});