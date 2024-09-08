import { createStyles } from '@/styles';
import { sheshaStyles, getTextHoverEffects } from '@/styles';

export const useStyles = createStyles(({ css, cx, prefixCls, token }) => {
  const textHoverEffect = getTextHoverEffects(token);

  const saveBtn = cx(css`
    padding-top: 12px;

    &.right {
      display: flex;
      justify-content: flex-end;
    }
  `);

  const notesTextarea = css`
    margin-bottom: ${sheshaStyles.paddingLG}px;
  `;

  const deleteIcon = css`
    ${textHoverEffect}
    position: absolute;
    right: 5px;
    top: @padding-lg;
    display: none;
    cursor: pointer;
    z-index: 1000;
  `;

  const commentListCard = css`
    border: unset;
    .ant-card-body {
      padding: unset;
    }
  `;
  const commentList = cx(css`
    maxheight: '480px';
  `);

  const commentItemBody = css`
    position: relative;

    &:hover {
      .anticon-delete {
        display: inline;
      }
    }

    .${prefixCls}-divider {
      margin: 0;
    }
  `;

  const commentItem = css`
    margin-inline: 15px;
    min-height: 50px;

    .${prefixCls}-comment-inner {
      padding-block: unset;

      .${prefixCls}-typography {
        margin-bottom: 0;
      }
    }
  `;

  const notes = css`
    .ant-divider: { margin: unset },
  `;

  return {
    saveBtn,
    deleteIcon,
    notesTextarea,
    commentListCard,
    commentList,
    commentItemBody,
    commentItem,
    notes,
  };
});

export default useStyles;
