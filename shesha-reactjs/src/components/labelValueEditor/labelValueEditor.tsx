import ConditionalWrap from '@/components/conditionalWrapper';
import React, { FC, Fragment, useState } from 'react';
import Show from '@/components/show';
import {
  Alert,
  Button,
  Col,
  Input,
  Modal,
  Row,
  Tabs
} from 'antd';
import { BorderlessTableOutlined } from '@ant-design/icons';
import { CodeVariablesTables, ICodeExposedVariable } from '@/components/codeVariablesTable';
import { ILabelValueEditorPropsBase } from './interfaces';
import { ListEditor } from '@/components';
import { ItemChangeDetails } from '../listEditor';

export interface ILabelValueItem {
  [key: string]: string;
}

export interface ILabelValueEditorProps extends ILabelValueEditorPropsBase {
  /**
   * Selected value
   */
  value?: ILabelValueItem[];

  /**
   * On change event handler
   */
  onChange?: (newValue: ILabelValueItem[]) => void;

  mode?: 'dialog' | 'inline';

  exposedVariables?: ICodeExposedVariable[];

  description?: string;

  readOnly?: boolean;
}

interface InputPropertyEditorProps<TItem> {
  item: TItem;
  itemOnChange: (newValue: TItem, changeDetails: ItemChangeDetails) => void;
  readOnly: boolean;
  placeholder?: string;
  propertyName: string;
}
const InputPropertyEditor = <TItem extends object>(props: InputPropertyEditorProps<TItem>) => {
  const { item, propertyName, itemOnChange, placeholder } = props;
  return (
    <Input
      placeholder={placeholder}
      title={placeholder}
      value={item[propertyName]}
      onChange={(e) => {
        itemOnChange({ ...item, [propertyName]: e.target.value }, undefined);
      }}
    />
  );
};

const LabelValueEditor: FC<ILabelValueEditorProps> = ({
  value,
  onChange,
  labelTitle,
  labelName,
  valueTitle,
  valueName,
  description,
  mode = 'dialog',
  exposedVariables,
  readOnly = false,
}) => {
  const [showModal, setShowModal] = useState(false);

  const toggleModal = () => setShowModal(currentVisible => !currentVisible);

  return (
    <ConditionalWrap
      condition={mode === 'dialog'}
      wrap={children => (
        <Fragment>
          <Button onClick={toggleModal} size="small" icon={<BorderlessTableOutlined />}>
            {readOnly ? 'Click to View Items' : 'Click to Add Items'}
          </Button>

          <Modal
            title={readOnly ? 'View Items' : 'Add Items'}
            open={showModal}
            width={650}

            onOk={toggleModal}
            okButtonProps={{ hidden: readOnly }}

            onCancel={toggleModal}
            cancelText={readOnly ? 'Close' : undefined}
          >
            <Show when={!!description}>
              <Alert type="info" message={description} />
              <br />
            </Show>
            <Tabs
              items={[
                { key: "keyValuePairs", label: "Key/Value pairs", children: children },
                { key: "variable", label: "Variables", children: <CodeVariablesTables data={exposedVariables} /> },
              ]}
            />
          </Modal>
        </Fragment>
      )}
    >
      <ListEditor<ILabelValueItem>
        value={value}
        onChange={onChange}
        initNewItem={(_items) => ({
          [labelName]: '',
          [valueName]: '',
        })
        }
        readOnly={readOnly}
      >
        {({ item, itemOnChange, readOnly }) => {
          return (
            <Row>
              <Col span={12}>
                <InputPropertyEditor<ILabelValueItem> item={item} itemOnChange={itemOnChange} propertyName={labelName} readOnly={readOnly} placeholder={labelTitle} />
              </Col>
              <Col span={12}>
                <InputPropertyEditor<ILabelValueItem> item={item} itemOnChange={itemOnChange} propertyName={valueName} readOnly={readOnly} placeholder={valueTitle} />
              </Col>
            </Row>);
        }}
      </ListEditor>
    </ConditionalWrap>
  );
};

export { LabelValueEditor };