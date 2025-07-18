import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const innerEntityReferenceSpanBoxStyle = cx('sha-quick-view-inner-entity-reference-span-box', css`
    width: 100%;
    margin: 0;
    padding: 0;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    display: inline-block;
  `);


  const innerEntityReferenceButtonBoxStyle = cx('sha-quick-view-inner-entity-reference-button-box', css`
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
  `);

  const spin = cx('sha-quick-view-spin', css`
    margin-right: 8px;
    display: inline-block;
    vertical-align: middle;
  `);

  const inlineBlock = cx('sha-quick-view-inline-block', css`
    display: inline-block;
    vertical-align: middle;
  `);

  return {
    innerEntityReferenceSpanBoxStyle,
    innerEntityReferenceButtonBoxStyle,
    spin,
    inlineBlock,
  };
});