import React, { FC, useState } from 'react';
import { Button, Input, Radio, Select, Table, Typography, Tabs } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { BodyType, IRequestBody, IGraphQLBody } from './models';
import { useStyles } from './styles';

const { TextArea } = Input;
const { Text } = Typography;

export interface IBodyTabProps {
  body: IRequestBody;
  onChange: (body: IRequestBody) => void;
}

interface IFormDataRow {
  key: string;
  value: string;
  enabled: boolean;
}

export const BodyTab: FC<IBodyTabProps> = ({ body, onChange }) => {
  const { styles } = useStyles();
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleTypeChange = (type: BodyType) => {
    let content: string | Record<string, any> | IGraphQLBody = '';

    if (type === 'json') {
      content = {};
    } else if (type === 'form-data' || type === 'x-www-form-urlencoded') {
      content = JSON.stringify([]);
    } else if (type === 'graphql') {
      content = {
        query: '',
        variables: '{}',
        operationName: '',
      };
    }

    onChange({ type, content });
    setJsonError(null);
  };

  const handleJsonChange = (value: string) => {
    onChange({ ...body, content: value });

    if (!value.trim()) {
      setJsonError(null);
      return;
    }

    try {
      JSON.parse(value);
      setJsonError(null);
    } catch (err) {
      setJsonError('Invalid JSON: ' + err.message);
    }
  };

  const handleRawChange = (value: string) => {
    onChange({ ...body, content: value });
  };

  const getGraphQLBody = (): IGraphQLBody => {
    if (typeof body.content === 'object' && body.content !== null && 'query' in body.content) {
      return body.content as IGraphQLBody;
    }
    return { query: '', variables: '{}', operationName: '' };
  };

  const handleGraphQLQueryChange = (value: string) => {
    const graphqlBody = getGraphQLBody();
    onChange({ ...body, content: { ...graphqlBody, query: value } });
  };

  const handleGraphQLVariablesChange = (value: string) => {
    const graphqlBody = getGraphQLBody();
    onChange({ ...body, content: { ...graphqlBody, variables: value } });

    if (!value.trim()) {
      setJsonError(null);
      return;
    }

    try {
      JSON.parse(value);
      setJsonError(null);
    } catch (err) {
      setJsonError('Invalid JSON in variables: ' + err.message);
    }
  };

  const handleGraphQLOperationNameChange = (value: string) => {
    const graphqlBody = getGraphQLBody();
    onChange({ ...body, content: { ...graphqlBody, operationName: value } });
  };

  const parseFormData = (): IFormDataRow[] => {
    try {
      const parsed = JSON.parse(body.content as string);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const updateFormData = (rows: IFormDataRow[]) => {
    onChange({ ...body, content: JSON.stringify(rows) });
  };

  const handleFormDataAdd = () => {
    const rows = parseFormData();
    updateFormData([...rows, { key: '', value: '', enabled: true }]);
  };

  const handleFormDataUpdate = (index: number, field: keyof IFormDataRow, value: any) => {
    const rows = parseFormData();
    rows[index] = { ...rows[index], [field]: value };
    updateFormData(rows);
  };

  const handleFormDataDelete = (index: number) => {
    const rows = parseFormData();
    updateFormData(rows.filter((_, i) => i !== index));
  };

  const renderFormDataTable = () => {
    const rows = parseFormData();

    const columns = [
      {
        title: 'Key',
        dataIndex: 'key',
        key: 'key',
        width: '35%',
        render: (text: string, _: IFormDataRow, index: number) => (
          <Input
            value={text}
            placeholder="Field name"
            onChange={(e) => handleFormDataUpdate(index, 'key', e.target.value)}
          />
        ),
      },
      {
        title: 'Value',
        dataIndex: 'value',
        key: 'value',
        width: '45%',
        render: (text: string, _: IFormDataRow, index: number) => (
          <Input
            value={text}
            placeholder="Field value"
            onChange={(e) => handleFormDataUpdate(index, 'value', e.target.value)}
          />
        ),
      },
      {
        title: '',
        key: 'action',
        width: '20%',
        render: (_: any, __: IFormDataRow, index: number) => (
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleFormDataDelete(index)}
          />
        ),
      },
    ];

    return (
      <>
        <Table
          dataSource={rows.map((row, index) => ({ ...row, rowKey: index }))}
          columns={columns}
          pagination={false}
          size="small"
          className={styles.requestTable}
          rowKey="rowKey"
        />
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={handleFormDataAdd}
          className={styles.addRowBtn}
          block
        >
          Add Field
        </Button>
      </>
    );
  };

  const renderBodyContent = () => {
    switch (body.type) {
      case 'none':
        return <Text type="secondary">This request does not have a body.</Text>;

      case 'json':
        return (
          <>
            <div className="code-editor">
              <TextArea
                value={typeof body.content === 'string' ? body.content : JSON.stringify(body.content, null, 2)}
                onChange={(e) => handleJsonChange(e.target.value)}
                placeholder='{\n  "key": "value"\n}'
                rows={12}
                style={{ fontFamily: 'monospace' }}
              />
            </div>
            {jsonError && <div className={styles.jsonError}>{jsonError}</div>}
          </>
        );

      case 'form-data':
        return (
          <div className="form-data-table">
            {renderFormDataTable()}
          </div>
        );

      case 'x-www-form-urlencoded':
        return (
          <div className="urlencoded-table">
            {renderFormDataTable()}
          </div>
        );

      case 'raw':
        return (
          <div className="code-editor">
            <TextArea
              value={body.content as string}
              onChange={(e) => handleRawChange(e.target.value)}
              placeholder="Enter raw request body"
              rows={12}
              style={{ fontFamily: 'monospace' }}
            />
          </div>
        );

      case 'graphql': {
        const graphqlBody = getGraphQLBody();
        return (
          <div className="graphql-editor">
            <Tabs
              defaultActiveKey="query"
              items={[
                {
                  key: 'query',
                  label: 'Query',
                  children: (
                    <div className="code-editor">
                      <TextArea
                        value={graphqlBody.query}
                        onChange={(e) => handleGraphQLQueryChange(e.target.value)}
                        placeholder={'query {\n  users {\n    id\n    name\n  }\n}'}
                        rows={14}
                        style={{ fontFamily: 'monospace' }}
                      />
                    </div>
                  ),
                },
                {
                  key: 'variables',
                  label: 'Variables',
                  children: (
                    <>
                      <div className="code-editor">
                        <TextArea
                          value={graphqlBody.variables || '{}'}
                          onChange={(e) => handleGraphQLVariablesChange(e.target.value)}
                          placeholder={'{\n  "id": "123"\n}'}
                          rows={14}
                          style={{ fontFamily: 'monospace' }}
                        />
                      </div>
                      {jsonError && <div className={styles.jsonError}>{jsonError}</div>}
                    </>
                  ),
                },
                {
                  key: 'operation',
                  label: 'Operation Name',
                  children: (
                    <Input
                      value={graphqlBody.operationName}
                      onChange={(e) => handleGraphQLOperationNameChange(e.target.value)}
                      placeholder="Optional operation name"
                    />
                  ),
                },
              ]}
            />
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className={styles.bodyEditor}>
      <div className={styles.bodyTypeSelector}>
        <Radio.Group value={body.type} onChange={(e) => handleTypeChange(e.target.value)}>
          <Radio.Button value="none">none</Radio.Button>
          <Radio.Button value="json">JSON</Radio.Button>
          <Radio.Button value="form-data">form-data</Radio.Button>
          <Radio.Button value="x-www-form-urlencoded">x-www-form-urlencoded</Radio.Button>
          <Radio.Button value="raw">raw</Radio.Button>
          <Radio.Button value="graphql">GraphQL</Radio.Button>
        </Radio.Group>
      </div>
      {renderBodyContent()}
    </div>
  );
};
