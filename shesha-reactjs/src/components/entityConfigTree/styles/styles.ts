import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, cx }) => {
  const shaTreeMain = cx('sha-ec-tree-main', css`
    height: calc(100% - 47px);
    overflow: auto;
  `);

  const shaComponentTitle = cx('sha-ec-component-title', css`
    display: inline-block;
    width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `);

  const shaComponentParent = cx('sha-ec-component-parent', css`
    display: flex;
    flex-direction: row;
        justify-content: flex-start;
    }`,
  );

  return {
    shaTreeMain,
    shaComponentTitle,
    shaComponentParent,
  };
});
