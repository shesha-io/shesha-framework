import React, { FC, Fragment, useMemo, useState } from 'react';
import { useMetadata } from '../../../../providers';
import { CodeEditor as BaseCodeEditor, Show } from '../../../..';
import { ICodeTreeLevel } from '../../../codeEditor/codeCompleter';
import { IPropertyMetadata } from '../../../../interfaces/metadata';
import { Alert, Button, Modal, Tabs } from 'antd';
import { CodeOutlined } from '@ant-design/icons';
import { ICodeEditorProps } from './models';
import { CodeVariablesTables } from '../../../codeVariablesTable';

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
  const [showDialog, setShowDialog] = useState(false);

  const onChange = _value => {
    if (props.onChange) props.onChange(_value);
  };
  const meta = useMetadata(false);

  const metaItems = useMemo<ICodeTreeLevel>(() => {
    if (!Boolean(meta?.metadata)) return null;

    const propsToLevel = (properties: IPropertyMetadata[]): ICodeTreeLevel => {
      const result: ICodeTreeLevel = {};
      properties.forEach(p => {
        result[p.path] = {
          value: p.path,
          caption: p.label,
          loaded: true,
        };
      });
      return result;
    };

    const metaTree: ICodeTreeLevel = {
      data: {
        value: 'data',
        caption: meta.metadata.name,
        loaded: true,
        childs: propsToLevel(meta.metadata.properties),
      },
    };
    return metaTree;
  }, [meta]);

  const editorProps = {
    shaMetadata: metaItems,
  };

  const openEditorDialog = () => setShowDialog(true);

  const closeEditorDialog = () => setShowDialog(false);

  const aceOptions = props?.setOptions || {};

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
      value={value}
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

  return (
    <Fragment>
      <Show when={mode === 'inline'}>{renderCodeEditor()}</Show>

      <Show when={mode === 'dialog'}>
        <Button icon={<CodeOutlined />} onClick={openEditorDialog} size="small">
          {disabled || readOnly ? 'View Code' : 'Launch Code Editor'}
        </Button>
      </Show>

      <Modal
        open={showDialog}
        onCancel={closeEditorDialog}
        onOk={closeEditorDialog}
        width={810}
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
