import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
    const searchField = cx(css`
    width: 100%;
    background: #fff;
  `);

  const content = cx(css`
    .ant-tabs-tab, .ant-tabs-nav-operations {
      height: 24px;
    }
    
    .ant-tabs-nav {
      margin-bottom: 0px;
    }
    .ant-tabs-tab {
      --ant-tabs-card-padding-sm: 0 8px;
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
  `);

  return {
    searchField,
    content
  };
});