import { FormAutocomplete } from '@/components/configurableItemAutocomplete/formAutocomplete';
import React, { FC, useMemo } from 'react';
import {
  Button,
  Col,
  Form,
  Input,
  Row,
} from 'antd';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { EntityViewConfigurationDto } from '@/apis/modelConfigurations';
import { FormFullName } from '@/providers/form/models';

interface IViewsEditorProps {
  value?: EntityViewConfigurationDto[];
  onChange?: (value: EntityViewConfigurationDto[]) => void;
}

const ViewsEditor: FC<IViewsEditorProps> = (props) => {
  const onDeleteClick = (type: string): void => {
    if (props.onChange) props.onChange(props.value.filter((x) => x.type !== type));
  };

  const onAddClick = (): void => {
    if (props.onChange) {
      const items = [...props.value];
      items.push({ isStandard: false, type: '', formId: null });
      props.onChange(items);
    }
  };

  const onChangeType = (item, value): void => {
    item.type = value;
    if (props.onChange) props.onChange([...props.value]);
  };

  const onChangeForm = (item, value): void => {
    item.formId = value;
    if (props.onChange) props.onChange([...props.value]);
  };

  const allowAdd = useMemo(() => {
    return props.value ? !props.value.find((v) => !v?.type) : true;
  }, [props.value]);

  return (
    <div>
      {props.value && props.value.map((item, index) => (
        <Row className="ant-form-item-row" key={index}>
          <Col span={6} style={{ textAlign: 'right' }}>
            <div className="ant-form-item-label">
              {item.isStandard
                ? <label>{item.type}</label>
                : (
                  <Input
                    value={item.type}
                    style={{ textAlign: 'right' }}
                    onChange={(e) => {
                      onChangeType(item, e.target.value);
                    }}
                  />
                )}
            </div>
          </Col>
          <Col span={18}>
            <Row>
              <Col span={22}>
                <FormAutocomplete
                  value={item.formId && item.formId.name ? item.formId as FormFullName : undefined}
                  onChange={(e) => onChangeForm(item, e)}
                />
              </Col>
              <Col span={2} style={{ textAlign: 'center' }}>
                {
                  !item.isStandard && (
                    <Button
                      icon={<DeleteFilled color="red" />}
                      onClick={() => {
                        onDeleteClick(item.type);
                      }}
                      size="small"
                      danger
                    />
                  )
                }
              </Col>
            </Row>
          </Col>
        </Row>
      ),
      )}
      <Row>
        <Col offset={5} span={8}>
          <Button icon={<PlusOutlined color="green" />} onClick={onAddClick} size="middle" disabled={!allowAdd}>Add</Button>
        </Col>
      </Row>
    </div>
  );
};

export const ViewsEditorComponent: FC<IViewsEditorProps> = (props) => {
  return (
    <Form.Item className="shaViewsEditorForm" name="viewConfigurations" labelCol={{ span: 0 }} wrapperCol={{ span: 24 }}>
      <ViewsEditor {...props} />
    </Form.Item>
  );
};
