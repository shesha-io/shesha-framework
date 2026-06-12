import React, { FC, useState } from 'react';
import { AutoComplete, Button, Checkbox, Radio, Select, Space, Table, Tooltip, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { BodyType, IFormDataField, IRequestBody, IResponseTransformationConfiguration, RawBodySubType, RequestValue } from './models';
import { RequestValueEditor } from './requestValueEditor';
import { TransformationTab } from './transformationTab';
import { CodeEditor as BaseCodeEditor } from '@/components/codeEditor/codeEditor';
import { CodeLanguages } from '@/designer-components/codeEditor/types';
import { useAvailableConstantsMetadata } from '@/utils/metadata/hooks';
import { DataTypes } from '@/interfaces';
import { asPropertiesArray } from '@/interfaces/metadata';
import { useMetadata } from '@/providers';
import { useStyles } from './styles';

// The raw JavaScript body is executed as a script that returns the payload, so its wrapper reads
// `async (): Promise<any>` (returning any value, not void). Stable reference avoids editor rebuilds.
const JS_BODY_RESULT_TYPE = { dataType: DataTypes.any };

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
  /** Response transformation config — persisted alongside the request, edited under the "Transformation" body option. */
  transformation?: IResponseTransformationConfiguration;
  onTransformationChange?: (transformation: IResponseTransformationConfiguration) => void;
}

// "transformation" is a view-only selection in the body type bar — it edits the response
// transformation (a sibling of the request body) rather than a real request body type, so it
// is tracked in local state and never written to body.type.
type BodyView = BodyType | 'transformation';

export const BodyTab: FC<IBodyTabProps> = ({ body, onChange, transformation, onTransformationChange }) => {
  const { styles } = useStyles();
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [view, setView] = useState<BodyView>(body.type);

  // Remembers each body type's content while the user toggles between formats, so switching tabs
  // never wipes what was entered. Seeded from the incoming body; entries are only emptied by the
  // explicit Clear button. The persisted request still carries a single `content` (the active type).
  const [contentByType, setContentByType] = useState<Partial<Record<BodyType, IRequestBody['content']>>>(
    () => ({ [body.type]: body.content }),
  );

  // Remember the raw sub-type (Text/JSON/XML/…) so leaving and returning to the "raw" tab keeps the
  // last choice instead of resetting to "text".
  const [lastRawSubType, setLastRawSubType] = useState<RawBodySubType>(body.rawSubType ?? 'text');

  const defaultContentFor = (type: BodyType): IRequestBody['content'] =>
    type === 'form-data' || type === 'x-www-form-urlencoded' ? ([] as IFormDataField[]) : '';

  // Standard constants exposed to the executable JavaScript body (data, globalState, http, form,
  // pageContext, selectedRow, …). `response` is intentionally excluded — it doesn't exist yet when
  // the request body is being built. Mirrors what the executer provides at runtime.
  const jsBodyConstants = useAvailableConstantsMetadata({ addGlobalConstants: true });

  // Properties of the model the host form is bound to (if any) — offered as autocomplete suggestions
  // for form-data field keys. Undefined when there's no metadata context; free typing always works.
  const metadataCtx = useMetadata(false);
  const keyOptions = asPropertiesArray(metadataCtx?.metadata?.properties, []).map((p) => ({
    value: p.path,
    label: p.path,
  }));

  const handleTypeChange = (type: BodyType): void => {
    // Restore the previously-entered content for this type instead of resetting it.
    const stashed = contentByType[type];
    const content = stashed !== undefined ? stashed : defaultContentFor(type);
    const rawSubType = type === 'raw' ? lastRawSubType : undefined;

    onChange({ type, content, rawSubType });
    setJsonError(null);
  };

  const handleViewChange = (next: BodyView): void => {
    setView(next);
    // Only real body types mutate the request body; "transformation" leaves the body untouched.
    if (next !== 'transformation') {
      handleTypeChange(next);
    }
  };

  const handleClear = (): void => {
    if (view === 'transformation') {
      onTransformationChange?.({ enabled: false, script: '' });
      return;
    }
    const type = view as BodyType;
    const cleared = defaultContentFor(type);
    setContentByType((prev) => ({ ...prev, [type]: cleared }));
    onChange({ ...body, content: cleared });
    setJsonError(null);
  };

  const handleRawSubTypeChange = (rawSubType: RawBodySubType): void => {
    setLastRawSubType(rawSubType);
    onChange({ ...body, rawSubType });
  };

  const handleJsonChange = (value: string): void => {
    setContentByType((prev) => ({ ...prev, json: value }));
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
    setContentByType((prev) => ({ ...prev, raw: value }));
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
    setContentByType((prev) => ({ ...prev, [body.type]: rows }));
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
        title: <Tooltip title="Include this field in the payload">Include</Tooltip>,
        key: 'enabled',
        width: '12%',
        align: 'center' as const,
        render: (_: any, row: IFormDataField, index: number) => (
          <Checkbox
            checked={row.enabled !== false}
            onChange={(e) => handleFormDataUpdate(index, 'enabled', e.target.checked)}
          />
        ),
      },
      {
        title: 'Key',
        dataIndex: 'key',
        key: 'key',
        width: '30%',
        render: (text: string, _: IFormDataField, index: number) => (
          <AutoComplete
            value={text}
            options={keyOptions}
            placeholder="Field name"
            style={{ width: '100%' }}
            // Suggest model properties but let the user type any key (free text).
            filterOption={(input, option) =>
              String(option?.value ?? '').toLowerCase().includes(input.toLowerCase())}
            onChange={(value) => handleFormDataUpdate(index, 'key', value ?? '')}
          />
        ),
      },
      {
        title: 'Value',
        dataIndex: 'value',
        key: 'value',
        width: '43%',
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
        width: '15%',
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
          rowClassName={(record: IFormDataField) => (record.enabled === false ? styles.disabledRow : '')}
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
    if (view === 'transformation') {
      return (
        <TransformationTab
          value={transformation}
          onChange={(t) => onTransformationChange?.(t)}
        />
      );
    }

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
        // The JavaScript sub-type is executed at request time, so it gets the templated editor with
        // exposed constants (like the Transformation tab). Other sub-types are sent as plain text.
        const isExecutableJs = activeSubType === 'javascript';
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
            {isExecutableJs && (
              <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                This script runs at request time and must <Text code>return</Text> the value to send as the body.
              </Text>
            )}
            <div className={styles.codeEditorWrapper}>
              <BaseCodeEditor
                value={typeof body.content === 'string' ? body.content : ''}
                onChange={(v) => handleRawChange(v ?? '')}
                language={isExecutableJs ? 'javascript' : subTypeMeta.language}
                placeholder={isExecutableJs ? 'return { /* payload */ };' : 'Enter raw request body'}
                fileName={isExecutableJs ? 'expression' : `api-call-body.${activeSubType}`}
                wrapInTemplate={isExecutableJs}
                templateSettings={isExecutableJs ? { useAsyncDeclaration: true, functionName: 'getRequestBody' } : undefined}
                availableConstants={isExecutableJs ? jsBodyConstants : undefined}
                resultType={isExecutableJs ? JS_BODY_RESULT_TYPE : undefined}
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

  // Whether the current view has anything worth clearing (drives the Clear button's enabled state).
  const hasContent = view === 'transformation'
    ? Boolean(transformation?.enabled || transformation?.script?.trim())
    : typeof body.content === 'string'
      ? Boolean(body.content.trim())
      : Array.isArray(body.content) && body.content.length > 0;

  return (
    <div className={styles.bodyEditor}>
      <div className={styles.bodyTypeSelector} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Radio.Group value={view} onChange={(e) => handleViewChange(e.target.value)}>
          <Radio.Button value="none">none</Radio.Button>
          <Radio.Button value="json">JSON</Radio.Button>
          <Radio.Button value="form-data">form-data</Radio.Button>
          <Radio.Button value="x-www-form-urlencoded">x-www-form-urlencoded</Radio.Button>
          <Radio.Button value="raw">raw</Radio.Button>
          <Radio.Button value="transformation">Transformation</Radio.Button>
        </Radio.Group>
        <Button
          size="small"
          icon={<DeleteOutlined />}
          onClick={handleClear}
          disabled={view === 'none' || !hasContent}
        >
          Clear
        </Button>
      </div>
      {renderBodyContent()}
    </div>
  );
};
