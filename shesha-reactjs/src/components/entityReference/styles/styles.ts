import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css }) => {
  const innerEntityReferenceSpanBoxStyle = css`
    width: 100%;
    margin: 0;
    padding: 0;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    display: inline-block;
  `;


  const innerEntityReferenceButtonBoxStyle = css`
    background-color: transparent;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
  `;

  const spin = css`
    margin-right: 8px;
    display: inline-block;
    vertical-align: middle;
  `;

  const inlineBlock = css`
    display: inline-block;
    vertical-align: middle;
  `;

  return {
    innerEntityReferenceSpanBoxStyle,
    innerEntityReferenceButtonBoxStyle,
    spin,
    inlineBlock,
  };
});
