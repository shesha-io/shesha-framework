import React, { useState } from 'react';
import { Form, Button } from 'antd';
import { ITableComponentBaseProps, ITableComponentProps, RowDroppedMode } from './models';
import { ColumnsEditorModal } from './columnsEditor/columnsEditorModal';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import SectionSeparator from '../../../../sectionSeparator';
import CodeEditor from '../../codeEditor/codeEditor';
import PropertyAutocomplete from '../../../../propertyAutocomplete/propertyAutocomplete';
import { ConfigurableActionConfigurator } from '../../configurableActionsConfigurator';

export interface IProps {
  readOnly: boolean;
  model: ITableComponentProps;
  onSave: (model: ITableComponentProps) => void;
  onCancel: () => void;
  onValuesChange?: (changedValues: any, values: ITableComponentProps) => void;
}

interface IColumnsSettingsState {
  showColumnsModal?: boolean;
  allowRowDragAndDrop?: boolean;
  rowDroppedMode?: RowDroppedMode;
}

function TableSettings(props: IProps) {
  const [state, setState] = useState<IColumnsSettingsState>({
    showColumnsModal: false,
  });
  const [form] = Form.useForm();

  const toggleColumnsModal = () => setState(prev => ({ ...prev, showColumnsModal: !prev?.showColumnsModal }));

  const initialState: ITableComponentBaseProps = {
    ...props?.model,
  };

  const onValuesChange = (changedValues, values: ITableComponentBaseProps) => {
    setState(prev => ({
      ...prev,
      allowRowDragAndDrop: values?.allowRowDragAndDrop,
    }));

    if (props.onValuesChange) props.onValuesChange(changedValues, values as any);
  };

  return (
    <Form
      form={form}
      onFinish={props.onSave}
      onValuesChange={onValuesChange}
      initialValues={initialState}
      wrapperCol={{ span: 24 }}
      labelCol={{ span: 24 }}
    >
      <Form.Item name="name" label="Name">
        <PropertyAutocomplete readOnly={props.readOnly} showFillPropsButton={false} />
      </Form.Item>

      <Button onClick={toggleColumnsModal}>{props.readOnly ? 'View Columns' : 'Customize Columns'}</Button>

      <Form.Item name="items">
        <ColumnsEditorModal
          visible={state?.showColumnsModal}
          hideModal={toggleColumnsModal}
          readOnly={props.readOnly}
        />
      </Form.Item>

      <Form.Item name="useMultiselect" label="Use Multi-select" valuePropName="checked">
        <Checkbox disabled={props.readOnly} />
      </Form.Item>

      <SectionSeparator title="Row drag and drop" />

      <Form.Item
        name="allowRowDragAndDrop"
        label="Allow row drag-and-drop"
        valuePropName="checked"
        tooltip="Whether rows should be dragged and dropped to rearrange them"
      >
        <Checkbox disabled={props.readOnly} />
      </Form.Item>

      <Form.Item name="rowDroppedActionConfiguration" label="On Row Dropped Action">
        <ConfigurableActionConfigurator editorConfig={null} level={0} />
      </Form.Item>

      <SectionSeparator title="Layout" />

      <Form.Item name="containerStyle" label="Table container style">
        <CodeEditor
          readOnly={props.readOnly}
          mode="dialog"
          setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
          name="containerStyle"
          type={''}
          id={''}
          label="Table container style"
          description="The style that will be applied to the table container/wrapper"
          exposedVariables={[]}
        />
      </Form.Item>

      <Form.Item name="tableStyle" label="Table style">
        <CodeEditor
          readOnly={props.readOnly}
          mode="dialog"
          setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
          name="tableStyle"
          type={''}
          id={''}
          label="Table style"
          description="The style that will be applied to the table"
          exposedVariables={[]}
        />
      </Form.Item>
    </Form>
  );
}

export default TableSettings;
