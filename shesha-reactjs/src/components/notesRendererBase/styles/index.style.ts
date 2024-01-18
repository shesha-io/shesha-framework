import { createStyles } from "antd-style";
import { sheshaStyles, getTextHoverEffects } from '@/styles';

export const useStyles = createStyles(({ css, cx, token }) => {
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
    maxHeight: "480px",
  `);

  const commentItemBody = css`
    position: relative;

    &:hover {
      .anticon-delete {
        display: inline;
      }
    }
  `;

  const commentItem = css`
    min-height: 96px;
    height: auto;
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