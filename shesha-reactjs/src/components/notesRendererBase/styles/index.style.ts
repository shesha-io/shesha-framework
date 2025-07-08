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
    top: ${sheshaStyles.paddingLG}px;
    display: none;
    cursor: pointer;
    z-index: 1000;
  `;

  const editIcon = css`
    ${textHoverEffect}
    position: absolute;
    right: 30px;
    top: ${sheshaStyles.paddingLG}px;
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
    max-height: 480px;
  `);

  const commentItemBody = css`
    position: relative;

    &:hover {
      .anticon-delete,
      .anticon-edit {
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

      .${prefixCls}-comment-content-author {
        margin-block: 10px;
      }
    }
  `;

  const charCounter = css`
    text-align: right;
    font-size: 12px;
    color: ${token.colorTextDescription};
    margin-top: 4px;
  `;

  const errorText = css`
    color: ${token.colorError};
    margin-left: 8px;
  `;

  const notes = css`
    .ant-divider {
      margin: unset;
    }
  `;

  const editControls = css`
    margin-bottom: ${sheshaStyles.paddingLG}px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    background-color: ${token.colorBgContainer};
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadius}px;
  `;

  const editButtons = css`
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  `;

  return {
    saveBtn,
    deleteIcon,
    editIcon,
    notesTextarea,
    commentListCard,
    commentList,
    commentItemBody,
    commentItem,
    notes,
    charCounter,
    errorText,
    editControls,
    editButtons,
  };
});