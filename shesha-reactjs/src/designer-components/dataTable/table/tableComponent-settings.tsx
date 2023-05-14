import React, { useState } from 'react';
import { Form, Button, Select, Input } from 'antd';
import { ITableComponentBaseProps, ITableComponentProps, RowDroppedMode } from './models';
import { ColumnsEditorModal } from './columnsEditor/columnsEditorModal';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import SectionSeparator from '../../../components/sectionSeparator';
import CodeEditor from '../../../components/formDesigner/components/codeEditor/codeEditor';
import PropertyAutocomplete from '../../../components/propertyAutocomplete/propertyAutocomplete';
import { ConfigurableActionConfigurator } from '../../configurableActionsConfigurator';
import { YesNoInherit } from 'components/dataTable/interfaces';
import { InlineEditMode, InlineSaveMode, NewRowCapturePosition } from 'components/reactTable/interfaces';

interface ITypedOption<T = string> {
  label: React.ReactNode;
  value: T;
}
const yesNoInheritOptions: ITypedOption<YesNoInherit>[] = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
  { label: 'Inherit', value: 'inherit' },
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

      <Form.Item name="canEditInline" label="Can edit inline">
        <Select disabled={props.readOnly} options={yesNoInheritOptions} />
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
      <Form.Item name="newRowCapturePosition" label="New row capture position" hidden={canAddInline === 'no'}>
        <Select disabled={props.readOnly} options={rowCapturePositions} />
      </Form.Item>
      <Form.Item name="newRowInsertPosition" label="New row insert position" hidden={canAddInline === 'no'}>
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
          description="Allows configurators to specify logic to initialise the object bound to a new row."
          // exposedVariables={EXPOSED_VARIABLES}
        />
      </Form.Item>
      <Form.Item
        label="On row save"
        name="onRowSave"
        tooltip="Allows custom business logic to be executed on saving of new/updated row (e.g. custom validation / calculations)."
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
          // exposedVariables={EXPOSED_VARIABLES}
        />
      </Form.Item>
      <Form.Item name="canDeleteInline" label="Can delete inline">
        <Select disabled={props.readOnly} options={yesNoInheritOptions} />
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
        <ConfigurableActionConfigurator editorConfig={null} level={1} label="On Row Dropped Action"/>
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
