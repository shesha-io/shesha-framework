import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, cx }) => {
  const shaComponentTitle = cx(
    'sha-component-title',
    css `
    display: inline-block;
    width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    `);

    const shaComponentParent = cx(
        'sha-component-parent',
        css `
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
    }`
  );
  return {
    shaComponentTitle,
    shaComponentParent
  };
});
