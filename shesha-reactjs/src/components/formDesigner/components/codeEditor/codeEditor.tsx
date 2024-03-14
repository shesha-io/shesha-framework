import React, {
  FC,
  Fragment,
  useState
} from 'react';
import {
  Alert,
  Button,
  Modal,
  Space,
  Tabs
} from 'antd';
import { CodeEditor as BaseCodeEditor } from '@/components/codeEditor/codeEditor';
import { CodeOutlined } from '@ant-design/icons';
import { CodeVariablesTables } from '@/components/codeVariablesTable';
import { ICodeEditorProps } from './interfaces';
import { Show } from '@/components';
import { useSourcesFolder } from '@/providers/sourceFileManager/sourcesFolderProvider';
import type { TabsProps } from 'antd';

type TabItem = TabsProps['items'][number];

export const CodeEditor: FC<ICodeEditorProps> = ({
  mode = 'inline',
  value,
  exposedVariables,
  readOnly = false,
  language = 'typescript',
  ...props
}) => {
  const [internalValue, setInternalValue] = useState<string>(value); // stores value for the `dialog` mode
  const [showDialog, setShowDialog] = useState(false);

  const src = useSourcesFolder(false);

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

  const openEditorDialog = () => setShowDialog(true);

  const onDialogCancel = () => {
    setInternalValue(value);
    setShowDialog(false);
  };
  const onDialogSave = () => {
    if (props.onChange) props.onChange(internalValue);
    setShowDialog(false);
  };

  const effectiveValue = mode === 'inline' ? value : internalValue;

  const renderCodeEditor = () => (
    <BaseCodeEditor
      value={effectiveValue}
      onChange={onChange}
      readOnly={readOnly}
      placeholder={props.placeholder}
      language={language}

      path={src?.path}
      wrapInTemplate={props.wrapInTemplate}
      fileName={props.fileName}
      availableConstants={props.availableConstants}
    />
  );

  const hasValue = Boolean(value?.trim());

  if (mode === 'inline')
    return renderCodeEditor();

  const tabItems: TabItem[] = exposedVariables?.length
    ? [
      {
        key: "code",
        label: "Code",
        children: (
          <>
            {renderCodeEditor()}
          </>
        )
      },
      {
        key: "variable",
        label: "Variables",
        children: (<CodeVariablesTables data={exposedVariables} />)
      }
    ]
    : undefined;

  return (
    <>
      <Space>
        <Button icon={<CodeOutlined />} onClick={openEditorDialog} size="small">
          {readOnly ? 'View Code' : hasValue ? 'Edit in Code Editor' : 'Create in Code Editor'}
        </Button>
        <Show when={hasValue && !readOnly}>
          <Button type="primary" size="small" danger onClick={onClear}>
            Clear
          </Button>
        </Show>
      </Space>
      <Modal
        open={showDialog}
        onCancel={onDialogCancel}
        onOk={onDialogSave}
        width={900}
        title={props.label}
        okButtonProps={{ hidden: readOnly }}
        cancelText={readOnly ? 'Close' : undefined}
        keyboard={false} /*prevent close by Esc*/
      >
        <Show when={!!props?.description}>
          <Alert message={props?.description} />
          <br />
        </Show>

        {tabItems ? (
          <Tabs items={tabItems} />
        ) : (
          <Fragment>{renderCodeEditor()}</Fragment>
        )}
      </Modal>

    </>
  );
};

export default CodeEditor;
