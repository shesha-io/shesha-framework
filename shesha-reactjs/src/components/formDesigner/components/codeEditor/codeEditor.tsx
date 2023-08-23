import React, { FC, Fragment, useMemo, useState } from 'react';
import { useMetadata } from '../../../../providers';
import { Show } from '../../../..';
import { Alert, Button, Modal, Space, Tabs } from 'antd';
import { CodeOutlined } from '@ant-design/icons';
import { ICodeEditorProps } from './interfaces';
import { CodeVariablesTables } from '../../../codeVariablesTable';
import { CodeEditor as BaseCodeEditor } from 'components/codeEditor';
import { useDataContextManager } from 'providers/dataContextManager';
import { ICodeTreeLevel } from 'components/codeEditor/utils';
import { getContextMetadata, getFormDataMetadata } from './utils';

const { TabPane } = Tabs;

export const CodeEditor: FC<ICodeEditorProps> = ({
  mode = 'inline',
  value,
  language = 'javascript',
  exposedVariables,
  disabled = false,
  readOnly = false,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState<string>(value); // stores value for the `dialog` mode
  const [showDialog, setShowDialog] = useState(false);

  const onChange = (_value) => {
    switch (mode) {
      case 'inline': {
        if (props.onChange) props.onChange(_value);
        break;
      }
      case 'dialog': {
        setInternalValue(_value);
        break;
      }
    }
  };
  const onClear = () => {
    setInternalValue(null);
    if (props.onChange) props.onChange(null);
  };
  const meta = useMetadata(false);
  const dataContextManager = useDataContextManager(false);

  const metaItems = useMemo<ICodeTreeLevel>(() => getFormDataMetadata(meta?.metadata), [meta]);
  const ctxItems = useMemo<ICodeTreeLevel>(() => getContextMetadata(dataContextManager?.getDataContexts(dataContextManager?.getActiveContext()?.id)), [dataContextManager.lastUpdate]);

  const editorProps: any = {};
  if (!exposedVariables || exposedVariables.find(x => x.name === 'data'))
    editorProps.shaMetadata = metaItems;
  if (!exposedVariables || exposedVariables.find(x => x.name === 'contexts'))
    editorProps.shaContext = ctxItems;

  const openEditorDialog = () => setShowDialog(true);

  const onDialogCancel = () => {
    setInternalValue(value);
    setShowDialog(false);
  };
  const onDialogSave = () => {
    if (props.onChange) props.onChange(internalValue);
    setShowDialog(false);
  };

  const aceOptions = props?.setOptions || {};

  const effectiveValue = mode === 'inline' ? value : internalValue;
  const renderCodeEditor = () => (
    <BaseCodeEditor
      name={props.id}
      style={{ width: 'unset' }}
      placeholder={props.placeholder}
      mode={language}
      theme="monokai"
      onChange={onChange}
      fontSize={14}
      showPrintMargin={true}
      showGutter={true}
      highlightActiveLine={true}
      value={effectiveValue}
      setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: false,
        showLineNumbers: true,
        tabSize: 2,
        autoScrollEditorIntoView: true,
        minLines: 3,
        maxLines: 100,
        readOnly: disabled || readOnly,
        ...aceOptions,
      }}
      editorProps={editorProps}
    />
  );

  const hasValue = Boolean(value?.trim());

  return (
    <Fragment>
      <Show when={mode === 'inline'}>{renderCodeEditor()}</Show>

      <Show when={mode === 'dialog'}>
        <Space>
          <Button icon={<CodeOutlined />} onClick={openEditorDialog} size="small">
            {disabled || readOnly ? 'View Code' : hasValue ? 'Edit in Code Editor' : 'Create in Code Editor'}
          </Button>
          <Show when={hasValue && !readOnly}>
            <Button type="primary" size="small" danger onClick={onClear}>
              Clear
            </Button>
          </Show>
        </Space>
      </Show>

      <Modal
        open={showDialog}
        onCancel={onDialogCancel}
        onOk={onDialogSave}
        width={900}
        title={props.label}
        okButtonProps={{ hidden: disabled || readOnly }}
        cancelText={disabled || readOnly ? 'Close' : undefined}
      >
        <Show when={!!props?.description}>
          <Alert message={props?.description} />
          <br />
        </Show>

        {exposedVariables?.length ? (
          <Tabs>
            <TabPane tab="Code" key="code">
              {renderCodeEditor()}
            </TabPane>
            <TabPane tab="Variables" key="variable">
              <CodeVariablesTables data={exposedVariables} />
            </TabPane>
          </Tabs>
        ) : (
          <Fragment>{renderCodeEditor()}</Fragment>
        )}
      </Modal>
    </Fragment>
  );
};

export default CodeEditor;
