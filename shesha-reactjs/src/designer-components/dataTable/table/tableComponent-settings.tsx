import React, { FC, ReactNode } from 'react';
import { Select, Input, InputNumber } from 'antd';
import { ITableComponentProps } from './models';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import { CodeEditor } from '@/designer-components/codeEditor/codeEditor';
import { ConfigurableActionConfigurator } from '../../configurableActionsConfigurator/configurator';
import { YesNoInheritJs } from '@/components/dataTable/interfaces';
import { InlineEditMode, InlineSaveMode, NewRowCapturePosition } from '@/components/reactTable/interfaces';
import { nanoid } from '@/utils/uuid';
import { ISettingsFormFactoryArgs } from '@/interfaces';
import SettingsForm, { useSettingsForm } from '@/designer-components/_settings/settingsForm';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import SettingsCollapsiblePanel from '@/designer-components/_settings/settingsCollapsiblePanel';
import { IconPicker } from '@/index';
import { ShaIconTypes } from '@/components/iconPicker';
import { ColumnsConfig } from './columnsEditor/columnsConfig';
import { useAvailableConstantsMetadata } from '@/utils/metadata/useAvailableConstants';
import { SheshaConstants } from '@/utils/metadata/standardProperties';
import { PermissionAutocomplete } from '@/components/permissionAutocomplete';

interface ITypedOption<T = string> {
  label: React.ReactNode;
  value: T;
}
const yesNoInheritOptions: ITypedOption<YesNoInheritJs>[] = [
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

const TableSettings: FC<ISettingsFormFactoryArgs<ITableComponentProps>> = (props) => {
  const { readOnly } = props;
  
  const { model } = useSettingsForm<ITableComponentProps>();

  const crudConstants = useAvailableConstantsMetadata({ 
    addGlobalConstants: true,
    standardConstants: [
      SheshaConstants.globalState, SheshaConstants.formData, SheshaConstants.moment
    ]
  });

  const onNewRowInitializeConstants = useAvailableConstantsMetadata({ 
    addGlobalConstants: true,
    standardConstants: [
      SheshaConstants.globalState, SheshaConstants.form, SheshaConstants.moment, SheshaConstants.http
    ]
  });
  const onRowSaveConstants = useAvailableConstantsMetadata({ 
    addGlobalConstants: true,
    standardConstants: [
      SheshaConstants.globalState, SheshaConstants.form, SheshaConstants.moment, SheshaConstants.http
    ],
    onBuild: (builder) => {
      builder.addObject("data", "Current row data", undefined);
    }
  });

  const styleConstants = useAvailableConstantsMetadata({ 
    addGlobalConstants: false,
    standardConstants: [
      SheshaConstants.globalState, SheshaConstants.formData
    ]
  });

  return (
    <>
      <SettingsFormItem name="componentName" label="Component name">
        <Input readOnly={readOnly} />
      </SettingsFormItem>

      <SettingsFormItem name="items" label={readOnly ? "View columns" : "Customize columns"} jsSetting>
        <ColumnsConfig readOnly={readOnly} />
      </SettingsFormItem>

      <SettingsFormItem name="showExpandedView" label="Show Expanded View" valuePropName="checked" jsSetting>
        <Checkbox disabled={readOnly} />
      </SettingsFormItem>

      <SettingsFormItem name="useMultiselect" label="Use Multi-select" valuePropName="checked" jsSetting>
        <Checkbox disabled={readOnly} />
      </SettingsFormItem>

      <SettingsFormItem name="freezeHeaders" label="Freeze Headers" valuePropName="checked" jsSetting>
        <Checkbox disabled={readOnly} />
      </SettingsFormItem>


      <SettingsCollapsiblePanel header='CRUD'>
        <SettingsFormItem
          name="canEditInline"
          label="Can edit inline"
        // label={<>Can edit inline <Switch size="small" defaultChecked unCheckedChildren="static" checkedChildren="JS" style={{ marginLeft: '8px' }}/></>}
        >
          <Select disabled={readOnly} options={yesNoInheritOptions} />
        </SettingsFormItem>
        <SettingsFormItem name="canEditInlineExpression" label="Can edit inline expression" hidden={model.canEditInline !== 'js'}>
          <CodeEditor
            propertyName="canEditInlineExpression"
            readOnly={readOnly}
            mode="dialog"
            label="Can edit inline expression"
            description="Return true to enable inline editing and false to disable."
            exposedVariables={ENABLE_CRUD_EXPOSED_VARIABLES}
            wrapInTemplate={true}
            templateSettings={{
              functionName: 'canEditInlineExpression'
            }}
            availableConstants={crudConstants}
          />
        </SettingsFormItem>
        <SettingsFormItem name="inlineEditMode" label="Row edit mode" hidden={model.canEditInline === 'no'}>
          <Select disabled={readOnly} options={inlineEditModes} />
        </SettingsFormItem>
        <SettingsFormItem name="inlineSaveMode" label="Save mode" hidden={model.canEditInline === 'no'}>
          <Select disabled={readOnly} options={inlineSaveModes} />
        </SettingsFormItem>
        <SettingsFormItem name="customUpdateUrl" label="Custom update url" hidden={model.canEditInline === 'no'}>
          <Input readOnly={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="canAddInline" label="Can add inline">
          <Select disabled={readOnly} options={yesNoInheritOptions} />
        </SettingsFormItem>
        <SettingsFormItem name="canAddInlineExpression" label="Can add inline expression" hidden={model.canAddInline !== 'js'}>
          <CodeEditor
            propertyName="canAddInlineExpression"
            readOnly={readOnly}
            mode="dialog"
            label="Can add inline expression"
            description="Return true to enable inline creation of new rows and false to disable."
            exposedVariables={ENABLE_CRUD_EXPOSED_VARIABLES}
            wrapInTemplate={true}
            templateSettings={{
              functionName: 'canAddInlineExpression'
            }}
            availableConstants={crudConstants}
          />
        </SettingsFormItem>
        <SettingsFormItem name="newRowCapturePosition" label="New row capture position" hidden={model.canAddInline === 'no'}>
          <Select disabled={readOnly} options={rowCapturePositions} />
        </SettingsFormItem>
        <SettingsFormItem name="newRowInsertPosition" label="New row insert position" /*hidden={canAddInline === 'no'}*/ hidden={true} /* note: hidden until review of rows drag&drop */>
          <Select disabled={readOnly} options={rowCapturePositions} />
        </SettingsFormItem>
        <SettingsFormItem name="customCreateUrl" label="Custom create url" hidden={model.canAddInline === 'no'}>
          <Input readOnly={readOnly} />
        </SettingsFormItem>
        <SettingsFormItem
          label="New row init"
          name="onNewRowInitialize"
          tooltip="Allows configurators to specify logic to initialise the object bound to a new row."
          hidden={model.canAddInline === 'no'}
        >
          <CodeEditor
            propertyName="onNewRowInitialize"
            readOnly={readOnly}
            mode="dialog"
            label="New row init"
            description="Specify logic to initialise the object bound to a new row. This handler should return an object or a Promise<object>."
            exposedVariables={NEW_ROW_EXPOSED_VARIABLES}
            wrapInTemplate={true}
            templateSettings={{
              functionName: 'onNewRowInitialize'
            }}
            availableConstants={onNewRowInitializeConstants}
          />
        </SettingsFormItem>
        <SettingsFormItem
          label="On row save"
          name="onRowSave"
          tooltip="Custom business logic to be executed on saving of new/updated row (e.g. custom validation / calculations). This handler should return an object or a Promise<object>."
          hidden={model.canAddInline === 'no' && model.canEditInline === 'no'}
        >
          <CodeEditor
            propertyName="onRowSave"
            readOnly={readOnly}
            mode="dialog"
            label="On row save"
            description="Allows custom business logic to be executed on saving of new/updated row (e.g. custom validation / calculations)."
            exposedVariables={ROW_SAVE_EXPOSED_VARIABLES}
            wrapInTemplate={true}
            templateSettings={{
              functionName: 'onRowSave',
              useAsyncDeclaration: true,
            }}
            availableConstants={onRowSaveConstants}
          />
        </SettingsFormItem>
        <SettingsFormItem name="onRowSaveSuccessAction" labelCol={{ span: 0 }} wrapperCol={{ span: 24 }}>
          <ConfigurableActionConfigurator
            editorConfig={null}
            level={1}
            label="On row save success"
            description="Custom business logic to be executed after successfull saving of new/updated row."
            exposedVariables={ROW_SAVED_SUCCESS_EXPOSED_VARIABLES}
          />
        </SettingsFormItem>
        <SettingsFormItem name="canDeleteInline" label="Can delete inline">
          <Select disabled={readOnly} options={yesNoInheritOptions} />
        </SettingsFormItem>
        <SettingsFormItem name="canDeleteInlineExpression" label="Can delete inline expression" hidden={model.canDeleteInline !== 'js'}>
          <CodeEditor
            propertyName="canDeleteInlineExpression"
            readOnly={readOnly}
            mode="dialog"
            label="Can delete inline expression"
            description="Return true to enable inline deletion and false to disable."
            exposedVariables={ENABLE_CRUD_EXPOSED_VARIABLES}
            wrapInTemplate={true}
            templateSettings={{
              functionName: 'canDeleteInlineExpression'
            }}
            availableConstants={crudConstants}
          />
        </SettingsFormItem>
        <SettingsFormItem name="customDeleteUrl" label="Custom delete url" hidden={model.canDeleteInline === 'no'}>
          <Input readOnly={readOnly} />
        </SettingsFormItem>

      </SettingsCollapsiblePanel>
      <SettingsCollapsiblePanel header="Layout">
        <SettingsFormItem jsSetting
          name="minHeight" label="Min Height" tooltip="The minimum height of the table (e.g. even when 0 rows). If blank then minimum height is 0.">
          <InputNumber />
        </SettingsFormItem>

        <SettingsFormItem jsSetting
          name="maxHeight" label="Max Height" tooltip="The maximum height of the table. If left blank should grow to display all rows, otherwise should allow for vertical scrolling.">
          <InputNumber />
        </SettingsFormItem>

        <SettingsFormItem name="containerStyle" label="Table container style">
          <CodeEditor
            readOnly={readOnly}
            mode="dialog"
            propertyName="containerStyle"
            label="Table container style"
            description="The style that will be applied to the table container/wrapper"
            exposedVariables={[]}
            wrapInTemplate={true}
            templateSettings={{
              functionName: 'getContainerStyle'
            }}
            availableConstants={styleConstants}
          />
        </SettingsFormItem>

        <SettingsFormItem name="tableStyle" label="Table style">
          <CodeEditor
            readOnly={readOnly}
            mode="dialog"
            propertyName="tableStyle"
            label="Table style"
            description="The style that will be applied to the table"
            exposedVariables={[]}
            wrapInTemplate={true}
            templateSettings={{
              functionName: 'getTableStyle'
            }}
            availableConstants={styleConstants}
          />
        </SettingsFormItem>
      </SettingsCollapsiblePanel>

      <SettingsCollapsiblePanel header='Empty Table'>
        <SettingsFormItem name="noDataText" label="Primary Text" jsSetting>
          <Input readOnly={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="noDataSecondaryText" label="Secondary Text" jsSetting>
          <Input readOnly={readOnly} />
        </SettingsFormItem>

        <SettingsFormItem name="noDataIcon" label="Icon" jsSetting>
          {(value, onChange) =>
            <IconPicker label='Icon Picker' value={value} onIconChange={(_icon: ReactNode, iconName: ShaIconTypes) => onChange(iconName)} />
          }
        </SettingsFormItem>
      </SettingsCollapsiblePanel>

      <SettingsCollapsiblePanel header="Security">
        <SettingsFormItem
          jsSetting
          label="Permissions"
          name="permissions"
          initialValue={props.model.permissions}
          tooltip="Enter a list of permissions that should be associated with this component"
        >
          <PermissionAutocomplete readOnly={readOnly} />
        </SettingsFormItem>
      </SettingsCollapsiblePanel>
    </>
  );
};

const TableSettingsForm: FC<ISettingsFormFactoryArgs<ITableComponentProps>> = (props) => {
  return (
    SettingsForm<ITableComponentProps>({ ...props, children: <TableSettings {...props} /> })
  );
};

export default TableSettingsForm;
