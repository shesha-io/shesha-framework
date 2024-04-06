import { CodeEditor } from '../codeEditor/codeEditor';
import FormAutocomplete from '@/components/formAutocomplete';
import React, { FC, ReactNode, useState } from 'react';
import SettingsCollapsiblePanel from '@/designer-components/_settings/settingsCollapsiblePanel';
import SettingsForm, { useSettingsForm } from '@/designer-components/_settings/settingsForm';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import Show from '@/components/show';
import {
  AutoComplete,
  Checkbox,
  Input,
  InputNumber,
  Select
} from 'antd';
import { ConfigurableActionConfigurator } from '@/designer-components/configurableActionsConfigurator/configurator';
import { IDataListComponentProps } from './model';
import { InlineEditMode, InlineSaveMode } from '@/components/dataList/models';
import { ISettingsFormFactoryArgs, YesNoInherit } from '@/interfaces';
import { nanoid } from '@/utils/uuid';
import IconPicker, { ShaIconTypes } from '@/components/iconPicker';

const formTypes = ['Table', 'Create', 'Edit', 'Details', 'Quickview', 'ListItem', 'Picker'];

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
/*const rowCapturePositions: ITypedOption<NewListItemCapturePosition>[] = [
  { label: 'Top', value: 'top' },
  { label: 'Bottom', value: 'bottom' }
];*/

const NEW_ROW_EXPOSED_VARIABLES = [
  {
    id: nanoid(),
    name: 'formData',
    description: 'Form values',
    type: 'object',
  },
  {
    id: nanoid(),
    name: 'contexts',
    description: 'Contexts data',
    type: 'object',
  },
  {
    id: nanoid(),
    name: 'globalState',
    description: 'The global model of the application',
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
    description: 'Current list item data',
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
    name: 'contexts',
    description: 'Contexts data',
    type: 'object',
  },
  {
    id: nanoid(),
    name: 'globalState',
    description: 'The global model of the application',
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
    description: 'Current list item data',
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
    name: 'contexts',
    description: 'Contexts data',
    type: 'object',
  },
  {
    id: nanoid(),
    name: 'globalState',
    description: 'The global model of the application',
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

const DataListSettings: FC<ISettingsFormFactoryArgs<IDataListComponentProps>> = ({ readOnly }) => {
  const { model } = useSettingsForm<IDataListComponentProps>();

  /*const dataSourcesDict = useDataSources()?.getDataSources() ?? {};
  const dataSources: IDataSourceDescriptor[] = [];
  for (let key in dataSourcesDict) {
    dataSources.push(dataSourcesDict[key] as IDataSourceDescriptor);
  }*/

  //const [model, setmodel] = usemodel<IDataListComponentProps>(initialmodel);
  const [formTypesOptions, setFormTypesOptions] = useState<{ value: string }[]>(
    formTypes.map(i => {
      return { value: i };
    })
  );

  return (
    <>
      <SettingsFormItem name="componentName" label="Component name" required>
        <Input readOnly={readOnly} />
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
          visible={model?.showColumnsModal}
          hideModal={toggleColumnsModal}
          readOnly={props.readOnly}
        />
      </SettingsFormItem>*/}

      <SettingsFormItem name="dblClickActionConfiguration">
        <ConfigurableActionConfigurator
          editorConfig={null}
          level={1}
          label="On Double Click"
          readOnly={readOnly}
        />
      </SettingsFormItem>

      <SettingsFormItem name="selectionMode" label="Selection mode" jsSetting>
        <Select disabled={readOnly} defaultValue={'none'}>
          <Select.Option key='1' value='none'>None</Select.Option>
          <Select.Option key='2' value='single'>Single</Select.Option>
          <Select.Option key='3' value='multiple'>Multiple</Select.Option>
        </Select>
      </SettingsFormItem>

      <SettingsCollapsiblePanel header="Render">
        <SettingsFormItem name="formSelectionMode" label="Form selection mode">
          <Select disabled={readOnly} defaultValue={'none'}>
            <Select.Option key='name' value='name'>Named form</Select.Option>
            <Select.Option key='view' value='view'>View type</Select.Option>
            <Select.Option key='expression' value='expression'>Expression</Select.Option>
          </Select>
        </SettingsFormItem>

        {model.formSelectionMode === 'name' &&
          <SettingsFormItem name="formId" label="Form">
            <FormAutocomplete convertToFullId={true} readOnly={readOnly} />
          </SettingsFormItem>
        }

        {model.formSelectionMode === 'view' &&
          <SettingsFormItem name="formType" label="Form type" jsSetting>
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

        {model.formSelectionMode === 'expression' &&
          <SettingsFormItem name="formIdExpression" label="Form identifier expression">
            <CodeEditor
              readOnly={readOnly}
              mode="dialog"
              propertyName="formIdExpression"
              label="Form identifier expression"
              description="Enter code to get form identifier. You must return { name: string; module?: string; version?: number; } object. The global variable data is provided, and allows you to access the data of any form component, by using its API key."
              exposedVariables={[
                { name: "item", description: "List item", type: "object" },
                { name: "data", description: "Selected form values", type: "object" },
                { name: "contexts", description: "Contexts data", type: "object" },
                { name: "globalmodel", description: "Global model", type: "object" },
                { name: "setGlobalmodel", description: "Functiont to set globalmodel", type: "function" },
                { name: "formMode", description: "Form mode", type: "object" },
                { name: "form", description: "Form instance", type: "object" },
                { name: "selectedListItem", description: "Selected list item of nearest table (null if not available)", type: "object" },
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

        <Show when={model?.orientation === 'horizontal'}>
          <SettingsFormItem name="listItemWidth" label="List Item Width">
            <Select disabled={readOnly} defaultValue={1}>
              <Select.Option key={1} value={1}>100%</Select.Option>
              <Select.Option key={2} value={0.5}>50%</Select.Option>
              <Select.Option key={3} value={0.33}>33%</Select.Option>
              <Select.Option key={4} value={0.25}>25%</Select.Option>
              <Select.Option key={5} value="custom">(Custom)</Select.Option>
            </Select>
          </SettingsFormItem>

          <Show when={model?.listItemWidth === 'custom'}>
            <SettingsFormItem name="customListItemWidth" label="Custom List Item Width (px)">
              <InputNumber readOnly={readOnly} />
            </SettingsFormItem>
          </Show>
        </Show>

        <SettingsFormItem name="hidden" label="Hidden" valuePropName='checked' jsSetting>
          <Checkbox disabled={readOnly} />
        </SettingsFormItem>
      </SettingsCollapsiblePanel>

      <SettingsCollapsiblePanel header="CRUD">
        <SettingsFormItem name="canEditInline" label="Can edit inline" jsSetting>
          <Select disabled={readOnly} options={yesNoInheritOptions} />
        </SettingsFormItem>
        <SettingsFormItem name="inlineEditMode" label="List edit mode" hidden={model.canEditInline === 'no'}>
          <Select disabled={readOnly} options={inlineEditModes} />
        </SettingsFormItem>
        <SettingsFormItem name="inlineSaveMode" label="Save mode" hidden={model.canEditInline === 'no'}>
          <Select disabled={readOnly} options={inlineSaveModes} />
        </SettingsFormItem>
        <SettingsFormItem name="customUpdateUrl" label="Custom update url" hidden={model.canEditInline === 'no'}>
          <Input readOnly={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="canAddInline" label="Can add inline" jsSetting>
          <Select disabled={readOnly} options={yesNoInheritOptions} />
        </SettingsFormItem>

        {model.formSelectionMode !== 'view' && model.canAddInline !== 'no' &&
          <SettingsFormItem name="createFormId" label="Create form" jsSetting >
            <FormAutocomplete convertToFullId={true} readOnly={readOnly} />
          </SettingsFormItem>
        }

        {model.formSelectionMode === 'view' && model.canAddInline !== 'no' &&
          <SettingsFormItem name="createFormType" label="Create form type" jsSetting>
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
        {model.canAddInline !== 'no' &&
          <SettingsFormItem name="modalWidth" label="Dialog Width (%)">
            <Select disabled={readOnly} allowClear>
              <Select.Option key={1} value='40%'>Small</Select.Option>
              <Select.Option key={2} value='60%'>Medium</Select.Option>
              <Select.Option key={3} value='80%'>Large</Select.Option>
              <Select.Option key={4} value="custom">Custom</Select.Option>
            </Select>
          </SettingsFormItem>
        }
        {model.canAddInline !== 'no' && model.modalWidth === 'custom' &&
          <SettingsFormItem name="widthUnits" label="Units">
            <Select disabled={readOnly} allowClear>
              <Select.Option key={1} value='%'>Percentage (%)</Select.Option>
              <Select.Option key={2} value='px'>'Pixels (px)</Select.Option>
            </Select>
          </SettingsFormItem>
        }
        {model.canAddInline !== 'no' && model.modalWidth === 'custom' && !!model.widthUnits &&
          <SettingsFormItem name="customWidth" label="Enter Custom Width">
            <InputNumber disabled={readOnly} />
          </SettingsFormItem>
        }
        {
          //<SettingsFormItem name="newListItemInsertPosition" label="New list item insert position" /*hidden={canAddInline === 'no'}*/ hidden={true} /* note: hidden until review of rows drag&drop */>
          //  <Select disabled={readOnly} options={rowCapturePositions} />
          //</SettingsFormItem>
        }
        <SettingsFormItem name="customCreateUrl" label="Custom create url" hidden={model.canAddInline === 'no'}>
          <Input readOnly={readOnly} />
        </SettingsFormItem>
        <SettingsFormItem
          label="New list item init"
          name="onNewListItemInitialize"
          tooltip="Allows configurators to specify logic to initialise the object bound to a new list item."
          hidden={model.canAddInline === 'no'}
        >
          <CodeEditor
            propertyName="onNewListItemInitialize"
            readOnly={readOnly}
            mode="dialog"
            label="New list item init"
            description="Specify logic to initialise the object bound to a new list item. This handler should return an object or a Promise<object>."
            exposedVariables={NEW_ROW_EXPOSED_VARIABLES}
          />
        </SettingsFormItem>
        <SettingsFormItem
          label="On list item save"
          name="onListItemSave"
          tooltip="Custom business logic to be executed on saving of new/updated list item (e.g. custom validation / calculations). This handler should return an object or a Promise<object>."
          hidden={model.canAddInline === 'no' && model.canEditInline === 'no'}
        >
          <CodeEditor
            propertyName="onListItemSave"
            readOnly={readOnly}
            mode="dialog"
            label="On list item save"
            description="Allows custom business logic to be executed on saving of new/updated list item (e.g. custom validation / calculations)."
            exposedVariables={ROW_SAVE_EXPOSED_VARIABLES}
          />
        </SettingsFormItem>
        <SettingsFormItem
          name="onListItemSaveSuccessAction" labelCol={{ span: 0 }} wrapperCol={{ span: 24 }}
          hidden={model.canAddInline === 'no' && model.canEditInline === 'no'}
        >
          <ConfigurableActionConfigurator
            editorConfig={null}
            level={1}
            label="On list item save success"
            description="Custom business logic to be executed after successfull saving of new/updated list item."
            exposedVariables={ROW_SAVED_SUCCESS_EXPOSED_VARIABLES}
          />
        </SettingsFormItem>
        <SettingsFormItem name="canDeleteInline" label="Can delete inline" jsSetting>
          <Select disabled={readOnly} options={yesNoInheritOptions} />
        </SettingsFormItem>
        <SettingsFormItem name="customDeleteUrl" label="Custom delete url" hidden={model.canDeleteInline === 'no'}>
          <Input readOnly={readOnly} />
        </SettingsFormItem>
      </SettingsCollapsiblePanel>

      <SettingsCollapsiblePanel header="Grouping">
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
            propertyName="groupStyle"
            label="Style of group headers"
            //description="Enter code to get form identifier. You must return { name: string; module?: string; version?: number; } object. The global variable data is provided, and allows you to access the data of any form component, by using its API key."
            exposedVariables={[
              { name: "data", description: "Selected form values", type: "object" },
            ]}
          />
        </SettingsFormItem>
      </SettingsCollapsiblePanel>

      <SettingsCollapsiblePanel header='Empty List'>
    <SettingsFormItem name="noDataText" label="No Data Primary Text" jsSetting>
        <Input defaultValue={"No Data"} readOnly={readOnly} />
      </SettingsFormItem>
      
      <SettingsFormItem name="noDataSecondaryText" label="No Data Secondary Text" jsSetting>
        <Input value={"No data is available for this list"} readOnly={readOnly} />
      </SettingsFormItem>

      <SettingsFormItem name="noDataIcon" label="Icon Picker">
      {(value, onChange)=>
         <IconPicker label='Icon Picker' value={value} onIconChange={(_icon: ReactNode, iconName: ShaIconTypes) => onChange(iconName)} /> 
      }
      </SettingsFormItem>
      </SettingsCollapsiblePanel>

      
    </>
  );
};

export const DataListSettingsForm: FC<ISettingsFormFactoryArgs<IDataListComponentProps>> = (props) => {
  return (
    SettingsForm<IDataListComponentProps>({ ...props, children: <DataListSettings {...props} /> })
  );
};