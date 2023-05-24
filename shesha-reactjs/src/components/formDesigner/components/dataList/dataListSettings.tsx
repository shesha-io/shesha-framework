import React, { useState } from 'react';
import { Form, Select, AutoComplete, InputNumber } from 'antd';
import SectionSeparator from '../../../sectionSeparator';
import CodeEditor from '../codeEditor/codeEditor';
import PropertyAutocomplete from '../../../propertyAutocomplete/propertyAutocomplete';
import { FormSelectionMode, IDataListComponentProps, ListItemWidth, Orientation } from '../../../dataList/models';
import FormAutocomplete from '../../../formAutocomplete';
import Show from 'components/show';

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

  /*const dataSourcesDict = useDataSources()?.getDataSources() ?? {};
  const dataSources: IDataSourceDescriptor[] = [];
  for (let key in dataSourcesDict) {
    dataSources.push(dataSourcesDict[key] as IDataSourceDescriptor);
  }*/
  const initialState: IDataListComponentProps = {
    ...props?.model,
  };

  const [state, setState] = useState<IDataListComponentProps>(initialState);
  const [formTypesOptions, setFormTypesOptions] = useState<{ value: string }[]>(
    formTypes.map(i => {
      return { value: i };
    })
  );

  return (
    <Form
      form={form}
      onFinish={props.onSave}
      onValuesChange={props.onValuesChange}
      initialValues={initialState}
      wrapperCol={{ span: 24 }}
      labelCol={{ span: 24 }}
    >
      {/*<Form.Item name="dataSource" label="Data Source">
        <Select disabled={props.readOnly}>
          <Option key='-1' value={null}>Data context</Option>
          {dataSources.map((item, index) => {
            return <Option key={index.toString()} value={`${item.id}_${item.name}`}>{item.name}</Option>
          })}         
        </Select>
        </Form.Item>*/}

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
          <Select.Option key='1' value='none'>None</Select.Option>
          <Select.Option key='2' value='single'>Single</Select.Option>
          <Select.Option key='3' value='multiple'>Multiple</Select.Option>
        </Select>
      </Form.Item>

      <SectionSeparator title="Render" />

      <Form.Item name="formSelectionMode" label="Form selection mode">
        <Select disabled={props.readOnly} defaultValue={'none'} onChange={(item) => {
          setState({...state, formSelectionMode: (item as FormSelectionMode)}); 
        }}>
          <Select.Option key='name' value='name'>Named form</Select.Option>
          <Select.Option key='view' value='view'>View type</Select.Option>
          <Select.Option key='expression' value='expression'>Expression</Select.Option>
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

      <Form.Item name="orientation" label="Orientation">
        <Select disabled={props.readOnly} defaultValue="vertical" onChange={(item) => {
          setState({...state, orientation: (item as Orientation)}); 
        }}>
          <Select.Option key={1} value="vertical">Vertical</Select.Option>
          <Select.Option key={2} value="horizontal">Horizontal</Select.Option>
        </Select>
      </Form.Item>

      <Show when={state?.orientation === 'horizontal'}>
        <Form.Item name="listItemWidth" label="List Item Width">
          <Select disabled={props.readOnly} defaultValue={1} onChange={(item) => {
            setState({...state, listItemWidth: (item as ListItemWidth)}); 
          }}>
            <Select.Option key={1} value={1}>100%</Select.Option>
            <Select.Option key={2} value={0.5}>50%</Select.Option>
            <Select.Option key={3} value={0.33}>33%</Select.Option>
            <Select.Option key={4} value={0.25}>25%</Select.Option>
            <Select.Option key={5} value="custom">(Custom)</Select.Option>
          </Select>
        </Form.Item>

        <Show when={state?.listItemWidth === 'custom'}>
          <Form.Item name="customListItemWidth" label="Custom List Item Width (px)">
            <InputNumber />
          </Form.Item>
        </Show>
      </Show>

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
