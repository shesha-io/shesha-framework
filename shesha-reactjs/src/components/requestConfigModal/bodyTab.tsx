import React, { FC, useState } from 'react';
import { Button, Input, Radio, Select, Space, Table, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { BodyType, IFormDataField, IRequestBody, RawBodySubType, RequestValue } from './models';
import { RequestValueEditor } from './requestValueEditor';
import { CodeEditor as BaseCodeEditor } from '@/components/codeEditor/codeEditor';
import { CodeLanguages } from '@/designer-components/codeEditor/types';
import { useStyles } from './styles';

const RAW_SUB_TYPES: { value: RawBodySubType; label: string; language: CodeLanguages }[] = [
  { value: 'text', label: 'Text', language: 'plain_text' },
  { value: 'json', label: 'JSON', language: 'json' },
  { value: 'xml', label: 'XML', language: 'xml' },
  { value: 'html', label: 'HTML', language: 'html' },
  { value: 'javascript', label: 'JavaScript', language: 'javascript' },
];

const { Text } = Typography;

export interface IBodyTabProps {
  body: IRequestBody;
  onChange: (body: IRequestBody) => void;
}

export const BodyTab: FC<IBodyTabProps> = ({ body, onChange }) => {
  const { styles } = useStyles();
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleTypeChange = (type: BodyType): void => {
    let content: IRequestBody['content'] = '';
    let rawSubType: RawBodySubType | undefined;

    if (type === 'json') {
      content = '';
    } else if (type === 'form-data' || type === 'x-www-form-urlencoded') {
      content = [] as IFormDataField[];
    } else if (type === 'raw') {
      rawSubType = body.rawSubType ?? 'text';
    }

    onChange({ type, content, rawSubType });
    setJsonError(null);
  };

  const handleRawSubTypeChange = (rawSubType: RawBodySubType): void => {
    onChange({ ...body, rawSubType });
  };

  const handleJsonChange = (value: string): void => {
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

  const handleRawChange = (value: string): void => {
    onChange({ ...body, content: value });
  };

  const parseFormData = (): IFormDataField[] => {
    const raw = body.content;
    if (Array.isArray(raw)) return raw as IFormDataField[];
    if (typeof raw === 'string') {
      // Legacy storage: JSON-stringified array
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const updateFormData = (rows: IFormDataField[]): void => {
    onChange({ ...body, content: rows });
  };

  const handleFormDataAdd = (): void => {
    const rows = parseFormData();
    updateFormData([...rows, { key: '', value: '', enabled: true }]);
  };

  const handleFormDataUpdate = <K extends keyof IFormDataField>(
    index: number,
    field: K,
    value: IFormDataField[K],
  ): void => {
    const rows = parseFormData();
    rows[index] = { ...rows[index], [field]: value };
    updateFormData(rows);
  };

  const handleFormDataDelete = (index: number): void => {
    const rows = parseFormData();
    updateFormData(rows.filter((_, i) => i !== index));
  };

  const renderFormDataTable = (): JSX.Element => {
    const rows = parseFormData();

    const columns = [
      {
        title: 'Key',
        dataIndex: 'key',
        key: 'key',
        width: '35%',
        render: (text: string, _: IFormDataField, index: number) => (
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
        render: (value: RequestValue, _: IFormDataField, index: number) => (
          <RequestValueEditor
            value={value}
            onChange={(v) => handleFormDataUpdate(index, 'value', v)}
            placeholder="Field value"
          />
        ),
      },
      {
        title: '',
        key: 'action',
        width: '20%',
        render: (_: any, __: IFormDataField, index: number) => (
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

  const renderBodyContent = (): JSX.Element | null => {
    switch (body.type) {
      case 'none':
        return <Text type="secondary">This request does not have a body.</Text>;

      case 'json': {
        const jsonValue = typeof body.content === 'string'
          ? body.content
          : JSON.stringify(body.content, null, 2);
        return (
          <>
            <div className={styles.codeEditorWrapper}>
              <BaseCodeEditor
                value={jsonValue}
                onChange={(v) => handleJsonChange(v ?? '')}
                language="json"
                placeholder='{\n  "key": "value"\n}'
                fileName="api-call-body.json"
                wrapInTemplate={false}
                style={{ height: 300 }}
              />
            </div>
            {jsonError && <div className={styles.jsonError}>{jsonError}</div>}
          </>
        );
      }

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

      case 'raw': {
        const activeSubType = body.rawSubType ?? 'text';
        const subTypeMeta = RAW_SUB_TYPES.find((s) => s.value === activeSubType) ?? RAW_SUB_TYPES[0];
        return (
          <>
            <Space style={{ marginBottom: 8 }} size="small">
              <Text type="secondary">Content type:</Text>
              <Select<RawBodySubType>
                value={activeSubType}
                onChange={handleRawSubTypeChange}
                options={RAW_SUB_TYPES.map((s) => ({ value: s.value, label: s.label }))}
                style={{ width: 140 }}
                size="small"
              />
            </Space>
            <div className={styles.codeEditorWrapper}>
              <BaseCodeEditor
                value={typeof body.content === 'string' ? body.content : ''}
                onChange={(v) => handleRawChange(v ?? '')}
                language={subTypeMeta.language}
                placeholder="Enter raw request body"
                fileName={`api-call-body.${activeSubType}`}
                wrapInTemplate={false}
                style={{ height: 300 }}
              />
            </div>
          </>
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
        </Radio.Group>
      </div>
      {renderBodyContent()}
    </div>
  );
};
