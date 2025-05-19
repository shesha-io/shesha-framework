import React, {
  FC,
  useState
} from 'react';
import {
  Alert,
  App,
  Button,
  Modal,
  Tabs,
  Typography
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
  environment,
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

  const hasValue = value && typeof (value) === 'string' && Boolean(value?.trim());

  const onClear = () => {
    if (hasValue) {
      modal.confirm({
        title: 'Clear code editor?',
        icon: <ExclamationCircleFilled />,
        content: 'If you clear the code editor, the changes will be lost and the editor will be closed',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk() {
          setInternalValue(null);
          setShowDialog(false);
          if (props.onChange) props.onChange(null);
        }
      });
    }
  };

  const onDialogSave = () => {
    if (props.onChange) props.onChange(internalValue);
    setShowDialog(false);
  };

  const openEditorDialog = () => setShowDialog(true);

  const onDialogCancel = () => {
    if (!readOnly && (value ?? "").trim() !== (internalValue ?? "").trim()) {
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
      resultType={props.resultType}
      style={mode === 'dialog' ? { height: "100%" } : undefined}
      environment={environment}
    />
  );

  if (props.hidden) return null;
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

  const buttonValue = value?.replace('return', '').replace(/;+$/, "");;

  return readOnly && !hasValue
    ? (<Typography.Text disabled>No Code</Typography.Text>)
    : (
      <>
        <Button
          className={props.className}
          size="small"
          onClick={openEditorDialog}
          style={hasValue ? { fontFamily: 'monospace', fontSize: '12px', width: '100%' } : { width: '100%' }}
        >
          {<><CodeOutlined /> {hasValue ? buttonValue : '...'}</>}
        </Button>
        {showDialog && (
          <Modal
            open={showDialog}
            onCancel={onDialogCancel}
            onOk={onDialogSave}
            closable={true}
            title={props.label}
            okButtonProps={{ hidden: readOnly }}
            cancelText={readOnly ? 'Close' : undefined}
            destroyOnClose={true}
            classNames={{ body: styles.codeEditorModalBody }}
            className={styles.codeEditorModal}
            width={null}
            footer={[
              hasValue && <Button key="clear" danger onClick={onClear} disabled={readOnly}>
                Clear
              </Button>,
              <Button key="cancel" onClick={onDialogCancel}>
                {readOnly ? 'Close' : 'Cancel'}
              </Button>,
              !readOnly && (
                <Button key="ok" type="primary" onClick={onDialogSave}>
                  OK
                </Button>
              ),
            ]}
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
          </Modal>
        )}
      </>
    );
};