import React, { useState } from 'react';
import { Form, Select, AutoComplete } from 'antd';
//import { ColumnsEditorModal } from './columnsEditor/columnsEditorModal';
import SectionSeparator from '../../../sectionSeparator';
import CodeEditor from '../codeEditor/codeEditor';
import PropertyAutocomplete from '../../../propertyAutocomplete/propertyAutocomplete';
import { FormSelectionMode, IDataListComponentProps } from '../../../dataList/models';
import { Option } from 'antd/lib/mentions';
import FormAutocomplete from '../../../formAutocomplete';

export interface IProps {
  readOnly: boolean;
  model: IDataListComponentProps;
  onSave: (model: IDataListComponentProps) => void;
  onCancel: () => void;
  onValuesChange?: (changedValues: any, values: IDataListComponentProps) => void;
}

const formTypes = ['Table', 'Create', 'Edit', 'Details', 'Quickview', 'ListItem', 'Picker'];

function DataListSettings(props: IProps) {
  const [form] = Form.useForm();

  const initialState: IDataListComponentProps = {
    ...props?.model,
  };

  const [state, setState] = useState<IDataListComponentProps>(initialState);
  const [formTypesOptions, setFormTypesOptions] = useState<{ value: string }[]>(
    formTypes.map(i => {
      return { value: i };
    })
  );

  const onValuesChange = (changedValues, values: IDataListComponentProps) => {
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

      {/*<Button onClick={toggleColumnsModal}>{props.readOnly ? 'View Properties' : 'Customize Properties'}</Button>

      <Form.Item name="properties">
        <ColumnsEditorModal
          visible={state?.showColumnsModal}
          hideModal={toggleColumnsModal}
          readOnly={props.readOnly}
        />
      </Form.Item>*/}

      <SectionSeparator title="Selection" />

      <Form.Item name="selectionMode" label="Selection mode">
        <Select disabled={props.readOnly} defaultValue={'none'}>
          <Option key='1' value='none'>None</Option>
          <Option key='2' value='single'>Single</Option>
          <Option key='3' value='multiple'>Multiple</Option>
        </Select>
      </Form.Item>

      <SectionSeparator title="Render" />

      <Form.Item name="formSelectionMode" label="Form selection mode">
        <Select disabled={props.readOnly} defaultValue={'none'} onChange={(item) => {
 setState({...state, formSelectionMode: (item as FormSelectionMode)}); 
}}>
          <Option key='name' value='name'>Named form</Option>
          <Option key='view' value='view'>View type</Option>
          <Option key='expression' value='expression'>Expression</Option>
        </Select>
      </Form.Item>

      {state.formSelectionMode === 'name' &&
      <Form.Item name="formId" label="Form">
        <FormAutocomplete convertToFullId={true} readOnly={props.readOnly} />
      </Form.Item>
      }

      {state.formSelectionMode === 'view' &&
      <Form.Item name="formType" label="formType">
        <AutoComplete
          disabled={props.readOnly}
          options={formTypesOptions}
          onSearch={t =>
            setFormTypesOptions(
              (t
                ? formTypes.filter(f => {
                    return f.toLowerCase().includes(t.toLowerCase());
                  })
                : formTypes
              ).map(i => {
                return { value: i };
              })
            )
          }
        />
      </Form.Item>
      }

      {state.formSelectionMode === 'expression' && 
      <Form.Item name="formIdExpression" label="Form identifer expression">
        <CodeEditor
          readOnly={props.readOnly}
          mode="dialog"
          setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
          name="formIdExpression"
          type={''}
          id={''}
          label="Form identifer expression"
          description="Enter code to get form identifier. You must return { name: string; module?: string; version?: number; } object. The global variable data is provided, and allows you to access the data of any form component, by using its API key."
          exposedVariables={[
            { "name": "item", "description": "List item", "type": "object" },
          ]}
        />
    </Form.Item>
    }

      <Form.Item name="customVisibility" label="Custom visibility">
        <CodeEditor
          readOnly={props.readOnly}
          mode="dialog"
          setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
          name="customVisibility"
          type={''}
          id={''}
          label="Custom visibility"
          description="Enter custom visibility code. You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key."
          exposedVariables={[
            { "name": "value", "description": "Component current value", "type": "string | any" },
            { "name": "data", "description": "Selected form values", "type": "object" }            
          ]}
        />
      </Form.Item>
    </Form>
  );
}

export default DataListSettings;
