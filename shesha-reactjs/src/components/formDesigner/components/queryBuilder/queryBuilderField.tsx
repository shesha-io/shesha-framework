import React, { FC, useState } from 'react';
import { JsonLogicResult } from 'react-awesome-query-builder';
import { Modal, Button, Collapse, Space } from 'antd';
import QueryBuilder from '../../../queryBuilder';
import { CodeEditor, Show } from '../../..';
import { CaretRightOutlined } from '@ant-design/icons';
import { useMedia } from 'react-use';
import { IQueryBuilderFieldProps } from './models';

export const QueryBuilderField: FC<IQueryBuilderFieldProps> = props => {
  const [modalVisible, setModalVisible] = useState(false);
  const [jsonLogicResult, setJsonLogicResult] = useState<JsonLogicResult>(undefined);
  const [jsonExpanded, setJsonExpanded] = useState(props.jsonExpanded ?? false);
  const isSmall = useMedia('(max-width: 480px)');

  const { readOnly = false } = props;

  const onOkClick = () => {
    if (jsonLogicResult) {
      if (jsonLogicResult && jsonLogicResult.errors && jsonLogicResult.errors.length > 0) {
        console.log(jsonLogicResult);
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
    setJsonLogicResult(result);
  };

  const onExpandClick = () => {
    setJsonExpanded(!jsonExpanded);
  };

  const hasValue = Boolean(props?.value);

  return (
    <>
      <Collapse
        className="sha-query-builder-field"
        activeKey={jsonExpanded ? '1' : null}
        expandIconPosition="right"
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
      >
        <Collapse.Panel
          header={
            <Space>
              <Button type={ readOnly ? 'default' : 'primary' } onClick={() => setModalVisible(true)} size="small">
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
          }
          key="1"
        >
          <CodeEditor
            width="100%"
            readOnly={true}
            value={props.value ? JSON.stringify(props.value, null, 2) : null}
            mode="json"
            theme="monokai"
            fontSize={14}
            showPrintMargin={true}
            showGutter={true}
            highlightActiveLine={true}
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: false,
              showLineNumbers: true,
              tabSize: 2,
              autoScrollEditorIntoView: true,
              minLines: 3,
              maxLines: 100,
            }}
          />
        </Collapse.Panel>
      </Collapse>
      <Modal
        open={modalVisible}
        width={isSmall ? '90%' : '60%'}
        title="Query Builder"
        
        onOk={onOkClick}
        okButtonProps={{ hidden: readOnly }}
        
        onCancel={() => setModalVisible(false)}
        cancelText={ readOnly ? 'Close' : undefined }

        destroyOnClose
      >
        <h4>Here you can create your own filter using the query builder below</h4>

        <QueryBuilder
          value={props.value}
          onChange={onChange}
          fields={props.fields}
          fetchFields={props.fetchFields}
          useExpression={props?.useExpression}
          readOnly={readOnly}
        />
      </Modal>
    </>
  );
};

export default QueryBuilderField;
