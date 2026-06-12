import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, prefixCls }) => {
  const requestConfigModal = cx(`${prefixCls}-request-config-modal`, css`
    .ant-modal-body {
      max-height: 600px;
      overflow-y: auto;
    }
  `);

  const modalContent = cx(`${prefixCls}-request-config-modal-content`, css`
    .ant-tabs-nav {
      position: sticky;
      top: 0;
      z-index: 1;
      background: #fff;
      margin-bottom: 16px;
    }

    .ant-tabs-content {
      min-height: 400px;
    }
  `);

  const requestTable = cx(`${prefixCls}-request-table`, css`
    margin-bottom: 16px;

    .ant-table-thead > tr > th {
      background: #fafafa;
      font-weight: 600;
      padding: 12px 8px;
    }

    .ant-table-tbody > tr > td {
      padding: 8px;
    }
  `);

  const actionCell = cx(`${prefixCls}-action-cell`, css`
    display: flex;
    gap: 8px;
    align-items: center;

    .ant-switch {
      margin-right: 8px;
    }
  `);

  const addRowBtn = cx(`${prefixCls}-add-row-btn`, css`
    margin-top: 8px;
  `);

  const bodyTypeSelector = cx(`${prefixCls}-body-type-selector`, css`
    margin-bottom: 16px;
  `);

  const bodyEditor = cx(`${prefixCls}-body-editor`, css`
    .code-editor {
      border: 1px solid #d9d9d9;
      border-radius: 2px;
      min-height: 300px;

      textarea {
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
        font-size: 13px;
        line-height: 1.5;
      }
    }

    .form-data-table,
    .urlencoded-table {
      margin-top: 16px;
    }

    .graphql-editor {
      .ant-tabs-nav {
        margin-bottom: 16px;
      }

      .ant-tabs-content {
        padding: 8px 0;
      }
    }
  `);

  const jsonError = cx(`${prefixCls}-json-error`, css`
    margin-top: 8px;
    color: #ff4d4f;
    font-size: 12px;
  `);

  return {
    requestConfigModal,
    modalContent,
    requestTable,
    actionCell,
    addRowBtn,
    bodyTypeSelector,
    bodyEditor,
    jsonError,
  };
});
