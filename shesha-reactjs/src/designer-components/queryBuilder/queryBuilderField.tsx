import { CaretRightOutlined, FilterOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { JsonLogicResult } from '@react-awesome-query-builder/antd';
import { Alert, Button, Collapse, Modal, Space, Tabs, Tooltip } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { useMedia } from 'react-use';
import { CodeEditor } from '@/components/codeEditor/codeEditor';
import { IQueryBuilderFieldProps } from './models';
import { useStyles } from './styles/styles';
import { QueryBuilder } from '@/components/queryBuilder';
import { Show } from '@/components/show';

const queryBuilderTabKey = 'queryBuilderTab';
const jsonInputTabKey = 'jsonInputTab';
const baseQueryBuilderModalWidth = 1038;

export const QueryBuilderField: FC<IQueryBuilderFieldProps> = (props) => {
  const queryBuilderDocUrl = 'https://docs.shesha.io/docs/front-end-basics/form-components/tables-lists/datatable-context';
  const { styles } = useStyles();
  const [modalVisible, setModalVisible] = useState(false);
  const [jsonLogicResult, setJsonLogicResult] = useState<JsonLogicResult>(undefined);
  const [draftLogic, setDraftLogic] = useState<object>(props.value);
  const [builderErrors, setBuilderErrors] = useState<string[]>([]);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonInputError, setJsonInputError] = useState<string>(null);
  const [inlineJsonInput, setInlineJsonInput] = useState(props.value ? JSON.stringify(props.value, null, 2) : '');
  const [activeTab, setActiveTab] = useState(queryBuilderTabKey);
  const [jsonExpanded, setJsonExpanded] = useState(props.jsonExpanded ?? false);
  const isSmall = useMedia('(max-width: 480px)');
  const modalWidth = baseQueryBuilderModalWidth;
  const modalStyles = isSmall ? undefined : {
    content: {
      height: 585,
      padding: 30,
      boxSizing: 'border-box' as const,
      display: 'flex',
      flexDirection: 'column' as const,
    },
    header: {
      padding: 0,
      marginBottom: 16,
    },
    body: {
      padding: 0,
      flex: 1,
      minHeight: 0,
      overflow: 'auto',
    },
    footer: {
      padding: 0,
      marginTop: 16,
    },
  };

  const { readOnly = false, showJsonTestingTools = false } = props;

  useEffect(() => {
    if (!modalVisible) return;

    const nextValue = props.value ?? undefined;
    setDraftLogic(nextValue);
    setJsonLogicResult(undefined);
    setBuilderErrors([]);
    setJsonInput(nextValue ? JSON.stringify(nextValue, null, 2) : '');
    setJsonInputError(null);
    setActiveTab(queryBuilderTabKey);
  }, [modalVisible, props.value]);

  useEffect(() => {
    setInlineJsonInput(props.value ? JSON.stringify(props.value, null, 2) : '');
  }, [props.value]);

  const onOkClick = (): void => {
    if (builderErrors.length > 0) {
      setActiveTab(queryBuilderTabKey);
      return;
    }

    if (props.onChange)
      props.onChange(draftLogic ?? null);

    setModalVisible(false);
  };

  const onChange = (result: JsonLogicResult): void => {
    if (result !== jsonLogicResult) setJsonLogicResult(result);
    setBuilderErrors(result?.errors ?? []);
    setDraftLogic(result?.logic);
    setJsonInput(result?.logic ? JSON.stringify(result.logic, null, 2) : '');
    setJsonInputError(null);
  };

  const onExpandClick = (): void => {
    setJsonExpanded(!jsonExpanded);
  };

  const applyJson = (): void => {
    const text = jsonInput?.trim();
    if (!text) {
      setDraftLogic(undefined);
      setJsonInputError(null);
      setBuilderErrors([]);
      setActiveTab(queryBuilderTabKey);
      return;
    }

    try {
      const parsed = JSON.parse(text);
      if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object')
        throw new Error('JSON must be an object');

      setDraftLogic(parsed);
      setJsonInput(JSON.stringify(parsed, null, 2));
      setJsonInputError(null);
      setBuilderErrors([]);
      setActiveTab(queryBuilderTabKey);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid JSON';
      setJsonInputError(message);
    }
  };

  const hasValue = Boolean(props?.value);
  const actionButtons = (
    <Space>
      <Button type={readOnly ? 'default' : 'primary'} onClick={() => setModalVisible(true)} size="small">
        {`Query Builder ${hasValue ? '(applied)' : ''}`.trim()}
      </Button>

      <Show when={hasValue && !readOnly}>
        <Button
          type="primary"
          size="small"
          danger
          onClick={() => {
            if (props?.onChange) props.onChange(null);
          }}
        >
          Clear
        </Button>
      </Show>
    </Space>
  );
  const queryBuilderContent = (
    <>
      {builderErrors.length > 0 && (
        <Alert
          type="error"
          showIcon
          message="Query has validation errors"
          description={builderErrors.join('\n')}
          style={{ marginBottom: 8 }}
        />
      )}
      <QueryBuilder value={draftLogic} onChange={onChange} readOnly={readOnly} />
    </>
  );
  const jsonEditorContent = (
    <>
      <CodeEditor
        value={jsonInput}
        onChange={setJsonInput}
        readOnly={readOnly}
        language="javascript"
        style={{ minHeight: 260 }}
      />
      {jsonInputError && (
        <Alert
          type="error"
          showIcon
          message="Invalid JsonLogic JSON"
          description={jsonInputError}
          style={{ marginTop: 8 }}
        />
      )}
      {!readOnly && (
        <div style={{ marginTop: 8 }}>
          <Button type="primary" onClick={applyJson}>
            Apply JSON
          </Button>
        </div>
      )}
    </>
  );

  return (
    <div className={styles.shaQueryBuilderMarginTop8}>
      <Collapse
        className={styles.shaQueryBuilderField}
        activeKey={jsonExpanded ? '1' : null}
        expandIconPlacement="end"
        bordered={false}
        ghost={true}
        expandIcon={({ isActive }) =>
          isActive ? (
            <span onClick={onExpandClick}>
              hide json <CaretRightOutlined rotate={90} />
            </span>
          ) : (
            <span onClick={onExpandClick}>
              show json <CaretRightOutlined rotate={0} />
            </span>
          )}
        items={[
          {
            key: '1',
            label: actionButtons,
            children: (
              <CodeEditor
                readOnly={true}
                value={inlineJsonInput}
                language="javascript"
                style={{ marginTop: 8 }}
              />
            ),
          },
        ]}
      />
      <Modal
        open={modalVisible}
        width={modalWidth}
        styles={modalStyles}
        title={(
          <Space size={10} className={styles.shaQueryBuilderModalTitle}>
            <span className={styles.shaQueryBuilderModalTitleIcon}>
              <FilterOutlined />
            </span>
            <span>Query Builder</span>
          </Space>
        )}
        onOk={onOkClick}
        okButtonProps={{ hidden: readOnly }}
        onCancel={() => setModalVisible(false)}
        cancelText={readOnly ? 'Close' : undefined}
        destroyOnHidden
      >
        <div className={styles.shaQueryBuilderModalBody}>
          <Space size={6} className={styles.shaQueryBuilderModalHelpWrap}>
            <span className={styles.shaQueryBuilderModalHelpText}>Create your own filter using the query builder below.</span>
            <Tooltip title={<a href={queryBuilderDocUrl} target="_blank" rel="noopener noreferrer">Open documentation</a>}>
              <a
                href={queryBuilderDocUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.shaQueryBuilderModalHelpIcon}
                aria-label="Open Query Builder documentation"
              >
                <QuestionCircleOutlined />
              </a>
            </Tooltip>
          </Space>
          {showJsonTestingTools ? (
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: queryBuilderTabKey,
                  label: 'Query builder',
                  children: queryBuilderContent,
                },
                {
                  key: jsonInputTabKey,
                  label: 'Edit JSON',
                  children: jsonEditorContent,
                },
              ]}
            />
          ) : (
            queryBuilderContent
          )}
        </div>
      </Modal>
    </div>
  );
};

export default QueryBuilderField;
