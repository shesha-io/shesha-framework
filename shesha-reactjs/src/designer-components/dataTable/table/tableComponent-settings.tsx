import React, { useState } from 'react';
import { Form, Button, Select, Input, InputNumber } from 'antd';
import { ITableComponentBaseProps, ITableComponentProps, RowDroppedMode } from './models';
import { ColumnsEditorModal } from './columnsEditor/columnsEditorModal';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import SectionSeparator from '../../../components/sectionSeparator';
import CodeEditor from '../../../components/formDesigner/components/codeEditor/codeEditor';
import PropertyAutocomplete from '../../../components/propertyAutocomplete/propertyAutocomplete';
import { ConfigurableActionConfigurator } from '../../configurableActionsConfigurator';
import { YesNoInherit } from 'components/dataTable/interfaces';
import { InlineEditMode, InlineSaveMode, NewRowCapturePosition } from 'components/reactTable/interfaces';
import { nanoid } from 'nanoid';

interface ITypedOption<T = string> {
  label: React.ReactNode;
  value: T;
}
const yesNoInheritOptions: ITypedOption<YesNoInherit>[] = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
  { label: 'Inherit', value: 'inherit' },
  { label: 'Expression', value: 'js' },
];
const inlineEditModes: ITypedOption<InlineEditMode>[] = [
  { label: 'One by one', value: 'one-by-one' },
  { label: 'All at once', value: 'all-at-once' }
];
const inlineSaveModes: ITypedOption<InlineSaveMode>[] = [
  { label: 'Auto', value: 'auto' },
  { label: 'Manual', value: 'manual' }
];
const rowCapturePositions: ITypedOption<NewRowCapturePosition>[] = [
  { label: 'Top', value: 'top' },
  { label: 'Bottom', value: 'bottom' }
];

const NEW_ROW_EXPOSED_VARIABLES = [
  {
    id: nanoid(),
    name: 'formData',
    description: 'Form values',
    type: 'object',
  },
  {
    id: nanoid(),
    name: 'globalState',
    description: 'The global state of the application',
    type: 'object',
  },
  {
    id: nanoid(),
    name: 'http',
    description: 'axios instance used to make http requests',
    type: 'object',
  },
  {
    id: nanoid(),
    name: 'moment',
    description: 'The moment.js object',
    type: 'object',
  }
];

const ROW_SAVE_EXPOSED_VARIABLES = [
  {
    id: nanoid(),
    name: 'data',
    description: 'Current row data',
    type: 'object',
  },
  {
    id: nanoid(),
    name: 'formData',
    description: 'Form values',
    type: 'object',
  },
  {
    id: nanoid(),
    name: 'globalState',
    description: 'The global state of the application',
    type: 'object',
  },
  {
    id: nanoid(),
    name: 'http',
    description: 'axios instance used to make http requests',
    type: 'object',
  },
  {
    id: nanoid(),
    name: 'moment',
    description: 'The moment.js object',
    type: 'object',
  }
];

const ROW_SAVED_SUCCESS_EXPOSED_VARIABLES = [
  {
    id: nanoid(),
    name: 'data',
    description: 'Current row data',
    type: 'object',
  },
  {
    id: nanoid(),
    name: 'formData',
    description: 'Form values',
    type: 'object',
  },
  {
    id: nanoid(),
    name: 'globalState',
    description: 'The global state of the application',
    type: 'object',
  },
  {
    id: nanoid(),
    name: 'http',
    description: 'axios instance used to make http requests',
    type: 'object',
  },
  {
    id: nanoid(),
    name: 'moment',
    description: 'The moment.js object',
    type: 'object',
  }
];

const ENABLE_CRUD_EXPOSED_VARIABLES = [
  {
    id: nanoid(),
    name: 'formData',
    description: 'Form values',
    type: 'object',
  },
  {
    id: nanoid(),
    name: 'globalState',
    description: 'The global state of the application',
    type: 'object',
  },
  {
    id: nanoid(),
    name: 'moment',
    description: 'The moment.js object',
    type: 'object',
  }
];

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
  const canEditInline = Form.useWatch('canEditInline', form);
  const canAddInline = Form.useWatch('canAddInline', form);
  const canDeleteInline = Form.useWatch('canDeleteInline', form);

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

      <SectionSeparator title="CRUD" />

      <Form.Item
        name="canEditInline"
        label="Can edit inline"
      // label={<>Can edit inline <Switch size="small" defaultChecked unCheckedChildren="static" checkedChildren="JS" style={{ marginLeft: '8px' }}/></>}
      >
        <Select disabled={props.readOnly} options={yesNoInheritOptions} />
      </Form.Item>
      <Form.Item name="canEditInlineExpression" label="Can edit inline expression" hidden={canEditInline !== 'js'}>
        <CodeEditor
          id={''}
          name="canEditInlineExpression"
          readOnly={props.readOnly}
          mode="dialog"
          label="Can edit inline expression"
          setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
          type={''}
          description="Return true to enable inline editing and false to disable."
          exposedVariables={ENABLE_CRUD_EXPOSED_VARIABLES}
        />
      </Form.Item>
      <Form.Item name="inlineEditMode" label="Row edit mode" hidden={canEditInline === 'no'}>
        <Select disabled={props.readOnly} options={inlineEditModes} />
      </Form.Item>
      <Form.Item name="inlineSaveMode" label="Save mode" hidden={canEditInline === 'no'}>
        <Select disabled={props.readOnly} options={inlineSaveModes} />
      </Form.Item>
      <Form.Item name="customUpdateUrl" label="Custom update url" hidden={canEditInline === 'no'}>
        <Input readOnly={props.readOnly} />
      </Form.Item>

      <Form.Item name="canAddInline" label="Can add inline">
        <Select disabled={props.readOnly} options={yesNoInheritOptions} />
      </Form.Item>
      <Form.Item name="canAddInlineExpression" label="Can add inline expression" hidden={canAddInline !== 'js'}>
        <CodeEditor
          id={''}
          name="canAddInlineExpression"
          readOnly={props.readOnly}
          mode="dialog"
          label="Can add inline expression"
          setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
          type={''}
          description="Return true to enable inline creation of new rows and false to disable."
          exposedVariables={ENABLE_CRUD_EXPOSED_VARIABLES}
        />
      </Form.Item>
      <Form.Item name="newRowCapturePosition" label="New row capture position" hidden={canAddInline === 'no'}>
        <Select disabled={props.readOnly} options={rowCapturePositions} />
      </Form.Item>
      <Form.Item name="newRowInsertPosition" label="New row insert position" /*hidden={canAddInline === 'no'}*/ hidden={true} /* note: hidden until review of rows drag&drop */>
        <Select disabled={props.readOnly} options={rowCapturePositions} />
      </Form.Item>
      <Form.Item name="customCreateUrl" label="Custom create url" hidden={canEditInline === 'no'}>
        <Input readOnly={props.readOnly} />
      </Form.Item>
      <Form.Item
        label="New row init"
        name="onNewRowInitialize"
        tooltip="Allows configurators to specify logic to initialise the object bound to a new row."
        hidden={canAddInline === 'no'}
      >
        <CodeEditor
          id={''}
          name="onNewRowInitialize"
          readOnly={props.readOnly}
          mode="dialog"
          label="New row init"
          setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
          type={''}
          description="Specify logic to initialise the object bound to a new row. This handler should return an object or a Promise<object>."
          exposedVariables={NEW_ROW_EXPOSED_VARIABLES}
        />
      </Form.Item>
      <Form.Item
        label="On row save"
        name="onRowSave"
        tooltip="Custom business logic to be executed on saving of new/updated row (e.g. custom validation / calculations). This handler should return an object or a Promise<object>."
        hidden={canAddInline === 'no' && canEditInline === 'no'}
      >
        <CodeEditor
          id={''}
          name="onRowSave"
          readOnly={props.readOnly}
          mode="dialog"
          label="On row save"
          setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
          type={''}
          description="Allows custom business logic to be executed on saving of new/updated row (e.g. custom validation / calculations)."
          exposedVariables={ROW_SAVE_EXPOSED_VARIABLES}
        />
      </Form.Item>
      <Form.Item name="onRowSaveSuccessAction" labelCol={{ span: 0 }} wrapperCol={{ span: 24 }} noStyle>
        <ConfigurableActionConfigurator
          editorConfig={null}
          level={1}
          label="On row save success"
          description="Custom business logic to be executed after successfull saving of new/updated row."
          exposedVariables={ROW_SAVED_SUCCESS_EXPOSED_VARIABLES}
        />
      </Form.Item>
      <Form.Item name="canDeleteInline" label="Can delete inline">
        <Select disabled={props.readOnly} options={yesNoInheritOptions} />
      </Form.Item>
      <Form.Item name="canDeleteInlineExpression" label="Can delete inline expression" hidden={canDeleteInline !== 'js'}>
        <CodeEditor
          id={''}
          name="canDeleteInlineExpression"
          readOnly={props.readOnly}
          mode="dialog"
          label="Can delete inline expression"
          setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
          type={''}
          description="Return true to enable inline deletion and false to disable."
          exposedVariables={ENABLE_CRUD_EXPOSED_VARIABLES}
        />
      </Form.Item>      
      <Form.Item name="customDeleteUrl" label="Custom delete url" hidden={canDeleteInline === 'no'}>
        <Input readOnly={props.readOnly} />
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

      <Form.Item name="rowDroppedActionConfiguration">
        <ConfigurableActionConfigurator editorConfig={null} level={1} label="On Row Dropped Action" />
      </Form.Item>

      <SectionSeparator title="Layout" />

      <Form.Item name="minHeight" label="Min Height" tooltip="The minimum height of the table (e.g. even when 0 rows). If blank then minimum height is 0.">
        <InputNumber />
      </Form.Item>

      <Form.Item name="maxHeight" label="Max Height" tooltip="The maximum height of the table. If left blank should grow to display all rows, otherwise should allow for vertical scrolling.">
        <InputNumber />
      </Form.Item>

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
