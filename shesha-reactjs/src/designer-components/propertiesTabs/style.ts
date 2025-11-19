import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, token }) => {
  const searchField = cx(css`
    width: 100%;
    background: #fff;
  `);

  const content = cx(css`
    .ant-tabs-tab, .ant-tabs-nav-operations {
      height: 30px;
    }
    .ant-tabs-tab {
      --ant-tabs-card-padding-sm: 0 8px;
    }

    .ant-form-item-vertical .ant-form-item-row {
      flex-direction: row !important;
    }

    .sha-toolbar-btn-configurable, .ant-btn {
      display: flex;
      align-items: center;
      max-width: 100%;
      span {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    * > .sha-required-mark {
      margin-left: 4px;
      color: ${token.colorErrorText};
      font-family: ${token.fontFamily};
      line-height: 1;
      position: relative;
      top: 8px;
  }
  `);

  return {
    searchField,
    content,
  };
});
