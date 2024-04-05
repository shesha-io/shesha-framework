import React, {
  FC,
  useState
} from 'react';
import {
  Alert,
  App,
  Button,
  Modal,
  Space,
  Tabs
} from 'antd';
import { CodeEditor as BaseCodeEditor } from '@/components/codeEditor/codeEditor';
import { CodeOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { CodeVariablesTables } from '@/components/codeVariablesTable';
import { ICodeEditorProps } from './interfaces';
import { Show } from '@/components';
import { useSourcesFolder } from '@/providers/sourceFileManager/sourcesFolderProvider';
import type { TabsProps } from 'antd';
import { useStyles } from './styles';

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
  const { modal } = App.useApp();

  const src = useSourcesFolder(false);
  const { styles } = useStyles();

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
    if (!readOnly && value !== internalValue) {
      modal.confirm({
        title: 'Close code editor?',
        icon: <ExclamationCircleFilled />,
        content: 'Unsaved changes will be lost. Are you sure you want to cancel edit?',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk() {
          setInternalValue(value);
          setShowDialog(false);
        }
      });
    } else {
      setInternalValue(value);
      setShowDialog(false);
    }
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
      templateSettings={props.templateSettings}
      fileName={props.fileName ?? props.propertyName}
      availableConstants={props.availableConstants}
      style={mode === 'dialog' ? { height: "100%" } : undefined}
    />
  );

  const hasValue = value && typeof (value) === 'string' && Boolean(value?.trim());

  if (mode === 'inline')
    return renderCodeEditor();

  const tabItems: TabItem[] = exposedVariables?.length
    ? [
      {
        key: "code",
        label: "Code",
        children: (
          <div className={styles.codeEditorContainer}>
            {renderCodeEditor()}
          </div>
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
        title={props.label}
        okButtonProps={{ hidden: readOnly }}
        cancelText={readOnly ? 'Close' : undefined}
        destroyOnClose={true}
        classNames={{ body: styles.codeEditorModalBody }}
        className={ styles.codeEditorModal }
        width={null}
      >
        <Show when={Boolean(props?.description)}>
          <Alert message={props?.description} />
          <br />
        </Show>

        {tabItems ? (
          <Tabs items={tabItems} />
        ) : (
          <div className={styles.codeEditorContainer}>{renderCodeEditor()}</div>
        )}
      </Modal >
    </>
  );
};