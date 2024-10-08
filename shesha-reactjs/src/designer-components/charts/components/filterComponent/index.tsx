import React from 'react';
import { Button, Select, Input, Space, Row, Col, Flex } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { IFilter } from '../../model';

const { Option } = Select;

const FilterComponent = ({
  filters,
  setFilters,
  properties,
  isVisible,
  onClose,
  onFilter,
  resetFilter
}: {
  filters: IFilter[];
  setFilters: (arg: IFilter[]) => void;
  properties: any[];
  isVisible: boolean;
  onClose: () => void;
  onFilter: () => void;
  resetFilter: () => void;
}) => {
  // Add new filter condition
  const addCondition = () => {
    // Update filters state with new filter condition
    setFilters([...filters, { property: '', operator: 'contains', value: '' }]);
    // Trigger filter function with new filters
    onFilter();
  };

  // Handle input change for each filter condition
  const handleInputChange = (index: number, field: any, value: string) => {
    const newFilters = filters?.map((filter, idx) =>
      idx === index ? { ...filter, [field]: value } : filter
    );
    setFilters(newFilters);
  };

  return (
    <div
      title="Filter"
      style={{
        marginTop: 10,
        padding: 10,
        display: isVisible ? 'block' : 'none',
        border: '1px solid #ddd',
      }}
    >
      {filters?.map((filter, index) => (
        <Space key={index} direction="vertical" style={{ width: '100%' }}>
          <Row align="middle">
            <Col flex="auto">
              <Row gutter={8}>
                {/* Select property */}
                <Col span={8}>
                  <Select
                    placeholder="Select property"
                    value={filter.property}
                    onChange={(value) => handleInputChange(index, 'property', value)}
                    style={{ width: '100%' }}
                  >
                    {properties.map((property: any) => (
                      <Option key={property} value={property}>
                        {property}
                      </Option>
                    ))}
                  </Select>
                </Col>
                {/* Select operator */}
                <Col span={8}>
                  <Select
                    placeholder="Select operator"
                    value={filter.operator}
                    onChange={(value) => handleInputChange(index, 'operator', value)}
                    style={{ width: '100%' }}
                  >
                    <Option value="equals">Equals</Option>
                    <Option value="not_equals">Not Equals</Option>
                    <Option value="contains">Contains</Option>
                    <Option value="does_not_contain">Does not contain</Option>
                    <Option value="is_empty">Is empty</Option>
                    <Option value="is_not_empty">Is not empty</Option>
                    <Option value="is_greater_than">Is greater than</Option>
                    <Option value="is_less_than">Is less than</Option>
                    <Option value="starts_with">Starts with</Option>
                    <Option value="ends_with">Ends with</Option>
                  </Select>
                </Col>
                {/* Input value */}
                <Col span={6}>
                  <Input
                    placeholder="Enter a value"
                    value={filter.value}
                    onChange={(e) => handleInputChange(index, 'value', e.target.value)}
                  />
                </Col>
                {/* Delete Button */}
                <Col span={2} style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Flex justify='center' align='center'>
                    <Button
                      icon={<DeleteOutlined />}
                      size={'small'}
                      danger
                      onClick={() => {
                        if (filters.length === 1) {
                          resetFilter();
                          return;
                        }
                        setFilters(filters.filter((_, idx) => idx !== index));
                        onFilter();
                      }}
                    />
                  </Flex>
                </Col>
              </Row>
            </Col>
          </Row>
        </Space>
      ))}

      <Button
        onClick={addCondition}
        type="dashed"
        block
        icon={<PlusOutlined />}
        style={{ marginTop: 10 }}
      >
        Add condition
      </Button>
      <Flex justify='end' align='center'
        style={{ marginTop: 10, gap: 10 }}
      >
        <Button key="cancel" size='small' onClick={onClose}>
          Hide
        </Button>
        <Button key="reset" size='small' onClick={resetFilter}>
          Reset
        </Button>
        <Button key="apply" size='small' type="primary" onClick={onFilter}>
          Apply
        </Button>
      </Flex>
    </div >
  );
};

export default FilterComponent;
