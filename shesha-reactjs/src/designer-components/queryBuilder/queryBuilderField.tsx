import { CaretRightOutlined } from '@ant-design/icons';
import { JsonLogicResult } from '@react-awesome-query-builder/antd';
import { Button, Collapse, Modal, Space } from 'antd';
import React, { FC, useState } from 'react';
import { useMedia } from 'react-use';
import { QueryBuilder, Show } from '@/components';
import { CodeEditor } from '@/components/codeEditor/codeEditor';
import { IQueryBuilderFieldProps } from './models';
import { useStyles } from './styles/styles';

export const QueryBuilderField: FC<IQueryBuilderFieldProps> = (props) => {
  const { styles } = useStyles();
  const [modalVisible, setModalVisible] = useState(false);
  const [jsonLogicResult, setJsonLogicResult] = useState<JsonLogicResult>(undefined);
  const [jsonExpanded, setJsonExpanded] = useState(props.jsonExpanded ?? false);
  const isSmall = useMedia('(max-width: 480px)');

  const { readOnly = false } = props;

  const onOkClick = () => {
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

  const onChange = (result: JsonLogicResult) => {
    if (result !== jsonLogicResult) setJsonLogicResult(result);
  };

  const onExpandClick = () => {
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
          )
        }
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
      ></Collapse>
      <Modal
        open={modalVisible}
        width={isSmall ? '90%' : '60%'}
        title="Query Builder"
        onOk={onOkClick}
        okButtonProps={{ hidden: readOnly }}
        onCancel={() => setModalVisible(false)}
        cancelText={readOnly ? 'Close' : undefined}
        destroyOnClose
      >
        <h4>Here you can create your own filter using the query builder below</h4>

        <QueryBuilder value={props.value} onChange={onChange} readOnly={readOnly} />
      </Modal>
    </div>
  );
};

export default QueryBuilderField;
