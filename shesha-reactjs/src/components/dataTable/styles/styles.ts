import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const shaMultiEntityCell = cx("sha-form-cell", css`
      white-space: normal;
    `);

  const shaFormCell = cx("sha-form-cell", css`
      width: 100%;

      .ant-form-item-control {
        flex-direction: unset;
        display: flex;
      }

      .ant-form-item-control-input   {
        width: 100%;
        min-height: --ant-control-height;
      }
    `);

    const tableErrorContainer = cx("sha-table-error-container", css`
        margin: 12px;
        margin-top: 0;
    
        &:empty {
        margin: unset;
        }    
    `);

    return {
        shaChildTableErrorContainer: tableErrorContainer,
        shaFormCell,
        shaMultiEntityCell,
    };
});