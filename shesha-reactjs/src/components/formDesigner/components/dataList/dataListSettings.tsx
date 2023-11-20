import React, { FC, useState } from 'react';
import { Select, AutoComplete, InputNumber, Input, Checkbox } from 'antd';
import SectionSeparator from '../../../sectionSeparator';
import CodeEditor from '../codeEditor/codeEditor';
import { IDataListComponentProps } from '../../../dataList/models';
import FormAutocomplete from '../../../formAutocomplete';
import Show from 'components/show';
import { ISettingsFormFactoryArgs } from 'interfaces';
import SettingsForm, { useSettingsForm } from '../../../../designer-components/_settings/settingsForm';
import SettingsFormItem from '../../../../designer-components/_settings/settingsFormItem';
import { ConfigurableActionConfigurator } from 'src/designer-components/configurableActionsConfigurator/configurator';

const formTypes = ['Table', 'Create', 'Edit', 'Details', 'Quickview', 'ListItem', 'Picker'];

export const DataListSettingsForm: FC<ISettingsFormFactoryArgs<IDataListComponentProps>> = (props) => {
  return (
    SettingsForm<IDataListComponentProps>({...props, children: <DataListSettings {...props}/>})
  );
};

const DataListSettings: FC<ISettingsFormFactoryArgs<IDataListComponentProps>> = ({readOnly}) => {
  const { model: state } = useSettingsForm<IDataListComponentProps>();

  /*const dataSourcesDict = useDataSources()?.getDataSources() ?? {};
  const dataSources: IDataSourceDescriptor[] = [];
  for (let key in dataSourcesDict) {
    dataSources.push(dataSourcesDict[key] as IDataSourceDescriptor);
  }*/

  //const [state, setState] = useState<IDataListComponentProps>(initialState);
  const [formTypesOptions, setFormTypesOptions] = useState<{ value: string }[]>(
    formTypes.map(i => {
      return { value: i };
    })
  );

  return (
    <>
      <SettingsFormItem name="componentName" label="Component name" required>
        <Input readOnly={readOnly}/>
      </SettingsFormItem>

      {/*<SettingsFormItem name="dataSource" label="Data Source">
        <Select disabled={props.readOnly}>
          <Option key='-1' value={null}>Data context</Option>
          {dataSources.map((item, index) => {
            return <Option key={index.toString()} value={`${item.id}_${item.name}`}>{item.name}</Option>
          })}         
        </Select>
        </SettingsFormItem>
      
        <Button onClick={toggleColumnsModal}>{props.readOnly ? 'View Properties' : 'Customize Properties'}</Button>

      <SettingsFormItem name="properties">
        <ColumnsEditorModal
          visible={state?.showColumnsModal}
          hideModal={toggleColumnsModal}
          readOnly={props.readOnly}
        />
      </SettingsFormItem>*/}

      <SettingsFormItem name="actionConfiguration">
        <ConfigurableActionConfigurator
          editorConfig={null}
          level={1}
          label="On Double Click"
          readOnly={readOnly}
        />
      </SettingsFormItem>

      <SectionSeparator title="Selection" />

      <SettingsFormItem name="selectionMode" label="Selection mode" jsSetting>
        <Select disabled={readOnly} defaultValue={'none'}>
          <Select.Option key='1' value='none'>None</Select.Option>
          <Select.Option key='2' value='single'>Single</Select.Option>
          <Select.Option key='3' value='multiple'>Multiple</Select.Option>
        </Select>
      </SettingsFormItem>

      <SectionSeparator title="Render" />

      <SettingsFormItem name="formSelectionMode" label="Form selection mode">
        <Select disabled={readOnly} defaultValue={'none'}>
          <Select.Option key='name' value='name'>Named form</Select.Option>
          <Select.Option key='view' value='view'>View type</Select.Option>
          <Select.Option key='expression' value='expression'>Expression</Select.Option>
        </Select>
      </SettingsFormItem>

      {state.formSelectionMode === 'name' &&
      <SettingsFormItem name="formId" label="Form">
        <FormAutocomplete convertToFullId={true} readOnly={readOnly} />
      </SettingsFormItem>
      }

      {state.formSelectionMode === 'view' &&
        <SettingsFormItem name="formType" label="formType" jsSetting>
          <AutoComplete
            disabled={readOnly}
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
        </SettingsFormItem>
      }

      {state.formSelectionMode === 'expression' && 
        <SettingsFormItem name="formIdExpression" label="Form identifer expression">
          <CodeEditor
            readOnly={readOnly}
            mode="dialog"
            setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
            propertyName="formIdExpression"
            label="Form identifer expression"
            description="Enter code to get form identifier. You must return { name: string; module?: string; version?: number; } object. The global variable data is provided, and allows you to access the data of any form component, by using its API key."
            exposedVariables={[
              { name: "item", description: "List item", type: "object" },
              { name: "data", description: "Selected form values", type: "object" },
              { name: "contexts", description: "Contexts data", type: "object" },
              { name: "globalState", description: "Global state", type: "object" },
              { name: "setGlobalState", description: "Functiont to set globalState", type: "function" },
              { name: "formMode", description: "Form mode", type: "object" },
              { name: "staticValue", description: "Static value of this setting", type: "any" },
              { name: "getSettingValue", description: "Functiont to get actual setting value", type: "function" },
              { name: "form", description: "Form instance", type: "object" },
              { name: "selectedRow", description: "Selected row of nearest table (null if not available)", type: "object" },
              { name: "moment", description: "moment", type: "object" },
              { name: "http", description: "axiosHttp", type: "object" },
              { name: "message", description: "message framework", type: "object" },
          ]}
          />
        </SettingsFormItem>
      }

      <SettingsFormItem name="orientation" label="Orientation" jsSetting>
        <Select disabled={readOnly} defaultValue="vertical">
          <Select.Option key={1} value="vertical">Vertical</Select.Option>
          <Select.Option key={2} value="horizontal">Horizontal</Select.Option>
        </Select>
      </SettingsFormItem>

      <Show when={state?.orientation === 'horizontal'}>
        <SettingsFormItem name="listItemWidth" label="List Item Width">
          <Select disabled={readOnly} defaultValue={1}>
            <Select.Option key={1} value={1}>100%</Select.Option>
            <Select.Option key={2} value={0.5}>50%</Select.Option>
            <Select.Option key={3} value={0.33}>33%</Select.Option>
            <Select.Option key={4} value={0.25}>25%</Select.Option>
            <Select.Option key={5} value="custom">(Custom)</Select.Option>
          </Select>
        </SettingsFormItem>

        <Show when={state?.listItemWidth === 'custom'}>
          <SettingsFormItem name="customListItemWidth" label="Custom List Item Width (px)">
            <InputNumber readOnly={readOnly}/>
          </SettingsFormItem>
        </Show>
      </Show>
  
      <SettingsFormItem name="hidden" label="Hidden" valuePropName='checked' jsSetting>
          <Checkbox disabled={readOnly} />
      </SettingsFormItem>

      <SectionSeparator title="Grouping" />

      <SettingsFormItem name="collapsible" label="Collapsible" valuePropName='checked' jsSetting>
          <Checkbox disabled={readOnly} />
      </SettingsFormItem>

      <SettingsFormItem name="collapseByDefault" label="Collapse by default" valuePropName='checked' jsSetting>
          <Checkbox disabled={readOnly} />
      </SettingsFormItem>

      <SettingsFormItem name="groupStyle" label="Style of group headers">
          <CodeEditor
            readOnly={readOnly}
            mode="dialog"
            setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
            propertyName="groupStyle"
            label="Style of group headers"
            //description="Enter code to get form identifier. You must return { name: string; module?: string; version?: number; } object. The global variable data is provided, and allows you to access the data of any form component, by using its API key."
            exposedVariables={[
              { name: "data", description: "Selected form values", type: "object" },
            ]}
          />
        </SettingsFormItem>
    </>
  );
};