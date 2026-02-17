import { CaretRightOutlined, FilterOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { JsonLogicResult } from '@react-awesome-query-builder/antd';
import { Button, Collapse, Modal, Space, Tooltip } from 'antd';
import React, { FC, useState } from 'react';
import { useMedia } from 'react-use';
import { QueryBuilder, Show } from '@/components';
import { CodeEditor } from '@/components/codeEditor/codeEditor';
import { IQueryBuilderFieldProps } from './models';
import { useStyles } from './styles/styles';

export const QueryBuilderField: FC<IQueryBuilderFieldProps> = (props) => {
  const queryBuilderDocUrl = 'https://docs.shesha.io/docs/category/form-components';
  const { styles } = useStyles();
  const [modalVisible, setModalVisible] = useState(false);
  const [jsonLogicResult, setJsonLogicResult] = useState<JsonLogicResult>(undefined);
  const [jsonExpanded, setJsonExpanded] = useState(props.jsonExpanded ?? false);
  const isSmall = useMedia('(max-width: 480px)');

  const { readOnly = false } = props;

  const onOkClick = (): void => {
    if (jsonLogicResult) {
      if (jsonLogicResult && jsonLogicResult.errors && jsonLogicResult.errors.length > 0) {
        // show errors
        return;
      }

      if (props.onChange) {
        props.onChange(jsonLogicResult?.logic);
      }
    }
    setModalVisible(false);
  };

  const onChange = (result: JsonLogicResult): void => {
    if (result !== jsonLogicResult) setJsonLogicResult(result);
  };

  const onExpandClick = (): void => {
    setJsonExpanded(!jsonExpanded);
  };

  const hasValue = Boolean(props?.value);

  return (
    <div className={styles.shaQueryBuilderMarginTop8}>
      <Collapse
        className={styles.shaQueryBuilderField}
        activeKey={jsonExpanded ? '1' : null}
        expandIconPosition="end"
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
            label: (
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
            ),
            children: (
              <CodeEditor
                readOnly={true}
                value={props.value ? JSON.stringify(props.value, null, 2) : ""}
                language="javascript"
                style={{ marginTop: 8 }}
              />
            ),
          },
        ]}
      >
      </Collapse>
      <Modal
        open={modalVisible}
        width={isSmall ? '90%' : '60%'}
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
          <QueryBuilder value={props.value} onChange={onChange} readOnly={readOnly} />
        </div>
      </Modal>
    </div>
  );
};

export default QueryBuilderField;
