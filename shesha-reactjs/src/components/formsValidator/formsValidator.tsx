'use client';

import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  App,
  Button, Flex, Progress,
  Space,
  Table,
  Tag, Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  BuildOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  CloseCircleFilled,
  LoadingOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  StopOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { isDefined, isNullOrWhiteSpace } from '@/utils';
import { JsonLogicTree } from '@react-awesome-query-builder/antd';
import { FormsFilter } from './formsFilter';
import { useConfigurableActionDispatcher, useFormManager, useHttpClient, useSettingsComponents, useTheme } from '@/providers';
import { BatchFormsValidator } from './batchFormsValidator';
import { FormProcessingItem, ITEM_STATUSES, ItemStatus } from './models';
import { useFormDesignerComponentGroups } from '@/providers/form/hooks';
import { useFormBuilderFactory } from '@/form-factory/hooks';
import { formatDuration, ProcessingStats, StatsSnapshot } from './processingStats';
import { QuickEditDialog } from '../formDesigner/quickEdit/quickEditDialog';
import { useAvailableConstantsDataNoRefresh } from '../..';
import { isNonEmptyArray } from '@/utils/array';

const { Text, Link } = Typography;

/* ---------------------------- Status meta ---------------------------- */

const STATUS_META: Record<
  ItemStatus,
  { color: string; icon: React.ReactNode; label: string }
> = {
  pending: { color: 'default', icon: <ClockCircleOutlined />, label: 'Pending' },
  processing: { color: 'processing', icon: <LoadingOutlined />, label: 'Processing' },
  done: { color: 'success', icon: <CheckCircleFilled />, label: 'Done' },
  error: { color: 'error', icon: <CloseCircleFilled />, label: 'Failed' },
};

export const FormsValidator: FC = () => {
  const { message } = App.useApp();
  const [forms, setForms] = useState<FormProcessingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [filter, setFilter] = useState<JsonLogicTree | undefined>(
    // { "==": [{ var: "id" }, "229c6ed8-244b-448d-ada8-f7a3a6b86547"] },
  );
  const [formId, setFormId] = useState<string | undefined>(undefined);

  const httpClient = useHttpClient();
  const formManager = useFormManager();
  const toolboxComponentGroups = useFormDesignerComponentGroups();
  const settingsComponents = useSettingsComponents();
  const { theme } = useTheme();
  const formBuilderFactory = useFormBuilderFactory();
  const { getConfigurableActionOrNull } = useConfigurableActionDispatcher();

  const statsRef = useRef(new ProcessingStats());
  const [stats, setStats] = useState<StatsSnapshot>(() => statsRef.current.snapshot());

  const syncStats = useCallback(() => {
    setStats(statsRef.current.snapshot());
  }, []);

  const allData = useAvailableConstantsDataNoRefresh();

  const [validator] = useState<BatchFormsValidator>(() => new BatchFormsValidator({
    httpClient,
    formManager,
    toolboxComponentGroups,
    settingsComponents,
    theme,
    formBuilderFactory,
    getConfigurableActionOrNull,
    appContext: allData,
  }));

  const mountedRef = useRef(true);
  const cancelRef = useRef(false);
  const runTokenRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cancelRef.current = true;
      runTokenRef.current += 1;
    };
  }, []);

  const patch = useCallback(
    (id: string, changes: Partial<FormProcessingItem> & { status?: ItemStatus }) => {
      setForms((prev) =>
        prev.map((it) => {
          if (it.id !== id) return it;
          if (changes.status && changes.status !== it.status) {
            statsRef.current.transition(it.status, changes.status);
          }
          return { ...it, ...changes };
        }),
      );
      syncStats();
    },
    [syncStats],
  );

  /* -------------------------------- Load ------------------------------- */

  const load = useCallback(async () => {
    // Abort any run that is currently in flight
    runTokenRef.current += 1;
    cancelRef.current = true;
    setRunning(false);

    setLoading(true);
    try {
      const fetchedForms = await validator.loadFormsListAsync(filter, (item) => ({ ...item, status: 'pending' }));

      if (!mountedRef.current) return;
      setForms(fetchedForms);
      statsRef.current.setTotal(fetchedForms.length);
      syncStats();
    } catch (error) {
      console.error('Failed to load forms', error);
      message.error('Failed to load forms');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [filter, message, syncStats, validator]);

  useEffect(() => {
    void load();
  }, [load]);

  /* --------------------------- Sequential run -------------------------- */

  const start = useCallback(async () => {
    const queue = forms.filter((i) => i.status === 'pending' || i.status === 'error');
    if (queue.length === 0) {
      message.info('Nothing left to process');
      return;
    }

    const token = ++runTokenRef.current;
    cancelRef.current = false;
    setRunning(true);
    statsRef.current.startRun();
    syncStats();

    const cancelled = (): boolean =>
      cancelRef.current || token !== runTokenRef.current || !mountedRef.current;

    try {
      for (const item of queue) {
        if (cancelled()) break;

        patch(item.id, { status: 'processing', result: undefined, errorMessage: undefined });

        if (cancelled()) {
          patch(item.id, { status: 'pending' });
          break;
        }

        try {
          const result = await validator.processItem(item);

          if (cancelled()) break;
          patch(item.id, {
            status: 'done',
            result,
          });
        } catch (err) {
          if (cancelled()) break;
          patch(item.id, { status: 'error', errorMessage: (err as Error).message });
        }
      }
    } finally {
      if (token === runTokenRef.current) {
        statsRef.current.finishRun();
        if (mountedRef.current) {
          setRunning(false);
          syncStats();
        }
      }
    }
  }, [forms, message, patch, syncStats, validator]);

  const stop = useCallback(() => {
    runTokenRef.current += 1;
    cancelRef.current = true;
    setRunning(false);
    setForms((prev) =>
      prev.map((it) => (it.status === 'processing' ? { ...it, status: 'pending' } : it)),
    );
    statsRef.current.requeueProcessing();
    statsRef.current.stopRun();
    syncStats();
  }, [syncStats]);

  const reset = useCallback(() => {
    runTokenRef.current += 1;
    cancelRef.current = true;
    setRunning(false);
    setForms((prev) =>
      prev.map((it) => ({
        ...it,
        status: 'pending' as ItemStatus,
        result: undefined,
        error: undefined,
      })),
    );
    statsRef.current.resetToPending();
    syncStats();
  }, [syncStats]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(syncStats, 500);
    return () => window.clearInterval(id);
  }, [running, syncStats]);

  const allDone = stats.total > 0 && stats.remaining === 0;

  const columns = useMemo<ColumnsType<FormProcessingItem>>(
    () => [
      {
        title: '',
        dataIndex: 'id',
        width: 30,
        render: (v: string) => (
          <Link onClick={(e): void => {
            e.stopPropagation();
            setFormId(v);
          }}
          >
            <BuildOutlined />
          </Link>
        ),
      },
      { title: 'Module', dataIndex: 'module' },
      { title: 'Name', dataIndex: 'name' },
      {
        title: 'Status',
        dataIndex: 'status',
        width: 150,
        render: (s: ItemStatus) => {
          const meta = STATUS_META[s];
          return (
            <Tag color={meta.color} icon={meta.icon}>
              {meta.label}
            </Tag>
          );
        },
        filters: ITEM_STATUSES.map((s) => ({ text: s, value: s })),
        onFilter: (value, record) => record.status === value,
      },
      {
        title: 'Result / Error',
        key: 'result',
        ellipsis: true,
        filters: [
          { text: 'No Issues', value: 'no-issues' },
          { text: 'Has Issues', value: 'has-issues' },
        ],
        onFilter: (value, record) => value === 'no-issues'
          ? !isNonEmptyArray(record.result?.issues)
          : value === 'has-issues'
            ? isNonEmptyArray(record.result?.issues)
            : true,
        render: (_, record) => {
          if (record.status === 'error') return <Text type="danger">{record.errorMessage}</Text>;
          return isDefined(record.result)
            ? record.result.issues.length > 0
              ? (
                <Text type="danger">
                  Found {record.result.issues.length} issues
                </Text>
              )
              : (
                <Text type="success">
                  No issues
                </Text>
              )
            : <Text type="secondary">—</Text>;
        },
      },
    ],
    [],
  );

  /* ------------------------------- Render ------------------------------ */

  return (
    <div style={{ padding: "20px" }}>
      <Typography.Title level={3}>Forms Validator</Typography.Title>
      <Flex vertical gap={16}>
        <div>
          <FormsFilter value={filter} onChange={setFilter} />
        </div>
        <Space wrap>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => void load()}
            loading={loading}
            disabled={running}
          >
            Reload
          </Button>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => void start()}
            loading={running}
            disabled={loading || stats.remaining === 0}
          >
            {running ? 'Processing…' : 'Start'}
          </Button>
          <Button danger icon={<StopOutlined />} onClick={stop} disabled={!running}>
            Stop
          </Button>
          <Button
            icon={<UndoOutlined />}
            onClick={reset}
            disabled={running || loading || forms.length === 0}
          >
            Reset
          </Button>
          {/* <Button
            icon={<ReloadOutlined />}
            onClick={() => void load()}
            loading={loading}
            disabled={running}
          >
            Reload
          </Button> */}
        </Space>

        <Progress percent={stats.percent} status={running ? 'active' : 'normal'} />

        <Space size="large" wrap>
          <Text>
            Total: <Text strong>{stats.total}</Text>
          </Text>
          <Text type="success">Done: {stats.done}</Text>
          <Text type="danger">Failed: {stats.failed}</Text>
          <Text type="secondary">Remaining: {stats.remaining}</Text>
          <Text>
            Elapsed: <Text strong>{formatDuration(stats.elapsedMs)}</Text>
          </Text>
          <Text>
            Avg / item:{' '}
            <Text strong>{isDefined(stats.avgPerItemMs) && stats.avgPerItemMs.toFixed(2)}</Text>
          </Text>
          <Text>
            Remaining:{' '}
            <Text strong>{running ? formatDuration(stats.remainingMs) : '—'}</Text>
          </Text>
          <Text>
            ETA total:{' '}
            <Text strong>{formatDuration(stats.estimatedTotalMs)}</Text>
          </Text>
        </Space>

        {allDone && (
          <Alert
            showIcon
            type={stats.failed > 0 ? 'warning' : 'success'}
            title={stats.failed > 0
              ? `Finished with ${stats.failed} failure(s). You can retry them with “Start”.`
              : 'All items processed successfully.'}
          />
        )}

        <Table<FormProcessingItem>
          rowKey="id"
          size="small"
          loading={loading}
          columns={columns}
          dataSource={forms}
          pagination={{
            placement: ["topStart", "bottomStart"],
            size: "small",
            pageSizeOptions: [20, 50, 100],
            defaultPageSize: 20,
          }}
        />
      </Flex>

      {!isNullOrWhiteSpace(formId) && (
        <QuickEditDialog
          formId={formId}
          open={true}
          onCancel={() => setFormId(undefined)}
          onUpdated={() => {
            patch(formId, { status: 'pending' });
            setFormId(undefined);
          }}
        />
      )}
    </div>
  );
};
